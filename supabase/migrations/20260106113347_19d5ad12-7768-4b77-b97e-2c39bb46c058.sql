-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_scores table for leaderboard
CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for questions (public read)
CREATE POLICY "Anyone can view questions" ON public.quiz_questions FOR SELECT USING (true);

-- RLS Policies for scores
CREATE POLICY "Anyone can view scores" ON public.quiz_scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON public.quiz_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample cyber awareness questions
INSERT INTO public.quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category) VALUES
('What is phishing?', 'A type of fishing', 'A cyber attack using fake emails/websites', 'A programming language', 'A network protocol', 'B', 'phishing'),
('What does HTTPS stand for?', 'HyperText Transfer Protocol Secure', 'High Tech Protocol System', 'Hyper Transfer Process Secure', 'Home Text Protocol Service', 'A', 'web_security'),
('What is a firewall?', 'A wall made of fire', 'A security system that monitors network traffic', 'A type of virus', 'A programming tool', 'B', 'network_security'),
('What is two-factor authentication?', 'Using two passwords', 'A security method requiring two forms of verification', 'Having two email accounts', 'Using two browsers', 'B', 'authentication'),
('What is malware?', 'Malfunctioning hardware', 'Malicious software designed to harm systems', 'A type of email', 'A web browser', 'B', 'malware'),
('What is a VPN used for?', 'Video Processing Network', 'Virtual Private Network for secure browsing', 'Virus Protection Node', 'Visual Programming Navigator', 'B', 'privacy'),
('What is ransomware?', 'Software that demands payment to restore access', 'A type of antivirus', 'A backup software', 'A password manager', 'A', 'malware'),
('What is social engineering?', 'Building social media platforms', 'Manipulating people to reveal confidential info', 'Engineering social networks', 'Creating chat applications', 'B', 'social_engineering'),
('What is the safest password practice?', 'Using the same password everywhere', 'Using unique, complex passwords for each account', 'Writing passwords on sticky notes', 'Sharing passwords with friends', 'B', 'passwords'),
('What is a DDoS attack?', 'Distributed Denial of Service attack', 'Direct Data Operating System', 'Digital Download Service', 'Data Disk Operating System', 'A', 'network_security'),
('What should you do if you receive a suspicious email?', 'Click all links to investigate', 'Delete it and report as phishing', 'Forward it to everyone', 'Reply with personal info', 'B', 'phishing'),
('What is encryption?', 'Deleting files permanently', 'Converting data into a coded format', 'Compressing files', 'Backing up data', 'B', 'encryption'),
('What is a strong password characteristic?', 'Your birthdate', 'Mix of letters, numbers, and symbols', 'Your pet''s name', 'Simple words', 'B', 'passwords'),
('What is a trojan horse in cybersecurity?', 'A wooden horse', 'Malware disguised as legitimate software', 'A type of firewall', 'A security protocol', 'B', 'malware'),
('What does SSL certificate indicate?', 'The site is slow', 'The connection is encrypted and secure', 'The site has ads', 'The site is free', 'B', 'web_security'),
('What is identity theft?', 'Losing your ID card', 'Stealing personal info to commit fraud', 'Changing your name', 'Creating a new email', 'B', 'privacy'),
('What is a botnet?', 'A network of robots', 'Network of infected computers controlled remotely', 'A type of antivirus', 'A social media platform', 'B', 'malware'),
('What is the purpose of antivirus software?', 'Speed up computer', 'Detect and remove malicious software', 'Create documents', 'Browse the internet', 'B', 'security_tools'),
('What is spyware?', 'Software for spies', 'Software that secretly monitors user activity', 'A type of browser', 'An email client', 'B', 'malware'),
('What is a zero-day vulnerability?', 'A bug fixed immediately', 'A security flaw unknown to the vendor', 'A scheduled update', 'A type of backup', 'B', 'vulnerabilities');
