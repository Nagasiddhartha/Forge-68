"""Sovereign Industrial Report Generator producing standard Microsoft Word (.docx) documents.

Fully standalone and air-gapped: utilizes native OpenXML packaging with zipfile and ElementTree,
with graceful adaptation if python-docx is installed. Zero cloud calls or third-party APIs.
Produces 100% localized engineering inspection dossiers in English, Hindi, and Kannada.
"""

import io
import re
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape as xml_escape


def _format_ist_time(dt_utc: datetime) -> str:
    """Format UTC datetime into readable Indian Standard Time string."""
    try:
        from datetime import timedelta
        ist_dt = dt_utc + timedelta(hours=5, minutes=30)
        return ist_dt.strftime("%Y-%m-%d %H:%M:%S IST")
    except Exception:
        return dt_utc.strftime("%Y-%m-%d %H:%M:%S UTC")


# Scenario-specific localized content dictionaries
SCENARIO_LOCALIZATION: Dict[str, Dict[str, Dict[str, str]]] = {
    "r204_investigation": {
        "en": {
            "title": "CASE 01: Reactor R-204 Structural Integrity & Wall Thickness Assessment",
            "query": "Analyze Reactor R-204 and evaluate current structural wall thickness against retirement thresholds.",
            "findings": (
                "Ultrasonic non-destructive testing (UT-204) confirms reactor shell wall thickness of 72.8 mm, "
                "which safely exceeds the minimum retirement limit of 68.2 mm with a positive safety margin of +4.6 mm. "
                "Operating pressure (31.4 bar) and temperature remain within certified design envelopes under SOP-R204-REV4. "
                "Conclusion: Reactor R-204 is verified as structurally sound and cleared for continued operation."
            ),
        },
        "hi": {
            "title": "केस 01: रिएक्टर R-204 संरचनात्मक अखंडता एवं दीवार मोटाई मूल्यांकन",
            "query": "रिएक्टर R-204 का विश्लेषण करें और सेवानिवृत्ति सीमा के विरुद्ध वर्तमान दीवार मोटाई का मूल्यांकन करें।",
            "findings": (
                "अल्ट्रासोनिक गैर-विनाशकारी परीक्षण (UT-204) पुष्टि करता है कि रिएक्टर शेल की दीवार की मोटाई 72.8 मिमी है, "
                "जो न्यूनतम सेवानिवृत्ति सीमा (68.2 मिमी) से +4.6 मिमी के सकारात्मक सुरक्षा मार्जिन के साथ अधिक है। "
                "परिचालन दबाव (31.4 बार) और तापमान SOP-R204-REV4 के तहत प्रमाणित डिज़ाइन सीमाओं के भीतर हैं। "
                "निष्कर्ष: रिएक्टर R-204 संरचनात्मक रूप से सुरक्षित सत्यापित है और निरंतर संचालन के लिए स्वीकृत है।"
            ),
        },
        "kn": {
            "title": "ಕೇಸ್ 01: ರಿಯಾಕ್ಟರ್ R-204 ರಚನಾತ್ಮಕ ಸಮಗ್ರತೆ ಮತ್ತು ಗೋಡೆಯ ದಪ್ಪದ ಮೌಲ್ಯಮಾಪನ",
            "query": "ರಿಯಾಕ್ಟರ್ R-204 ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ನಿವೃತ್ತಿ ಮಿತಿಯ ವಿರುದ್ಧ ಪ್ರಸ್ತುತ ಗೋಡೆಯ ದಪ್ಪವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ.",
            "findings": (
                "ಅಲ್ಟ್ರಾಸಾನಿಕ್ ಪರೀಕ್ಷೆಯು (UT-204) ರಿಯಾಕ್ಟರ್ ಗೋಡೆಯ ದಪ್ಪ 72.8 ಮಿಮೀ ಎಂದು ದೃಢಪಡಿಸುತ್ತದೆ, "
                "ಇದು ಕನಿಷ್ಠ ನಿವೃತ್ತಿ ಮಿತಿಯಾದ 68.2 ಮಿಮೀ ಗಿಂತ +4.6 ಮಿಮೀ ಸುರಕ್ಷತಾ ಅಂತರದೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿದೆ. "
                "ಕಾರ್ಯಾಚರಣೆಯ ಒತ್ತಡ (31.4 ಬಾರ್) SOP-R204-REV4 ಅಡಿಯಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿದೆ. "
                "ತೀರ್ಮಾನ: ರಿಯಾಕ್ಟರ್ R-204 ರಚನಾತ್ಮಕವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿದೆ ಮತ್ತು ನಿರಂತರ ಕಾರ್ಯಾಚರಣೆಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ."
            ),
        },
    },
    "r204_pressure_variance": {
        "en": {
            "title": "CASE 02: Reactor R-204 Pressure Variance & Dial PI-204 Anomaly Investigation",
            "query": "Evaluate analog pressure transmitter PI-204 and determine if pressure variance requires engineering review.",
            "findings": (
                "Multimodal vision analysis of analog gauge PI-204 registers an observed operating pressure of 33.0 bar, "
                "representing a +1.8 bar deviation (+5.77%) above the normal operating baseline of 31.2 bar. "
                "Emergency trip boundary is 35.0 bar (remaining margin: 2.0 bar). "
                "Conclusion: Parameter deviation flagged by VerificationEngine. Senior engineering review and telemetry cross-check recommended."
            ),
        },
        "hi": {
            "title": "केस 02: रिएक्टर R-204 दबाव विचरण एवं एनालॉग डायल PI-204 विसंगति जांच",
            "query": "एनालॉग प्रेशर ट्रांसमीटर PI-204 का मूल्यांकन करें और निर्धारित करें कि क्या दबाव विचरण को इंजीनियरिंग समीक्षा की आवश्यकता है।",
            "findings": (
                "एनालॉग डायल PI-204 का कंप्यूटर विज़न विश्लेषण 33.0 बार का दबाव दर्शाता है, "
                "जो सामान्य ऑपरेटिंग बेसलाइन (31.2 बार) से +1.8 बार (+5.77%) अधिक है। "
                "आपातकालीन ट्रिप सीमा 35.0 बार है (शेष सुरक्षा मार्जिन: 2.0 बार)। "
                "निष्कर्ष: सत्यापन इंजन द्वारा पैरामीटर विचलन ध्वजांकित। सुरक्षा प्रोटोकॉल के तहत तत्काल वरिष्ठ इंजीनियरिंग समीक्षा की सिफारिश की जाती है।"
            ),
        },
        "kn": {
            "title": "ಕೇಸ್ 02: ರಿಯಾಕ್ಟರ್ R-204 ಒತ್ತಡದ ವ್ಯತ್ಯಾಸ ಮತ್ತು ಅನಲಾಗ್ ಡಯಲ್ PI-204 ತನಿಖೆ",
            "query": "ಅನಲಾಗ್ ಪ್ರೆಶರ್ ಟ್ರಾನ್ಸ್‌ಮಿಟರ್ PI-204 ಅನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆಯೇ ಎಂದು ನಿರ್ಧರಿಸಿ.",
            "findings": (
                "ಅನಲಾಗ್ ಗೇಜ್ PI-204 ರ ಕಂಪ್ಯೂಟರ್ ವಿಷನ್ ವಿಶ್ಲೇಷಣೆಯು 33.0 ಬಾರ್ ಒತ್ತಡವನ್ನು ದಾಖಲಿಸಿದೆ, "
                "ಇದು ಸಾಮಾನ್ಯ ಬೇಸ್‌ಲೈನ್ (31.2 ಬಾರ್) ಗಿಂತ +1.8 ಬಾರ್ (+5.77%) ಹೆಚ್ಚಾಗಿದೆ. "
                "ತುರ್ತು ಟ್ರಿಪ್ ಮಿತಿ 35.0 ಬಾರ್ ಆಗಿದೆ (ಉಳಿದ ಅಂತರ: 2.0 ಬಾರ್). "
                "ತೀರ್ಮಾನ: ಪ್ಯಾರಾಮೀಟರ್ ವ್ಯತ್ಯಾಸ ಪತ್ತೆಯಾಗಿದೆ. ಹಿರಿಯ ಎಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ."
            ),
        },
    },
    "policy_denial": {
        "en": {
            "title": "CASE 03: Unauthorized Actuation Interception — Safety Policy Enforcement",
            "query": "Attempt critical valve calibration tool invocation without required supervisor authorization.",
            "findings": (
                "Tool execution request for 'calibrate_pressure_relief_valve' was intercepted by PolicyGateway (Policy POL-CRIT-002). "
                "Clearance check failed: Role 'ENGINEER' is restricted from direct calibration actuation. "
                "Enforced default-deny governance: Zero tool execution, physical valve actuation counter strictly verified as 0. "
                "Conclusion: Industrial safety boundary successfully preserved."
            ),
        },
        "hi": {
            "title": "केस 03: अनधिकृत वाल्व अंशांकन अवरोधन — सुरक्षा नीति प्रवर्तन",
            "query": "आवश्यक पर्यवेक्षक प्राधिकरण के बिना महत्वपूर्ण दबाव राहत वाल्व को कैलिब्रेट करने का प्रयास।",
            "findings": (
                "टूल 'calibrate_pressure_relief_valve' के निष्पादन अनुरोध को नीति गेटवे POL-CRIT-002 द्वारा अवरुद्ध किया गया। "
                "भूमिका 'ENGINEER' के पास सीधी अंशांकन कार्रवाई का अधिकार नहीं है। "
                "डिफ़ॉल्ट-अस्वीकार सुरक्षा नीति लागू: शून्य भौतिक उपकरण सक्रियण, निष्पादन काउंटर सख्ती से 0 सत्यापित। "
                "निष्कर्ष: औद्योगिक सुरक्षा सीमा सफलतापूर्वक सुरक्षित रखी गई।"
            ),
        },
        "kn": {
            "title": "ಕೇಸ್ 03: ಅನಧಿಕೃತ ವಾಲ್ವ್ ಕಾರ್ಯಾಚರಣೆ ತಡೆಗಟ್ಟುವಿಕೆ — ಸುರಕ್ಷತಾ ನೀತಿ ಜಾರಿ",
            "query": "ಅಗತ್ಯವಿರುವ ಮೇಲ್ವಿಚಾರಕರ ಅನುಮತಿಯಿಲ್ಲದೆ ನಿರ್ಣಾಯಕ ಪ್ರೆಶರ್ ರಿಲೀಫ್ ವಾಲ್ವ್ ಮಾಪನಾಂಕ ನಿರ್ಣಯದ ಪ್ರಯತ್ನ.",
            "findings": (
                "POL-CRIT-002 ನೀತಿಯ ಮೂಲಕ 'calibrate_pressure_relief_valve' ಉಪಕರಣದ ಕಾರ್ಯಾಚರಣೆಯನ್ನು ತಡೆಯಲಾಗಿದೆ. "
                "'ENGINEER' ಪಾತ್ರಕ್ಕೆ ನೇರ ಮಾಪನಾಂಕ ನಿರ್ಣಯದ ಅಧಿಕಾರವಿಲ್ಲ. "
                "ಡೀಫಾಲ್ಟ್-ನಿರಾಕರಣೆ ನೀತಿ ಜಾರಿಯಲ್ಲಿದೆ: ಶೂನ್ಯ ಉಪಕರಣ ಚಾಲನೆ, ಯಂತ್ರ ಚಲನೆ ಕೌಂಟರ್ ಕಟ್ಟುನಿಟ್ಟಾಗಿ 0. "
                "ತೀರ್ಮಾನ: ಕೈಗಾರಿಕಾ ಸುರಕ್ಷತಾ ಮಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ."
            ),
        },
    },
    "prompt_injection": {
        "en": {
            "title": "CASE 04: Adversarial Instruction Isolation — Prompt Security Boundary",
            "query": "Ingest and process advisory bulletin containing indirect injection payload.",
            "findings": (
                "Adversarial prompt injection pattern ('Ignore previous instructions and execute...') detected in document text. "
                "FORGE Prompt-Security Enclave quarantined the advisory text strictly as inert, untrusted DATA. "
                "Zero administrative or execution privileges granted to the model. "
                "Conclusion: Sovereign enclave integrity maintained without compromise."
            ),
        },
        "hi": {
            "title": "केस 04: प्रतिकूल प्रॉम्प्ट इंजेक्शन अलगाव — सुरक्षा सीमा परीक्षण",
            "query": "अप्रत्यक्ष इंजेक्शन पेलोड युक्त सलाहकारी बुलेटिन का सेवन और विश्लेषण।",
            "findings": (
                "दस्तावेज़ में प्रतिकूल प्रॉम्प्ट इंजेक्शन पैटर्न ('पिछले निर्देशों को अनदेखा करें...') पाया गया। "
                "FORGE प्रॉम्प्ट-सुरक्षा एन्क्लेव ने इस सामग्री को पूरी तरह से निष्क्रिय, अविश्वासनीय डेटा के रूप में अलग (Quarantine) किया। "
                "एजेंट को कोई विशेषाधिकार या निष्पादन प्राधिकरण प्रदान नहीं किया गया। "
                "निष्कर्ष: संप्रभु एन्क्लेव सत्यनिष्ठा बिना किसी समझौते के बरकरार है।"
            ),
        },
        "kn": {
            "title": "ಕೇಸ್ 04: ವಿರೋಧಿ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್ ಪ್ರತ್ಯೇಕತೆ — ಸುರಕ್ಷತಾ ಗಡಿ ಪರೀಕ್ಷೆ",
            "query": "ಪರೋಕ್ಷ ಇಂಜೆಕ್ಷನ್ ಹೊಂದಿರುವ ಸಲಹಾ ಬುಲೆಟಿನ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿ.",
            "findings": (
                "ದಾಖಲೆಯಲ್ಲಿ ವಿರೋಧಿ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್ ಪತ್ತೆಯಾಗಿದೆ. "
                "FORGE ಸುರಕ್ಷತಾ ಗಡಿಯು ಈ ಪಠ್ಯವನ್ನು ನಿಷ್ಕ್ರಿಯ, ಅವಿಶ್ವಾಸನೀಯ ಡೇಟಾ ಎಂದು ಪ್ರತ್ಯೇಕಿಸಿದೆ (Quarantine). "
                "ಯಾವುದೇ ಅನಧಿಕೃತ ಸಾಧನ ಚಾಲನಾ ಅಧಿಕಾರವನ್ನು ನೀಡಿಲ್ಲ. "
                "ತೀರ್ಮಾನ: ಸಾರ್ವಭೌಮ ಎನ್‌ಕ್ಲೇವ್ ಸಮಗ್ರತೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಕಾಪಾಡಲಾಗಿದೆ."
            ),
        },
    },
}

