
-- Fix infinite recursion: shg_group_members SELECT policy references itself
-- Use shg_groups.leader_user_id instead to avoid recursion

DROP POLICY IF EXISTS "Group members can view members" ON public.shg_group_members;
DROP POLICY IF EXISTS "Leaders can manage members" ON public.shg_group_members;

-- Leaders can do everything (SELECT, INSERT, UPDATE, DELETE)
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

-- Members can view themselves (no self-reference)
CREATE POLICY "Members can view own membership"
ON public.shg_group_members
FOR SELECT
USING (user_id = auth.uid());

-- Fix shg_group_income: avoid referencing shg_group_members in SELECT
DROP POLICY IF EXISTS "Group members can view income" ON public.shg_group_income;
DROP POLICY IF EXISTS "Leaders can manage income" ON public.shg_group_income;

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

-- Fix shg_group_savings: avoid referencing shg_group_members in SELECT
DROP POLICY IF EXISTS "Group members can view savings" ON public.shg_group_savings;
DROP POLICY IF EXISTS "Leaders can manage savings" ON public.shg_group_savings;

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
