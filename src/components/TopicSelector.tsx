import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopicSelection {
  category: string;
  topic: string;
}

interface TopicCategory {
  name: string;
  emoji: string;
  topics: string[];
}

const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    name: "Przygoda",
    emoji: "🗺️",
    topics: ["Podwodne głębiny", "Kosmos", "Piraci", "Dinozaury", "Podróż w czasie"],
  },
  {
    name: "Magia",
    emoji: "🪄",
    topics: ["Wróżki", "Smoki", "Szkoła Magii", "Zaczarowany Las"],
  },
  {
    name: "Mały odkrywca",
    emoji: "🔍",
    topics: ["Wnętrze komputera", "Mikroświat", "Królestwo słodyczy"],
  },
];

interface TopicSelectorProps {
  value: TopicSelection | null;
  onChange: (selection: TopicSelection) => void;
}

const TopicSelector = ({ value, onChange }: TopicSelectorProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [randomMode, setRandomMode] = useState<"full" | string | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
  };

  const selectTopic = (category: string, topic: string) => {
    setRandomMode(null);
    onChange({ category, topic });
  };

  const selectRandomFromCategory = (cat: TopicCategory) => {
    const random = cat.topics[Math.floor(Math.random() * cat.topics.length)];
    setRandomMode(cat.name);
    onChange({ category: cat.name, topic: random });
  };

  const selectFullyRandom = () => {
    const cat = TOPIC_CATEGORIES[Math.floor(Math.random() * TOPIC_CATEGORIES.length)];
    const topic = cat.topics[Math.floor(Math.random() * cat.topics.length)];
    setRandomMode("full");
    onChange({ category: cat.name, topic });
  };

  const isSelected = (category: string, topic: string) =>
    value?.category === category && value?.topic === topic;

  return (
    <div className="space-y-2">
      {/* Fully random */}
      <button
        onClick={selectFullyRandom}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all rounded-xl border",
          randomMode === "full"
            ? "bg-primary/20 border-primary text-foreground shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
            : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        <Shuffle className="h-4 w-4" />
        <span>✨ Losowy temat</span>
      </button>

      {TOPIC_CATEGORIES.map((cat) => (
        <div key={cat.name} className="rounded-xl overflow-hidden">
          <button
            onClick={() => toggleCategory(cat.name)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-all rounded-xl border",
              expandedCategory === cat.name
                ? "bg-secondary/60 border-primary/40 text-foreground"
                : value?.category === cat.name && !randomMode
                ? "bg-primary/10 border-primary text-foreground shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            <span className="text-base">{cat.emoji}</span>
            <span className="flex-1 text-left">{cat.name}</span>
            {value?.category === cat.name && !randomMode && (
              <span className="text-xs text-primary truncate max-w-[120px]">
                {value.topic}
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
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs transition-all border",
                      randomMode === cat.name
                        ? "bg-primary/20 border-primary text-foreground shadow-[0_0_10px_-2px_hsl(var(--primary)/0.5)]"
                        : "bg-secondary/40 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    🎲 Losowy
                  </button>
                  {cat.topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => selectTopic(cat.name, topic)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs transition-all border",
                        isSelected(cat.name, topic)
                          ? "bg-primary/20 border-primary text-foreground shadow-[0_0_10px_-2px_hsl(var(--primary)/0.5)]"
                          : "bg-secondary/40 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default TopicSelector;
