import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Play, Trophy, LogOut, User } from 'lucide-react';
import Leaderboard from './Leaderboard';

interface QuizHomeProps {
  onStartQuiz: () => void;
}

export default function QuizHome({ onStartQuiz }: QuizHomeProps) {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUsername(data.username);
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMjU1LDIxOCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
        <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full backdrop-blur-sm">
          <User className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-medium">{username}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <Card className="w-full max-w-lg relative z-10 bg-slate-900/80 border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Cyber Awareness Quiz
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              by P Siva Sai
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
            <h3 className="text-cyan-400 font-semibold">📋 Quiz Rules</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• 10 random questions from our question bank</li>
              <li>• Full-screen mode required during quiz</li>
              <li>• Cannot exit until quiz completion</li>
              <li>• Timer tracks your completion speed</li>
              <li>• Score based on correct answers</li>
            </ul>
          </div>

          <Button
            onClick={onStartQuiz}
            className="w-full h-14 text-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-lg shadow-cyan-500/25"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Quiz
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowLeaderboard(true)}
            className="w-full h-12 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
