import os
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional

from app.schemas.prescription import ExtractedMedicationCandidate, FieldConfidence


class OCRError(Exception):
    """Base exception for OCR service errors."""
    pass


@dataclass
class OCRRawOutput:
    raw_text: str
    confidence: Optional[float]
    engine: str
    model_version: str
    status: str = "COMPLETED"


class OCRGateway(ABC):
    """Abstract Base Class for OCR engines."""

    @abstractmethod
    def process_image(self, image_bytes: bytes, filename: str) -> OCRRawOutput:
        """Run OCR on image bytes and return raw text output with confidence."""
        raise NotImplementedError


class MockOCRGateway(OCRGateway):
    """
    Deterministic test OCR gateway using synthetic multi-condition prescription fixtures.
    Safe, offline-compatible, and 100% reproducible for pipeline validation.
    """

    FIXTURES = {
        # 1. Pediatric Malaria & Fever
        "malaria": (
            "Rx\n"
            "Artemether-Lumefantrine 20/120mg\n"
            "1 tablet twice daily with milk for 3 days\n"
            "Paracetamol 250mg/5ml syrup\n"
            "5ml SOS for fever > 38.5C\n"
            "ORS oral rehydration salts 1 sachet in 1L water\n"
        ),
        # 2. Adult Primary Hypertension
        "hypertension": (
            "Rx\n"
            "Amlodipine 5mg\n"
            "1 tablet once daily in morning\n"
            "Telmisartan 40mg\n"
            "1 tab OD\n"
            "Hydrochlorothiazide 12.5mg\n"
            "1 tab OD\n"
        ),
        # 3. Pediatric Tuberculosis Intensive Phase
        "tb": (
            "Rx\n"
            "Rifampicin 150mg\n"
            "1 tab OD on empty stomach\n"
            "Isoniazid 100mg\n"
            "1 tab OD\n"
            "Pyrazinamide 500mg\n"
            "1 tab OD\n"
            "Ethambutol 400mg\n"
            "1 tab OD\n"
        ),
        # 4. Type 2 Diabetes Management
        "diabetes": (
            "Rx\n"
            "Metformin 500mg\n"
            "1 tablet twice daily after meals\n"
            "Glimepiride 1mg\n"
            "1 tab before breakfast\n"
        ),
        # 5. Acute Respiratory Infection & Cough
        "respiratory": (
            "Rx\n"
            "Amoxicillin 500mg\n"
            "1 capsule TDS for 5 days\n"
            "Cetirizine 10mg\n"
            "1 tablet at bedtime\n"
        ),
        # 6. Minimal Name Only (Testing Conservative Extraction: No Inferred Dosage)
        "minimal": (
            "Rx\n"
            "Azithromycin\n"
            "Pantoprazole\n"
        ),
        # 7. Gastroenteritis / Dehydration
        "gastro": (
            "Rx\n"
            "ORS Solution 1L daily\n"
            "Zinc Sulfate 20mg\n"
            "1 tab OD for 14 days\n"
            "Ondansetron 4mg\n"
            "1 tab SOS\n"
        ),
        # 8. Anemia & Iron Deficiency
        "anemia": (
            "Rx\n"
            "Ferrous Sulfate 200mg\n"
            "1 tablet OD after meals\n"
            "Folic Acid 5mg\n"
            "1 tab OD\n"
        ),
        # 9. Bronchial Asthma Inhaler
        "asthma": (
            "Rx\n"
            "Salbutamol Inhaler 100mcg\n"
            "2 puffs as needed for wheezing\n"
            "Budecort 200mcg Inhaler\n"
            "1 puff BD\n"
        ),
        # 10. Default General Practice Multi-Item
        "default": (
            "Rx\n"
            "Paracetamol 500mg\n"
            "1 tablet twice daily after food\n"
            "Amoxicillin 500mg\n"
            "1 capsule thrice daily\n"
            "Cetirizine 10mg\n"
            "1 tab at night\n"
        ),
    }

    def process_image(self, image_bytes: bytes, filename: str) -> OCRRawOutput:
        fn_lower = (filename or "").lower()
        
        # Match fixture by filename key or return default
        matched_text = self.FIXTURES["default"]
        for key in self.FIXTURES:
            if key in fn_lower:
                matched_text = self.FIXTURES[key]
                break

        return OCRRawOutput(
            raw_text=matched_text,
            confidence=0.95,
            engine="mock_ocr",
            model_version="v1.0",
            status="COMPLETED",
        )


