import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowLeft, Clock, Target, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  profiles: {
    username: string;
  } | null;
}

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select(`
          id,
          score,
          total_questions,
          time_taken_seconds,
          completed_at,
          profiles!quiz_scores_user_id_fkey (username)
        `)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(20);

      if (!error && data) {
        setEntries(data as unknown as LeaderboardEntry[]);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMjU1LDIxOCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          </div>
        </div>

        <Card className="bg-slate-900/80 border-cyan-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-center">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No scores yet. Be the first to complete the quiz!
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      index < 3 
                        ? 'bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-cyan-500/20' 
                        : 'bg-slate-800/40'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center">
                      {index < 3 ? (
                        <Medal className={`w-6 h-6 mx-auto ${getMedalColor(index + 1)}`} />
                      ) : (
                        <span className="text-slate-500 font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        {entry.profiles?.username || 'Anonymous'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.completed_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Target className="w-4 h-4" />
                        <span className="font-mono">{entry.score}/{entry.total_questions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-sm">{formatTime(entry.time_taken_seconds)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
