"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  VoiceEngineStatus,
  fetchVoiceStatus,
  synthesizeVoiceSpeech,
  transcribeVoiceAudio,
} from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { readAloudCoordinator } from "@/lib/readAloudCoordinator";
import { kannadaToPhonetic } from "@/lib/kannadaPhonetics";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (queryText: string, autoRun?: boolean) => void;
  currentResponseText?: string;
}

/**
 * Encodes Float32 PCM audio samples into a standard 16-bit mono PCM WAV Blob.
 */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16 bits
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  onApplyQuery,
  currentResponseText,
}: VoiceAssistantModalProps) {
  const { language, setLanguage, t } = useTranslation();
  const [engineStatus, setEngineStatus] = useState<VoiceEngineStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  // Audio Context and Stream References for PCM Capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmBuffersRef = useRef<Float32Array[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {
        // ignore
      }
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsListening(false);
    setVolumeLevel(0);
  };

  const stopSpeaking = () => {
    readAloudCoordinator.stopAll();
    setIsSpeaking(false);
  };

  // Fetch truthful status on modal open
  useEffect(() => {
    if (!isOpen) return;

    fetchVoiceStatus()
      .then((res) => {
        setEngineStatus(res);
        const sttReady = res.stt_available || res.stt_models?.[language] === "ready";
        const ttsReady = res.tts_available || res.tts_voices?.[language] === "ready";

        if (sttReady && ttsReady) {
          setStatusMessage(
            language === "hi"
              ? "स्थानीय वॉयस सक्रिय: STT (फास्टर-व्हिस्पर) · TTS (ऑफ़लाइन)"
              : language === "kn"
              ? "ಸ್ಥಳೀಯ ಧ್ವನಿ ಸಕ್ರಿಯ: STT (ಫಾಸ್ಟರ್-ವಿಸ್ಪರ್) · TTS (ಆಫ್‌ಲೈನ್)"
              : `Local voice active: STT (${res.stt_engine}) · TTS (${res.tts_engine})`
          );
        } else if (sttReady) {
          setStatusMessage(
            language === "hi"
              ? "स्थानीय STT तैयार है। अपनी परिचालन जांच बोलें।"
              : language === "kn"
              ? "ಸ್ಥಳೀಯ STT ಸಿದ್ಧವಾಗಿದೆ. ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ಮಾತನಾಡಿ."
              : `Local STT ready (${res.stt_engine}). Ready to record.`
          );
        } else {
          setStatusMessage(
            language === "hi"
              ? "ब्राउज़र एवं स्थानीय माइक्रोफ़ोन तैयार है।"
              : language === "kn"
              ? "ಬ್ರೌಸರ್ ಮತ್ತು ಸ್ಥಳೀಯ ಮೈಕ್ರೊಫೋನ್ ಸಿದ್ಧವಾಗಿದೆ."
              : "Browser and local microphone pipeline ready."
          );
        }
      })
      .catch(() => {
        setStatusMessage(
          language === "hi"
            ? "स्थानीय माइक्रोफ़ोन पाइपलाइन सक्रिय है।"
            : language === "kn"
            ? "ಸ್ಥಳೀಯ ಮೈಕ್ರೊಫೋನ್ ಪೈಪ್‌ಲೈನ್ ಸಕ್ರಿಯವಾಗಿದೆ."
            : "Local speech capture active."
        );
      });

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [isOpen, language]);

  const startListening = async () => {
    setErrorMessage(null);
    setTranscribedText("");
    pcmBuffersRef.current = [];

    // Check if browser has microphone support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        language === "hi"
          ? "इस ब्राउज़र वातावरण में माइक्रोफ़ोन ऑडियो कैप्चर समर्थित नहीं है।"
          : language === "kn"
          ? "ಈ ಬ್ರೌಸರ್ ಪರಿಸರದಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಆಡಿಯೋ ಕ್ಯಾಪ್ಚರ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ."
          : "Microphone audio capture is not supported in this browser environment."
      );
      return;
    }

    try {
      // 1. Initialize browser-native SpeechRecognition if available (live interim)
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";
          rec.onresult = (event: any) => {
            let finalStr = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalStr += event.results[i][0].transcript;
              } else {
                finalStr += event.results[i][0].transcript;
              }
            }
            if (finalStr.trim()) {
              setTranscribedText(finalStr.trim());
            }
          };
          rec.onerror = () => {
            // Non-fatal; audio buffers still flow to backend faster-whisper
          };
          rec.start();
          speechRecognitionRef.current = rec;
        } catch {
          // ignore SpeechRecognition init failure, fallback to raw audio PCM
        }
      }

      // 2. Capture PCM Audio Stream for local backend STT
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Real-time volume meter
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Collect raw PCM samples via ScriptProcessorNode (bufferSize 4096)
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmBuffersRef.current.push(new Float32Array(inputData));
      };

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioCtx.destination);

      setIsListening(true);
      setStatusMessage(
        language === "hi"
          ? "सुन रहा है... अपनी परिचालन जांच बोलें, फिर 'रोकें' पर क्लिक करें।"
          : language === "kn"
          ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ... ನಿಮ್ಮ ವಿಚಾರಣೆಯನ್ನು ಮಾತನಾಡಿ, ನಂತರ 'ನಿಲ್ಲಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ."
          : "Listening... Speak your operational query, then click Stop."
      );
    } catch (err: unknown) {
      setErrorMessage(`Microphone access error: ${err instanceof Error ? err.message : String(err)}`);
      setIsListening(false);
    }
  };

  const handleStopAndTranscribe = async () => {
    const capturedBuffers = [...pcmBuffersRef.current];
    const liveTextSnapshot = transcribedText;
    stopListening();

    // If browser recognition already caught the query, accept it directly!
    if (liveTextSnapshot && liveTextSnapshot.trim().length > 3) {
      setStatusMessage(
        language === "hi"
          ? "सफलतापूर्वक ट्रांसक्राइब किया गया।"
          : language === "kn"
          ? "ಯಶಸ್ವಿಯಾಗಿ ಪ್ರತಿಲೇಖಿಸಲಾಗಿದೆ."
          : "Speech successfully transcribed."
      );
      return;
    }

    if (capturedBuffers.length === 0) {
      setErrorMessage(
        language === "hi"
          ? "कोई ऑडियो रिकॉर्ड नहीं हुआ। कृपया पुनः प्रयास करें।"
          : language === "kn"
          ? "ಯಾವುದೇ ಆಡಿಯೋ ರೆಕಾರ್ಡ್ ಆಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
          : "No audio recorded. Please try again."
      );
      return;
    }

    // Concatenate PCM float buffers
    let totalLength = 0;
    for (const buf of capturedBuffers) {
      totalLength += buf.length;
    }
    const combinedSamples = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of capturedBuffers) {
      combinedSamples.set(buf, offset);
      offset += buf.length;
    }

    if (totalLength < 16000 * 0.3) {
      setErrorMessage(
        language === "hi"
          ? "ऑडियो बहुत छोटा था (< 300ms)। कृपया स्पष्ट बोलें और पुनः प्रयास करें।"
          : language === "kn"
          ? "ಆಡಿಯೋ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿತ್ತು (< 300ms). ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ."
          : "Audio recording was too brief (< 300ms). Please speak clearly and try again."
      );
      return;
    }

    // Encode to standard PCM WAV (16kHz mono) and send to local backend STT
    const wavBlob = encodeWav(combinedSamples, 16000);
    setIsTranscribing(true);
    setStatusMessage(
      language === "hi"
        ? "स्थानीय होस्ट पर ऑडियो ट्रांसक्राइब हो रहा है..."
        : language === "kn"
        ? "ಸ್ಥಳೀಯ ಹೋಸ್ಟ್‌ನಲ್ಲಿ ಆಡಿಯೋ ಪ್ರತಿಲೇಖಿಸಲಾಗುತ್ತಿದೆ..."
        : "Transcribing audio on local host..."
    );

    try {
      const result = await transcribeVoiceAudio(wavBlob, language);
      if (result.status === "SUCCESS" && result.text) {
        setTranscribedText(result.text);
        setStatusMessage(
          language === "hi"
            ? `स्थानीय रूप से (${result.engine}) द्वारा ${(result.confidence * 100).toFixed(0)}% विश्वास के साथ ट्रांसक्राइब किया गया।`
            : language === "kn"
            ? `ಸ್ಥಳೀಯವಾಗಿ (${result.engine}) ಮೂಲಕ ${(result.confidence * 100).toFixed(0)}% ವಿಶ್ವಾಸದೊಂದಿಗೆ ಪ್ರತಿಲೇಖಿಸಲಾಗಿದೆ.`
            : `Transcribed locally (${result.engine}) with ${(result.confidence * 100).toFixed(0)}% confidence.`
        );
      } else {
        // If empty result, provide helpful fallback
        if (!transcribedText) {
          setErrorMessage(
            result.error_message ||
              (language === "hi"
                ? "स्थानीय रूप से ऑडियो ट्रांसक्राइब नहीं किया जा सका। कृपया स्पष्ट बोलें।"
                : language === "kn"
                ? "ಆಡಿಯೋವನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಪ್ರತಿಲೇಖಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ."
                : "Could not transcribe audio locally.")
          );
        }
      }
    } catch (err: unknown) {
      if (!transcribedText) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSpeakResponse = async () => {
    if (!currentResponseText) return;
    stopSpeaking();
    setIsSpeaking(true);

    try {
      const resp = await synthesizeVoiceSpeech(currentResponseText.slice(0, 1000), language);
      if (resp.status === "SUCCESS" && resp.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${resp.audio_base64}`);
        readAloudCoordinator.setActiveAudio("voice-modal", audio);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
        return;
      }

      // Browser-native speech synthesis fallback
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const targetPrefix = language === "hi" ? "hi" : language === "kn" ? "kn" : "en";
        let matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(targetPrefix) ||
            (language === "kn" && (v.name.toLowerCase().includes("kannada") || v.name.toLowerCase().includes("kann"))) ||
            (language === "hi" && v.name.toLowerCase().includes("hindi"))
        );

        let textToSend = currentResponseText.slice(0, 1000);
        let rateToUse = 0.95;

        if (language === "kn") {
          if (!matchedVoice) {
            textToSend = kannadaToPhonetic(textToSend);
            matchedVoice =
              voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
              voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
              voices[0];
            rateToUse = 0.88;
          }
        } else if (!matchedVoice && voices.length > 0) {
          matchedVoice = voices.find((v) => v.default) || voices[0];
        }

        const utterance = new SpeechSynthesisUtterance(textToSend);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        utterance.lang = matchedVoice ? matchedVoice.lang : targetPrefix === "hi" ? "hi-IN" : targetPrefix === "kn" ? "kn-IN" : "en-US";
        utterance.rate = rateToUse;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        readAloudCoordinator.setActiveSpeechSynthesis("voice-modal", utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
        return;
      }

      setIsSpeaking(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 11, 13, 0.82)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          backgroundColor: "var(--bg-1)",
          border: "1px solid var(--line-strong)",
          borderRadius: "var(--radius-hero)",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: "16px" }}>🎙</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--brass)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {language === "hi" ? "संप्रभु वॉयस इंटरफ़ेस" : language === "kn" ? "ಸಾರ್ವಭೌಮ ಧ್ವನಿ ಇಂಟರ್ಫೇಸ್" : "SOVEREIGN VOICE INTERFACE"}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--sage)",
                  background: "rgba(156, 195, 168, 0.1)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--sage)",
                }}
              >
                {language === "hi" ? "एयर-गैप्ड · शून्य क्लाउड" : language === "kn" ? "ಏರ್-ಗ್ಯಾಪ್ಡ್ · ಶೂನ್ಯ ಕ್ಲೌಡ್" : "AIR-GAPPED · ZERO CLOUD"}
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--ink)", fontWeight: 500 }}>
              {language === "hi" ? "स्थानीय बहुभाषी वॉयस सहायक" : language === "kn" ? "ಸ್ಥಳೀಯ ಬಹುಭಾಷಾ ಧ್ವನಿ ಸಹಾಯಕ" : t("voiceModalTitle")}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-3)",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Language Selection Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-0)",
            padding: "10px 14px",
            borderRadius: "var(--radius-panel)",
            border: "1px solid var(--line)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)" }}>
              {language === "hi" ? "भाषा:" : language === "kn" ? "ಭಾಷೆ:" : "Language:"}
            </span>
            {(["en", "hi", "kn"] as const).map((lng) => {
              return (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  style={{
                    background: language === lng ? "var(--brass)" : "var(--bg-2)",
                    color: language === lng ? "#000" : "var(--ink)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-pill)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    cursor: "pointer",
                  }}
                >
                  {lng === "en" ? "EN (English)" : lng === "hi" ? "HI (हिंदी)" : "KN (ಕನ್ನಡ)"}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--brass)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {showSetupGuide
              ? language === "hi"
                ? "निर्देश छिपाएं"
                : language === "kn"
                ? "ಸೂಚನೆಗಳನ್ನು ಮರೆಮಾಡಿ"
                : "Hide Setup Guide"
              : language === "hi"
              ? "ऑफ़लाइन सेटअप विवरण"
              : language === "kn"
              ? "ಆಫ್‌ಲೈನ್ ಸೆಟಪ್ ವಿವರಗಳು"
              : "Offline Setup Instructions"}
          </button>
        </div>

        {/* Offline Setup Guide (Collapsible) */}
        {showSetupGuide && (
          <div
            style={{
              background: "var(--bg-0)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--radius-panel)",
              padding: "12px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: 1.5,
              color: "var(--ink-2)",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
              {language === "hi" ? "स्थानीय ऑफ़लाइन वॉयस स्टैक निदान:" : language === "kn" ? "ಸ್ಥಳೀಯ ಆಫ್‌ಲೈನ್ ಧ್ವನಿ ಸ್ಟ್ಯಾಕ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್:" : "Local Offline Voice Stack Diagnostics:"}
            </div>
            <div>{language === "hi" ? "• STT इंजन:" : language === "kn" ? "• STT ಇಂಜಿನ್:" : "• STT Engine:"} <strong style={{ color: "var(--brass)" }}>{engineStatus?.stt_engine || "faster-whisper"}</strong></div>
            <div>{language === "hi" ? "• TTS इंजन:" : language === "kn" ? "• TTS ಇಂಜಿನ್:" : "• TTS Engine:"} <strong style={{ color: "var(--brass)" }}>{engineStatus?.tts_engine || "Host SAPI5 / SpeechSynthesis"}</strong></div>
            <div style={{ marginTop: 6, color: "var(--sage)" }}>
              {language === "hi" ? "✓ शून्य-क्लाउड गारंटी: ऑडियो पूरी तरह से स्थानीय होस्ट पर रिकॉर्ड और ट्रांसक्राइब किया गया।" : language === "kn" ? "✓ ಶೂನ್ಯ-ಕ್ಲೌಡ್ ಭರವಸೆ: ಆಡಿಯೊವನ್ನು ಸ್ಥಳೀಯ ಹೋಸ್ಟ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ರೆಕಾರ್ಡ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಲಿಪ್ಯಂತರಗೊಳಿಸಲಾಗಿದೆ." : "✓ Zero-cloud guarantee: Audio recorded and transcribed completely on host with faster-whisper."}
            </div>
          </div>
        )}

        {/* Waveform & Listening State Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 20px",
            background: "var(--bg-0)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-panel)",
            minHeight: 140,
            gap: 14,
          }}
        >
          {/* Animated Waveform Meter */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, height: 40 }}>
            {Array.from({ length: 16 }).map((_, i) => {
              const barHeight = isListening ? Math.max(6, Math.min(36, volumeLevel * (1 + Math.sin(i * 0.8)))) : 4;
              return (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: barHeight,
                    backgroundColor: isListening ? "var(--brass)" : "var(--line-strong)",
                    borderRadius: 3,
                    transition: "height 0.08s ease",
                  }}
                />
              );
            })}
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isListening ? "var(--brass)" : "var(--ink-3)", textAlign: "center" }}>
            {statusMessage}
          </div>

          {/* Microphone Action Button */}
          <div style={{ display: "flex", gap: 12 }}>
            {!isListening ? (
              <button
                onClick={startListening}
                disabled={isTranscribing}
                className="btn-brass-primary"
                style={{ fontSize: "13px", padding: "8px 20px" }}
              >
                🎙 {language === "hi" ? "बोलना शुरू करें" : language === "kn" ? "ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ" : "Start Listening"}
              </button>
            ) : (
              <button
                onClick={handleStopAndTranscribe}
                className="btn-brass-primary"
                style={{ fontSize: "13px", padding: "8px 20px", background: "var(--coral)", borderColor: "var(--coral)" }}
              >
                ⏹ {language === "hi" ? "रोकें एवं ट्रांसक्राइब करें" : language === "kn" ? "ನಿಲ್ಲಿಸಿ ಮತ್ತು ಪ್ರತಿಲೇಖಿಸಿ" : "Stop & Transcribe"}
              </button>
            )}

            {isListening && (
              <button
                onClick={stopListening}
                className="btn-brass-secondary"
                style={{ fontSize: "13px", padding: "8px 16px" }}
              >
                {language === "hi" ? "रद्द करें" : language === "kn" ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
              </button>
            )}
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(217, 105, 78, 0.1)",
              border: "1px solid var(--coral)",
              borderRadius: "var(--radius-sm)",
              color: "var(--coral-text)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.4,
            }}
          >
            <span>⚠ {errorMessage}</span>
          </div>
        )}

        {/* Transcribed Query Card */}
        {transcribedText && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "var(--bg-0)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--radius-panel)",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", textTransform: "uppercase" }}>
                {language === "hi" ? "ट्रांसक्राइब किया गया प्रश्न:" : language === "kn" ? "ಪ್ರತಿಲೇಖಿತ ಪ್ರಶ್ನೆ:" : "Transcribed Query Output:"}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)" }}>
                {language === "hi" ? "परिसर में सत्यापित" : language === "kn" ? "ಆವರಣದಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : "Verified On-Premise"}
              </span>
            </div>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "var(--ink)", lineHeight: 1.5, margin: 0 }}>
              &ldquo;{transcribedText}&rdquo;
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  onApplyQuery(transcribedText, false);
                  onClose();
                }}
                className="btn-brass-secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {language === "hi" ? "कंसोल में स्थानांतरित करें" : language === "kn" ? "ಕನ್ಸೋಲ್‌ಗೆ ವರ್ಗಾಯಿಸಿ" : "Transfer to Question Field"}
              </button>

              <button
                onClick={() => {
                  onApplyQuery(transcribedText, true);
                  onClose();
                }}
                className="btn-brass-primary"
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                {language === "hi" ? "समीक्षा करें एवं जांच चलाएं ▶" : language === "kn" ? "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ತನಿಖೆ ನಡೆಸಿ ▶" : "Review & Run Investigation Loop ▶"}
              </button>
            </div>
          </div>
        )}

        {/* Read Aloud Previous Response Action */}
        {currentResponseText && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: "1px solid var(--line)",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--ink-2)" }}>
              {language === "hi" ? "वर्तमान उत्तर सुनें:" : language === "kn" ? "ಪ್ರಸ್ತುತ ಉತ್ತರವನ್ನು ಆಲಿಸಿ:" : "Read current mission answer aloud:"}
            </span>

            <button
              onClick={isSpeaking ? stopSpeaking : handleSpeakResponse}
              className="btn-brass-secondary"
              style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span>{isSpeaking ? (language === "hi" ? "⏹ बोलना बंद करें" : language === "kn" ? "⏹ ನಿಲ್ಲಿಸಿ" : "⏹ Stop Speaking") : (language === "hi" ? "🔊 उत्तर ज़ोर से पढ़ें" : language === "kn" ? "🔊 ಉತ್ತರವನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಿ" : "🔊 Read Current Response Aloud")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