class TesseractOCRGateway(OCRGateway):
    """
    Local Tesseract OCR engine using pytesseract if installed.
    """

    def __init__(self):
        try:
            import pytesseract
            from PIL import Image
            self.pytesseract = pytesseract
            self.Image = Image
            command = os.getenv("TESSERACT_CMD")
            if command:
                self.pytesseract.pytesseract.tesseract_cmd = command
        except ImportError:
            raise OCRError("pytesseract or Pillow is not installed in the environment.")

    def process_image(self, image_bytes: bytes, filename: str) -> OCRRawOutput:
        import io
        try:
            image = self.Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            
            extracted_text = self.pytesseract.image_to_string(image, timeout=30)
            if isinstance(extracted_text, dict):
                raw_text_str = str(extracted_text.get("text", "")).strip()
            elif isinstance(extracted_text, bytes):
                raw_text_str = extracted_text.decode("utf-8", errors="replace").strip()
            else:
                raw_text_str = str(extracted_text).strip()

            data = self.pytesseract.image_to_data(image, output_type=self.pytesseract.Output.DICT, timeout=30)
            scores = [float(score) for score, word in zip(data["conf"], data["text"]) if word.strip() and float(score) >= 0]
            return OCRRawOutput(
                raw_text=raw_text_str,
                confidence=sum(scores) / (100 * len(scores)) if scores else None,
                engine="tesseract_ocr",
                model_version=str(self.pytesseract.get_tesseract_version()),
                status="COMPLETED",
            )
        except Exception:
            raise OCRError("OCR could not read this image. Check the file or the local OCR installation.") from None


class DisabledOCRGateway(OCRGateway):
    """Disabled OCR provider returning an explicit offline notice."""

    def process_image(self, image_bytes: bytes, filename: str) -> OCRRawOutput:
        raise OCRError("OCR processing is disabled in this environment.")


def create_ocr_gateway() -> OCRGateway:
    """Factory to instantiate the configured OCRGateway."""
    from app.core.config import settings
    provider = os.getenv("OCR_PROVIDER", "tesseract").lower().strip()
    if provider == "tesseract":
        return TesseractOCRGateway()
    elif provider == "disabled":
        return DisabledOCRGateway()
    if provider == "mock" and settings.APP_ENV == "test":
        return MockOCRGateway()
    raise OCRError("Configure a real OCR provider. Mock OCR is restricted to tests.")


# ---------------------------------------------------------------------------
# Conservative Medication Entity Extractor
# ---------------------------------------------------------------------------

# Common strength / dosage patterns (e.g. 500mg, 20/120mg, 100mcg, 250mg/5ml, 5ml, 1 sachet)
DOSAGE_PATTERN = re.compile(
    r"\b(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?\s*(?:mg|mcg|g|ml|mg\/5ml|iu|sachet|puffs?))\b",
    re.IGNORECASE,
)

# Common frequency patterns (e.g. OD, BD, TDS, QID, SOS, once daily, twice daily, at bedtime)
FREQUENCY_PATTERNS = [
    (re.compile(r"\b(once\s+daily|once\s+a\s+day|in\s+morning|od)\b", re.IGNORECASE), "Once daily (OD)"),
    (re.compile(r"\b(twice\s+daily|twice\s+a\s+day|bd|bid)\b", re.IGNORECASE), "Twice daily (BD)"),
    (re.compile(r"\b(thrice\s+daily|three\s+times\s+a\s+day|tds|tid)\b", re.IGNORECASE), "Thrice daily (TDS)"),
    (re.compile(r"\b(four\s+times\s+a\s+day|qid)\b", re.IGNORECASE), "Four times daily (QID)"),
    (re.compile(r"\b(as\s+needed|sos|when\s+required)\b", re.IGNORECASE), "As needed (SOS)"),
    (re.compile(r"\b(at\s+bedtime|at\s+night|hs)\b", re.IGNORECASE), "At bedtime (HS)"),
]

# Common instructions patterns (e.g. after meals, with milk, empty stomach, for 5 days)
INSTRUCTION_PATTERNS = re.compile(
    r"\b(after\s+meals?|after\s+food|before\s+meals?|before\s+breakfast|with\s+milk|on\s+empty\s+stomach|for\s+\d+\s+days|with\s+water)\b",
    re.IGNORECASE,
)

