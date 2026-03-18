import { motion } from "framer-motion";

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

const Metric = ({ label, value, unit, color }: { label: string; value: string | number; unit: string; color?: string }) => (
  <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
    <p className="text-sm text-muted-foreground mb-1 font-body">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-display font-bold tabular-nums ${color || "text-foreground"}`}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground font-medium">{unit}</span>
    </div>
  </div>
);

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-display font-semibold text-foreground">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-secondary">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${
          value >= 75 ? "bg-accent" : value >= 50 ? "bg-primary" : "bg-destructive"
        }`}
      />
    </div>
  </div>
);

export const FeedbackPanel = ({ feedback }: { feedback: FeedbackData }) => {
  const fillerColor = feedback.filler_count <= 2 ? "text-accent" : feedback.filler_count <= 5 ? "text-primary" : "text-destructive";
  const paceStatus = feedback.wpm >= 100 && feedback.wpm <= 150 ? "text-accent" : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Metric label="Pace" value={feedback.wpm} unit="WPM" color={paceStatus} />
        <Metric label="Fillers" value={feedback.filler_count} unit="total" color={fillerColor} />
        <Metric label="Sentiment" value={feedback.sentiment} unit="" />
        <Metric label="Overall" value={Math.round((feedback.clarity_score + feedback.confidence_score + feedback.relevance_score) / 3)} unit="%" />
      </motion.div>

      {/* Score Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="p-6 rounded-2xl border border-border bg-card shadow-card space-y-4"
      >
        <h3 className="font-display font-semibold text-foreground">Performance Breakdown</h3>
        <ScoreBar label="Clarity" value={feedback.clarity_score} />
        <ScoreBar label="Confidence" value={feedback.confidence_score} />
        <ScoreBar label="Relevance" value={feedback.relevance_score} />
      </motion.div>

      {/* Transcript */}
      {feedback.transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="p-6 rounded-2xl border border-border bg-card shadow-card"
        >
          <h3 className="font-display font-semibold text-foreground mb-3">Your Response</h3>
          <p className="text-foreground/80 leading-relaxed font-body text-sm">{feedback.transcript}</p>
          {feedback.filler_words.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {feedback.filler_words.map((w, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                  "{w}"
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* AI Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="p-6 rounded-2xl border border-border bg-card shadow-card"
      >
        <h3 className="font-display font-semibold text-foreground mb-3">Coach Feedback</h3>
        <p className="text-foreground/80 leading-relaxed font-body text-sm">{feedback.feedback}</p>
      </motion.div>

      {/* Improved Answer */}
      {feedback.improved_answer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border-2 border-accent/30 bg-accent/5"
        >
          <h3 className="font-display font-semibold text-foreground mb-3">✨ Suggested Improvement</h3>
          <p className="text-foreground/80 leading-relaxed font-body text-sm">{feedback.improved_answer}</p>
        </motion.div>
      )}
    </div>
  );
};
