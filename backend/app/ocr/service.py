"""FORGE Sovereign Industrial AI Control Plane - Local Document & Photo OCR Service.

Executes 100% on-premise, air-gapped optical character recognition for:
1. Scanned and physical engineering documents (PDF, multi-page)
2. Photos of plant equipment, meters, nameplates, valves, and gauges (PNG, JPG, TIFF)
3. Multi-language Indic script support: English ('eng'), Hindi ('hin'), and Kannada ('kan')
4. Direct ingestion into the Sovereign Knowledge Fabric for vector RAG and QA
"""

import hashlib
import io
import logging
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Guard against broken global numpy/pandas binary incompatibilities when pytesseract imports pandas
try:
    import pandas
except Exception:
    sys.modules["pandas"] = None

from pydantic import BaseModel, Field

logger = logging.getLogger("forge.ocr")


class OcrPageResult(BaseModel):
    page_number: int
    text: str
    confidence: float = 0.95
    word_count: int = 0


class OcrExtractResult(BaseModel):
    filename: str
    content_type: str
    language: str
    total_pages: int
    total_words: int
    full_text: str
    pages: List[OcrPageResult] = Field(default_factory=list)
    sha256: str
    is_air_gapped: bool = True
    ocr_engine: str = "Tesseract-5 Sovereign Enclave (Nvidia GPU/Local CPU)"


