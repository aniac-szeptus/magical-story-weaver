import { useState, useRef, useEffect, useCallback } from "react";

export const useBackgroundMusic = (topic: string) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(true);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMusic = async () => {
      setIsMusicLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-music`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ topic }),
          }
        );

        if (!response.ok) throw new Error("Music generation failed");
        if (cancelled) return;

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        musicUrlRef.current = url;

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.15;
        musicRef.current = audio;

        // Auto-play
        try {
          await audio.play();
          if (!cancelled) {
            setIsMusicPlaying(true);
          }
        } catch {
          // Autoplay blocked by browser - that's ok
          console.log("Autoplay blocked, user needs to interact first");
        }
      } catch (e) {
        console.error("Background music error:", e);
      } finally {
        if (!cancelled) setIsMusicLoading(false);
      }
    };

    loadMusic();

    return () => {
      cancelled = true;
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      if (musicUrlRef.current) {
        URL.revokeObjectURL(musicUrlRef.current);
        musicUrlRef.current = null;
      }
    };
  }, [topic]);

  const toggleMusic = useCallback(() => {
    if (!musicRef.current) return;

    if (isMusicMuted || !isMusicPlaying) {
      musicRef.current.volume = 0.15;
      musicRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
      setIsMusicMuted(false);
    } else {
      musicRef.current.pause();
      setIsMusicPlaying(false);
      setIsMusicMuted(true);
    }
  }, [isMusicPlaying, isMusicMuted]);

  return { isMusicPlaying, isMusicLoading, isMusicMuted, toggleMusic };
};