# Noise tokens to strip from line beginnings
HEADER_TOKENS = re.compile(r"^(?:Rx|Dr\.?|Date:|Patient:|Name:|Tab(?:let)?\.?|Cap(?:sule)?\.?|Syr(?:up)?\.?|Inj(?:ection)?\.?)\s*", re.IGNORECASE)

# Document-layout filtering, not a medicine dictionary or a clinical rule.
# Preserve excluded text in raw OCR for human review.
DOCUMENT_METADATA = re.compile(
    r"^(?:patient\b|name\s*:|date\b|doctor\b|dr\.|clinic\b|hospital\b|"
    r"signature\b|address\s*:|age\s*:|sex\s*:|phone\s*:|"
    r"synthetic\b|this\s+is\b|test\s+document\b|generated\s+.+test\b)",
    re.IGNORECASE,
)


def extract_medication_entities(raw_text: str) -> List[ExtractedMedicationCandidate]:
    """
    Conservatively extract medication candidates from raw OCR text.
    
    SAFETY RULE (AGENTS.md Rule 12 & Approved Architecture):
    - Never invent or infer medication name, dosage, frequency, or instructions not explicitly present.
    - If a field is missing, it remains None with no hallucinated default.
    - Preserves field-level confidence scores.
    """
    candidates: List[ExtractedMedicationCandidate] = []
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        if DOCUMENT_METADATA.match(line):
            i += 1
            continue
        
        # Skip pure header/date lines
        cleaned_line = HEADER_TOKENS.sub("", line).strip()
        if not cleaned_line or len(cleaned_line) < 3:
            i += 1
            continue

        # Look ahead to combine line + next line if next line contains frequency/instructions for this medicine
        combined_text = cleaned_line
        if i + 1 < len(lines) and not HEADER_TOKENS.match(lines[i + 1]):
            # If current line looks like a medicine name/dosage, next line may contain instructions
            next_line = lines[i + 1]
            if any(p.search(next_line) for p, _ in FREQUENCY_PATTERNS) or INSTRUCTION_PATTERNS.search(next_line):
                combined_text = f"{cleaned_line} {next_line}"
                i += 1  # consume next line

        # 1. Extract Dosage / Strength (if present)
        dosage_match = DOSAGE_PATTERN.search(combined_text)
        dosage_field: Optional[FieldConfidence] = None
        if dosage_match:
            dosage_val = dosage_match.group(1).strip()
            dosage_field = FieldConfidence(value=dosage_val, confidence=0.92)

        # 2. Extract Frequency (if present)
        frequency_field: Optional[FieldConfidence] = None
        for pattern, label in FREQUENCY_PATTERNS:
            match = pattern.search(combined_text)
            if match:
                frequency_field = FieldConfidence(value=label, confidence=0.90)
                break

        # 3. Extract Instructions (if present)
        instruction_match = INSTRUCTION_PATTERNS.search(combined_text)
        instruction_field: Optional[FieldConfidence] = None
        if instruction_match:
            instruction_field = FieldConfidence(value=instruction_match.group(1).strip(), confidence=0.88)

        # 4. Extract Medicine Name (clean out extracted tokens)
        name_candidate = cleaned_line
        # Remove dosage if at end of name line
        if dosage_match:
            name_candidate = DOSAGE_PATTERN.sub("", name_candidate).strip()
        
        # Remove frequency tokens from name
        for pattern, _ in FREQUENCY_PATTERNS:
            name_candidate = pattern.sub("", name_candidate).strip()
            
        # Remove trailing/leading punctuation
        name_candidate = re.sub(r"^[\d\.\-\*\•\s]+", "", name_candidate).strip()
        name_candidate = re.sub(r"[,;:\-]+$", "", name_candidate).strip()

        if len(name_candidate) >= 3 and not re.match(r"^(Rx|Date|Total|Signature|Clinic|Hospital)$", name_candidate, re.IGNORECASE):
            med_name_field = FieldConfidence(value=name_candidate, confidence=0.94)
            candidate = ExtractedMedicationCandidate(
                medicine_name=med_name_field,
                dosage=dosage_field,
                frequency=frequency_field,
                instructions=instruction_field,
                verification_status="PENDING",  # Strict Safety Invariant
            )
            candidates.append(candidate)

        i += 1

    return candidates
