import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code, LineChart, Briefcase, Database, Palette, Shield } from "lucide-react";

const roles = [
  { id: "software-engineer", title: "Software Engineer", icon: Code, questions: 12 },
  { id: "data-analyst", title: "Data Analyst", icon: LineChart, questions: 10 },
  { id: "product-manager", title: "Product Manager", icon: Briefcase, questions: 10 },
  { id: "data-scientist", title: "Data Scientist", icon: Database, questions: 8 },
  { id: "ux-designer", title: "UX Designer", icon: Palette, questions: 8 },
  { id: "cybersecurity", title: "Cybersecurity Analyst", icon: Shield, questions: 8 },
];

const SelectRolePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-8 py-4 max-w-7xl mx-auto">
        <span className="font-display text-xl font-bold text-foreground tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          Lumina<span className="text-primary">Coach</span>
        </span>
      </nav>

      <div className="max-w-3xl mx-auto px-8 pt-16 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Step 1</span>
          <h1 className="font-display text-3xl font-bold text-foreground mt-2 mb-2">Select your target role</h1>
          <p className="text-muted-foreground mb-10">Choose the role you're preparing for. Questions will be tailored accordingly.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/interview?role=${role.id}`)}
              className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card shadow-card text-left hover:border-primary hover:shadow-elevated transition-all duration-200 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <role.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">{role.title}</p>
                <p className="text-sm text-muted-foreground">{role.questions} practice questions</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="ghost" onClick={() => navigate("/interview")}>
            Skip — use general questions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectRolePage;
