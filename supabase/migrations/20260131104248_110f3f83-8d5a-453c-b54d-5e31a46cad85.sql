-- Create SHG Group business type enum
CREATE TYPE public.shg_business_type AS ENUM (
  'tailoring', 
  'dairy', 
  'handicrafts', 
  'agriculture', 
  'food_processing', 
  'textiles', 
  'poultry', 
  'fishery',
  'beauty_parlor',
  'retail',
  'other'
);

-- Create SHG member role enum
CREATE TYPE public.shg_member_role AS ENUM ('leader', 'treasurer', 'secretary', 'member');

-- Create SHG Groups table
CREATE TABLE public.shg_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT,
  state TEXT,
  leader_user_id UUID NOT NULL,
  business_type shg_business_type NOT NULL DEFAULT 'other',
  description TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shg_groups ENABLE ROW LEVEL SECURITY;

-- Create SHG Group Members table
CREATE TABLE public.shg_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.shg_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role shg_member_role NOT NULL DEFAULT 'member',
  full_name TEXT NOT NULL,
  phone TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.shg_group_members ENABLE ROW LEVEL SECURITY;

-- Create SHG Group Income table
CREATE TABLE public.shg_group_income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.shg_groups(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  recorded_by UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shg_group_income ENABLE ROW LEVEL SECURITY;

-- Create SHG Group Savings table
CREATE TABLE public.shg_group_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.shg_groups(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  contributor_id UUID,
  contributor_name TEXT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shg_group_savings ENABLE ROW LEVEL SECURITY;

-- Create Loan Schemes table (separate from government_schemes for loan-specific data)
CREATE TABLE public.loan_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ministry TEXT,
  loan_amount_min NUMERIC,
  loan_amount_max NUMERIC,
  interest_rate NUMERIC NOT NULL,
  subsidy_percentage NUMERIC DEFAULT 0,
  tenure_months_min INTEGER,
  tenure_months_max INTEGER,
  eligibility TEXT,
  applicable_business_types TEXT[],
  applicable_states TEXT[],
  for_women BOOLEAN DEFAULT true,
  for_shg BOOLEAN DEFAULT false,
  application_url TEXT,
  documents_required TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_schemes ENABLE ROW LEVEL SECURITY;

-- Create User Saved Loans table for bookmarking
CREATE TABLE public.saved_loan_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_scheme_id UUID NOT NULL REFERENCES public.loan_schemes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, loan_scheme_id)
);

-- Enable RLS
ALTER TABLE public.saved_loan_schemes ENABLE ROW LEVEL SECURITY;

-- Create EMI Calculations table (to save user's EMI calculations)
CREATE TABLE public.emi_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_scheme_id UUID REFERENCES public.loan_schemes(id),
  loan_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  tenure_months INTEGER NOT NULL,
  monthly_emi NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  total_interest NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emi_calculations ENABLE ROW LEVEL SECURITY;

-- Add shg_group_id to businesses table for group businesses
ALTER TABLE public.businesses ADD COLUMN shg_group_id UUID REFERENCES public.shg_groups(id);

-- Add loan_repayment category to expenses (no ALTER ENUM needed, just allow new category values)

-- Create RLS Policies

-- SHG Groups: Anyone can view active groups, members can manage
CREATE POLICY "Anyone can view active SHG groups" ON public.shg_groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Leaders can manage their groups" ON public.shg_groups
  FOR ALL USING (auth.uid() = leader_user_id);

-- Group Members: Members can view their group members
CREATE POLICY "Group members can view members" ON public.shg_group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shg_group_members m 
      WHERE m.group_id = shg_group_members.group_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can manage members" ON public.shg_group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shg_groups g 
      WHERE g.id = shg_group_members.group_id 
      AND g.leader_user_id = auth.uid()
    )
  );

-- Group Income: Members can view, leaders can manage
CREATE POLICY "Group members can view income" ON public.shg_group_income
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shg_group_members m 
      WHERE m.group_id = shg_group_income.group_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can manage income" ON public.shg_group_income
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shg_groups g 
      WHERE g.id = shg_group_income.group_id 
      AND g.leader_user_id = auth.uid()
    )
  );

-- Group Savings: Members can view, leaders can manage
CREATE POLICY "Group members can view savings" ON public.shg_group_savings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shg_group_members m 
      WHERE m.group_id = shg_group_savings.group_id 
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can manage savings" ON public.shg_group_savings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shg_groups g 
      WHERE g.id = shg_group_savings.group_id 
      AND g.leader_user_id = auth.uid()
    )
  );

-- Loan Schemes: Anyone can view active schemes
CREATE POLICY "Anyone can view active loan schemes" ON public.loan_schemes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage loan schemes" ON public.loan_schemes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Saved Loans: Users can manage their own bookmarks
CREATE POLICY "Users can manage their saved loans" ON public.saved_loan_schemes
  FOR ALL USING (auth.uid() = user_id);

