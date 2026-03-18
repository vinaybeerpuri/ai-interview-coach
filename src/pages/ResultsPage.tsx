import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, RotateCcw, Home } from "lucide-react";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = (location.state as any) || {};

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-8 text-center"
      >
        <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">Session Complete</h1>
        <p className="text-muted-foreground mb-8">
          Great work! You've completed your practice session. Keep practicing to improve your interview skills.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="hero" size="lg" onClick={() => navigate(`/interview${role ? `?role=${role}` : ""}`)}>
            <RotateCcw className="h-4 w-4 mr-2" /> Practice Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/select-role")}>
            Try a Different Role
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
