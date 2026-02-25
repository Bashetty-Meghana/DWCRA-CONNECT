import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Package,
  MapPin,
  Heart,
  HelpCircle,
  Settings,
  ShoppingBag,
  Trash2,
  Eye,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  full_name: string;
  phone: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
  };
}

export default function Account() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    state: '',
    district: '',
    village: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone, state, district, village')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          state: profileData.state || '',
          district: profileData.district || '',
          village: profileData.village || '',
        });
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setOrders(ordersData || []);

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          product:products (
            id,
            name,
            price,
            image_url,
            is_available
          )
        `)
        .eq('user_id', user.id);

      setWishlist(wishlistData as unknown as WishlistItem[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          state: formData.state,
          district: formData.district,
          village: formData.village,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated! ✓',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlist(wishlist.filter(item => item.id !== wishlistId));
      toast({
        title: 'Removed from Wishlist',
        description: 'Item has been removed from your wishlist.',
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by visiting the "My Orders" section. Each order shows its current status from Pending to Delivered.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order before it is shipped. Go to "My Orders", click on the order, and use the Cancel button if available.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Cash on Delivery (COD), UPI payments, and Card payments (Credit/Debit cards).',
    },
    {
      question: 'How do I add items to my wishlist?',
      answer: 'While browsing products in the Marketplace, click the heart icon on any product to add it to your wishlist.',
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach our support team through the contact information provided in the Help section or email us at support@example.com.',
    },
    {
      question: 'What is the return policy?',
      answer: 'Products can be returned within 7 days of delivery if they are unused and in original packaging. Contact the seller through your order details.',
    },
  ];

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
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            My Account 👤
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, orders, and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your account details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <Input id="email" value={user.email || ''} disabled />
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  View your recent orders and their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => navigate('/marketplace')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate('/my-orders')}
                      >
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/my-orders')}>
                      View All Orders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  My Wishlist
                </CardTitle>
                <CardDescription>
                  Products you've saved for later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                    <Button onClick={() => navigate('/marketplace')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted">
                          {item.product?.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold truncate">{item.product?.name}</h4>
                          <p className="text-primary font-bold">₹{Number(item.product?.price).toLocaleString()}</p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate('/marketplace')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromWishlist(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saved Address
                </CardTitle>
                <CardDescription>
                  Manage your delivery address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Enter your district"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village/Town</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Enter your village or town"
                  />
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Address'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Find answers to common questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
