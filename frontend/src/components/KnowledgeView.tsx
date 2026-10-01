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
      setIngestStatus(`Successfully indexed: ${filePath}`);
      await loadDocuments();
    } catch (err: unknown) {
      setIngestStatus(`Ingestion error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div className="card" style={{ border: "1px solid var(--accent-cyan-dim)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-cyan">KNOWLEDGE FABRIC</span>
              <span className="badge badge-verified">LOCAL VECTOR STORE</span>
              <span className="badge badge-secondary">SEMANTIC RETRIEVAL</span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Industrial Knowledge Ingestion & Vector Retrieval
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
              On-premise air-gapped vector search across technical specifications, SOPs, and engineering runbooks.
              All chunk retrievals are bounded by user data clearance: <strong style={{ color: "var(--accent-cyan)" }}>{clearance}</strong>.
            </p>
          </div>
          <button
            onClick={loadDocuments}
            disabled={isLoadingDocs}
            className="btn-secondary"
            style={{ fontSize: "0.78rem" }}
          >
            {isLoadingDocs ? "REFRESHING..." : "↻ REFRESH REPOSITORY"}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
        {/* Left Column: Repository Documents */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                AVAILABLE DEMO DOCUMENTS
              </span>
              <span className="badge badge-secondary">
                {docsData?.available_demo_documents.length ?? 0} SPECIFICATIONS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docsData?.available_demo_documents && docsData.available_demo_documents.length > 0 ? (
                docsData.available_demo_documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--bg-surface-border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {doc.filename}
                      </span>
                      <span className="badge badge-secondary" style={{ fontSize: "0.68rem" }}>
                        {doc.classification}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                      PATH: {doc.file_path}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        Size: {(doc.size_bytes / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => handleQuickIngest(doc.file_path, doc.classification as DataClassification)}
                        disabled={isIngesting}
                        className="btn-primary"
                        style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                      >
                        INGEST / RE-INDEX
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: 12 }}>
                  {isLoadingDocs ? "Scanning local demo repository..." : "No demo documents detected in backend demo folder."}
                </div>
              )}
            </div>

            {ingestStatus && (
              <div style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "rgba(0, 240, 255, 0.08)",
                border: "1px solid rgba(0, 240, 255, 0.2)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                color: "var(--accent-cyan)",
              }}>
                {ingestStatus}
              </div>
            )}
          </div>

          {/* Currently Ingested Documents */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                ACTIVE IN-MEMORY CHUNKS
              </span>
              <span className="badge badge-cyan">
                {docsData?.total_ingested ?? 0} ACTIVE DOCS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {docsData?.ingested_documents && docsData.ingested_documents.length > 0 ? (
                docsData.ingested_documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {doc.filename}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        SHA-256: {doc.sha256_hash ? `${doc.sha256_hash.slice(0, 14)}...` : "N/A"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="badge badge-verified" style={{ fontSize: "0.68rem" }}>
                        {doc.chunks_count} CHUNKS
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: 8 }}>
                  No documents ingested in this session yet. Click Ingest on any document above or perform an agent query to trigger dynamic ingestion.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Semantic Vector Search Interface */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                SEMANTIC RETRIEVAL CONSOLE
              </span>
              <span className="badge badge-cyan">SIMILARITY SCORING</span>
            </div>

            <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
                  NATURAL LANGUAGE QUERY OR SPECIFICATION SEARCH:
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Reactor R-204 operating pressure trip limits"
                    style={{
                      flex: 1,
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--bg-surface-border)",
                      color: "var(--text-primary)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="btn-primary"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {isSearching ? "SEARCHING..." : "SEARCH VECTOR STORE"}
                  </button>
                </div>
              </div>

              {/* Sample Queries */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>DEMO QUERIES:</span>
                {[
                  "Reactor R-204 normal operating pressure",
                  "R-204 high pressure trip limit shutdown threshold",
                  "Relief valve PSV-204 set pressure and calibration",
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchQuery(sample);
                      searchKnowledge(sample, 5, clearance).then(setSearchResults).catch(console.error);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--accent-cyan)",
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </form>

            {searchError && (
              <div style={{
                marginTop: 14,
                padding: "8px 12px",
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                borderRadius: "var(--radius-sm)",
                color: "#fda4af",
                fontSize: "0.78rem",
              }}>
                Error during retrieval: {searchError}
              </div>
            )}
          </div>

          {/* Search Results Display */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                RETRIEVED KNOWLEDGE CHUNKS
              </span>
              <span className="badge badge-secondary">
                {searchResults ? `${searchResults.total_results} MATCHES` : "AWAITING QUERY"}
              </span>
            </div>

            {searchResults && searchResults.results && searchResults.results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {searchResults.results.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--bg-surface-border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
                          RANK #{item.rank || idx + 1}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                          CHUNK ID: <strong style={{ color: "var(--text-primary)" }}>{item.chunk.chunk_id}</strong>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="badge badge-verified" style={{ fontSize: "0.7rem" }}>
                          SIMILARITY: {(item.score * 100).toFixed(1)}%
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                          {String(item.chunk.metadata?.classification || "INTERNAL")}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: 10,
                      background: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      {item.chunk.text}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      <span>DOC ID: {item.chunk.document_id}</span>
                      <span>TOKENS: {item.chunk.token_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults ? (
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: 16, textAlign: "center" }}>
                No matching chunks found for query with classification &le; {clearance}. Try indexing documents on the left.
              </div>
            ) : (
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: 24, textAlign: "center" }}>
                Execute a semantic query above to inspect retrieved document chunks and similarity scoring.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
