import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import QuizHome from "@/components/quiz/QuizHome";
import QuizScreen from "@/components/quiz/QuizScreen";
import QuizResult from "@/components/quiz/QuizResult";

type QuizState = "home" | "quiz" | "result";

interface QuizResultData {
  score: number;
  totalQuestions: number;
  timeTaken: number;
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>("home");
  const [resultData, setResultData] = useState<QuizResultData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleStartQuiz = () => {
    setQuizState("quiz");
  };

  const handleQuizComplete = (score: number, totalQuestions: number, timeTaken: number) => {
    setResultData({ score, totalQuestions, timeTaken });
    setQuizState("result");
  };

  const handleBackToHome = () => {
    setQuizState("home");
    setResultData(null);
  };

  const handleRetry = () => {
    setResultData(null);
    setQuizState("quiz");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {quizState === "home" && (
        <QuizHome onStartQuiz={handleStartQuiz} />
      )}
      {quizState === "quiz" && (
        <QuizScreen onComplete={handleQuizComplete} onExit={handleBackToHome} />
      )}
      {quizState === "result" && resultData && (
        <QuizResult
          score={resultData.score}
          totalQuestions={resultData.totalQuestions}
          timeTaken={resultData.timeTaken}
          onHome={handleBackToHome}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default Index;
