"use client";

import React, { useId } from "react";
import { Locale, TRANSLATIONS } from "@/lib/i18n";
import { useSpeechSynthesis } from "@/lib/speech";

export interface AudioReadoutButtonProps {
  id?: string;
  text: string;
  locale?: Locale;
  label?: string;
  variant?: "button" | "compact" | "banner" | "subtle";
  // Optional controlled state from parent hook
  isCurrentlyPlaying?: boolean;
  onPlay?: (id: string, text: string, locale: Locale) => void;
  onStop?: () => void;
  style?: React.CSSProperties;
}

export function AudioReadoutButton({
  id,
  text,
  locale = "en",
  label,
  variant = "button",
  isCurrentlyPlaying,
  onPlay,
  onStop,
  style,
}: AudioReadoutButtonProps) {
  const autoId = useId();
  const itemId = id || autoId;
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  // Internal hook if parent didn't pass controlled handlers
  const internalSpeech = useSpeechSynthesis();

  const isControlled = typeof isCurrentlyPlaying === "boolean" && Boolean(onPlay) && Boolean(onStop);
  const activePlaying = isControlled ? isCurrentlyPlaying : internalSpeech.speakingId === itemId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePlaying) {
      if (isControlled && onStop) {
        onStop();
      } else {
        internalSpeech.stop();
      }
    } else {
      if (isControlled && onPlay) {
        onPlay(itemId, text, locale);
      } else {
        internalSpeech.speak(itemId, text, locale);
      }
    }
  };

  const displayText = activePlaying
    ? t.stopAudio
    : (label || t.readOutLoud);

  // Equalizer wave animation for active playback
  const soundWave = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        height: "12px",
        marginRight: "4px",
      }}
    >
      <span
        style={{
          width: "2px",
          height: activePlaying ? "10px" : "4px",
          background: "currentColor",
          borderRadius: "1px",
          animation: activePlaying ? "audioWave 0.8s ease-in-out infinite alternate" : "none",
        }}
      />
      <span
        style={{
          width: "2px",
          height: activePlaying ? "14px" : "8px",
          background: "currentColor",
          borderRadius: "1px",
          animation: activePlaying ? "audioWave 0.6s ease-in-out infinite alternate 0.2s" : "none",
        }}
      />
      <span
        style={{
          width: "2px",
          height: activePlaying ? "8px" : "5px",
          background: "currentColor",
          borderRadius: "1px",
          animation: activePlaying ? "audioWave 0.7s ease-in-out infinite alternate 0.4s" : "none",
        }}
      />
    </span>
  );

  const speakerIcon = (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {activePlaying ? (
        <>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </>
      ) : (
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      )}
    </svg>
  );

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={activePlaying ? t.stopAudio : (label || t.readOutLoud)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "var(--radius-sm)",
          background: activePlaying ? "rgba(200, 161, 90, 0.2)" : "rgba(255, 255, 255, 0.04)",
          border: activePlaying ? "1px solid var(--brass)" : "1px solid var(--line)",
          color: activePlaying ? "var(--brass)" : "var(--ink-2)",
          cursor: "pointer",
          transition: "all var(--dur-fast) var(--ease-out)",
          ...style,
        }}
      >
        {activePlaying ? soundWave : speakerIcon}
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: "var(--radius-pill)",
          background: activePlaying ? "rgba(200, 161, 90, 0.25)" : "rgba(200, 161, 90, 0.12)",
          border: "1px solid var(--brass)",
          color: "var(--brass)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          cursor: "pointer",
          transition: "all var(--dur-fast) var(--ease-out)",
          ...style,
        }}
      >
        {activePlaying ? soundWave : speakerIcon}
        <span>{displayText}</span>
      </button>
    );
  }

  if (variant === "subtle") {
    return (
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          padding: 0,
          color: activePlaying ? "var(--brass)" : "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          cursor: "pointer",
          transition: "color var(--dur-fast) var(--ease-out)",
          ...style,
        }}
      >
        {activePlaying ? soundWave : speakerIcon}
        <span>{displayText}</span>
      </button>
    );
  }

  // Default "button"
  return (
    <button
      type="button"
      onClick={handleClick}
      className={activePlaying ? "btn-brass-primary" : "btn-brass-secondary"}
      style={{
        fontSize: "12px",
        padding: "6px 14px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
      title={activePlaying ? t.stopAudio : (label || t.readOutLoud)}
    >
      {activePlaying ? soundWave : speakerIcon}
      <span>{displayText}</span>
    </button>
  );
}
