import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowLeft, Clock, Target, Medal, Award } from 'lucide-react';
import Certificate from './Certificate';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  username?: string;
}

interface CertificateData {
  certificate_id: string;
  username: string;
  score: number;
  total_questions: number;
  percentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  issued_at: string;
}

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch scores
      const { data: scores, error: scoresError } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(20);

      if (scoresError || !scores) {
        setLoading(false);
        return;
      }

      // Fetch profiles for usernames
      const userIds = scores.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      // Map usernames to scores
      const entriesWithUsernames = scores.map(score => ({
        ...score,
        username: profiles?.find(p => p.user_id === score.user_id)?.username || 'Anonymous'
      }));

      setEntries(entriesWithUsernames);
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

  const getPercentage = (score: number, total: number) => Math.round((score / total) * 100);

  const handleViewCertificate = async (entry: LeaderboardEntry) => {
    // Try to find existing certificate for this user
    const { data: certificate } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', entry.user_id)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (certificate) {
      setSelectedCertificate({
        certificate_id: certificate.certificate_id,
        username: certificate.username,
        score: certificate.score,
        total_questions: certificate.total_questions,
        percentage: certificate.percentage,
        difficulty: certificate.difficulty as 'easy' | 'medium' | 'hard',
        issued_at: certificate.issued_at
      });
    }
  };

  return (
    <>
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
                  {entries.map((entry, index) => {
                    const percentage = getPercentage(entry.score, entry.total_questions);
                    const hasCertificate = percentage >= 75;
                    
                    return (
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
                            {entry.username}
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
                          {hasCertificate && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewCertificate(entry)}
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 p-2"
                              title="View Certificate"
                            >
                              <Award className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <Certificate
          username={selectedCertificate.username}
          score={selectedCertificate.score}
          totalQuestions={selectedCertificate.total_questions}
          completedAt={selectedCertificate.issued_at}
          certificateId={selectedCertificate.certificate_id}
          difficulty={selectedCertificate.difficulty}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </>
  );
}