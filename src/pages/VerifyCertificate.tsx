import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, XCircle, ArrowLeft, Award, Zap, Flame, Skull } from 'lucide-react';

interface CertificateData {
  certificate_id: string;
  username: string;
  score: number;
  total_questions: number;
  percentage: number;
  difficulty: string;
  issued_at: string;
}

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!certificateId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCertificate(data);
      }
      setLoading(false);
    };

    verifyCertificate();
  }, [certificateId]);

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { label: 'Beginner Level', icon: Zap, color: 'text-green-400' };
      case 'medium': return { label: 'Intermediate Level', icon: Flame, color: 'text-yellow-400' };
      case 'hard': return { label: 'Advanced Level', icon: Skull, color: 'text-red-400' };
      default: return { label: 'Standard Level', icon: Shield, color: 'text-cyan-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMjU1LDIxOCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <Card className="w-full max-w-md relative z-10 bg-slate-900/80 border-cyan-500/30 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
            notFound 
              ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30'
          }`}>
            {notFound ? (
              <XCircle className="w-10 h-10 text-white" />
            ) : (
              <CheckCircle className="w-10 h-10 text-white" />
            )}
          </div>
          <CardTitle className={`text-2xl font-bold ${notFound ? 'text-red-400' : 'text-green-400'}`}>
            {notFound ? 'Certificate Not Found' : 'Certificate Verified!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notFound ? (
            <div className="text-center space-y-4">
              <p className="text-slate-400">
                The certificate ID <span className="text-cyan-400 font-mono">{certificateId}</span> could not be found in our records.
              </p>
              <p className="text-slate-500 text-sm">
                Please check the certificate ID and try again.
              </p>
            </div>
          ) : certificate && (
            <>
              {/* Certificate Details */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Certificate ID</p>
                    <p className="text-amber-400 font-mono text-sm">{certificate.certificate_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs">Recipient</p>
                    <p className="text-white font-semibold">{certificate.username}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Score</p>
                    <p className="text-cyan-400 font-semibold">{certificate.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Questions</p>
                    <p className="text-white">{certificate.score}/{certificate.total_questions}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Difficulty</p>
                    <div className={`flex items-center gap-1 ${getDifficultyInfo(certificate.difficulty).color}`}>
                      {(() => {
                        const Icon = getDifficultyInfo(certificate.difficulty).icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                      <span className="text-sm capitalize">{certificate.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-slate-500 text-xs">Issued On</p>
                  <p className="text-white">
                    {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  This certificate is authentic and verified
                </p>
              </div>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full h-12 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}