-- EMI Calculations: Users can manage their own calculations
CREATE POLICY "Users can manage their EMI calculations" ON public.emi_calculations
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_shg_groups_updated_at
  BEFORE UPDATE ON public.shg_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_schemes_updated_at
  BEFORE UPDATE ON public.loan_schemes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample loan schemes data
INSERT INTO public.loan_schemes (name, description, ministry, loan_amount_min, loan_amount_max, interest_rate, subsidy_percentage, tenure_months_min, tenure_months_max, eligibility, applicable_business_types, applicable_states, for_women, for_shg, application_url, documents_required) VALUES
('Mudra Yojana - Shishu', 'PMMY Shishu loan for micro enterprises up to ₹50,000', 'Ministry of Finance', 10000, 50000, 10.5, 0, 12, 60, 'Any Indian citizen above 18 years starting or expanding micro enterprise', ARRAY['tailoring', 'handicrafts', 'food_processing', 'retail'], ARRAY['All India'], true, true, 'https://www.mudra.org.in', 'Aadhaar, PAN, Business plan, Address proof'),
('Mudra Yojana - Kishor', 'PMMY Kishor loan for small enterprises ₹50,000 to ₹5 lakhs', 'Ministry of Finance', 50000, 500000, 11.0, 0, 12, 84, 'Indian citizen with existing business or expansion plans', ARRAY['tailoring', 'dairy', 'handicrafts', 'agriculture', 'food_processing'], ARRAY['All India'], true, true, 'https://www.mudra.org.in', 'Aadhaar, PAN, Business registration, Bank statements'),
('Stand Up India', 'Loans for SC/ST and Women entrepreneurs ₹10 lakhs to ₹1 crore', 'Ministry of Finance', 1000000, 10000000, 9.25, 15, 24, 84, 'SC/ST and/or Women entrepreneur with 51% stake in enterprise', ARRAY['dairy', 'agriculture', 'food_processing', 'textiles', 'retail'], ARRAY['All India'], true, false, 'https://www.standupmitra.in', 'Aadhaar, PAN, Caste certificate (if applicable), Business plan, Land/property documents'),
('Mahila Udyam Nidhi', 'Scheme for women entrepreneurs in small scale industries', 'SIDBI', 100000, 1000000, 8.5, 25, 12, 120, 'Women entrepreneur in SSI sector', ARRAY['tailoring', 'handicrafts', 'textiles', 'beauty_parlor'], ARRAY['All India'], true, false, 'https://sidbi.in', 'Aadhaar, PAN, Project report, SSI registration'),
('PMEGP', 'Prime Minister Employment Generation Programme', 'Ministry of MSME', 25000, 2500000, 11.0, 35, 36, 84, 'Any individual above 18 years, preference to women and SC/ST', ARRAY['tailoring', 'dairy', 'handicrafts', 'food_processing', 'poultry'], ARRAY['All India'], true, true, 'https://www.kviconline.gov.in/pmegp', 'Aadhaar, PAN, Educational certificate, Caste certificate'),
('Stree Shakti Package', 'Special loan scheme for women entrepreneurs', 'State Bank of India', 50000, 2500000, 9.0, 0, 12, 84, 'Women having majority ownership in enterprise', ARRAY['tailoring', 'handicrafts', 'textiles', 'retail', 'beauty_parlor'], ARRAY['All India'], true, true, 'https://sbi.co.in', 'Aadhaar, PAN, Business registration, Income proof'),
('Cent Kalyani Scheme', 'Collateral-free loans for women entrepreneurs', 'Central Bank of India', 100000, 10000000, 8.75, 0, 12, 84, 'Women entrepreneur in micro/small enterprise', ARRAY['tailoring', 'dairy', 'handicrafts', 'food_processing', 'textiles'], ARRAY['All India'], true, false, 'https://centralbankofindia.co.in', 'Aadhaar, PAN, Project report, Business registration'),
('NABARD SHG Loan', 'NABARD loan scheme for Self Help Groups', 'NABARD', 50000, 500000, 7.0, 25, 12, 60, 'Registered and active SHG with minimum 6 months savings record', ARRAY['dairy', 'agriculture', 'poultry', 'handicrafts'], ARRAY['All India'], true, true, 'https://www.nabard.org', 'SHG registration, Bank passbook, Meeting minutes, Member list'),
('Annapurna Scheme', 'Loan for women in food catering business', 'State Bank of Mysore', 50000, 50000, 9.5, 0, 12, 36, 'Women entrepreneur setting up food catering unit', ARRAY['food_processing'], ARRAY['Karnataka', 'Maharashtra', 'Tamil Nadu'], true, false, 'https://sbm.co.in', 'Aadhaar, PAN, Food license, Address proof'),
('Udyogini Scheme', 'Scheme for women below poverty line', 'Women Development Corporation', 15000, 300000, 0, 30, 12, 84, 'Women from BPL families aged 18-45', ARRAY['tailoring', 'dairy', 'handicrafts', 'food_processing', 'poultry'], ARRAY['Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu'], true, true, 'https://kswdc.karnataka.gov.in', 'Aadhaar, BPL card, Age proof, Caste certificate');