import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Zalogowano!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Sprawdź swoją skrzynkę e-mail, aby potwierdzić konto!");
      }
    } catch (e: any) {
      toast.error(e.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto w-full">
        <motion.div
          className="w-full glass-card rounded-2xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Powrót
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-gradient-magic mb-1">
              {isLogin ? "Zaloguj się" : "Załóż konto"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Zaloguj się, aby zapisywać ulubione bajki" : "Stwórz konto, aby korzystać z ulubionych"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="twoj@email.pl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Min. 6 znaków"
              />
            </div>
            <Button variant="magic" size="lg" className="w-full py-5 rounded-xl" type="submit" disabled={loading}>
              {loading ? "Ładowanie..." : isLogin ? "Zaloguj" : "Zarejestruj"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Zarejestruj się" : "Zaloguj się"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
