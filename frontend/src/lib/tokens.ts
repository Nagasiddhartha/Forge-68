/**
 * FORGE Design Tokens: Enamel + Brass Visual System
 * Source: design/FORGE-design-spec-enamel-brass.md
 */

export const TOKENS = {
  surfaces: {
    bg0: "#0A211D",       // Page canvas, deepest
    bg1: "#0E2B26",       // Main panels, hero base
    bg2: "#12332D",       // Raised panels, popovers
    bg3: "#174039",       // Hover, selected rows
    face: "#0A231E",      // Dial face
    bezelRing: "#1F5247", // Dial inner ring
  },
  lines: {
    line: "#23463D",        // Hairlines, dividers
    lineStrong: "#2D5249",  // Dial track, input borders
    lineFocus: "#C8A15A",   // Active focus ring
  },
  typography: {
    ink: "#EFE9DA",        // Primary text, headlines (warm ivory)
    ink2: "#B9C6BF",       // Body, descriptions (secondary warm gray)
    ink3: "#9FB1A9",       // Captions, labels (min 4.5:1 text)
    inkFaint: "#6F8A80",   // Decorative only
  },
  brandAndState: {
    brass: "#C8A15A",       // Primary action, review required, needle, bezel
    brassHover: "#D4AE68",  // Brass hover
    onBrass: "#10241F",     // Text on brass fills
    sage: "#9CC3A8",        // Verified, passed, progress
    pewter: "#8DB4D6",      // Action blocked, quarantined (safe outcomes)
    coral: "#D9694E",       // Fills for trip zone, genuine failures
    coralText: "#E58A70",   // Coral for text meeting 4.5:1 contrast
    mist: "#9FB1A9",        // Insufficient evidence, not applicable
  },
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    ui: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  },
  radii: {
    hero: "20px",
    panel: "14px",
    input: "10px",
    pill: "999px",
    sm: "6px",
  },
  space: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    12: "48px",
    16: "64px",
  },
  shadows: {
    popover: "0 12px 32px rgba(0, 0, 0, 0.35)",
    subtle: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },
  motion: {
    easeOut: "cubic-bezier(.22, 1, .36, 1)",
    easeNeedle: "cubic-bezier(.22, 1.15, .36, 1)",
    easeDraw: "cubic-bezier(.3, .7, .2, 1)",
    durFast: "120ms",
    durBase: "240ms",
    durSlow: "600ms",
  },
} as const;

export type TokenColors = typeof TOKENS;
