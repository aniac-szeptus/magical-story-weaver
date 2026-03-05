import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Check, Loader2, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

const PRESET_VOICES = [
{ id: "xsSg7GkDPDhaGZpbKOLn", label: "🎙️ Narrator PL", desc: "Ciepły, narracyjny głos" },
{ id: "onwK4e9ZLuTAKqWW03F9", label: "🧔 Daniel", desc: "Męski, spokojny" },
{ id: "EXAVITQu4vr4xnSDxMaL", label: "👩 Sarah", desc: "Kobiecy, delikatny" },
{ id: "pFZP5JQG7iQjIQuC4Bku", label: "🌸 Lily", desc: "Kobiecy, ciepły" },
{ id: "IKne3meq5aSn9XLyUdCD", label: "🧒 Charlie", desc: "Młody, energiczny" }];


const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      toast.error("Nie udało się uzyskać dostępu do mikrofonu");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        resolve(blob);
      };
      mediaRecorderRef.current!.stop();
      mediaRecorderRef.current!.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    });
  }, []);

  const handleStopAndClone = useCallback(async () => {
    if (recordingTime < 10) {
      toast.error("Nagraj minimum 10 sekund głosu");
      return;
    }

    const audioBlob = await stopRecording();
    if (!audioBlob) return;

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("name", `Mój głos ${Date.now()}`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clone-voice`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: formData
        }
      );

      if (!response.ok) throw new Error("Błąd klonowania głosu");

      const data = await response.json();
      setClonedVoiceId(data.voice_id);
      onVoiceChange(data.voice_id);
      toast.success("Głos sklonowany! 🎉");
    } catch (e: any) {
      console.error("Clone error:", e);
      toast.error("Nie udało się sklonować głosu");
    } finally {
      setIsCloning(false);
    }
  }, [recordingTime, stopRecording, onVoiceChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground/80">🔊 Wybierz głos lektora</label>

      <div className="flex flex-wrap gap-2">
        {PRESET_VOICES.map((v) =>
        <button
          key={v.id}
          onClick={() => onVoiceChange(v.id)}
          className={`px-3 py-2 rounded-xl text-xs transition-all border flex flex-col items-start ${
          selectedVoice === v.id ?
          "bg-primary/20 border-primary text-foreground" :
          "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50"}`
          }>
          
            <span className="font-medium">{v.label}</span>
            <span className="text-[10px] opacity-70">{v.desc}</span>
          </button>
        )}

        {clonedVoiceId &&
        <button
          onClick={() => onVoiceChange(clonedVoiceId)}
          className={`px-3 py-2 rounded-xl text-xs transition-all border flex flex-col items-start ${
          selectedVoice === clonedVoiceId ?
          "bg-primary/20 border-primary text-foreground" :
          "bg-secondary/30 border-border text-muted-foreground hover:border-primary/50"}`
          }>
          
            <span className="font-medium">🎤 Mój głos</span>
            <span className="text-[10px] opacity-70">Sklonowany</span>
          </button>
        }
      </div>

      {/* Record own voice */}
      <div className="glass-card rounded-xl p-3 space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="h-3 w-3" /> Nagraj swój głos (min. 10s)
        </p>

        <AnimatePresence mode="wait">
          {isCloning ?
          <motion.div key="cloning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Klonowanie głosu...
            </motion.div> :
          isRecording ?
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <motion.div
              className="h-3 w-3 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }} />
            
              <span className="text-xs font-mono text-foreground/80">{recordingTime}s</span>
              <Button
              variant="magic"
              size="sm"
              onClick={handleStopAndClone}
              className="ml-auto rounded-lg text-xs">
              
                <MicOff className="h-3 w-3 mr-1" />
                Zatrzymaj i sklonuj
              </Button>
            </motion.div> :

          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
              variant="outline"
              size="sm"
              onClick={startRecording}
              className="rounded-lg text-xs">
              
                <Mic className="h-3 w-3 mr-1" />
                Nagraj głos
              </Button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

};

export default VoiceSelector;