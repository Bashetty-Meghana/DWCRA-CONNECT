import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Briefcase,
  Package,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  address: string | null;
  state: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  phone: string | null;
  created_at: string;
  buyer: {
    full_name: string;
  } | null;
}

export default function MyBusiness() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    description: '',
    category: 'other',
    address: '',
    state: '',
    district: '',
    phone: '',
    email: '',
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'piece',
    stock_quantity: '',
    category: '',
    image_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBusiness();
    }
  }, [user]);

  const fetchBusiness = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (businessError) throw businessError;

      if (businessData) {
        setBusiness(businessData);
        setBusinessForm({
          business_name: businessData.business_name,
          description: businessData.description || '',
          category: businessData.category,
          address: businessData.address || '',
          state: businessData.state || '',
          district: businessData.district || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
        });
        
        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });
        
        setProducts(productsData || []);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });
        
        setOrders((ordersData || []).map(o => ({ ...o, buyer: null })));
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBusiness = async () => {
    try {
      const data = {
        business_name: businessForm.business_name,
        description: businessForm.description || null,
        category: businessForm.category as any,
        address: businessForm.address || null,
        state: businessForm.state || null,
        district: businessForm.district || null,
        phone: businessForm.phone || null,
        email: businessForm.email || null,
      };

      if (business) {
        const { error } = await supabase
          .from('businesses')
          .update(data)
          .eq('id', business.id);
        
        if (error) throw error;
        toast({ title: 'Business updated successfully' });
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert({ ...data, user_id: user!.id });
        
        if (error) throw error;
        toast({ title: 'Business created successfully' });
      }
      
      setBusinessDialogOpen(false);
      fetchBusiness();
    } catch (error) {
      console.error('Error saving business:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business',
        variant: 'destructive',
      });
    }
  };

  const saveProduct = async () => {
    if (!business) return;
    
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        stock_quantity: parseInt(productForm.stock_quantity),
        category: productForm.category || null,
        image_url: productForm.image_url || null,
        business_id: business.id,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: 'Product updated successfully' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        toast({ title: 'Product added successfully' });
      }

      setProductDialogOpen(false);
      setEditingProduct(null);
      resetProductForm();
      fetchBusiness();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      toast({ title: 'Product deleted' });
      fetchBusiness();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      toast({ title: `Order marked as ${status}` });
      fetchBusiness();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      unit: 'piece',
      stock_quantity: '',
      category: '',
      image_url: '',
    });
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      unit: product.unit,
      stock_quantity: product.stock_quantity.toString(),
      category: product.category || '',
      image_url: product.image_url || '',
    });
    setProductDialogOpen(true);
  };

  const categories = [
    { value: 'handicrafts', label: 'Handicrafts' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'food_products', label: 'Food Products' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'services', label: 'Services' },
    { value: 'retail', label: 'Retail' },
    { value: 'other', label: 'Other' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-blue-100 text-blue-800' },
      processing: { icon: <Package className="h-3 w-3" />, className: 'bg-purple-100 text-purple-800' },
      shipped: { icon: <Truck className="h-3 w-3" />, className: 'bg-indigo-100 text-indigo-800' },
      delivered: { icon: <CheckCircle className="h-3 w-3" />, className: 'bg-green-100 text-green-800' },
      cancelled: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.className} flex items-center gap-1`} variant="secondary">
        {config.icon}
        {status}
      </Badge>
    );
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              My Business 💼
            </h1>
            <p className="text-muted-foreground">
              Manage your products, orders, and business profile.
            </p>
          </div>
          {business && (
            <Button variant="outline" onClick={() => setBusinessDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-64" />
          </div>
        ) : !business ? (
          /* No Business - Create One */
          <Card className="p-12 text-center">
            <Store className="h-16 w-16 text-primary/30 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-semibold mb-2">
              Start Your Business Journey
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your business profile to start selling your products on the marketplace.
            </p>
            <Button variant="hero" size="lg" onClick={() => setBusinessDialogOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Business
            </Button>
          </Card>
        ) : (
          /* Business Dashboard */
          <>
            {/* Business Overview */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-heading text-xl font-bold">{business.business_name}</h2>
                      {business.is_verified && (
                        <Badge className="bg-success/10 text-success">Verified</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{business.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{categories.find((c) => c.value === business.category)?.label}</span>
                      {business.district && <span>📍 {business.district}, {business.state}</span>}
                      {business.phone && <span>📞 {business.phone}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="products">
              <TabsList className="mb-6">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Orders ({orders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-semibold">Your Products</h3>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      resetProductForm();
                      setProductDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {products.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products yet. Add your first product!</p>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <Card key={product.id} className="card-warm">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-primary/30" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                              <p className="text-sm text-primary font-bold">
                                ₹{product.price}/{product.unit}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Stock: {product.stock_quantity}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openEditProduct(product)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders">
                <h3 className="font-heading text-lg font-semibold mb-4">Received Orders</h3>
                
                {orders.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet. Keep promoting your products!</p>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">
                              {order.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>{order.buyer?.full_name || 'Unknown'}</TableCell>
                            <TableCell className="font-semibold">
                              ₹{order.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Business Dialog */}
        <Dialog open={businessDialogOpen} onOpenChange={setBusinessDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {business ? 'Edit Business' : 'Create Your Business'}
              </DialogTitle>
              <DialogDescription>
                Fill in your business details to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={businessForm.business_name}
                  onChange={(e) => setBusinessForm({ ...businessForm, business_name: e.target.value })}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                  placeholder="What does your business do?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={businessForm.category}
                  onValueChange={(value) => setBusinessForm({ ...businessForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={businessForm.state}
                    onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={businessForm.district}
                    onChange={(e) => setBusinessForm({ ...businessForm, district: e.target.value })}
                    placeholder="District"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={businessForm.phone}
                    onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBusinessDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={saveBusiness} disabled={!businessForm.business_name}>
                {business ? 'Save Changes' : 'Create Business'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="prod_description">Description</Label>
                <Textarea
                  id="prod_description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe your product"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="piece"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="prod_category">Category</Label>
                <Input
                  id="prod_category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="e.g., Handicrafts, Food, Textiles"
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={saveProduct}
                disabled={!productForm.name || !productForm.price || !productForm.stock_quantity}
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
