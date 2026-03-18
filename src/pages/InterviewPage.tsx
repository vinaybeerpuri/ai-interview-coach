import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SkeletonFeedback } from "@/components/SkeletonFeedback";
import { toast } from "sonner";

const roleQuestions: Record<string, string[]> = {
  "software-engineer": [
    "Tell me about a time you resolved a technical conflict within your team.",
    "How do you approach debugging a complex production issue?",
    "Describe a system you designed from scratch. What trade-offs did you make?",
    "How do you prioritize technical debt versus new feature development?",
    "Walk me through your approach to code reviews.",
  ],
  "data-analyst": [
    "How do you approach cleaning a messy dataset?",
    "Describe a time your analysis changed a business decision.",
    "How do you communicate technical findings to non-technical stakeholders?",
    "What's your approach to handling missing data?",
    "Tell me about a dashboard you built and its impact.",
  ],
  "product-manager": [
    "How do you prioritize features when you have limited resources?",
    "Tell me about a product launch that didn't go as planned.",
    "How do you gather and incorporate user feedback?",
    "Describe your approach to writing product requirements.",
    "How do you measure product success?",
  ],
  default: [
    "Tell me about yourself and your professional background.",
    "What is your greatest professional achievement?",
    "Describe a challenging situation at work and how you handled it.",
    "Where do you see yourself in five years?",
    "Why should we hire you for this position?",
  ],
};

interface FeedbackData {
  transcript: string;
  filler_count: number;
  filler_words: string[];
  wpm: number;
  sentiment: string;
  clarity_score: number;
  confidence_score: number;
  relevance_score: number;
  feedback: string;
  improved_answer: string;
}

const InterviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "default";
  const questions = roleQuestions[role] || roleQuestions.default;

  const [currentQ, setCurrentQ] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [mode, setMode] = useState<"voice" | "text">("voice");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access or use text mode.");
      setMode("text");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        resolve(audioBlob);
      };
      mediaRecorderRef.current!.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
      analyserRef.current = null;
      setIsRecording(false);
    });
  }, []);

  const analyzeAnswer = useCallback(
    async (answer: string) => {
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke("analyze-answer", {
          body: {
            answer,
            question: questions[currentQ],
            role: role === "default" ? "general" : role,
          },
        });

        if (error) throw error;
        setFeedback(data);
      } catch (e: any) {
        console.error("Analysis error:", e);
        toast.error("Analysis failed. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentQ, questions, role]
  );

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      // For now, we convert to text-based analysis since we can't run Whisper directly
      // In production, you'd send the audio to a speech-to-text service
      toast.info("Processing your response...");
      // Simulate a transcript for demo — in production, use speech-to-text
      const reader = new FileReader();
      reader.onloadend = () => {
        // Send a placeholder — the edge function will use AI to generate feedback
        analyzeAnswer("[Voice response recorded - analyzing speech patterns]");
      };
      reader.readAsDataURL(audioBlob);
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording, analyzeAnswer]);

  const handleSubmitText = useCallback(() => {
    if (!textAnswer.trim()) {
      toast.error("Please type your answer first.");
      return;
    }
    analyzeAnswer(textAnswer);
    setTextAnswer("");
  }, [textAnswer, analyzeAnswer]);

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((p) => p + 1);
      setFeedback(null);
    } else {
      navigate("/results", { state: { completed: true, role } });
    }
  };

  const roleName = role === "default" ? "General" : role.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="font-display text-xl font-bold text-foreground tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          Lumina<span className="text-primary">Coach</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {roleName} · Q{currentQ + 1}/{questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i <= currentQ ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-12 pb-24">
        {/* Question Card */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 bg-card rounded-3xl border border-border shadow-card mb-8"
        >
          <span className="text-xs font-bold tracking-[0.1em] uppercase text-muted-foreground">
            Current Question
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground mt-3 leading-tight">
            {questions[currentQ]}
          </h2>

          {/* Mode Toggle */}
          <div className="mt-8 flex gap-2">
            <button
              onClick={() => setMode("voice")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "voice" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setMode("text")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "text" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Text
            </button>
          </div>

          {mode === "voice" ? (
            <div className="mt-8 flex flex-col items-center gap-6">
              {isRecording && analyserRef.current && (
                <WaveformVisualizer analyser={analyserRef.current} />
              )}
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" />
                )}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={handleToggleRecording}
                  disabled={isAnalyzing}
                  className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-colors ${
                    isRecording
                      ? "bg-destructive shadow-glow-destructive"
                      : "bg-primary shadow-glow-primary"
                  } disabled:opacity-50`}
                >
                  {isRecording ? (
                    <Square className="h-6 w-6 text-destructive-foreground" fill="currentColor" />
                  ) : (
                    <Mic className="h-6 w-6 text-primary-foreground" />
                  )}
                </motion.button>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {isRecording ? "Listening for your response..." : "Click to start answering"}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
                className="w-full rounded-2xl border border-border bg-secondary/50 p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-body"
              />
              <Button onClick={handleSubmitText} disabled={isAnalyzing} variant="hero" size="lg">
                Submit Answer
              </Button>
            </div>
          )}
        </motion.div>

        {/* Feedback Section */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonFeedback />
            </motion.div>
          )}
          {feedback && !isAnalyzing && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FeedbackPanel feedback={feedback} />
              <div className="mt-6 flex gap-4 justify-center">
                <Button variant="outline" size="lg" onClick={() => { setFeedback(null); }}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Retry
                </Button>
                <Button variant="hero" size="lg" onClick={nextQuestion}>
                  {currentQ < questions.length - 1 ? (
                    <>Next Question <ArrowRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    "Finish Session"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPage;
