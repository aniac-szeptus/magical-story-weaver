import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, age, gender, topic, topic_category, moral, moral_category, duration, continuation } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isBoy = gender === "boy";
    const genderInfo = isBoy
      ? "chłopiec (używaj form męskich: on, jego, zrobił, poszedł, odważny)"
      : "dziewczynka (używaj form żeńskich: ona, jej, zrobiła, poszła, odważna)";

    const wordCount = duration === "2" ? 300 : duration === "5" ? 700 : 1400;

    const systemPrompt = `Jesteś światowej klasy autorem literatury dziecięcej. Piszesz piękne, wciągające bajki w języku polskim. Bajki muszą być odpowiednie dla dzieci i mieć pozytywne przesłanie.

WAŻNE ZASADY:
- Pisz TYLKO po polsku
- Główny bohater ma na imię "${name}", ma ${age} lat i jest to ${genderInfo}
- Temat bajki: ${topic}
- Morał/przesłanie bajki: ${moral}
- Bajka ma mieć około ${wordCount} słów (czas czytania: ~${duration} minut)
- Bezpieczeństwo: Żadnej przemocy, strachu czy treści nieodpowiednich
- Słownictwo: Dostosuj do wieku ${age}. Np Dla dzieka o ${age} <4 używaj prostych zdań i wielu onomatopei (plusk, bam, hura). Dla dziecka o ${age} >3 dodaj więcej opisów przyrody i emocji.
- Używaj poprawnych form gramatycznych dopasowanych do płci bohatera
- Zakończ bajkę emoji: 🌟 Koniec 🌟
- Nie dodawaj tytułu na początku
- Pisz akapitami oddzielonymi pustą linią`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Napisz bajkę dla ${isBoy ? "chłopca" : "dziewczynki"} o imieniu ${name} (${age} lat). Temat: ${topic}. Morał: ${moral}. Długość: około ${wordCount} słów.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Brak kredytów AI. Doładuj konto w ustawieniach workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Błąd generowania bajki" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content;

    if (!story) {
      return new Response(JSON.stringify({ error: "AI nie wygenerowało bajki" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Nieznany błąd" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