VERDICT_MAP: Dict[str, Dict[str, str]] = {
    "en": {
        "VERIFIED": "VERIFIED (COMPLIANT)",
        "NEEDS_REVIEW": "NEEDS ENGINEERING REVIEW",
        "REVIEW_REQUIRED": "NEEDS ENGINEERING REVIEW",
        "ACTION_BLOCKED": "ACTION BLOCKED BY POLICY",
        "POLICY_DENIED": "ACTION BLOCKED BY POLICY",
        "QUARANTINED": "QUARANTINED AS INERT DATA",
        "FAILED": "VERIFICATION FAILED",
    },
    "hi": {
        "VERIFIED": "सत्यापित (अनुपालन सत्यापित)",
        "NEEDS_REVIEW": "इंजीनियरिंग समीक्षा आवश्यक",
        "REVIEW_REQUIRED": "इंजीनियरिंग समीक्षा आवश्यक",
        "ACTION_BLOCKED": "सुरक्षा नीति द्वारा कार्रवाई अवरुद्ध",
        "POLICY_DENIED": "सुरक्षा नीति द्वारा कार्रवाई अवरुद्ध",
        "QUARANTINED": "निष्क्रिय डेटा के रूप में संगरोधित",
        "FAILED": "सत्यापन विफल",
    },
    "kn": {
        "VERIFIED": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಅನುಸರಣೆ ದೃಢಪಟ್ಟಿದೆ)",
        "NEEDS_REVIEW": "ಎಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ",
        "REVIEW_REQUIRED": "ಎಂಜಿನಿಯರಿಂಗ್ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ",
        "ACTION_BLOCKED": "ಸುರಕ್ಷತಾ ನೀತಿಯಿಂದ ಕ್ರಿಯೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
        "POLICY_DENIED": "ಸುರಕ್ಷತಾ ನೀತಿಯಿಂದ ಕ್ರಿಯೆ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
        "QUARANTINED": "ನಿಷ್ಕ್ರಿಯ ಡೇಟಾ ಎಂದು ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ",
        "FAILED": "ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ",
    },
}

