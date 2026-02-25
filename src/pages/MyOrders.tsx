import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Ban,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  notes: string | null;
  shipping_address: string | null;
  phone: string | null;
  business?: {
    business_name: string;
    state: string | null;
    district: string | null;
  };
}

export default function MyOrders() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      // Fetch orders where user is buyer
      const { data: buyerData, error: buyerError } = await supabase
        .from('orders')
        .select(`
          *,
          business:businesses (
            business_name,
            state,
            district
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (buyerError) throw buyerError;
      setBuyerOrders(buyerData || []);

      // Fetch orders where user is the seller (has business)
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (businessData) {
        const { data: sellerData, error: sellerError } = await supabase
          .from('orders')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        if (sellerError) throw sellerError;
        setSellerOrders(sellerData || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Status Updated! ✓',
        description: `Order status changed to ${newStatus}`,
      });

      // Refresh orders
      fetchOrders();
      
      // Update selected order if viewing
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
    setDetailOpen(true);
  };

  const canCancelOrder = (status: OrderStatus) => {
    return ['pending', 'confirmed', 'processing'].includes(status);
  };

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery time is too long',
    'Need to modify order details',
    'Payment issues',
    'Other',
  ];

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason) {
      toast({
        title: 'Please select a reason',
        description: 'Select a reason for cancelling the order.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          notes: `Cancelled: ${cancelReason}`,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderToCancel);

      if (error) throw error;

      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
      });

      fetchOrders();
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
      
      if (selectedOrder?.id === orderToCancel) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle2,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle2,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const isSeller = role === 'entrepreneur' || role === 'admin';

  const OrderCard = ({ order, isBuyerOrder = false }: { order: Order; isBuyerOrder?: boolean }) => {
    const StatusIcon = getStatusIcon(order.status);
    
    return (
      <Card className="card-warm cursor-pointer group" onClick={() => openOrderDetail(order)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
              <p className="font-semibold text-lg">₹{Number(order.total_amount).toLocaleString()}</p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          
          {order.business && (
            <p className="text-sm text-muted-foreground mb-2">
              From: {order.business.business_name}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-2">
              {isBuyerOrder && canCancelOrder(order.status) && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOrderToCancel(order.id);
                    setCancelDialogOpen(true);
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
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
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            My Orders 📦
          </h1>
          <p className="text-muted-foreground">
            Track your orders and manage deliveries.
          </p>
        </div>

        {/* Show only sales for entrepreneurs, purchases for buyers */}
        {isSeller ? (
          // Entrepreneurs see only their sales
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders Received ({sellerOrders.length})
            </h2>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : sellerOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No orders received yet</h3>
                <p className="text-muted-foreground mb-4">
                  Once customers order your products, they'll appear here.
                </p>
                <Button onClick={() => navigate('/my-business')}>
                  Manage Products
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sellerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Buyers see their purchases
          <div>
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              My Purchases ({buyerOrders.length})
            </h2>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : buyerOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start shopping from our marketplace to see your orders here.
                </p>
                <Button onClick={() => navigate('/marketplace')}>
                  Browse Marketplace
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {buyerOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isBuyerOrder />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="font-heading">
                        Order #{selectedOrder.id.slice(0, 8)}
                      </DialogTitle>
                      <DialogDescription>
                        Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </DialogDescription>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* Order Progress */}
                <div className="my-6">
                  <div className="flex items-center justify-between relative">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                      const StatusIcon = getStatusIcon(status as OrderStatus);
                      const statusIndex = statusOptions.indexOf(selectedOrder.status);
                      const currentIndex = statusOptions.indexOf(status as OrderStatus);
                      const isActive = currentIndex <= statusIndex && selectedOrder.status !== 'cancelled';
                      
                      return (
                        <div key={status} className="flex flex-col items-center z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0" />
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">₹{Number(item.unit_price).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-semibold">₹{Number(item.total_price).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Buyer Address - Show to Sellers */}
                {isSeller && sellerOrders.some(o => o.id === selectedOrder.id) && (selectedOrder.shipping_address || selectedOrder.phone) && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Buyer Delivery Details
                    </h4>
                    {selectedOrder.shipping_address && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Address:</strong> {selectedOrder.shipping_address}
                      </p>
                    )}
                    {selectedOrder.phone && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Phone:</strong> {selectedOrder.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(selectedOrder.total_amount).toLocaleString()}
                  </span>
                </div>

                {/* Seller Controls */}
                {isSeller && sellerOrders.some(o => o.id === selectedOrder.id) && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Update Status:</span>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Buyer Cancel Button */}
                {!isSeller && canCancelOrder(selectedOrder.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setOrderToCancel(selectedOrder.id);
                      setCancelDialogOpen(true);
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog with Reasons */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setOrderToCancel(null);
            setCancelReason('');
          }
        }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Please select a reason for cancelling this order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4 space-y-2">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    cancelReason === reason 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setOrderToCancel(null);
                setCancelReason('');
              }}>
                Keep Order
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelOrder} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={!cancelReason}
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}