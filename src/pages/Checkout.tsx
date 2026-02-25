import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import {
  CreditCard,
  Smartphone,
  Banknote,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock_quantity: number;
    image_url: string | null;
    business_id?: string;
    business: {
      business_name: string;
      state: string | null;
      district: string | null;
    };
  };
  quantity: number;
}

type PaymentMethod = 'cod' | 'upi' | 'card';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // Get cart from location state
    const cartData = location.state?.cart;
    if (!cartData || cartData.size === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart first.',
        variant: 'destructive',
      });
      navigate('/marketplace');
      return;
    }
    setCart(new Map(cartData));
  }, [authLoading, user, location.state, navigate, toast]);

  const getTotalAmount = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.product.price * item.quantity;
    });
    return total;
  };

  const getItemCount = () => {
    let count = 0;
    cart.forEach((item) => {
      count += item.quantity;
    });
    return count;
  };

  const handleCancelOrder = () => {
    setCancelDialogOpen(false);
    navigate('/marketplace');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    if (!shippingAddress.trim()) {
      toast({
        title: 'Address required',
        description: 'Please enter your shipping address.',
        variant: 'destructive',
      });
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      toast({
        title: 'Phone required',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Group items by business
      const ordersByBusiness = new Map<string, CartItem[]>();
      
      for (const [_, item] of cart) {
        // Fetch business_id for each product
        const { data: productData } = await supabase
          .from('products')
          .select('business_id')
          .eq('id', item.product.id)
          .single();

        if (!productData) continue;

        const businessId = productData.business_id;
        const items = ordersByBusiness.get(businessId) || [];
        items.push({ ...item, product: { ...item.product, business_id: businessId } });
        ordersByBusiness.set(businessId, items);
      }

      let lastOrderId = '';

      // Create orders for each business
      for (const [businessId, items] of ordersByBusiness) {
        const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            business_id: businessId,
            total_amount: total,
            status: 'pending',
            shipping_address: shippingAddress,
            phone: phone,
            notes: `Payment: ${paymentMethod.toUpperCase()}${notes ? ` | ${notes}` : ''}`,
          })
          .select()
          .single();

        if (orderError) throw orderError;
        lastOrderId = order.id;

        // Add order items
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          total_price: item.product.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Reduce stock for each product
        for (const item of items) {
          const newStock = item.product.stock_quantity - item.quantity;
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, newStock) })
            .eq('id', item.product.id);
        }

        // Send order notification
        try {
          await supabase.functions.invoke('send-order-notification', {
            body: {
              orderId: order.id,
              buyerEmail: user.email,
              orderTotal: total,
              paymentMethod: paymentMethod,
              items: items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          });
        } catch (notifError) {
          console.log('Notification service:', notifError);
        }
      }

      setOrderId(lastOrderId);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'cod' as PaymentMethod,
      label: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: Banknote,
    },
    {
      id: 'upi' as PaymentMethod,
      label: 'UPI Payment',
      description: 'PhonePe, Google Pay, Paytm, etc.',
      icon: Smartphone,
    },
    {
      id: 'card' as PaymentMethod,
      label: 'Debit/Credit Card',
      description: 'Visa, Mastercard, RuPay',
      icon: CreditCard,
    },
  ];

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse h-96 bg-muted rounded-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketplace')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Checkout 🛒
            </h1>
            <p className="text-muted-foreground text-sm">
              Complete your order
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address with pincode"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Special instructions"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <method.icon className={`h-6 w-6 ${
                        paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="cursor-pointer font-medium">
                          {method.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 After placing order, you'll receive payment details on your registered phone.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💳 Secure card payment will be processed after order confirmation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Array.from(cart.values()).map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-primary/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ₹{item.product.price}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({getItemCount()})</span>
                    <span>₹{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-success">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <Button
                    variant="hero"
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? Your cart items will be preserved.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Continue Shopping
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder}>
                Yes, Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={() => {}}>
          <DialogContent className="text-center">
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <DialogTitle className="text-2xl mb-2">Order Placed! 🎉</DialogTitle>
              <DialogDescription className="text-base">
                Your order has been placed successfully.
                {paymentMethod === 'cod' && ' Pay ₹' + getTotalAmount().toLocaleString() + ' on delivery.'}
                {paymentMethod === 'upi' && ' Payment details will be sent to your phone.'}
                {paymentMethod === 'card' && ' Payment will be processed shortly.'}
              </DialogDescription>
              {orderId && (
                <p className="text-sm text-muted-foreground mt-2">
                  Order ID: #{orderId.slice(0, 8)}
                </p>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => navigate('/marketplace')} className="w-full sm:w-auto">
                Continue Shopping
              </Button>
              <Button variant="hero" onClick={() => navigate('/my-orders')} className="w-full sm:w-auto">
                View My Orders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
