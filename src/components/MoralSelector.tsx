import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pen, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MoralSelection {
  category: string;
  moral: string;
}

interface MoralCategory {
  name: string;
  emoji: string;
  morals: string[];
}

const MORAL_CATEGORIES: MoralCategory[] = [
  {
    name: "Dzielny Maluch",
    emoji: "🦁",
    morals: ["Strach przed ciemnością", "Wizyta u lekarza", "Samodzielne zasypianie"],
  },
  {
    name: "Emocje i Relacje",
    emoji: "💛",
    morals: [
      "Dzielenie się",
      "Radzenie sobie ze złością",
      "Empatia",
      "Moc słowa Przepraszam",
      "Moc słowa Dziękuję",
    ],
  },
  {
    name: "Wartości",
    emoji: "⭐",
    morals: ["Wytrwałość", "Ciekawość", "Uczciwość"],
  },
];

interface MoralSelectorProps {
  value: MoralSelection | null;
  onChange: (selection: MoralSelection) => void;
}

const MoralSelector = ({ value, onChange }: MoralSelectorProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customMoral, setCustomMoral] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleCategory = (name: string) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
    setShowCustomInput(false);
  };

  const selectMoral = (category: string, moral: string) => {
    onChange({ category, moral });
  };

  const selectRandomFromCategory = (cat: MoralCategory) => {
    const random = cat.morals[Math.floor(Math.random() * cat.morals.length)];
    onChange({ category: cat.name, moral: random });
  };

  const selectFullyRandom = () => {
    const cat = MORAL_CATEGORIES[Math.floor(Math.random() * MORAL_CATEGORIES.length)];
    const moral = cat.morals[Math.floor(Math.random() * cat.morals.length)];
    onChange({ category: cat.name, moral });
  };

  const handleCustomToggle = () => {
    setShowCustomInput((prev) => !prev);
    setExpandedCategory(null);
  };

  const handleCustomSubmit = () => {
    if (customMoral.trim()) {
      onChange({ category: "Własny morał", moral: customMoral.trim() });
    }
  };

  const isSelected = (category: string, moral: string) =>
    value?.category === category && value?.moral === moral;

  return (
    <div className="space-y-2">
      {/* Fully random */}
      <button
        onClick={selectFullyRandom}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all rounded-xl border",
          "bg-secondary/30 border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
        )}
      >
        <Shuffle className="h-4 w-4" />
        <span>✨ Losowy morał</span>
      </button>

      {MORAL_CATEGORIES.map((cat) => (
        <div key={cat.name} className="rounded-xl overflow-hidden">
          <button
            onClick={() => toggleCategory(cat.name)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all rounded-xl border",
              expandedCategory === cat.name
                ? "bg-secondary/60 border-accent/40 text-foreground"
                : value?.category === cat.name
                ? "bg-accent/10 border-accent text-foreground shadow-[0_0_12px_-3px_hsl(var(--accent)/0.4)]"
                : "bg-secondary/30 border-border text-muted-foreground hover:border-accent/30"
            )}
          >
            <span className="text-base">{cat.emoji}</span>
            <span className="flex-1 text-left">{cat.name}</span>
            {value?.category === cat.name && (
              <span className="text-xs text-accent truncate max-w-[120px]">
                {value.moral}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform shrink-0",
                expandedCategory === cat.name && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {expandedCategory === cat.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  <button
                    onClick={() => selectRandomFromCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all border bg-secondary/40 border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                  >
                    🎲 Losowy
                  </button>
                  {cat.morals.map((moral) => (
                    <button
                      key={moral}
                      onClick={() => selectMoral(cat.name, moral)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs transition-all border",
                        isSelected(cat.name, moral)
                          ? "bg-accent/20 border-accent text-foreground shadow-[0_0_10px_-2px_hsl(var(--accent)/0.5)]"
                          : "bg-secondary/40 border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                      )}
                    >
                      {moral}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Custom moral */}
      <div className="rounded-xl overflow-hidden">
        <button
          onClick={handleCustomToggle}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all rounded-xl border",
            showCustomInput
              ? "bg-secondary/60 border-accent/40 text-foreground"
              : value?.category === "Własny morał"
              ? "bg-accent/10 border-accent text-foreground shadow-[0_0_12px_-3px_hsl(var(--accent)/0.4)]"
              : "bg-secondary/30 border-border text-muted-foreground hover:border-accent/30"
          )}
        >
          <Pen className="h-4 w-4" />
          <span className="flex-1 text-left">Inny...</span>
          {value?.category === "Własny morał" && !showCustomInput && (
            <span className="text-xs text-accent truncate max-w-[140px]">
              {value.moral}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showCustomInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-2 py-2 flex gap-2">
                <input
                  type="text"
                  value={customMoral}
                  onChange={(e) => setCustomMoral(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                  placeholder="Wpisz własny morał..."
                  className="flex-1 rounded-lg bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customMoral.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-accent/20 border border-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/30 transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoralSelector;
