import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Target, Home, RotateCcw, Star, Award } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import Certificate from './Certificate';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  onHome: () => void;
  onRetry: () => void;
}

export default function QuizResult({ score, totalQuestions, timeTaken, onHome, onRetry }: QuizResultProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [username, setUsername] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);

  useEffect(() => {
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Fetch username
    const fetchUsername = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setUsername(data.username);
        }
      }
    };
    fetchUsername();

    // Save score to database
    const saveScore = async () => {
      if (!user || saved) return;

      const { error } = await supabase
        .from('quiz_scores')
        .insert({
          user_id: user.id,
          score,
          total_questions: totalQuestions,
          time_taken_seconds: timeTaken
        });

      if (error) {
        toast.error('Failed to save score');
      } else {
        setSaved(true);
        toast.success('Score saved to leaderboard!');
      }
    };

    saveScore();

    // Confetti for good scores
    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [user, score, totalQuestions, timeTaken, percentage, saved]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-400', message: 'Outstanding! You\'re a Cyber Security Expert!' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400', message: 'Excellent! Great cybersecurity knowledge!' };
    if (percentage >= 70) return { grade: 'B', color: 'text-cyan-400', message: 'Good job! You\'re cyber aware!' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-400', message: 'Not bad! Keep learning about cyber security!' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-400', message: 'You need more practice!' };
    return { grade: 'F', color: 'text-red-400', message: 'Time to brush up on cyber security basics!' };
  };

  const gradeInfo = getGrade();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMjU1LDIxOCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        <Card className="w-full max-w-lg relative z-10 bg-slate-900/80 border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grade */}
            <div className="text-center">
              <div className={`text-8xl font-bold ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </div>
              <p className="text-slate-400 mt-2">{gradeInfo.message}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{score}/{totalQuestions}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{percentage}%</div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatTime(timeTaken)}</div>
                <div className="text-xs text-slate-400">Time</div>
              </div>
            </div>

            {/* Certificate Button - Only show if 75% or more */}
            {percentage >= 75 && (
              <Button
                onClick={() => setShowCertificate(true)}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-semibold"
              >
                <Award className="w-5 h-5 mr-2" />
                Get Your Certificate 🎉
              </Button>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={onRetry}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={onHome}
                className="w-full h-12 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate
          username={username || 'Participant'}
          score={score}
          totalQuestions={totalQuestions}
          completedAt={new Date().toISOString()}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </>
  );
}
