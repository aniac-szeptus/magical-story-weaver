import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FavoriteStory {
  id: string;
  child_name: string;
  topic: string;
  story_text: string;
  created_at: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<FavoriteStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from("favorite_stories")
      .select("id, child_name, topic, story_text, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Nie udało się załadować ulubionych");
    } else {
      setStories(data || []);
    }
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from("favorite_stories").delete().eq("id", id);
    if (error) {
      toast.error("Nie udało się usunąć");
    } else {
      setStories((s) => s.filter((x) => x.id !== id));
      toast.success("Usunięto z ulubionych");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />
      <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-foreground/60 hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-gradient-magic">
            <Heart className="inline h-5 w-5 mr-2" />
            Ulubione bajki
          </h1>
        </motion.div>

        {loading ? (
          <p className="text-center text-muted-foreground">Ładowanie...</p>
        ) : stories.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">💫</p>
            <p className="text-muted-foreground">Nie masz jeszcze ulubionych bajek</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.map((s, i) => (
              <motion.div
                key={s.id}
                className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate("/", { state: { story: s.story_text, childName: s.child_name, topic: s.topic } })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">Bajka dla {s.child_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.topic}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(s.created_at).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFavorite(s.id); }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
