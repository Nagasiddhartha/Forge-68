"use client";

import React, { useState, useRef } from "react";
import { DataClassification, OcrExtractResult, extractOcrText, ingestOcrDocument } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { ReadAloudButton } from "@/components/ReadAloudButton";

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  clearance?: DataClassification;
  onDocumentIngested?: (docId: string, filename: string, extractedText: string) => void;
}

export function OcrModal({
  isOpen,
  onClose,
  clearance = "INTERNAL",
  onDocumentIngested,
}: OcrModalProps) {
  const { language, t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrLang, setOcrLang] = useState<string>(
    language === "kn" ? "kan" : language === "hi" ? "hin" : "eng"
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [extractResult, setExtractResult] = useState<OcrExtractResult | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractResult(null);
      setIngestSuccess(false);
      setErrorMessage(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    setErrorMessage(null);
    try {
      const res = await extractOcrText(selectedFile, selectedFile.name, ocrLang);
      setExtractResult(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleIngest = async () => {
    if (!selectedFile) return;
    setIsIngesting(true);
    setErrorMessage(null);
    try {
      const res = await ingestOcrDocument(
        selectedFile,
        selectedFile.name,
        ocrLang,
        clearance,
        "R-204"
      );
      setIngestSuccess(true);
      if (onDocumentIngested && extractResult) {
        onDocumentIngested(res.ingestion.document_id, res.ingestion.filename, extractResult.full_text);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 15, 12, 0.78)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          backgroundColor: "var(--bg-0)",
          border: "1px solid var(--line-strong)",
          borderRadius: "var(--radius-panel)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.45)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "var(--bg-1)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--sage)",
                  background: "rgba(156, 195, 168, 0.1)",
                  border: "1px solid var(--sage)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {language === "hi" ? "टेसरेक्ट-5 · संप्रभु स्थानीय ओसीआर" : language === "kn" ? "ಟೆಸೆರಾಕ್ಟ್-5 · ಸಾರ್ವಭೌಮ ಸ್ಥಳೀಯ OCR" : "TESSERACT-5 · SOVEREIGN LOCAL OCR"}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
                {language === "hi" ? "शून्य क्लाउड ट्रांसमिशन" : language === "kn" ? "ಶೂನ್ಯ ಕ್ಲೌಡ್ ಪ್ರಸರಣ" : "ZERO CLOUD TRANSMISSION"}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--ink)",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {t("ocrModalTitle")}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "12.5px",
                color: "var(--ink-2)",
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              {t("ocrModalSubtitle")}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              color: "var(--ink-3)",
              cursor: "pointer",
              padding: "4px 8px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* File Picker & OCR Lang Toolbar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 14,
              alignItems: "center",
              background: "var(--bg-1)",
              padding: "14px 18px",
              borderRadius: "var(--radius-panel)",
              border: "1px dashed var(--line-strong)",
            }}
          >
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff,.webp,.bmp"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-brass-secondary"
                style={{ fontSize: "12.5px", padding: "6px 14px", marginRight: 12 }}
              >
                📁 {t("ocrSelectFile")}
              </button>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: selectedFile ? "var(--ink)" : "var(--ink-3)" }}>
                {selectedFile ? selectedFile.name : t("ocrUploadPrompt")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
                {t("ocrLanguageLabel")}:
              </span>
              <select
                value={ocrLang}
                onChange={(e) => setOcrLang(e.target.value)}
                style={{
                  background: "var(--bg-0)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  outline: "none",
                }}
              >
                <option value="eng">{language === "hi" ? "अंग्रेजी (eng)" : language === "kn" ? "ಇಂಗ್ಲಿಷ್ (eng)" : "English (eng)"}</option>
                <option value="hin">{language === "hi" ? "हिन्दी (hin)" : language === "kn" ? "ಹಿಂದಿ (hin)" : "Hindi (hin)"}</option>
                <option value="kan">{language === "hi" ? "कन्नड़ (kan)" : language === "kn" ? "ಕನ್ನಡ (kan)" : "Kannada (kan)"}</option>
                <option value="all">{language === "hi" ? "बहुभाषी (kan+hin+eng)" : language === "kn" ? "ಬಹುಭಾಷೆ (kan+hin+eng)" : "Multilingual (kan+hin+eng)"}</option>
              </select>

              <button
                type="button"
                onClick={handleExtract}
                disabled={!selectedFile || isExtracting}
                className="btn-brass-primary"
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                {isExtracting ? t("ocrProcessing") : t("ocrExtractButton")}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(217, 105, 78, 0.1)",
                border: "1px solid var(--coral)",
                borderRadius: "var(--radius-sm)",
                color: "var(--coral-text)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              [OCR ERROR] {errorMessage}
            </div>
          )}

          {/* Extracted Text View */}
          {extractResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--brass)", fontWeight: 600 }}>
                    {t("ocrExtractedHeader")} ({extractResult.total_words} words)
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--ink-3)" }}>
                    {t("ocrPagesProcessed")}: {extractResult.total_pages}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--sage)" }}>
                    SHA-256: {extractResult.sha256.slice(0, 12)}...
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ReadAloudButton text={extractResult.full_text} compact />
                  <button
                    type="button"
                    onClick={handleIngest}
                    disabled={isIngesting || ingestSuccess}
                    className="btn-brass-primary"
                    style={{ fontSize: "12px", padding: "5px 12px" }}
                  >
                    {isIngesting ? t("ocrIngesting") : ingestSuccess ? `✓ ${t("ocrIngestSuccess").slice(0, 20)}...` : t("ocrIngestButton")}
                  </button>
                </div>
              </div>

              {ingestSuccess && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(156, 195, 168, 0.12)",
                    border: "1px solid var(--sage)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--sage)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>✓ {t("ocrIngestSuccess")}</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-brass-secondary"
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                  >
                    {t("ocrCloseButton")}
                  </button>
                </div>
              )}

              <div
                style={{
                  background: "var(--bg-1)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-panel)",
                  padding: "14px 18px",
                  maxHeight: 260,
                  overflowY: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px",
                  color: "var(--ink)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {extractResult.full_text}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            background: "var(--bg-1)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-brass-secondary"
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            {t("ocrCloseButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