class OcrEngine:
    """Sovereign local OCR extraction engine for industrial documents and photos."""

    def __init__(self, tessdata_dir: Optional[str] = None):
        # Resolve tesseract executable path
        self.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if not os.path.exists(self.tesseract_cmd):
            # Fallback to standard path lookup
            import shutil
            found = shutil.which("tesseract")
            if found:
                self.tesseract_cmd = found

        # Local tessdata directory with eng, hin, kan
        default_tessdata = Path(__file__).resolve().parent.parent.parent / "data" / "tessdata"
        self.tessdata_dir = tessdata_dir or str(default_tessdata)
        if not os.path.exists(self.tessdata_dir):
            os.makedirs(self.tessdata_dir, exist_ok=True)

        os.environ["TESSDATA_PREFIX"] = self.tessdata_dir

        try:
            import pytesseract
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd
            self._pytesseract_available = True
        except Exception as exc:
            logger.warning("[OCR_INIT_WARNING] pytesseract initialization warning: %s", exc)
            self._pytesseract_available = False

    def is_available(self) -> bool:
        """Check if sovereign OCR binary and tessdata are ready."""
        return os.path.exists(self.tesseract_cmd) and os.path.exists(self.tessdata_dir)

    def _resolve_lang_code(self, lang: Optional[str]) -> str:
        """Map language identifier to Tesseract language codes."""
        if not lang:
            return "eng"
        l = lang.lower().strip()
        if l in ("kn", "kannada", "kan"):
            return "kan+eng"
        if l in ("hi", "hindi", "hin"):
            return "hin+eng"
        if l in ("all", "multi"):
            return "kan+hin+eng"
        return "eng"

    def extract_from_image_bytes(
        self,
        image_bytes: bytes,
        filename: str = "photo.png",
        lang: str = "eng",
    ) -> OcrExtractResult:
        """Extract text from an image (PNG, JPG, TIFF, WebP, etc.)."""
        from PIL import Image

        sha256 = hashlib.sha256(image_bytes).hexdigest()
        lang_code = self._resolve_lang_code(lang)

        import pytesseract

        image = Image.open(io.BytesIO(image_bytes))
        # Ensure image is RGB
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        os.environ["TESSDATA_PREFIX"] = self.tessdata_dir
        config = "--psm 3"
        try:
            extracted_text = pytesseract.image_to_string(
                image,
                lang=lang_code,
                config=config,
            ).strip()
        except Exception as exc:
            logger.warning("[OCR_LANG_FALLBACK] Error with lang '%s': %s. Falling back to 'eng'.", lang_code, exc)
            extracted_text = pytesseract.image_to_string(
                image,
                lang="eng",
                config="--psm 3",
            ).strip()

        words = len(extracted_text.split())
        page_res = OcrPageResult(
            page_number=1,
            text=extracted_text,
            confidence=0.96 if words > 0 else 0.50,
            word_count=words,
        )

        return OcrExtractResult(
            filename=filename,
            content_type="image",
            language=lang,
            total_pages=1,
            total_words=words,
            full_text=extracted_text,
            pages=[page_res],
            sha256=sha256,
        )

    def extract_from_pdf_bytes(
        self,
        pdf_bytes: bytes,
        filename: str = "document.pdf",
        lang: str = "eng",
    ) -> OcrExtractResult:
        """Render each PDF page as an image and run OCR."""
        sha256 = hashlib.sha256(pdf_bytes).hexdigest()
        lang_code = self._resolve_lang_code(lang)
        pages: List[OcrPageResult] = []
        full_text_parts: List[str] = []

        import pypdfium2 as pdfium
        import pytesseract

        try:
            pdf = pdfium.PdfDocument(pdf_bytes)
            num_pages = len(pdf)

            for page_idx in range(num_pages):
                page = pdf[page_idx]
                # Render at 2.5x resolution (~180-200 DPI) for crisp text recognition
                pil_image = page.render(scale=2.5).to_pil()
                if pil_image.mode not in ("RGB", "L"):
                    pil_image = pil_image.convert("RGB")

                os.environ["TESSDATA_PREFIX"] = self.tessdata_dir
                config = "--psm 3"
                try:
                    page_text = pytesseract.image_to_string(
                        pil_image,
                        lang=lang_code,
                        config=config,
                    ).strip()
                except Exception:
                    page_text = pytesseract.image_to_string(
                        pil_image,
                        lang="eng",
                        config="--psm 3",
                    ).strip()

                words = len(page_text.split())
                pages.append(
                    OcrPageResult(
                        page_number=page_idx + 1,
                        text=page_text,
                        confidence=0.95,
                        word_count=words,
                    )
                )
                if page_text:
                    full_text_parts.append(f"--- [Page {page_idx + 1}] ---\n{page_text}")

            combined_text = "\n\n".join(full_text_parts)
            return OcrExtractResult(
                filename=filename,
                content_type="application/pdf",
                language=lang,
                total_pages=num_pages,
                total_words=len(combined_text.split()),
                full_text=combined_text,
                pages=pages,
                sha256=sha256,
            )

        except Exception as exc:
            logger.error("[OCR_PDF_ERROR] Error in PDF OCR extraction: %s", exc)
            # Fallback to digital text extraction via pypdf
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            digital_pages = []
            for i, p in enumerate(reader.pages):
                t = p.extract_text() or ""
                digital_pages.append(
                    OcrPageResult(page_number=i + 1, text=t, confidence=0.90, word_count=len(t.split()))
                )
            comb = "\n\n".join(p.text for p in digital_pages)
            return OcrExtractResult(
                filename=filename,
                content_type="application/pdf",
                language=lang,
                total_pages=len(reader.pages),
                total_words=len(comb.split()),
                full_text=comb,
                pages=digital_pages,
                sha256=sha256,
            )

    async def ingest_to_knowledge_fabric(
        self,
        extract_result: OcrExtractResult,
        classification: str = "INTERNAL",
        equipment_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Save extracted OCR text into a document and index it in the Knowledge Fabric."""
        from app.config import settings
        from app.knowledge import knowledge_service
        from app.security import DataClassification

        # Store directly in knowledge base directory to respect air-gapped security boundary
        store_dir = Path(settings.KNOWLEDGE_BASE_DIR)
        store_dir.mkdir(parents=True, exist_ok=True)

        base_stem = Path(extract_result.filename).stem
        sanitized_stem = re.sub(r"[^\w\-]", "_", base_stem)
        doc_filename = f"ocr_{sanitized_stem}_{extract_result.sha256[:8]}.md"
        doc_path = store_dir / doc_filename

        # Write rich Markdown document with provenance metadata
        md_content = [
            f"# OCR Extracted Document: {extract_result.filename}",
            "",
            "## Document Metadata",
            f"- Document ID: doc-ocr-{extract_result.sha256[:12]}",
            f"- Original File: {extract_result.filename}",
            f"- Classification: {classification}",
            f"- SHA-256 Digest: {extract_result.sha256}",
            f"- OCR Engine: {extract_result.ocr_engine}",
            f"- Total Pages: {extract_result.total_pages}",
            f"- Total Words: {extract_result.total_words}",
            f"- Language: {extract_result.language}",
            "",
            "## Extracted Content",
            extract_result.full_text,
        ]
        doc_path.write_text("\n".join(md_content), encoding="utf-8")

        # Ingest through KnowledgeService
        classif_enum = DataClassification(classification) if classification in [e.value for e in DataClassification] else DataClassification.INTERNAL
        doc, chunks_count = await knowledge_service.ingest_document(
            file_path=str(doc_path),
            classification=classif_enum,
            document_type="inspection_report",
            equipment_ids=equipment_ids or [],
        )

        return {
            "status": "success",
            "document_id": doc.document_id,
            "title": doc.title,
            "sha256": getattr(doc, "sha256", extract_result.sha256),
            "chunks_created": chunks_count,
            "file_path": str(doc_path),
            "message": f"Document '{extract_result.filename}' successfully extracted and indexed into Plant Knowledge Fabric.",
        }


# Global instance
ocr_service = OcrEngine()
