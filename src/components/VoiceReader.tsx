import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Mic, MicOff, SkipForward } from "lucide-react";
import {
  getVoiceReaderPosition,
  setVoiceReaderPosition,
  clearVoiceReaderPosition,
} from "@/lib/storage";

interface WebSpeechRecognitionEvent {
  results: ArrayLike<{
    0?: { transcript: string };
  }>;
}

interface WebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: WebSpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type Props = {
  /** Callable to fetch the plain-text content to read (kept fresh). */
  getText: () => string;
  /** Optional: called when speech recognition finalises a phrase. */
  onTranscript?: (text: string) => void;
  /** Lesson slug for persisting resume position. */
  lessonSlug?: string;
};

/**
 * VoiceReader — browser-native TTS + STT (Web Speech API).
 * No network calls, works offline.
 *
 * Emits CustomEvents for sentence-level highlighting:
 * - "voice-reader:chunk"   { index: number, text: string }  on utterance start
 * - "voice-reader:stop"    {}                                when speech ends
 *
 * Resume support: persists the last spoken chunk index per lesson slug
 * so the reader can resume from where it left off after refresh/reopen.
 */
export function VoiceReader({ getText, onTranscript, lessonSlug }: Props) {
  const [supportedTTS, setSupportedTTS] = useState(false);
  const [supportedSTT, setSupportedSTT] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [chunkIndex, setChunkIndex] = useState(-1);
  const [totalChunks, setTotalChunks] = useState(0);
  const [hasResumePoint, setHasResumePoint] = useState(false);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const chunksRef = useRef<string[]>([]);
  const currentIdxRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupportedTTS("speechSynthesis" in window);
    const win = window as unknown as {
      SpeechRecognition?: new () => WebSpeechRecognition;
      webkitSpeechRecognition?: new () => WebSpeechRecognition;
    };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    setSupportedSTT(Boolean(SR));

    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() ?? [];
      setVoices(v);
      if (!voiceURI && v.length > 0) {
        const en = v.find((x) => x.lang?.toLowerCase().startsWith("en")) ?? v[0];
        setVoiceURI(en.voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);

    // Check for saved resume position
    if (lessonSlug) {
      const pos = getVoiceReaderPosition(lessonSlug);
      if (pos && pos.chunkIndex > 0) setHasResumePoint(true);
    }

    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis?.cancel();
      emitStop();
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emitChunk(index: number, text: string) {
    setChunkIndex(index);
    currentIdxRef.current = index;
    // Persist position for resume
    if (lessonSlug) setVoiceReaderPosition(lessonSlug, index);
    window.dispatchEvent(new CustomEvent("voice-reader:chunk", { detail: { index, text } }));
  }

  function emitStop() {
    setChunkIndex(-1);
    window.dispatchEvent(new CustomEvent("voice-reader:stop"));
  }

  function speak(startFromIndex = 0) {
    if (!supportedTTS) return;
    const text = getText();
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const chunks = text.match(/[^.!?\n]+[.!?\n]?/g) ?? [text];
    chunksRef.current = chunks;
    setTotalChunks(chunks.length);
    let idx = Math.max(0, Math.min(startFromIndex, chunks.length - 1));
    const voice = voices.find((v) => v.voiceURI === voiceURI);

    const speakNext = () => {
      if (idx >= chunks.length) {
        setSpeaking(false);
        setPaused(false);
        emitStop();
        if (lessonSlug) clearVoiceReaderPosition(lessonSlug);
        setHasResumePoint(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[idx]);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onstart = () => {
        emitChunk(idx, chunks[idx]);
      };
      u.onend = () => {
        idx += 1;
        speakNext();
      };
      u.onerror = () => {
        setSpeaking(false);
        setPaused(false);
        emitStop();
      };
      window.speechSynthesis.speak(u);
    };
    setSpeaking(true);
    setPaused(false);
    setHasResumePoint(false);
    speakNext();
  }

  function resume() {
    if (!lessonSlug) return speak();
    const pos = getVoiceReaderPosition(lessonSlug);
    speak(pos?.chunkIndex ?? 0);
  }

  function togglePause() {
    if (!supportedTTS) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
    emitStop();
    // Keep the resume point so user can resume later
    if (lessonSlug && currentIdxRef.current > 0) {
      setHasResumePoint(true);
    }
  }

  function toggleListen() {
    if (!supportedSTT) return;
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      return;
    }
    const win = window as unknown as {
      SpeechRecognition?: new () => WebSpeechRecognition;
      webkitSpeechRecognition?: new () => WebSpeechRecognition;
    };
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: WebSpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript && onTranscript) onTranscript(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  if (!supportedTTS && !supportedSTT) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {supportedTTS && (
        <>
          {!speaking ? (
            <>
              {hasResumePoint ? (
                <button
                  onClick={resume}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-primary bg-primary/10 text-primary hover:bg-primary/20"
                  title="Resume from where you left off"
                >
                  <SkipForward className="h-3.5 w-3.5" /> Resume
                </button>
              ) : null}
              <button
                onClick={() => speak(0)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted"
                title="Read this lesson aloud"
              >
                <Play className="h-3.5 w-3.5" /> {hasResumePoint ? "Start over" : "Read aloud"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={stop}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted"
              >
                <Square className="h-3.5 w-3.5" /> Stop
              </button>
              {totalChunks > 0 && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {chunkIndex + 1}/{totalChunks}
                </span>
              )}
            </>
          )}
          {voices.length > 0 && (
            <select
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
              className="text-xs bg-background border border-border rounded-full px-2 py-1"
              title="Voice"
            >
              {voices.map((v, i) => (
                <option key={`${v.voiceURI}-${i}`} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}
          <label className="text-xs text-muted-foreground inline-flex items-center gap-1">
            Speed
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-20"
            />
            <span className="tabular-nums">{rate.toFixed(1)}x</span>
          </label>
        </>
      )}
      {supportedSTT && (
        <button
          onClick={toggleListen}
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
            listening ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
          }`}
          title="Ask the AI Teacher by voice"
        >
          {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {listening ? "Listening…" : "Ask by voice"}
        </button>
      )}
    </div>
  );
}
