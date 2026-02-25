-- Fix SHG member issue: allow inserting members with any user_id for the group leader
-- Update the RLS policy for shg_group_members to allow leaders to add members with different user_ids

-- Drop existing policy
DROP POLICY IF EXISTS "Leaders can manage members" ON public.shg_group_members;

-- Create new policy that allows leaders to manage all members in their groups
CREATE POLICY "Leaders can manage members" 
ON public.shg_group_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_members.group_id 
    AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_members.group_id 
    AND g.leader_user_id = auth.uid()
  )
);

-- Also fix shg_group_income to allow leaders to record income
DROP POLICY IF EXISTS "Leaders can manage income" ON public.shg_group_income;

CREATE POLICY "Leaders can manage income" 
ON public.shg_group_income 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_income.group_id 
    AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_income.group_id 
    AND g.leader_user_id = auth.uid()
  )
);

-- Also fix shg_group_savings to allow leaders to record savings
DROP POLICY IF EXISTS "Leaders can manage savings" ON public.shg_group_savings;

CREATE POLICY "Leaders can manage savings" 
ON public.shg_group_savings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_savings.group_id 
    AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_savings.group_id 
    AND g.leader_user_id = auth.uid()
  )
);