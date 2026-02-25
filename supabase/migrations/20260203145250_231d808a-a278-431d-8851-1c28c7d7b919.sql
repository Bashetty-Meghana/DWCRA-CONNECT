-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.wishlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
ON public.wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
ON public.wishlist
FOR DELETE
USING (auth.uid() = user_id);

-- Add RLS policy for buyers to cancel their own orders (only pending/confirmed status)
CREATE POLICY "Buyers can cancel their pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = buyer_id AND status IN ('pending', 'confirmed', 'processing'))
WITH CHECK (auth.uid() = buyer_id AND status = 'cancelled');