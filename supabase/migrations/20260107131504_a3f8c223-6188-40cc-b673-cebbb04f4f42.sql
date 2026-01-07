-- Create certificates table to store issued certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  certificate_id text NOT NULL UNIQUE,
  username text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage integer NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certificates_percentage_check CHECK (percentage >= 75)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can view certificates (for verification)
CREATE POLICY "Anyone can view certificates for verification"
ON public.certificates
FOR SELECT
USING (true);

-- Users can insert their own certificates
CREATE POLICY "Users can insert own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);