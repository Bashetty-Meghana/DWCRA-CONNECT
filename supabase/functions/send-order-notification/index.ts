import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface OrderNotificationRequest {
  orderId: string;
  buyerEmail: string;
  orderTotal: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, buyerEmail, orderTotal, items }: OrderNotificationRequest = await req.json();

    console.log(`📧 Order notification triggered for order: ${orderId}`);
    console.log(`📬 Buyer email: ${buyerEmail}`);
    console.log(`💰 Order total: ₹${orderTotal}`);
    console.log(`📦 Items:`, items);

    // Log the notification attempt (in production, this would send an actual email)
    // Since we don't have RESEND_API_KEY configured, we'll log for now
    
    const notificationMessage = `
Order Confirmation
==================
Order ID: ${orderId.slice(0, 8)}
Email: ${buyerEmail}
Total: ₹${orderTotal.toLocaleString()}

Items:
${items.map(item => `- ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Your order has been placed successfully!
Track your order status in the "My Orders" section.

Thank you for shopping with Gramin Udyami! 🙏
    `.trim();

    console.log(notificationMessage);

    // Return success - in production with RESEND_API_KEY, this would actually send the email
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order notification logged successfully',
        note: 'Email sending requires RESEND_API_KEY configuration. Currently logging only.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-order-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});