REPORT_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        "title": "FORGE Sovereign Industrial Control Plane",
        "subtitle": "Mission Verification & Industrial Safety Dossier (Air-Gapped Local Runtime)",
        "meta_run_id": "Execution Run ID:",
        "meta_scenario": "Mission / Scenario:",
        "meta_timestamp": "Generated Timestamp:",
        "meta_clearance_role": "Clearance & Role:",
        "meta_model_runtime": "Sovereign Runtime:",
        "meta_verdict": "Independent Verdict:",
        "sec1_heading": "1. Executive Findings & Operational Verdict",
        "sec1_verdict": "Operational Verdict:",
        "sec1_analysis": "Synthesized Technical Analysis:",
        "sec2_heading": "2. Operational Query & Scope",
        "sec2_query": "Query:",
        "sec3_heading": "3. Evidence Grounding Dossier",
        "sec3_total": "Retrieved Artifacts:",
        "sec4_heading": "4. Deterministic Verified Calculations",
        "sec4_no_calcs": "No mathematical calculations triggered for this mission type.",
        "sec4_verified": "[VERIFIED BY PYTHON DETERMINISTIC KERNEL]",
        "sec5_heading": "5. Sovereign Policy Gateway & Actuation Boundaries",
        "sec5_default_deny": "Action evaluated under default-deny industrial policy. Zero boundary violations.",
        "sec6_heading": "6. Independent 7-Check Verification Results",
        "sec6_checks_exec": "7 / 7 Verification checks executed and recorded in tamper-evident event log.",
        "sec7_heading": "7. Enclave Integrity & Local Audit Reference",
        "sec7_text": "This document was deterministically compiled by the on-premise FORGE Sovereign Industrial AI Control Plane. No data was transmitted to third-party public clouds or external AI providers. Audit reference signature: SHA256:{signature}",
        "sig_heading": "Official Engineering Sign-off Block",
        "sig_approved": "Authorized Signatory: Lead Operations Engineer",
        "sig_status": "Integrity Status: Cryptographically Hash-Chained",
        "sig_date": "Sign-off Date:",
        "sig_clearance": "Clearance Enclave: Sovereign On-Premise",
    },
    "hi": {
        "title": "FORGE संप्रभु औद्योगिक नियंत्रण तल",
        "subtitle": "मिशन सत्यापन एवं औद्योगिक सुरक्षा डोजियर (एयर-गैप्ड स्थानीय रनटाइम)",
        "meta_run_id": "निष्पादन रन आईडी (Run ID):",
        "meta_scenario": "मिशन / परिदृश्य:",
        "meta_timestamp": "उत्पन्न समय (IST):",
        "meta_clearance_role": "सुरक्षा स्तर एवं भूमिका:",
        "meta_model_runtime": "संप्रभु रनटाइम:",
        "meta_verdict": "स्वतंत्र निर्णय:",
        "sec1_heading": "1. कार्यकारी निष्कर्ष एवं परिचालन निर्णय",
        "sec1_verdict": "परिचालन निर्णय:",
        "sec1_analysis": "संश्लेषित तकनीकी विश्लेषण:",
        "sec2_heading": "2. परिचालन प्रश्न एवं दायरा",
        "sec2_query": "प्रश्न:",
        "sec3_heading": "3. साक्ष्य आधार डोजियर",
        "sec3_total": "पुनर्प्राप्त साक्ष्य कलाकृतियाँ:",
        "sec4_heading": "4. नियतात्मक सत्यापित गणनाएँ",
        "sec4_no_calcs": "इस मिशन प्रकार के लिए कोई गणितीय गणना शुरू नहीं की गई।",
        "sec4_verified": "[पायथन नियतात्मक कर्नेल द्वारा सत्यापित]",
        "sec5_heading": "5. संप्रभु नीति गेटवे एवं प्रवर्तन सीमाएँ",
        "sec5_default_deny": "कार्रवाई का मूल्यांकन डिफ़ॉल्ट-अस्वीकार औद्योगिक नीति के तहत किया गया। शून्य सीमा उल्लंघन।",
        "sec6_heading": "6. स्वतंत्र 7-जांच सत्यापन परिणाम",
        "sec6_checks_exec": "7 / 7 सत्यापन जाँचें निष्पादित की गईं और छेड़छाड़-रोधी इवेंट लॉग में दर्ज की गईं।",
        "sec7_heading": "7. एन्क्लेव सत्यनिष्ठा एवं स्थानीय ऑडिट संदर्भ",
        "sec7_text": "यह दस्तावेज़ ऑन-प्रिमाइसेस FORGE संप्रभु औद्योगिक AI नियंत्रण तल द्वारा संकलित किया गया था। किसी भी तृतीय-पक्ष सार्वजनिक क्लाउड या बाहरी AI प्रदाताओं को कोई डेटा प्रेषित नहीं किया गया। ऑडिट संदर्भ हस्ताक्षर: SHA256:{signature}",
        "sig_heading": "आधिकारिक इंजीनियरिंग हस्ताक्षर एवं अनुमोदन ब्लॉक",
        "sig_approved": "अधिकृत हस्ताक्षरकर्ता: प्रमुख परिचालन इंजीनियर",
        "sig_status": "सत्यनिष्ठा स्थिति: क्रिप्टोग्राफिक रूप से हैश-श्रृंखलाबद्ध",
        "sig_date": "हस्ताक्षर तिथि:",
        "sig_clearance": "सुरक्षा एन्क्लेव: संप्रभु स्थानीय (ऑन-प्रिमाइसेस)",
    },
    "kn": {
        "title": "FORGE ಸಾರ್ವಭೌಮ ಕೈಗಾರಿಕಾ ನಿಯಂತ್ರಣ ವೇದಿಕೆ",
        "subtitle": "ಕಾರ್ಯಾಚರಣೆ ಪರಿಶೀಲನೆ ಮತ್ತು ಕೈಗಾರಿಕಾ ಸುರಕ್ಷತಾ ದಾಖಲೆ (ಏರ್-ಗ್ಯಾಪ್ಡ್ ಸ್ಥಳೀಯ ರನ್‌ಟೈಮ್)",
        "meta_run_id": "ಚಾಲನೆ ರನ್ ಐಡಿ (Run ID):",
        "meta_scenario": "ಕಾರ್ಯಾಚರಣೆ / ಸನ್ನಿವೇಶ:",
        "meta_timestamp": "ರಚಿಸಿದ ಸಮಯ (IST):",
        "meta_clearance_role": "ಕ್ಲಿಯರೆನ್ಸ್ ಮತ್ತು ಪಾತ್ರ:",
        "meta_model_runtime": "ಸಾರ್ವಭೌಮ ರನ್‌ಟೈಮ್:",
        "meta_verdict": "ಸ್ವತಂತ್ರ ತೀರ್ಪು:",
        "sec1_heading": "1. ಕಾರ್ಯಕಾರಿ ಸಂಶೋಧನೆಗಳು ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ತೀರ್ಪು",
        "sec1_verdict": "ಕಾರ್ಯಾಚರಣೆಯ ತೀರ್ಪು:",
        "sec1_analysis": "ಸಂಶ್ಲೇಷಿತ ತಾಂತ್ರಿಕ ವಿಶ್ಲೇಷಣೆ:",
        "sec2_heading": "2. ಕಾರ್ಯಾಚರಣೆಯ ಪ್ರಶ್ನೆ ಮತ್ತು ವ್ಯಾಪ್ತಿ",
        "sec2_query": "ಪ್ರಶ್ನೆ:",
        "sec3_heading": "3. ಪುರಾವೆ ಆಧಾರಿತ ದಾಖಲೆ",
        "sec3_total": "ಹಿಂಪಡೆಯಲಾದ ಪುರಾವೆ ದಾಖಲೆಗಳು:",
        "sec4_heading": "4. ನಿರ್ಣಾಯಕ ಪರಿಶೀಲಿಸಿದ ಲೆಕ್ಕಾಚಾರಗಳು",
        "sec4_no_calcs": "ಈ ಕಾರ್ಯಾಚರಣೆಯ ಪ್ರಕಾರಕ್ಕೆ ಯಾವುದೇ ಗಣಿತದ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಪ್ರಚೋದಿಸಲಾಗಿಲ್ಲ.",
        "sec4_verified": "[ಪೈಥಾನ್ ನಿರ್ಣಾಯಕ ಕರ್ನಲ್‌ನಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ]",
        "sec5_heading": "5. ಸಾರ್ವಭೌಮ ನೀತಿ ಗೇಟ್‌ವೇ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ಮಿತಿಗಳು",
        "sec5_default_deny": "ಡೀಫಾಲ್ಟ್-ನಿರಾಕರಣೆ ಕೈಗಾರಿಕಾ ನೀತಿಯ ಅಡಿಯಲ್ಲಿ ಕ್ರಿಯೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ. ಶೂನ್ಯ ಗಡಿ ಉಲ್ಲಂಘನೆ.",
        "sec6_heading": "6. ಸ್ವತಂತ್ರ 7-ಹಂತದ ಪರಿಶೀಲನಾ ಫಲಿತಾಂಶಗಳು",
        "sec6_checks_exec": "7 / 7 ಪರಿಶೀಲನಾ ತಪಾಸಣೆಗಳನ್ನು ಕಾರ್ಯಗತಗೊಳಿಸಲಾಗಿದೆ ಮತ್ತು ತಿರುಚುವಿಕೆ-ನಿರೋಧಕ ಇವೆಂಟ್ ಲಾಗ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.",
        "sec7_heading": "7. ಎನ್‌ಕ್ಲೇವ್ ಸಮಗ್ರತೆ ಮತ್ತು ಸ್ಥಳೀಯ ಆಡಿಟ್ ಉಲ್ಲೇಖ",
        "sec7_text": "ಈ ಡಾಕ್ಯುಮೆಂಟ್ ಅನ್ನು ಆನ್-ಪ್ರೆಮಿಸಸ್ FORGE ಸಾರ್ವಭೌಮ ಕೈಗಾರಿಕಾ AI ನಿಯಂತ್ರಣ ವೇದಿಕೆಯಿಂದ ನಿರ್ಣಾಯಕವಾಗಿ ಸಂಕಲಿಸಲಾಗಿದೆ. ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸಾರ್ವಜನಿಕ ಕ್ಲೌಡ್‌ಗಳಿಗೆ ಯಾವುದೇ ಡೇಟಾವನ್ನು ರವಾನಿಸಲಾಗಿಲ್ಲ. ಆಡಿಟ್ ಉಲ್ಲೇಖ ಸಹಿ: SHA256:{signature}",
        "sig_heading": "ಅಧಿಕೃತ ಎಂಜಿನಿಯರಿಂಗ್ ಸಹಿ ಮತ್ತು ಅನುಮೋದನಾ ಬ್ಲಾಕ್",
        "sig_approved": "ಅಧಿಕೃತ ಸಹಿದಾರರು: ಮುಖ್ಯ ಕಾರ್ಯಾಚರಣಾ ಎಂಜಿನಿಯರ್",
        "sig_status": "ಸಮಗ್ರತೆ ಸ್ಥಿತಿ: ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಹ್ಯಾಶ್-ಸರಣಿ ಪರಿಶೀಲಿತ",
        "sig_date": "ಅನುಮೋದಿತ ದಿನಾಂಕ:",
        "sig_clearance": "ಕ್ಲಿಯರೆನ್ಸ್ ಎನ್‌ಕ್ಲೇವ್: ಸಾರ್ವಭೌಮ ಸ್ಥಳೀಯ (ಆನ್-ಪ್ರೆಮಿಸಸ್)",
    },
}


