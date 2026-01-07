import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, Zap, Flame, Skull } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty: string;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface QuizScreenProps {
  difficulty: Difficulty;
  onComplete: (score: number, total: number, time: number, difficulty: Difficulty) => void;
  onExit: () => void;
}

export default function QuizScreen({ difficulty, onComplete, onExit }: QuizScreenProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);

  // Fetch questions by difficulty
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('difficulty', difficulty);
      
      if (error) {
        toast.error('Failed to load questions');
        return;
      }

      // Shuffle and take 10 random questions
      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
      setLoading(false);
    };

    fetchQuestions();
  }, [difficulty]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Fullscreen handling
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setFullscreenWarning(false);
    } catch (err) {
      toast.error('Fullscreen is required for this quiz');
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      setFullscreenWarning(true);
    } else {
      setIsFullscreen(true);
      setFullscreenWarning(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.key === 'F11') || (e.altKey && e.key === 'Tab')) {
        e.preventDefault();
        toast.warning('Please complete the quiz first!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast.warning('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = score + (selectedAnswer === questions[currentIndex].correct_answer ? 1 : 0);
      onComplete(finalScore, questions.length, finalTime, difficulty);
    }
  };

  const getDifficultyIcon = () => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-5 h-5 text-green-400" />;
      case 'medium': return <Flame className="w-5 h-5 text-yellow-400" />;
      case 'hard': return <Skull className="w-5 h-5 text-red-400" />;
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400">Loading {difficulty} questions...</p>
        </div>
      </div>
    );
  }

  if (!isFullscreen || fullscreenWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-900/90 border-yellow-500/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-yellow-400">Fullscreen Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">
              This quiz must be taken in fullscreen mode to ensure fair assessment.
            </p>
            <Button
              onClick={enterFullscreen}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
            >
              Enter Fullscreen & Continue
            </Button>
            <Button
              variant="ghost"
              onClick={onExit}
              className="w-full text-slate-400"
            >
              Exit Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMDAsMjU1LDIxOCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-white font-bold text-xl">Cyber Quiz</span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/60 ${getDifficultyColor()}`}>
              {getDifficultyIcon()}
              <span className="text-sm font-medium capitalize">{difficulty}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800/60 px-4 py-2 rounded-full flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
            </div>
            <div className="bg-slate-800/60 px-4 py-2 rounded-full">
              <span className="text-cyan-400 font-semibold">{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Question Card */}
        <Card className="bg-slate-900/80 border-cyan-500/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-white leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionKey = `option_${option.toLowerCase()}` as keyof Question;
              const optionText = currentQuestion[optionKey];
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ";
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-500/20 text-green-400";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-500/20 text-red-400";
                } else {
                  buttonClass += "border-slate-700 bg-slate-800/50 text-slate-400";
                }
              } else {
                if (isSelected) {
                  buttonClass += "border-cyan-500 bg-cyan-500/20 text-cyan-400";
                } else {
                  buttonClass += "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-sm">
                      {option}
                    </span>
                    <span className="flex-1">{optionText}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                </button>
              );
            })}

            <div className="pt-4">
              {!showResult ? (
                <Button
                  onClick={handleSubmitAnswer}
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score indicator */}
        <div className="mt-4 text-center">
          <span className="text-slate-400">
            Current Score: <span className="text-cyan-400 font-bold">{score}</span> / {currentIndex + (showResult ? 1 : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}