import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Volume2, Heart, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";
import VoiceSelector from "@/components/VoiceSelector";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface StoryViewProps {
  story: string;
  childName: string;
  topic: string;
  onBack: () => void;
  onContinue?: () => void;
  storyMeta?: {
    topicCategory?: string;
    moral?: string;
    moralCategory?: string;
    duration?: string;
    gender?: string;
    age?: string;
  };
}

const StoryView = ({ story, childName, topic, onBack, onContinue, storyMeta }: StoryViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [savingFav, setSavingFav] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const topicEmoji: Record<string, string> = {
    kosmos: "🚀", dinozaury: "🦕", wróżki: "🧚", piraci: "🏴‍☠️", smoki: "🐉", ocean: "🌊",
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast("Zaloguj się, aby dodać do ulubionych", {
        action: { label: "Zaloguj", onClick: () => navigate("/auth") },
      });
      return;
    }
    setSavingFav(true);
    try {
      const { error } = await supabase.from("favorite_stories").insert({
        user_id: user.id,
        child_name: childName,
        topic,
        topic_category: storyMeta?.topicCategory || null,
        moral: storyMeta?.moral || null,
        moral_category: storyMeta?.moralCategory || null,
        duration: storyMeta?.duration || null,
        gender: storyMeta?.gender || null,
        age: storyMeta?.age || null,
        story_text: story,
      });
      if (error) throw error;
      setIsFavorited(true);
      toast.success("Dodano do ulubionych! ❤️");
    } catch (e: any) {
      toast.error(e.message || "Nie udało się zapisać");
    } finally {
      setSavingFav(false);
    }
  };

  const playAudio = useCallback(async () => {
    // If we already have audio loaded, just toggle play/pause
    if (audioRef.current && audioUrlRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    setIsLoadingAudio(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: story }),
        }
      );

      if (!response.ok) throw new Error("Błąd generowania audio");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (e: any) {
      console.error("TTS error:", e);
      toast.error("Nie udało się wygenerować audio");
    } finally {
      setIsLoadingAudio(false);
    }
  }, [story, isPlaying]);

  const paragraphs = story.split("\n\n").filter(Boolean);

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />

      <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        {/* Header */}
        <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground/60 hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-display text-lg text-gradient-magic">Bajka dla {childName}</h2>
            <p className="text-xs text-muted-foreground">
              {topicEmoji[topic] || "✨"} Przygoda w świecie: {topic}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            disabled={isFavorited || savingFav}
            className={isFavorited ? "text-destructive" : "text-foreground/60 hover:text-destructive"}
          >
            {savingFav ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />}
          </Button>
        </motion.div>

        {/* Illustration placeholder */}
        <motion.div
          className="w-full aspect-[16/9] rounded-2xl glass-card mb-6 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center">
            <motion.div className="text-6xl mb-2" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              {topicEmoji[topic] || "✨"}
            </motion.div>
            <p className="text-xs text-muted-foreground">Ilustracja bajki</p>
          </div>
        </motion.div>

        {/* Story text */}
        <motion.div
          className="glass-card rounded-2xl p-6 mb-4 flex-1"
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

        {/* Continue story button */}
        {onContinue && (
          <motion.div className="mb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Button variant="magic" className="w-full rounded-xl py-5" onClick={onContinue}>
              <BookOpen className="mr-2 h-5 w-5" />
              ✨ Odkryj dalszą część przygody
            </Button>
          </motion.div>
        )}

        {!onContinue && <div className="mb-24" />}
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
            onClick={playAudio}
            disabled={isLoadingAudio}
          >
            {isLoadingAudio ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-foreground/60">
                {isLoadingAudio ? "Generowanie audio..." : isPlaying ? "Odtwarzanie..." : "Posłuchaj bajki"}
              </span>
            </div>
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
    </div>
  );
};

export default StoryView;
