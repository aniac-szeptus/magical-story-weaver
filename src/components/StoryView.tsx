import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";

interface StoryViewProps {
  story: string;
  childName: string;
  topic: string;
  onBack: () => void;
}

const StoryView = ({ story, childName, topic, onBack }: StoryViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const topicEmoji: Record<string, string> = {
    kosmos: "🚀",
    dinozaury: "🦕",
    wróżki: "🧚",
    piraci: "🏴‍☠️",
    smoki: "🐉",
    ocean: "🌊",
  };

  const togglePlay = () => {
    // Placeholder — integrate with ElevenLabs TTS here
    setIsPlaying(!isPlaying);
  };

  const paragraphs = story.split("\n\n").filter(Boolean);

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />

      <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground/60 hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-display text-lg text-gradient-magic">
              Bajka dla {childName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {topicEmoji[topic] || "✨"} Przygoda w świecie: {topic}
            </p>
          </div>
        </motion.div>

        {/* Illustration placeholder */}
        <motion.div
          className="w-full aspect-[16/9] rounded-2xl glass-card mb-6 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center">
            <motion.div
              className="text-6xl mb-2"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {topicEmoji[topic] || "✨"}
            </motion.div>
            <p className="text-xs text-muted-foreground">Ilustracja bajki</p>
          </div>
        </motion.div>

        {/* Story text */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-24 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4 text-foreground/90 leading-relaxed text-[15px]">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={p.includes("Koniec") ? "text-center text-lg font-display text-gradient-magic" : ""}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Audio player bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-20 glass-card border-t border-border/50"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="magic"
            size="icon"
            className="rounded-full h-12 w-12 shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-foreground/60">
                {isPlaying ? "Odtwarzanie..." : "Posłuchaj bajki"}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full gradient-magic rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: 60, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <audio ref={audioRef} />
    </div>
  );
};

export default StoryView;
