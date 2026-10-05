"use client";

import React, { useEffect, useState } from "react";
import {
  DataClassification,
  KnowledgeDocsResponse,
  KnowledgeSearchResponse,
  fetchKnowledgeDocuments,
  ingestKnowledgeDocument,
  searchKnowledge,
} from "@/lib/api";
import {
  EnamelSurface,
  BrassLabel,
  Divider,
} from "@/components/primitives";

interface KnowledgeViewProps {
  clearance: DataClassification;
}

export function KnowledgeView({ clearance }: KnowledgeViewProps) {
  const [docsData, setDocsData] = useState<KnowledgeDocsResponse | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("Reactor R-204 operating pressure trip limits");
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetchKnowledgeDocuments();
      setDocsData(res);
    } catch (err: unknown) {
      console.error("Failed to load knowledge documents", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchKnowledgeDocuments()
      .then((res) => {
        if (active) {
          setDocsData(res);
          setIsLoadingDocs(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          console.error("Failed to load knowledge documents", err);
          setIsLoadingDocs(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchKnowledge(searchQuery.trim(), 5, clearance);
      setSearchResults(res);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickIngest = async (filePath: string, classification: DataClassification) => {
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      await ingestKnowledgeDocument(filePath, classification, "technical_specification", ["R-204"]);
      setIngestStatus(`Indexed: ${filePath.split("/").pop() || filePath}`);
      await loadDocuments();
    } catch (err: unknown) {
      setIngestStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Human-friendly title mapper for demo specifications
  const getDocumentMeta = (filename: string) => {
    if (filename.includes("operating_sop")) {
      return {
        title: "Operating SOP",
        subtext: "Revision C · Operating Limits & Normal Baselines",
        category: "STANDARD PROCEDURE",
      };
    }
    if (filename.includes("inspection_report")) {
      return {
        title: "Inspection Report",
        subtext: "Inspection 204-07 · Ultrasonic Shell PAUT Survey",
        category: "NDT SURVEY",
      };
    }
    if (filename.includes("equipment_specification")) {
      return {
        title: "Equipment Specification",
        subtext: "Pressure Vessel R-204 · Hydrocracker Unit 4",
        category: "VESSEL SPEC",
      };
    }
    if (filename.includes("maintenance_history")) {
      return {
        title: "Maintenance History",
        subtext: "R-204 Overhaul Logs & Relief Valve Calibrations",
        category: "PLANT HISTORY",
      };
    }
    if (filename.includes("adversarial")) {
      return {
        title: "Advisory Bulletin (Quarantine Sample)",
        subtext: "Urgent Maintenance Bulletin · Security Test Vector",
        category: "SECURITY FIXTURE",
      };
    }
    return {
      title: filename.replace(/_/g, " ").replace(".md", ""),
      subtext: "Technical documentation record",
      category: "DOCUMENT",
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header Banner */}
      <EnamelSurface variant="base" padding="spacious">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <BrassLabel variant="outline">INDUSTRIAL RECORD ARCHIVE</BrassLabel>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
                PLANT UNIT 4 · HYDROCRACKER ASSET R-204
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--sage)",
                  background: "rgba(156, 195, 168, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--sage)",
                }}
              >
                SOVEREIGN LOCAL VECTOR STORAGE
              </span>
            </div>

            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "36px", color: "var(--ink)", fontWeight: 500, lineHeight: 1.1 }}>
              Technical Specifications & Procedural Archive
            </h1>

            <p style={{ fontFamily: "var(--font-ui)", fontSize: "14.5px", color: "var(--ink-2)", marginTop: 6, maxWidth: 680 }}>
              On-premise semantic search across engineering runbooks, ultrasonic non-destructive testing reports,
              and standard operating procedures. All chunk retrieval queries are strictly filtered by user clearance:{" "}
              <strong style={{ color: "var(--brass)" }}>{clearance}</strong>.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={loadDocuments}
              disabled={isLoadingDocs}
              className="btn-brass-secondary"
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              {isLoadingDocs ? "Refreshing..." : "↻ Refresh Archive"}
            </button>
          </div>
        </div>

        <Divider style={{ margin: "20px 0" }} />

        {/* PROMINENT SEARCH BAR */}
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)", letterSpacing: "0.06em" }}>
              SEARCH THE RECORD
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
              Clearance Enforced: {clearance}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specifications, e.g. 'Reactor R-204 operating pressure trip limits'..."
              style={{
                flex: 1,
                minWidth: 280,
                background: "var(--bg-0)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-panel)",
                color: "var(--ink)",
                fontFamily: "var(--font-ui)",
                fontSize: "14px",
                padding: "12px 16px",
                outline: "none",
                transition: "border-color var(--dur-fast) var(--ease-out)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--brass)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="btn-brass-primary"
              style={{ padding: "12px 24px", fontSize: "13px" }}
            >
              {isSearching ? "Searching..." : "Search Record ▶"}
            </button>
          </div>

          {/* Quick Query Suggestions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
              Suggested Queries:
            </span>
            {[
              "Reactor R-204 normal operating pressure",
              "R-204 high pressure trip limit shutdown threshold",
              "Relief valve PSV-204 set pressure and calibration",
              "Minimum shell wall thickness PAUT inspection",
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(q);
                }}
                style={{
                  background: "var(--bg-0)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-pill)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "3px 10px",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </form>

        {ingestStatus && (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              background: "rgba(156, 195, 168, 0.08)",
              border: "1px solid var(--sage)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--sage)",
            }}
          >
            ✓ {ingestStatus}
          </div>
        )}

        {searchError && (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              background: "rgba(217, 105, 78, 0.08)",
              border: "1px solid var(--coral)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--coral-text)",
            }}
          >
            [SEARCH ERROR] {searchError}
          </div>
        )}
      </EnamelSurface>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 24 }} className="library-split-grid">
        {/* Left Column: Industrial Plant Records */}
        <EnamelSurface variant="base" padding="normal">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)", letterSpacing: "0.06em" }}>
              PLANT TECHNICAL RECORDS ({docsData?.available_demo_documents.length ?? 5})
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
              ASSET: REACTOR R-204
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {docsData?.available_demo_documents && docsData.available_demo_documents.length > 0 ? (
              docsData.available_demo_documents.map((doc, idx) => {
                const meta = getDocumentMeta(doc.filename);
                return (
                  <div
                    key={idx}
                    style={{
                      background: "var(--bg-0)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-panel)",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      transition: "border-color var(--dur-fast) var(--ease-out)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10.5px",
                          color: "var(--brass)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {meta.category}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--ink-3)",
                          border: "1px solid var(--line)",
                          padding: "1px 6px",
                          borderRadius: "var(--radius-pill)",
                        }}
                      >
                        {doc.classification}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "15px", fontWeight: 500, color: "var(--ink)" }}>
                      {meta.title}
                    </h3>

                    <p style={{ fontFamily: "var(--font-ui)", fontSize: "12.5px", color: "var(--ink-2)", lineHeight: 1.45 }}>
                      {meta.subtext}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 8,
                        borderTop: "1px solid var(--line)",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--ink-3)",
                      }}
                    >
                      <span>
                        Size: {(doc.size_bytes / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => handleQuickIngest(doc.file_path, doc.classification as DataClassification)}
                        disabled={isIngesting}
                        style={{
                          background: "var(--bg-1)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--brass)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          padding: "3px 8px",
                          cursor: "pointer",
                        }}
                      >
                        {isIngesting ? "Indexing..." : "Re-Index ↺"}
                      </button>
                    </div>

                    {/* Secondary Technical Metadata */}
                    <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--ink-3)", opacity: 0.7 }}>
                      Ref: {doc.file_path}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--ink-3)" }}>
                Loading plant technical documents...
              </div>
            )}
          </div>
        </EnamelSurface>

        {/* Right Column: Search Results Excerpts */}
        <EnamelSurface variant="base" padding="normal">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--brass)", letterSpacing: "0.06em" }}>
              RETRIEVED RECORD EXCERPTS ({searchResults?.results.length ?? 0})
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
              Vector Cosine Similarity
            </span>
          </div>

          {searchResults && searchResults.results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {searchResults.results.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-0)",
                    border: "1px solid var(--line)",
                    borderLeft: "3px solid var(--sage)",
                    borderRadius: "var(--radius-panel)",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--brass)", fontWeight: 600 }}>
                        PASSAGE [{String(idx + 1).padStart(2, "0")}]
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)", border: "1px solid var(--line)", padding: "1px 6px", borderRadius: "var(--radius-pill)" }}>
                        {((r.chunk.metadata?.classification as string) || clearance)}
                      </span>
                    </div>

                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)", fontWeight: 600 }}>
                      {(r.score * 100).toFixed(0)}% MATCH
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "13.5px",
                      color: "var(--ink)",
                      lineHeight: 1.55,
                      background: "var(--bg-1)",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--line)",
                      margin: "8px 0",
                    }}
                  >
                    &ldquo;{r.chunk.text}&rdquo;
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--ink-3)",
                      paddingTop: 6,
                    }}
                  >
                    <span>
                      Document: <strong style={{ color: "var(--ink-2)" }}>{((r.chunk.metadata?.filename as string) || "Technical Specification")}</strong>
                    </span>
                    <span>
                      Chunk ID: {r.chunk.chunk_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--ink-3)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--ink-2)", marginBottom: 6 }}>
                Ready to search industrial records
              </p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px" }}>
                Enter an operating question or select a query above to inspect sovereign vector retrievals.
              </p>
            </div>
          )}
        </EnamelSurface>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .library-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
