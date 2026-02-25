
-- Fix shg_group_members: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Group members can view members" ON public.shg_group_members;
DROP POLICY IF EXISTS "Leaders can manage members" ON public.shg_group_members;

CREATE POLICY "Group members can view members"
ON public.shg_group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shg_group_members m
    WHERE m.group_id = shg_group_members.group_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Leaders can manage members"
ON public.shg_group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_members.group_id AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_members.group_id AND g.leader_user_id = auth.uid()
  )
);

-- Fix shg_group_income: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Group members can view income" ON public.shg_group_income;
DROP POLICY IF EXISTS "Leaders can manage income" ON public.shg_group_income;

CREATE POLICY "Group members can view income"
ON public.shg_group_income
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shg_group_members m
    WHERE m.group_id = shg_group_income.group_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Leaders can manage income"
ON public.shg_group_income
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_income.group_id AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_income.group_id AND g.leader_user_id = auth.uid()
  )
);

-- Fix shg_group_savings: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Group members can view savings" ON public.shg_group_savings;
DROP POLICY IF EXISTS "Leaders can manage savings" ON public.shg_group_savings;

CREATE POLICY "Group members can view savings"
ON public.shg_group_savings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shg_group_members m
    WHERE m.group_id = shg_group_savings.group_id AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Leaders can manage savings"
ON public.shg_group_savings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_savings.group_id AND g.leader_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shg_groups g
    WHERE g.id = shg_group_savings.group_id AND g.leader_user_id = auth.uid()
  )
);