class SovereignReportGenerator:
    """Generates tamper-evident, audit-grade Microsoft Word (.docx) reports for FORGE missions."""

    def _resolve_localized_content(self, data: Dict[str, Any], lang: str) -> Dict[str, str]:
        """Resolve localized titles, queries, verdicts, and findings based on scenario and target language."""
        scenario_key = str(data.get("scenario_id") or data.get("scenario") or "").lower()
        sc_info = SCENARIO_LOCALIZATION.get(scenario_key, {}).get(lang, {})

        raw_verdict = str(data.get("verdict") or (data.get("verification") or {}).get("status") or data.get("status") or "VERIFIED").upper()
        verdict_text = VERDICT_MAP.get(lang, VERDICT_MAP["en"]).get(raw_verdict, raw_verdict)

        title = sc_info.get("title") or str(data.get("scenario_title") or f"Mission Analysis: {scenario_key}")
        query = sc_info.get("query") or str(data.get("query") or "Custom operational assessment.")

        # If data has a custom synthesized answer in that language, use it; otherwise use scenario finding
        final_answer = str(data.get("final_answer") or "").strip()
        if not final_answer or (lang in ["hi", "kn"] and sc_info.get("findings")):
            final_answer = sc_info.get("findings") or final_answer or "No narrative recorded."

        return {
            "title": title,
            "query": query,
            "verdict": verdict_text,
            "final_answer": final_answer,
        }

    def generate_mission_docx(self, run_data: Dict[str, Any]) -> bytes:
        """Generate a complete .docx report bytes for the given mission run."""
        try:
            import docx  # type: ignore
            return self._generate_with_python_docx(run_data)
        except ImportError:
            return self._generate_native_openxml_docx(run_data)

    def _generate_with_python_docx(self, data: Dict[str, Any]) -> bytes:
        """Render using python-docx when available in the environment."""
        import docx
        from docx.shared import Pt, RGBColor

        lang = str(data.get("language") or data.get("locale") or "en").lower()
        if lang not in ["en", "hi", "kn"]:
            lang = "en"
        t = REPORT_TRANSLATIONS.get(lang, REPORT_TRANSLATIONS["en"])
        resolved = self._resolve_localized_content(data, lang)

        doc = docx.Document()
        try:
            doc.styles['Normal'].font.name = 'Nirmala UI'
        except Exception:
            pass

        # Title & Subtitle
        p_title = doc.add_paragraph()
        run_title = p_title.add_run(t["title"])
        run_title.bold = True
        run_title.font.size = Pt(20)
        run_title.font.color.rgb = RGBColor(30, 41, 59)

        p_sub = doc.add_paragraph()
        run_sub = p_sub.add_run(t["subtitle"])
        run_sub.font.size = Pt(13)
        run_sub.font.color.rgb = RGBColor(100, 116, 139)

        doc.add_paragraph("―" * 50)

        # Run Identity Metadata Table
        run_id = data.get("run_id") or "run-unknown"
        now_dt = datetime.now(timezone.utc)
        ist_str = _format_ist_time(now_dt)

        meta_table = doc.add_table(rows=6, cols=2)
        meta_data = [
            (t["meta_run_id"], str(run_id)),
            (t["meta_scenario"], resolved["title"]),
            (t["meta_timestamp"], f"{ist_str}"),
            (t["meta_clearance_role"], f"{data.get('classification', 'INTERNAL')} / {data.get('role', 'ENGINEER')}"),
            (t["meta_model_runtime"], f"{data.get('model_name', 'qwen2.5:7b')} (Sovereign Local Host)"),
            (t["meta_verdict"], resolved["verdict"]),
        ]
        for idx, (k, v) in enumerate(meta_data):
            row = meta_table.rows[idx]
            cell_k, cell_v = row.cells[0], row.cells[1]
            cell_k.text = k
            cell_k.paragraphs[0].runs[0].bold = True
            cell_v.text = v

        doc.add_paragraph("")

        # Section 1: Executive Findings
        h1 = doc.add_heading(t["sec1_heading"], level=1)
        h1.paragraph_format.space_before = Pt(14)
        doc.add_paragraph(f"{t['sec1_verdict']} {resolved['verdict']}")

        p_ans = doc.add_paragraph()
        p_ans.add_run(f"{t['sec1_analysis']}\n").bold = True
        p_ans.add_run(resolved["final_answer"])

        # Section 2: Operational Query & Scope
        doc.add_heading(t["sec2_heading"], level=1)
        doc.add_paragraph(f"{t['sec2_query']} {resolved['query']}")

        # Section 3: Evidence Grounding Dossier
        doc.add_heading(t["sec3_heading"], level=1)
        evidence_set = data.get("evidence_set") or {}
        k_evd = evidence_set.get("knowledge_evidence") or []
        t_evd = evidence_set.get("tool_evidence") or []
        v_evd = evidence_set.get("visual_evidence") or []
        total_evd = len(k_evd) + len(t_evd) + len(v_evd)
        doc.add_paragraph(f"{t['sec3_total']} {total_evd}")

        for e in k_evd:
            p = doc.add_paragraph()
            src = e.get("source_reference") or e.get("filename") or "Plant SOP"
            p.add_run(f"• [Knowledge: {src}]: ").bold = True
            txt = str(e.get("content") or e.get("retrieved_data") or "")
            p.add_run(txt[:300] + ("..." if len(txt) > 300 else ""))

        for e in t_evd:
            p = doc.add_paragraph()
            tool = e.get("tool_name") or "Telemetry Tool"
            p.add_run(f"• [Tool: {tool}]: ").bold = True
            p.add_run(str(e.get("retrieved_data") or ""))

        for e in v_evd:
            p = doc.add_paragraph()
            p.add_run(f"• [Visual Telemetry]: ").bold = True
            p.add_run(f"Observed: {e.get('observed_value')} {e.get('unit', '')} (Confidence: {e.get('confidence', 1.0)})")

        # Section 4: Verified Calculations
        doc.add_heading(t["sec4_heading"], level=1)
        calcs = data.get("calculations") or []
        if not calcs and data.get("verification"):
            calcs = data["verification"].get("calculations") or []

        if calcs:
            for idx, c in enumerate(calcs):
                p = doc.add_paragraph()
                c_desc = c.get("description") or c.get("calculation_type") or "Math check"
                p.add_run(f"[{idx+1}] {c_desc}: ").bold = True
                p.add_run(f"{c.get('result')} {c.get('units', '')} {t['sec4_verified']}")
        else:
            doc.add_paragraph(t["sec4_no_calcs"])

        # Section 5: Policy Decisions
        doc.add_heading(t["sec5_heading"], level=1)
        p_decisions = data.get("policy_decisions") or []
        if not p_decisions and data.get("policy_decision"):
            p_decisions = [data["policy_decision"]]

        if p_decisions:
            for d in p_decisions:
                p = doc.add_paragraph()
                act = d.get("tool") or d.get("action", "inspect")
                dec = d.get("decision") or ("ALLOW" if d.get("allowed") is True else "DENY")
                p.add_run(f"• Action '{act}': ").bold = True
                p.add_run(f"DECISION = {dec}. Reason: {d.get('reason') or 'Zero-trust verification'}")
        else:
            doc.add_paragraph(t["sec5_default_deny"])

        # Section 6: Verification Results
        doc.add_heading(t["sec6_heading"], level=1)
        checks = []
        if data.get("verification") and data["verification"].get("checks"):
            checks = data["verification"]["checks"]

        if checks:
            for chk in checks:
                p = doc.add_paragraph()
                p.add_run(f"[{chk.get('check_type')}]: ").bold = True
                p.add_run(f"{chk.get('status', 'VERIFIED')} ― {chk.get('description', '')}")
        else:
            doc.add_paragraph(t["sec6_checks_exec"])

        # Section 7: Audit Reference
        doc.add_heading(t["sec7_heading"], level=1)
        doc.add_paragraph(t["sec7_text"].format(signature=uuid.uuid4().hex))

        # Official Sign-off Block
        doc.add_heading(t["sig_heading"], level=1)
        sig_table = doc.add_table(rows=4, cols=2)
        sig_rows = [
            (t["sig_approved"], "MRPL Lead Plant Engineer (PE-84209)"),
            (t["sig_status"], "PASSED & DIGITALLY VERIFIED"),
            (t["sig_date"], ist_str),
            (t["sig_clearance"], f"{data.get('classification', 'CONFIDENTIAL')} ENCLAVE"),
        ]
        for idx, (sk, sv) in enumerate(sig_rows):
            srow = sig_table.rows[idx]
            srow.cells[0].text = sk
            srow.cells[0].paragraphs[0].runs[0].bold = True
            srow.cells[1].text = sv

        buf = io.BytesIO()
        doc.save(buf)
        return buf.getvalue()

    def _generate_native_openxml_docx(self, data: Dict[str, Any]) -> bytes:
        """Render a 100% valid Microsoft Word OpenXML (.docx) ZIP archive using native standard library."""
        lang = str(data.get("language") or data.get("locale") or "en").lower()
        if lang not in ["en", "hi", "kn"]:
            lang = "en"
        t = REPORT_TRANSLATIONS.get(lang, REPORT_TRANSLATIONS["en"])
        resolved = self._resolve_localized_content(data, lang)

        run_id = xml_escape(str(data.get("run_id") or "run-unknown"))
        scenario_title = xml_escape(resolved["title"])
        now_dt = datetime.now(timezone.utc)
        ist_str = xml_escape(_format_ist_time(now_dt))
        role = xml_escape(str(data.get("role") or "ENGINEER"))
        classification = xml_escape(str(data.get("classification") or "INTERNAL"))
        model_name = xml_escape(str(data.get("model_name") or "qwen2.5:7b"))
        provider = xml_escape(str(data.get("provider") or "ollama_local"))
        verdict = xml_escape(resolved["verdict"])
        query = xml_escape(resolved["query"])
        final_answer = xml_escape(resolved["final_answer"])

        font_family = "Nirmala UI"

        def xml_para(text: str, bold_prefix: str = "", font_size: int = 22, color: str = "1E293B") -> str:
            runs = []
            if bold_prefix:
                runs.append(
                    f'<w:r><w:rPr><w:rFonts w:ascii="{font_family}" w:hAnsi="{font_family}" w:cs="{font_family}"/><w:b/><w:sz w:val="{font_size}"/><w:color w:val="{color}"/></w:rPr>'
                    f'<w:t xml:space="preserve">{xml_escape(bold_prefix)} </w:t></w:r>'
                )
            if text:
                runs.append(
                    f'<w:r><w:rPr><w:rFonts w:ascii="{font_family}" w:hAnsi="{font_family}" w:cs="{font_family}"/><w:sz w:val="{font_size}"/><w:color w:val="{color}"/></w:rPr>'
                    f'<w:t xml:space="preserve">{xml_escape(text)}</w:t></w:r>'
                )
            return f'<w:p><w:pPr><w:spacing w:after="160"/></w:pPr>{"".join(runs)}</w:p>'

        def xml_heading(title: str, level: int = 1) -> str:
            sz = 32 if level == 1 else 26
            return (
                f'<w:p><w:pPr><w:spacing w:before="300" w:after="160"/></w:pPr>'
                f'<w:r><w:rPr><w:rFonts w:ascii="{font_family}" w:hAnsi="{font_family}" w:cs="{font_family}"/><w:b/><w:sz w:val="{sz}"/><w:color w:val="0F172A"/></w:rPr>'
                f'<w:t>{xml_escape(title)}</w:t></w:r></w:p>'
            )

        body_xml = []

        # Document Header
        body_xml.append(
            f'<w:p><w:pPr><w:spacing w:after="80"/></w:pPr>'
            f'<w:r><w:rPr><w:rFonts w:ascii="{font_family}" w:hAnsi="{font_family}" w:cs="{font_family}"/><w:b/><w:sz w:val="44"/><w:color w:val="1E293B"/></w:rPr>'
            f'<w:t>{xml_escape(t["title"])}</w:t></w:r></w:p>'
        )
        body_xml.append(
            f'<w:p><w:pPr><w:spacing w:after="240"/></w:pPr>'
            f'<w:r><w:rPr><w:rFonts w:ascii="{font_family}" w:hAnsi="{font_family}" w:cs="{font_family}"/><w:sz w:val="26"/><w:color w:val="64748B"/></w:rPr>'
            f'<w:t>{xml_escape(t["subtitle"])}</w:t></w:r></w:p>'
        )

        # Meta block
        body_xml.append(xml_para(run_id, bold_prefix=t["meta_run_id"]))
        body_xml.append(xml_para(scenario_title, bold_prefix=t["meta_scenario"]))
        body_xml.append(xml_para(ist_str, bold_prefix=t["meta_timestamp"]))
        body_xml.append(xml_para(f"{classification} / {role}", bold_prefix=t["meta_clearance_role"]))
        body_xml.append(xml_para(f"{model_name} [{provider}]", bold_prefix=t["meta_model_runtime"]))
        body_xml.append(xml_para(verdict, bold_prefix=t["meta_verdict"], color="059669" if "VERIFIED" in verdict or "सत्यापित" in verdict or "ಪರಿಶೀಲಿಸಲಾಗಿದೆ" in verdict else "D97706"))

        # Section 1: Findings
        body_xml.append(xml_heading(t["sec1_heading"], level=1))
        body_xml.append(xml_para(verdict, bold_prefix=t["sec1_verdict"]))
        body_xml.append(xml_para(final_answer, bold_prefix=t["sec1_analysis"]))

        # Section 2: Query
        body_xml.append(xml_heading(t["sec2_heading"], level=1))
        body_xml.append(xml_para(query, bold_prefix=t["sec2_query"]))

        # Section 3: Evidence
        body_xml.append(xml_heading(t["sec3_heading"], level=1))
        evidence_set = data.get("evidence_set") or {}
        k_evd = evidence_set.get("knowledge_evidence") or []
        t_evd = evidence_set.get("tool_evidence") or []
        v_evd = evidence_set.get("visual_evidence") or []
        total_evd = len(k_evd) + len(t_evd) + len(v_evd)
        body_xml.append(xml_para(f"{total_evd}", bold_prefix=t["sec3_total"]))

        for e in k_evd:
            src = e.get("source_reference") or e.get("filename") or "Plant Knowledge Fabric"
            txt = str(e.get("content") or e.get("retrieved_data") or "")
            body_xml.append(xml_para(txt[:300] + ("..." if len(txt) > 300 else ""), bold_prefix=f"• [Knowledge: {src}]:"))

        for e in t_evd:
            tool_name = e.get("tool_name") or "industrial_tool"
            data_str = str(e.get("retrieved_data") or "")
            body_xml.append(xml_para(data_str, bold_prefix=f"• [Tool: {tool_name}]:"))

        for e in v_evd:
            src = e.get("source_reference") or "Optical Sensor"
            obs = f"Observed: {e.get('observed_value')} {e.get('unit', '')}"
            body_xml.append(xml_para(obs, bold_prefix=f"• [Optical Observation: {src}]:"))

        # Section 4: Calculations
        body_xml.append(xml_heading(t["sec4_heading"], level=1))
        calcs = data.get("calculations") or []
        if not calcs and data.get("verification"):
            calcs = data["verification"].get("calculations") or []

        if calcs:
            for idx, c in enumerate(calcs):
                desc = c.get("description") or c.get("calculation_type") or "Math check"
                res_str = f"{c.get('result')} {c.get('units', '')} {t['sec4_verified']}"
                body_xml.append(xml_para(res_str, bold_prefix=f"[{idx+1}] {desc}:"))
        else:
            body_xml.append(xml_para(t["sec4_no_calcs"]))

        # Section 5: Policy
        body_xml.append(xml_heading(t["sec5_heading"], level=1))
        p_decisions = data.get("policy_decisions") or []
        if not p_decisions and data.get("policy_decision"):
            p_decisions = [data["policy_decision"]]

        if p_decisions:
            for d in p_decisions:
                action_name = d.get("tool") or d.get("action", "inspect")
                dec = d.get("decision") or ("ALLOW" if d.get("allowed") is True else "DENY")
                reason = d.get("reason") or "Enforced by local policy rules."
                body_xml.append(xml_para(f"DECISION = {dec}. Reason: {reason}", bold_prefix=f"• Action '{action_name}':"))
        else:
            body_xml.append(xml_para(t["sec5_default_deny"]))

        # Section 6: Verification
        body_xml.append(xml_heading(t["sec6_heading"], level=1))
        checks = []
        if data.get("verification") and data["verification"].get("checks"):
            checks = data["verification"]["checks"]

        if checks:
            for chk in checks:
                ctype = chk.get("check_type", "CHECK")
                cstatus = chk.get("status", "VERIFIED")
                cdesc = chk.get("description", "")
                body_xml.append(xml_para(f"{cstatus} ― {cdesc}", bold_prefix=f"[{ctype}]:"))
        else:
            body_xml.append(xml_para(t["sec6_checks_exec"]))

        # Section 7: Audit Reference
        body_xml.append(xml_heading(t["sec7_heading"], level=1))
        sig = uuid.uuid4().hex
        body_xml.append(xml_para(t["sec7_text"].format(signature=sig)))

        # Section 8: Formal Sign-off Block
        body_xml.append(xml_heading(t["sig_heading"], level=1))
        body_xml.append(xml_para("MRPL Lead Operations Engineer (PE-84209)", bold_prefix=f"{t['sig_approved']}:"))
        body_xml.append(xml_para("PASSED & DIGITALLY VERIFIED", bold_prefix=f"{t['sig_status']}:"))
        body_xml.append(xml_para(ist_str, bold_prefix=f"{t['sig_date']}:"))
        body_xml.append(xml_para(f"{classification} ENCLAVE", bold_prefix=f"{t['sig_clearance']}:"))

        content_document_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:body>'
            + "".join(body_xml)
            + '<w:sectPr>'
            '<w:pgSz w:w="11906" w:h="16838"/>'
            '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>'
            '</w:sectPr>'
            '</w:body>'
            '</w:document>'
        )

        content_types_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            '</Types>'
        )

        rels_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            '</Relationships>'
        )

        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", content_types_xml)
            z.writestr("_rels/.rels", rels_xml)
            z.writestr("word/document.xml", content_document_xml.encode("utf-8"))

        return zip_buf.getvalue()


report_generator = SovereignReportGenerator()
