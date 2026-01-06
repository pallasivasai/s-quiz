import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Download, X } from 'lucide-react';

interface CertificateProps {
  username: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  onClose: () => void;
}

export default function Certificate({ username, score, totalQuestions, completedAt, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((score / totalQuestions) * 100);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    // Use html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: null,
    });
    
    const link = document.createElement('a');
    link.download = `cyber-awareness-certificate-${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:bg-slate-800"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-1 rounded-xl"
        >
          <Card className="relative bg-slate-950 border-2 border-amber-500/50 rounded-xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjE1LDAsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-amber-500/60 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-amber-500/60 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-amber-500/60 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-amber-500/60 rounded-br-lg"></div>

            <div className="relative z-10 p-8 md:p-12 text-center">
              {/* Header */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Award className="w-10 h-10 text-slate-900" />
                </div>
              </div>

              <p className="text-amber-400 text-sm uppercase tracking-[0.3em] mb-2">Certificate of Achievement</p>
              
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-6">
                Cyber Security Awareness
              </h1>

              <p className="text-slate-400 text-lg mb-2">This certifies that</p>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 border-b-2 border-amber-500/30 pb-2 mx-auto max-w-md">
                {username}
              </h2>

              <p className="text-slate-400 mb-6">
                has successfully demonstrated proficiency in Cyber Security Awareness<br />
                by achieving a score of
              </p>

              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-xl px-6 py-3 mb-6">
                <span className="text-4xl font-bold text-cyan-400">{percentage}%</span>
                <span className="text-slate-400">({score}/{totalQuestions} correct)</span>
              </div>

              <p className="text-slate-500 text-sm mb-8">
                Awarded on {formattedDate}
              </p>

              {/* Signature Area */}
              <div className="flex justify-between items-end px-8 md:px-16">
                <div className="text-center">
                  <div className="w-32 border-t border-amber-500/40 mb-2"></div>
                  <p className="text-slate-400 text-sm">P Siva Sai</p>
                  <p className="text-slate-500 text-xs">Quiz Administrator</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t border-amber-500/40 mb-2"></div>
                  <p className="text-slate-400 text-sm">Certificate ID</p>
                  <p className="text-slate-500 text-xs font-mono">{Date.now().toString(36).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="mt-4 w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}
