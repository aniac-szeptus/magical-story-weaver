import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY not set");

    const topicPrompts: Record<string, string> = {
      kosmos: "Gentle dreamy ambient space music with soft synth pads, twinkling stars, slow tempo, calming, children's lullaby feel",
      dinozaury: "Playful adventurous orchestral music with soft drums, wooden flutes, nature sounds, gentle and magical, children's story",
      wróżki: "Enchanting fairy tale music with gentle harp, music box melody, soft chimes, magical sparkles, dreamy lullaby",
      piraci: "Gentle sea shanty lullaby with soft accordion, ocean waves, calm adventure feel, children's bedtime music",
      smoki: "Mystical fantasy music with soft Celtic harp, gentle flutes, magical atmosphere, calm and enchanting lullaby",
      ocean: "Calm ocean ambient music with gentle waves, soft piano melody, underwater bubbles, peaceful lullaby",
    };

    const prompt = topicPrompts[topic] || 
      `Gentle, calming children's bedtime story background music about ${topic}. Soft, magical, dreamy lullaby with warm instruments. No vocals.`;

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: 60,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("ElevenLabs music error:", response.status, t);
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (e) {
    console.error("Music generation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
