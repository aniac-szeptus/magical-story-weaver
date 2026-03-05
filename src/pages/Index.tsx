import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryBackground from "@/components/StoryBackground";
import StarLoader from "@/components/StarLoader";
import StoryView from "@/components/StoryView";

const TOPICS = [
  { label: "🚀 Kosmos", value: "kosmos" },
  { label: "🦕 Dinozaury", value: "dinozaury" },
  { label: "🧚 Wróżki", value: "wróżki" },
  { label: "🏴‍☠️ Piraci", value: "piraci" },
  { label: "🐉 Smoki", value: "smoki" },
  { label: "🌊 Ocean", value: "ocean" },
];

const MORALS = [
  { label: "💪 Odwaga", value: "odwaga" },
  { label: "🤝 Dzielenie się", value: "dzielenie się" },
  { label: "❤️ Przyjaźń", value: "przyjaźń" },
  { label: "🌟 Wytrwałość", value: "wytrwałość" },
  { label: "🤗 Życzliwość", value: "życzliwość" },
  { label: "📚 Ciekawość", value: "ciekawość" },
];

const DEMO_STORY = `Dawno, dawno temu, w galaktyce pełnej iskrzących gwiazd, żył mały astronauta imieniem {name}. Miał zaledwie {age} lat, ale jego marzenia były większe niż cały wszechświat.

Pewnego wieczoru, gdy {name} patrzył przez teleskop, zauważył migoczącą gwiazdę, która zdawała się do niego mrugać. "To zaproszenie!" — pomyślał i wsiadł do swojego rakietowego statku zbudowanego z kartonowego pudła i marzeń.

Statek wzniósł się wysoko, mijając srebrny księżyc i tańczące komety. Na planecie Lumina {name} spotkał małego kosmitę o wielkich, złotych oczach. "Jestem Ziko" — powiedział kosmita. "Moja planeta traci blask. Potrzebuję kogoś odważnego."

{name} poczuł lekki strach, ale przypomniał sobie słowa babci: "Odwaga to nie brak strachu, to decyzja, że coś jest ważniejsze." Razem z Ziko wyruszyli w podróż do Jądra Gwiazdy.

Po drodze pokonali wir kosmiczny, rozwiązali zagadkę Sfinksa Mgławicy i przeszli przez most z tęczowego pyłu. Kiedy dotarli do Jądra, {name} zrozumiał, że musi podzielić się swoim własnym blaskiem — odwagą, którą niósł w sercu.

Położył dłoń na krysztale i cała planeta rozbłysła złotym światłem. Ziko uśmiechnął się, a tysiące gwiazd zatańczyły na niebie.

"Dziękuję, {name}" — szepnął Ziko. "Nauczyłeś mnie, że prawdziwa odwaga mieszka w każdym, kto decyduje się pomóc."

{name} wrócił do domu, tuż przed śniadaniem. Nikt nie wiedział o jego kosmicznej przygodzie — poza jedną mrugającą gwiazdą na niebie, która od tamtej pory świeciła jaśniej niż wszystkie inne.

🌟 Koniec 🌟`;

const Index = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [topic, setTopic] = useState("");
  const [moral, setMoral] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!name || !age || !gender || !topic || !moral || !duration) return;
    setLoading(true);

    setTimeout(() => {
      const personalizedStory = getDemoStory(gender)
        .replace(/{name}/g, name)
        .replace(/{age}/g, age);
      setStory(personalizedStory);
      setLoading(false);
    }, 3000);
  };

  const handleBack = () => {
    setStory(null);
  };

  const isValid = name && age && gender && topic && moral && duration;

  if (loading) return <StarLoader />;
  if (story) return <StoryView story={story} childName={name} topic={topic} onBack={handleBack} />;

  return (
    <div className="relative min-h-screen flex flex-col">
      <StoryBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-5xl mb-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-gradient-magic mb-2">
            Bajkowa Magia
          </h1>
          <p className="text-muted-foreground text-sm">
            Stwórz spersonalizowaną bajkę dla swojego dziecka
          </p>
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
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Imię dziecka
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Zosia, Kacper..."
              className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Wiek
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="np. 5"
              className="w-full rounded-lg bg-secondary/50 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Temat bajki
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTopic(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    topic === t.value
                      ? "bg-primary/20 border-primary text-foreground"
                      : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Moral */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Morał
            </label>
            <div className="flex flex-wrap gap-2">
              {MORALS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMoral(m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    moral === m.value
                      ? "bg-accent/20 border-accent text-foreground"
                      : "bg-secondary/30 border-border text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            variant="magic"
            size="lg"
            className="w-full text-base py-6 rounded-xl"
            onClick={handleGenerate}
            disabled={!isValid}
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Stwórz magię
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground/50 mt-6 text-center">
          Gotowe do integracji z OpenAI i ElevenLabs
        </p>
      </div>
    </div>
  );
};

export default Index;
