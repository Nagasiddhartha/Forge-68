"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Locale } from "@/lib/i18n";

/**
 * Sanitizes technical industrial text, removing Markdown symbols, code blocks,
 * and bracketed hashes to produce fluent, natural speech for audio readout.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " code block omitted ");

  // Remove inline code
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Remove markdown images/links: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Simplify internal evidence citations: [img:r204...#dial] or [doc:...#chunk_1] -> ""
  cleaned = cleaned.replace(/\[(?:img|doc|calc|tool):[^\]]+\]/gi, "");

  // Remove markdown headers, bold, italics, strikethrough
  cleaned = cleaned.replace(/^[#\s=~*-]+/gm, "");
  cleaned = cleaned.replace(/[*_~]{1,3}/g, "");

  // Expand industrial symbols for natural pronunciation
  cleaned = cleaned.replace(/(\d+)\s*bar\b/gi, "$1 bar");
  cleaned = cleaned.replace(/(\d+)\s*%/g, "$1 percent");
  cleaned = cleaned.replace(/Δ\s*P/g, "Delta P");
  cleaned = cleaned.replace(/±\s*/g, "plus or minus ");
  cleaned = cleaned.replace(/≈\s*/g, "approximately ");

  // Collapse consecutive whitespaces and clean line breaks
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Map FORGE locale string to standard BCP-47 language tags.
 */
export function getBcp47LanguageTag(locale: Locale): string {
  switch (locale) {
    case "hi":
      return "hi-IN";
    case "kn":
      return "kn-IN";
    case "en":
    default:
      return "en-IN"; // Prefer Indian English for refinery operational context
  }
}

/**
 * Split text into sentence chunks to prevent browser speech synthesis timeouts
 * on long engineering audit reports.
 */
function splitIntoSentenceChunks(text: string): string[] {
  // Delimiters include English punctuation (. ? !) and Indic danda (।)
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g);
  if (!sentences) return [text];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Pick best matched speech synthesis voice for the target language.
 */
function pickBestVoice(voices: SpeechSynthesisVoice[], targetLang: string, fallbackLang: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Exact match (e.g. "hi-IN" or "kn-IN")
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exact) return exact;

  // 2. Prefix match (e.g. "hi" or "kn")
  const prefix = targetLang.split("-")[0].toLowerCase();
  const langMatch = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (langMatch) return langMatch;

  // 3. Fallback language match (e.g. "en-IN" or "en-US")
  const fbExact = voices.find((v) => v.lang.toLowerCase() === fallbackLang.toLowerCase());
  if (fbExact) return fbExact;

  const fbPrefix = fallbackLang.split("-")[0].toLowerCase();
  const fbMatch = voices.find((v) => v.lang.toLowerCase().startsWith(fbPrefix));
  if (fbMatch) return fbMatch;

  // 4. Default voice
  return voices.find((v) => v.default) || voices[0] || null;
}

export interface UseSpeechSynthesisResult {
  isSupported: boolean;
  isSpeaking: boolean;
  speakingId: string | null;
  speak: (id: string, text: string, locale?: Locale) => void;
  stop: () => void;
}

/**
 * Sovereign client-side Speech Synthesis Hook.
 * Zero external network calls. Operates 100% on-device via Web Speech API.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const updateVoices = () => {
        try {
          voicesRef.current = window.speechSynthesis.getVoices();
        } catch {
          voicesRef.current = [];
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    isPlayingRef.current = false;
    activeIdRef.current = null;
    setIsSpeaking(false);
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, locale: Locale = "en") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      // If already speaking the same item, toggle to stop
      if (isPlayingRef.current && activeIdRef.current === id) {
        stop();
        return;
      }

      // Stop any existing speech first
      stop();

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      const chunks = splitIntoSentenceChunks(cleaned);
      if (chunks.length === 0) return;

      const targetLang = getBcp47LanguageTag(locale);
      const voice = pickBestVoice(voicesRef.current, targetLang, "en-US");

      isPlayingRef.current = true;
      activeIdRef.current = id;
      setIsSpeaking(true);
      setSpeakingId(id);

      let currentChunkIndex = 0;

      const speakNextChunk = () => {
        if (!isPlayingRef.current || activeIdRef.current !== id || currentChunkIndex >= chunks.length) {
          isPlayingRef.current = false;
          activeIdRef.current = null;
          setIsSpeaking(false);
          setSpeakingId(null);
          return;
        }

        const chunkText = chunks[currentChunkIndex];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = targetLang;
        if (voice) {
          utterance.voice = voice;
        }

        // Slightly measured pace for technical clarity in industrial control environments
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          currentChunkIndex++;
          speakNextChunk();
        };

        utterance.onerror = (e) => {
          // If canceled explicitly, don't flag error
          if (e.error === "canceled" || e.error === "interrupted") {
            return;
          }
          currentChunkIndex++;
          speakNextChunk();
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          stop();
        }
      };

      speakNextChunk();
    },
    [stop]
  );

  return {
    isSupported,
    isSpeaking,
    speakingId,
    speak,
    stop,
  };
}
