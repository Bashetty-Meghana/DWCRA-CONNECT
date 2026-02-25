import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { ShoppingBag, Search, Filter, MapPin, ShoppingCart, Plus, Minus, Heart, ArrowUpDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  business: {
    business_name: string;
    state: string | null;
    district: string | null;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('newest');
  
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (data) {
        setWishlist(new Set(data.map(item => item.product_id)));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          business:businesses (
            business_name,
            state,
            district
          )
        `)
        .eq('is_available', true)
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.get(product.id);
    const newQuantity = (existing?.quantity || 0) + 1;
    
    if (newQuantity > product.stock_quantity) {
      toast({
        title: 'Limited Stock',
        description: `Only ${product.stock_quantity} available`,
        variant: 'destructive',
      });
      return;
    }

    setCart(new Map(cart.set(product.id, {
      product,
      quantity: newQuantity,
    })));

    toast({
      title: 'Added to Cart',
      description: `${product.name} added to your cart`,
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const existing = cart.get(productId);
    if (!existing) return;

    const newQuantity = existing.quantity + delta;
    if (newQuantity <= 0) {
      const newCart = new Map(cart);
      newCart.delete(productId);
      setCart(newCart);
    } else if (newQuantity <= existing.product.stock_quantity) {
      setCart(new Map(cart.set(productId, {
        ...existing,
        quantity: newQuantity,
      })));
    }
  };

  const toggleWishlist = async (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const isWishlisted = wishlist.has(productId);
    
    try {
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        const newWishlist = new Set(wishlist);
        newWishlist.delete(productId);
        setWishlist(newWishlist);
        
        toast({
          title: 'Removed from Wishlist',
          description: 'Item removed from your wishlist',
        });
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        
        setWishlist(new Set(wishlist).add(productId));
        
        toast({
          title: 'Added to Wishlist ❤️',
          description: 'Item saved to your wishlist',
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.product.price * item.quantity;
    });
    return total;
  };

  const proceedToCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (cart.size === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add some products to your cart first',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to checkout with cart data
    setOrderDialogOpen(false);
    navigate('/checkout', { state: { cart } });
  };

  const categories = [
    'Handicrafts',
    'Textiles',
    'Food Products',
    'Agriculture',
    'Dairy',
    'Beauty',
    'Home Decor',
    'Jewelry',
    'Other',
  ];

  

  const locations = [...new Set(products.map(p => p.business.state).filter(Boolean))] as string[];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' ||
        product.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchesLocation =
        locationFilter === 'all' ||
        product.business.state?.toLowerCase() === locationFilter.toLowerCase();
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name-az': return a.name.localeCompare(b.name);
        case 'name-za': return b.name.localeCompare(a.name);
        default: return 0; // newest — already sorted by created_at desc from DB
      }
    });

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Marketplace 🛍️
            </h1>
            <p className="text-muted-foreground">
              Discover handmade products from rural women entrepreneurs.
            </p>
          </div>
          <Button
            variant={cart.size > 0 ? 'hero' : 'outline'}
            onClick={() => setOrderDialogOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cart.size})
            {cart.size > 0 && (
              <span className="ml-2 font-bold">₹{getTotalCartAmount().toLocaleString()}</span>
            )}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-az">Name: A to Z</SelectItem>
                  <SelectItem value="name-za">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {locations.length > 0 && (
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc.toLowerCase()}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.get(product.id);
              return (
                <Card key={product.id} className="card-warm overflow-hidden group relative">
                  {/* Wishlist Heart Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-2 right-2 z-10 bg-background/80 hover:bg-background ${
                      wishlist.has(product.id) ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                    onClick={(e) => toggleWishlist(product.id, e)}
                  >
                    <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <div
                    className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-primary/30" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {product.business.business_name}
                    </p>
                    {product.business.district && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {product.business.district}, {product.business.state}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/{product.unit}</span>
                      </div>
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <Badge variant="outline" className="text-xs text-warning border-warning">
                          Only {product.stock_quantity} left
                        </Badge>
                      )}
                    </div>
                    {product.stock_quantity === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        disabled
                      >
                        Out of Stock
                      </Button>
                    ) : cartItem ? (
                      <div className="flex items-center justify-between mt-3 bg-muted rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(product.id, -1);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold">{cartItem.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(product.id, 1);
                          }}
                          disabled={cartItem.quantity >= product.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Product Detail Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-lg">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading">{selectedProduct.name}</DialogTitle>
                  <DialogDescription>
                    By {selectedProduct.business.business_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <ShoppingBag className="h-16 w-16 text-primary/30" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-2xl text-primary">
                        ₹{selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/{selectedProduct.unit}</span>
                    </div>
                    <Badge variant="secondary">{selectedProduct.stock_quantity} in stock</Badge>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cart Dialog */}
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Your Cart</DialogTitle>
              <DialogDescription>Review your items before placing order</DialogDescription>
            </DialogHeader>
            {cart.size === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(cart.values()).map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-primary/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ₹{product.price} × {quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(product.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-bold shrink-0">
                      ₹{(product.price * quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{getTotalCartAmount().toLocaleString()}
                  </span>
                </div>
                <Button variant="hero" className="w-full" size="lg" onClick={proceedToCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
