
-- Fix certificates RLS: change restrictive to permissive
DROP POLICY IF EXISTS "Anyone can view certificates for verification" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;

CREATE POLICY "Anyone can view certificates for verification"
ON public.certificates FOR SELECT
USING (true);

CREATE POLICY "Users can insert own certificates"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);
