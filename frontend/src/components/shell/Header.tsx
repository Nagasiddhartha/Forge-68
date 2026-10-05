"use client";

import React, { useState, useRef, useEffect } from "react";
import { DataClassification, Role } from "@/lib/api";
import { ComputedRuntimeState } from "@/lib/runtime";

export type ShellDestination = "missions" | "library" | "governance" | "audit" | "boundary";

export interface HeaderProps {
  activeDestination: ShellDestination;
  onSelectDestination: (dest: ShellDestination) => void;
  role: Role;
  onChangeRole: (r: Role) => void;
  clearance: DataClassification;
  onChangeClearance: (c: DataClassification) => void;
  runtime: ComputedRuntimeState;
}

const NAV_ITEMS: Array<{ id: ShellDestination; label: string }> = [
  { id: "missions", label: "Missions" },
  { id: "library", label: "Library" },
  { id: "governance", label: "Governance" },
  { id: "audit", label: "Audit" },
  { id: "boundary", label: "Boundary" },
];

export function Header({
  activeDestination,
  onSelectDestination,
  role,
  onChangeRole,
  clearance,
  onChangeClearance,
  runtime,
}: HeaderProps) {
  const [personaOpen, setPersonaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Underline slide position
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const buttonRefs = useRef<Map<ShellDestination, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const activeBtn = buttonRefs.current.get(activeDestination);
    const container = navContainerRef.current;
    if (activeBtn && container) {
      const btnRect = activeBtn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setUnderlineStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeDestination]);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPersonaOpen(false);
      }
    }
    if (personaOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [personaOpen]);

  const isOnline = runtime.backend === "ONLINE";

  return (
    <header
      style={{
        backgroundColor: "var(--bg-0)",
        borderBottom: "1px solid var(--line)",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
      className="forge-top-bar"
    >
      {/* Left: Product Identity & Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              fontSize: "17px",
              letterSpacing: "0.2em",
              color: "var(--ink)",
              cursor: "pointer",
            }}
            onClick={() => onSelectDestination("missions")}
          >
            FORGE
          </span>
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              color: "var(--ink-3)",
              display: "none",
            }}
            className="md-show-inline"
          >
            Industrial AI Control Plane
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav
          ref={navContainerRef}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
          className="desktop-nav"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeDestination === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  if (el) buttonRefs.current.set(item.id, el);
                  else buttonRefs.current.delete(item.id);
                }}
                onClick={() => onSelectDestination(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-ui)",
                  fontSize: "14px",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "var(--ink)" : "var(--ink-2)",
                  cursor: "pointer",
                  padding: "6px 2px",
                  transition: "color var(--dur-fast) var(--ease-out)",
                }}
              >
                {item.label}
              </button>
            );
          })}

          {/* Sliding brass underline */}
          <div
            style={{
              position: "absolute",
              bottom: -4,
              height: 1.5,
              backgroundColor: "var(--brass)",
              left: underlineStyle.left,
              width: underlineStyle.width,
              transition: "left 260ms var(--ease-out), width 260ms var(--ease-out)",
              pointerEvents: "none",
            }}
          />
        </nav>
      </div>

      {/* Right Controls: Boundary Chip & Persona */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Boundary Chip */}
        <button
          onClick={() => onSelectDestination("boundary")}
          title="Inspect sovereignty boundary and runtime verification"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-pill)",
            padding: "5px 12px",
            fontFamily: "var(--font-ui)",
            fontSize: "12px",
            color: "var(--ink)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "border-color var(--dur-fast) var(--ease-out)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: isOnline ? "var(--sage)" : "var(--coral)",
              boxShadow: isOnline ? "0 0 6px var(--sage)" : "0 0 6px var(--coral)",
            }}
          />
          <span>{isOnline ? "Local only" : "Offline"}</span>
        </button>

        {/* Demo Persona Selector */}
        <div style={{ position: "relative" }} ref={popoverRef}>
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            style={{
              background: "var(--bg-1)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 14px",
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--ink-3)" }}>Persona:</span>
            <span style={{ fontWeight: 500 }}>{role}</span>
            <span style={{ color: "var(--line-strong)" }}>·</span>
            <span style={{ color: "var(--brass)" }}>{clearance}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1L5 5L9 1" />
            </svg>
          </button>

          {/* Demo Persona Popover */}
          {personaOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 290,
                backgroundColor: "var(--bg-2)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                boxShadow: "var(--shadow-popover)",
                padding: "16px",
                zIndex: 200,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                  Demo Persona
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "var(--ink-3)", marginTop: 2 }}>
                  Simulates industrial single sign-on (SSO) and role-based clearance enforcement.
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: "11px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 6 }}>
                  Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => onChangeRole(e.target.value as Role)}
                  style={{
                    width: "100%",
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-strong)",
                    color: "var(--ink)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "13px",
                  }}
                >
                  <option value="ENGINEER">ENGINEER (Standard Operations)</option>
                  <option value="INSPECTOR">INSPECTOR (Audits & Vision)</option>
                  <option value="AI_OPERATOR">AI_OPERATOR (Restricted Access)</option>
                  <option value="ADMIN">ADMIN (Full Authority)</option>
                  <option value="SECURITY_OFFICER">SECURITY_OFFICER</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: "11px", color: "var(--ink-3)", textTransform: "uppercase", marginBottom: 6 }}>
                  Security Clearance
                </label>
                <select
                  value={clearance}
                  onChange={(e) => onChangeClearance(e.target.value as DataClassification)}
                  style={{
                    width: "100%",
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-strong)",
                    color: "var(--ink)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "13px",
                  }}
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setPersonaOpen(false)}
                  className="btn-brass-primary"
                  style={{ padding: "5px 14px", fontSize: "12px" }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "none",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            color: "var(--ink)",
            padding: "6px 10px",
            cursor: "pointer",
            display: "none",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="18" y2="7" />
            <line x1="0" y1="13" x2="18" y2="13" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 600px) {
          .md-show-inline {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
}
