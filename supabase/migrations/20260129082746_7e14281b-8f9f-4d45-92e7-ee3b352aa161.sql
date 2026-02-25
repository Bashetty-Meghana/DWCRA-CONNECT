-- =====================================================
-- RURAL WOMEN MICRO-BUSINESS SUPPORT PLATFORM
-- Complete Database Schema
-- =====================================================

-- 1. Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('entrepreneur', 'buyer', 'admin');

-- 2. Create business_category enum
CREATE TYPE public.business_category AS ENUM (
  'handicrafts', 'textiles', 'food_products', 'agriculture', 
  'dairy', 'beauty', 'services', 'retail', 'other'
);

-- 3. Create order_status enum
CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

-- 4. Create course_level enum
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- 5. Create course_category enum
CREATE TYPE public.course_category AS ENUM (
  'business_basics', 'digital_skills', 'financial_literacy', 
  'marketing', 'product_development', 'communication', 'legal', 'other'
);

-- =====================================================
-- USERS & PROFILES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  district TEXT,
  village TEXT,
  profile_image_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'entrepreneur',
  UNIQUE(user_id, role)
);

-- =====================================================
-- BUSINESSES
-- =====================================================

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  category business_category NOT NULL DEFAULT 'other',
  address TEXT,
  state TEXT,
  district TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  unit TEXT DEFAULT 'piece',
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  shipping_address TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- COURSES & LEARNING
-- =====================================================

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category course_category NOT NULL DEFAULT 'other',
  level course_level NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  content TEXT,
  instructor_name TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- =====================================================
-- INCOME & EXPENSES
-- =====================================================

CREATE TABLE public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- GOVERNMENT SCHEMES
-- =====================================================

CREATE TABLE public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT,
  eligibility TEXT,
  documents_required TEXT,
  application_process TEXT,
  application_url TEXT,
  ministry TEXT,
  scheme_type TEXT,
  applicable_states TEXT[],
  for_women BOOLEAN DEFAULT true,
  max_amount DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.scheme_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.government_schemes(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'applied',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  notes TEXT
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Businesses policies
CREATE POLICY "Anyone can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can manage their business" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Business owners can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = products.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Buyers can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Business owners can view orders for their business" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = orders.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Business owners can update order status" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = orders.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.buyer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE businesses.id = orders.business_id 
        AND businesses.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Buyers can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.buyer_id = auth.uid()
    )
  );

-- Courses policies (public read)
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Course modules policies
CREATE POLICY "Anyone can view course modules" ON public.course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_modules.course_id 
      AND courses.is_published = true
    )
  );

-- Learning progress policies
CREATE POLICY "Users can view own progress" ON public.learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON public.learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- Income policies
CREATE POLICY "Users can manage own income" ON public.income
  FOR ALL USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can manage own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

-- Government schemes policies (public read)
CREATE POLICY "Anyone can view schemes" ON public.government_schemes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage schemes" ON public.government_schemes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Scheme applications policies
CREATE POLICY "Users can manage own applications" ON public.scheme_applications
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
  BEFORE UPDATE ON public.government_schemes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGER: Auto-create profile and role on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'entrepreneur'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();