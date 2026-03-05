import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Heart, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";
import StarLoader from "@/components/StarLoader";
import StoryView from "@/components/StoryView";
import TopicSelector, { type TopicSelection } from "@/components/TopicSelector";
import MoralSelector, { type MoralSelection } from "@/components/MoralSelector";
import VoiceSelector from "@/components/VoiceSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

const GENDERS = [
  { label: "👧 Dziewczynka", value: "girl" },
  { label: "👦 Chłopiec", value: "boy" },
];

const DURATIONS = [
  { label: "⚡ 2 min", value: "2" },
  { label: "📖 5 min", value: "5" },
  { label: "📚 10 min", value: "10" },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [topicSelection, setTopicSelection] = useState<TopicSelection | null>(null);
  const [moralSelection, setMoralSelection] = useState<MoralSelection | null>(null);
  const [duration, setDuration] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("xsSg7GkDPDhaGZpbKOLn");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);

  // Handle navigation from favorites page
  useEffect(() => {
    const state = location.state as any;
    if (state?.story) {
      setStory(state.story);
      setName(state.childName || "");
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!name || !age || !gender || !topicSelection || !moralSelection || !duration) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: {
          name, age, gender,
          topic: topicSelection.topic,
          topic_category: topicSelection.category,
          moral: moralSelection.moral,
          moral_category: moralSelection.category,
          duration,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStory(data.story);
    } catch (e: any) {
      console.error("Story generation error:", e);
      toast.error(e.message || "Nie udało się wygenerować bajki. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!story) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: {
          name, age, gender,
          topic: topicSelection?.topic || "",
          topic_category: topicSelection?.category || "",
          moral: moralSelection?.moral || "",
          moral_category: moralSelection?.category || "",
          duration: "5",
          continuation: story,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStory((prev) => (prev || "") + "\n\n---\n\n" + data.story);
    } catch (e: any) {
      toast.error(e.message || "Nie udało się wygenerować ciągu dalszego.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStory(null);

  const isValid = name && age && gender && topicSelection && moralSelection && duration;

  if (loading) return <StarLoader />;
  if (story) return (
    <StoryView
      story={story}
      childName={name}
      topic={topicSelection?.topic || ""}
      onBack={handleBack}
      onContinue={handleContinue}
      storyMeta={{
        topicCategory: topicSelection?.category,
        moral: moralSelection?.moral,
        moralCategory: moralSelection?.category,
        duration, gender, age,
      }}
    />
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* User nav */}
        <div className="w-full flex justify-end gap-2 mb-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/favorites")} className="text-foreground/60 hover:text-foreground">
                <Heart className="h-4 w-4 mr-1" /> Ulubione
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-foreground/60 hover:text-foreground">
                <LogOut className="h-4 w-4 mr-1" /> Wyloguj
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-foreground/60 hover:text-foreground">
              <LogIn className="h-4 w-4 mr-1" /> Zaloguj
            </Button>
          )}
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="text-5xl mb-3" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            ✨
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-gradient-magic mb-2">Bajkowa Magia</h1>
          <p className="text-muted-foreground text-sm">Stwórz spersonalizowaną bajkę dla swojego dziecka</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full glass-card rounded-2xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Imię dziecka</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Zosia, Kacper..."
              className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Wiek</label>
            <input type="number" min="1" max="12" value={age} onChange={(e) => setAge(e.target.value)} placeholder="np. 5"
              className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Płeć</label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${gender === g.value ? "bg-primary/20 border-primary text-foreground" : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50"}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Temat bajki</label>
            <TopicSelector value={topicSelection} onChange={setTopicSelection} />
          </div>

          {/* Moral */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Morał / Przesłanie</label>
            <MoralSelector value={moralSelection} onChange={setMoralSelection} />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Czas trwania bajki</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${duration === d.value ? "bg-accent/20 border-accent text-foreground" : "bg-secondary/30 border-border text-muted-foreground hover:border-accent/50"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button variant="magic" size="lg" className="w-full text-base py-6 rounded-xl" onClick={handleGenerate} disabled={!isValid}>
            <Wand2 className="mr-2 h-5 w-5" />
            Stwórz magię
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground/50 mt-6 text-center">Bajki generowane przez AI ✨</p>
      </div>
    </div>
  );
};

export default Index;
