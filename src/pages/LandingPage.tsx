import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, BarChart2, MessageSquare, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Mic, title: "Voice Analysis", desc: "Real-time speech metrics including pace, fillers, and clarity" },
  { icon: BarChart2, title: "Performance Scoring", desc: "Comprehensive scoring across multiple interview dimensions" },
  { icon: MessageSquare, title: "AI Feedback", desc: "Personalized suggestions powered by advanced language models" },
  { icon: Zap, title: "Instant Results", desc: "Get actionable feedback the moment you finish speaking" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="font-display text-xl font-bold text-foreground tracking-tight">
          Lumina<span className="text-primary">Coach</span>
        </span>
        <Button variant="outline" size="sm" onClick={() => navigate("/interview")}>
          Start Practice
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-6">
            AI Interview Performance Lab
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
            Master the art of<br />the conversation.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            Practice interviews with real-time AI analysis. Get scored on clarity, confidence, 
            and content — then improve with personalized feedback.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={() => navigate("/select-role")}>
              Begin Practice Session
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate("/interview")}>
              Quick Start
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.5 }}
              className="p-6 rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto px-8 py-16 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "50+", label: "Interview Questions" },
            { value: "6", label: "Job Roles" },
            { value: "Real-time", label: "AI Feedback" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
