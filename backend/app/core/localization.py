"""FORGE Sovereign Industrial AI Control Plane - Centralized Backend Localization Module.

Provides sovereign offline translations for verification checks, evidence metadata,
calculation descriptions, policy enforcement messages, and report artifacts in
English ('en'), Hindi ('hi'), and Kannada ('kn').
"""

from typing import Any, Dict, Optional


# ---------------------------------------------------------------------------
# 1. Verification Check Names & Plain Titles
# ---------------------------------------------------------------------------
CHECK_NAME_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "PROVENANCE": {
        "en": "Sources traceable",
        "hi": "स्रोत पता लगाने योग्य (Sources traceable)",
        "kn": "ಮೂಲಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಬಹುದಾಗಿದೆ (Sources traceable)",
    },
    "COMPLETENESS": {
        "en": "Evidence complete",
        "hi": "साक्ष्य पूर्ण (Evidence complete)",
        "kn": "ಪುರಾವೆ ಪೂರ್ಣಗೊಂಡಿದೆ (Evidence complete)",
    },
    "POLICY_COMPLIANCE": {
        "en": "Within policy rules",
        "hi": "नीति नियमों के तहत (Policy compliance)",
        "kn": "ನೀತಿ ನಿಯಮಗಳ ಒಳಗೆ (Policy compliance)",
    },
    "POLICY": {
        "en": "Within policy rules",
        "hi": "नीति नियमों के तहत (Policy compliance)",
        "kn": "ನೀತಿ ನಿಯಮಗಳ ಒಳಗೆ (Policy compliance)",
    },
    "CLASSIFICATION": {
        "en": "Within your access",
        "hi": "आपकी पहुंच के भीतर (Within your access)",
        "kn": "ನಿಮ್ಮ ಪ್ರವೇಶದ ಒಳಗೆ (Within your access)",
    },
    "PARAMETER_CONSISTENCY": {
        "en": "Values agree",
        "hi": "पैरामीटर मान सहमत हैं (Values agree)",
        "kn": "ಮೌಲ್ಯಗಳು ಒಪ್ಪುತ್ತವೆ (Values agree)",
    },
    "CALCULATION_VALIDATION": {
        "en": "Math independently checked",
        "hi": "गणित स्वतंत्र रूप से सत्यापित (Math checked)",
        "kn": "ಗಣಿತವನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (Math checked)",
    },
    "CALCULATION": {
        "en": "Math independently checked",
        "hi": "गणित स्वतंत्र रूप से सत्यापित (Math checked)",
        "kn": "ಗಣಿತವನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ (Math checked)",
    },
    "GROUNDING_SUPPORT": {
        "en": "Answer supported by evidence",
        "hi": "उत्तर साक्ष्य समर्थित (Answer grounded)",
        "kn": "ಉತ್ತರವು ಪುರಾವೆಗಳಿಂದ ಬೆಂಬಲಿತವಾಗಿದೆ (Answer grounded)",
    },
    "OPERATIONAL_AUTHORITY": {
        "en": "Observer boundary confirmed",
        "hi": "पर्यवेक्षक सीमा की पुष्टि (Observer boundary)",
        "kn": "ವೀಕ್ಷಕ ಗಡಿಯನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ (Observer boundary)",
    },
}

# ---------------------------------------------------------------------------
# 2. Verification Check Descriptions (Deterministic Check Details)
# ---------------------------------------------------------------------------
CHECK_DESCRIPTION_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "All evidence items possess verifiable source references, identifiers, and classifications.": {
        "en": "All evidence items possess verifiable source references, identifiers, and classifications.",
        "hi": "सभी साक्ष्य मदों में सत्यापन योग्य स्रोत संदर्भ, पहचानकर्ता और सुरक्षा वर्गीकरण मौजूद हैं।",
        "kn": "ಎಲ್ಲಾ ಪುರಾವೆ ಅಂಶಗಳು ಪರಿಶೀಲಿಸಬಹುದಾದ ಮೂಲ ಉಲ್ಲೇಖಗಳು, ಗುರುತಿಸುವಿಕೆಗಳು ಮತ್ತು ವರ್ಗೀಕರಣಗಳನ್ನು ಹೊಂದಿವೆ.",
    },
    "All requested knowledge queries and tool operations have corresponding evidence or policy records.": {
        "en": "All requested knowledge queries and tool operations have corresponding evidence or policy records.",
        "hi": "सभी अनुरोधित ज्ञान प्रश्नों और उपकरण संचालन के लिए संगत साक्ष्य या नीति रिकॉर्ड उपलब्ध हैं।",
        "kn": "ವಿನಂತಿಸಿದ ಎಲ್ಲಾ ಜ್ಞಾನ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉಪಕರಣ ಕಾರ್ಯಾಚರಣೆಗಳು ಅನುಗುಣವಾದ ಪುರಾವೆ ಅಥವಾ ನೀತಿ ದಾಖಲೆಗಳನ್ನು ಹೊಂದಿವೆ.",
    },
    "Policy trace verified: All tool actions were authorized; denied tools were strictly unexecuted.": {
        "en": "Policy trace verified: All tool actions were authorized; denied tools were strictly unexecuted.",
        "hi": "नीति अनुरेखण सत्यापित: सभी उपकरण क्रियाएं अधिकृत थीं; अस्वीकृत उपकरण सख्त रूप से निष्पादित नहीं किए गए।",
        "kn": "ನೀತಿ ಜಾಡನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ಎಲ್ಲಾ ಉಪಕರಣ ಕ್ರಿಯೆಗಳು ಅಧಿಕೃತವಾಗಿದ್ದವು; ನಿರಾಕರಿಸಿದ ಉಪಕರಣಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಕಾರ್ಯಗತಗೊಳಿಸಲಾಗಿಲ್ಲ.",
    },
    "Data classifications verified: All evidence items remain within requester clearance ('CONFIDENTIAL').": {
        "en": "Data classifications verified: All evidence items remain within requester clearance ('CONFIDENTIAL').",
        "hi": "डेटा वर्गीकरण सत्यापित: सभी साक्ष्य मदें अनुरोधकर्ता की सुरक्षा मंजूरी ('CONFIDENTIAL') के भीतर हैं।",
        "kn": "ಡೇಟಾ ವರ್ಗೀಕರಣಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ಎಲ್ಲಾ ಪುರಾವೆ ಅಂಶಗಳು ವಿನಂತಿದಾರರ ಅನುಮತಿ ಮಿತಿಯೊಳಗೆ ('CONFIDENTIAL') ಇವೆ.",
    },
    "Parameter consistency confirmed: No conflicting or diverging values detected.": {
        "en": "Parameter consistency confirmed: No conflicting or diverging values detected.",
        "hi": "पैरामीटर संगति की पुष्टि: कोई परस्पर विरोधी या भिन्न मान नहीं पाए गए।",
        "kn": "ನಿಯತಾಂಕ ಸ್ಥಿರತೆ ದೃಢಪಟ್ಟಿದೆ: ಯಾವುದೇ ಸಂಘರ್ಷದ ಅಥವಾ ಭಿನ್ನ ಮೌಲ್ಯಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ.",
    },
    "Supporting evidence and calculations are available for synthesis grounding.": {
        "en": "Supporting evidence and calculations are available for synthesis grounding.",
        "hi": "निष्कर्ष और तकनीकी संश्लेषण को प्रमाणित करने के लिए समर्थक साक्ष्य और गणनाएं उपलब्ध हैं।",
        "kn": "ಸಂಶ್ಲೇಷಣಾ ಆಧಾರಕ್ಕಾಗಿ ಪೂರಕ ಪುರಾವೆಗಳು ಮತ್ತು ಲೆಕ್ಕಾಚಾರಗಳು ಲಭ್ಯವಿವೆ.",
    },
    "Direct conceptual response does not require numerical evidence grounding.": {
        "en": "Direct conceptual response does not require numerical evidence grounding.",
        "hi": "प्रत्यक्ष वैचारिक उत्तर के लिए संख्यात्मक साक्ष्य आधार की आवश्यकता नहीं है।",
        "kn": "ನೇರ ಪರಿಕಲ್ಪನಾ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಸಂಖ್ಯಾತ್ಮಕ ಪುರಾವೆ ಆಧಾರದ ಅಗತ್ಯವಿಲ್ಲ.",
    },
    "No industrial calculations requested or performed.": {
        "en": "No industrial calculations requested or performed.",
        "hi": "कोई औद्योगिक गणना अनुरोधित या निष्पादित नहीं की गई।",
        "kn": "ಯಾವುದೇ ಕೈಗಾರಿಕಾ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ವಿನಂತಿಸಲಾಗಿಲ್ಲ ಅಥವಾ ನಿರ್ವಹಿಸಲಾಗಿಲ್ಲ.",
    },
}

# ---------------------------------------------------------------------------
# 3. Calculation Descriptions
# ---------------------------------------------------------------------------
def localize_calculation_description(
    calc_type: str,
    inputs: Dict[str, Any],
    result: Any,
    units: str,
    locale: str = "en",
) -> str:
    loc = (locale or "en").lower()
    if calc_type == "pressure_variance":
        obs = inputs.get("observed_pressure_bar", 0)
        norm = inputs.get("normal_pressure_bar", 0)
        if loc == "kn":
            return f"ಒತ್ತಡದ ವ್ಯತ್ಯಾಸ: ಗಮನಿಸಿದ ಮೌಲ್ಯ ({obs} {units}) - ಸಾಮಾನ್ಯ ಮೌಲ್ಯ ({norm} {units}) = {result} {units}"
        if loc == "hi":
            return f"दबाव विचरण: प्रेक्षित मान ({obs} {units}) - सामान्य मान ({norm} {units}) = {result} {units}"
        return f"Pressure variance: observed ({obs} {units}) - normal ({norm} {units}) = {result} {units}"

    elif calc_type == "pressure_margin":
        trip = inputs.get("trip_pressure_bar", 0)
        obs = inputs.get("observed_pressure_bar", 0)
        if loc == "kn":
            return f"ತುರ್ತು ಟ್ರಿಪ್‌ಗೆ ಸುರಕ್ಷತಾ ಅಂತರ: ಟ್ರಿಪ್ ಮಿತಿ ({trip} {units}) - ಗಮನಿಸಿದ ಮೌಲ್ಯ ({obs} {units}) = {result} {units}"
        if loc == "hi":
            return f"आपातकालीन ट्रिप हेतु सुरक्षा मार्जिन: ट्रिप सीमा ({trip} {units}) - प्रेक्षित मान ({obs} {units}) = {result} {units}"
        return f"Pressure margin to trip: trip threshold ({trip} {units}) - observed ({obs} {units}) = {result} {units}"

    elif calc_type == "thickness_loss":
        init = inputs.get("initial_thickness_mm", 0)
        cur = inputs.get("current_thickness_mm", 0)
        if loc == "kn":
            return f"ಒಟ್ಟು ಗೋಡೆಯ ದಪ್ಪದ ನಷ್ಟ: ಆರಂಭಿಕ ({init} {units}) - ಪ್ರಸ್ತುತ ({cur} {units}) = {result} {units}"
        if loc == "hi":
            return f"कुल दीवार मोटाई हानि: प्रारंभिक ({init} {units}) - वर्तमान ({cur} {units}) = {result} {units}"
        return f"Total thickness loss: initial ({init} {units}) - current ({cur} {units}) = {result} {units}"

    elif calc_type == "wall_thickness_margin":
        cur = inputs.get("measured_thickness_mm", 72.8)
        retire = inputs.get("retirement_thickness_mm", 68.2)
        if loc == "kn":
            return f"ಗೋಡೆಯ ದಪ್ಪದ ಸುರಕ್ಷತಾ ಅಂತರ: ಅಳತೆ ಮಾಡಿದ ಮೌಲ್ಯ ({cur} {units}) - ನಿವೃತ್ತಿ ಮಿತಿ ({retire} {units}) = +{result} {units}"
        if loc == "hi":
            return f"दीवार मोटाई सुरक्षा मार्जिन: मापा गया मान ({cur} {units}) - सेवानिवृत्ति सीमा ({retire} {units}) = +{result} {units}"
        return f"Wall thickness safety margin: measured ({cur} {units}) - retirement limit ({retire} {units}) = +{result} {units}"

    elif calc_type == "corrosion_projection":
        thick = inputs.get("current_thickness_mm", 0)
        rate = inputs.get("corrosion_rate_mm_per_year", 0)
        years = inputs.get("operating_years", 0)
        if loc == "kn":
            return f"{years} ವರ್ಷಗಳಲ್ಲಿ ಅಂದಾಜು ಗೋಡೆಯ ದಪ್ಪ: {thick} {units} - ({rate} {units}/ವರ್ಷ * {years} ವರ್ಷ) = {result} {units}"
        if loc == "hi":
            return f"{years} वर्षों में अनुमानित दीवार मोटाई: {thick} {units} - ({rate} {units}/वर्ष * {years} वर्ष) = {result} {units}"
        return f"Projected wall thickness over {years} years: {thick} {units} - ({rate} {units}/yr * {years} yr) = {result} {units}"

    return f"{calc_type}: {result} {units}"


# ---------------------------------------------------------------------------
# 4. Status & Verdict Translation
# ---------------------------------------------------------------------------
VERDICT_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "VERIFIED": {
        "en": "Verified",
        "hi": "सत्यापित (अनुपालन पुष्ट)",
        "kn": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ (ಅನುಸರಣೆ ದೃಢಪಟ್ಟಿದೆ)",
    },
    "REVIEW_REQUIRED": {
        "en": "Review required",
        "hi": "समीक्षा आवश्यक (ऑपरेटर ध्यान दें)",
        "kn": "ಪರಿಶೀಲನೆ ಅಗತ್ಯ (ಆಪರೇಟರ್ ಗಮನಿಸಿ)",
    },
    "ACTION_BLOCKED": {
        "en": "Action blocked",
        "hi": "कार्रवाई अवरुद्ध (शून्य-विश्वास नीति)",
        "kn": "ಕ್ರಮ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (ಶೂನ್ಯ-ವಿಶ್ವಾಸ ನೀತಿ)",
    },
    "QUARANTINED": {
        "en": "Quarantined",
        "hi": "संगरोधित (असुरक्षित डेटा अलग किया गया)",
        "kn": "ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ (ಅಸುರಕ್ಷಿತ ಡೇಟಾ ಕ್ವಾರಂಟೈನ್)",
    },
    "INSUFFICIENT_EVIDENCE": {
        "en": "Insufficient evidence",
        "hi": "अपर्याप्त साक्ष्य (अधिक डेटा आवश्यक)",
        "kn": "ಅಪರ್ಯಾಪ್ತ ಪುರಾವೆ (ಹೆಚ್ಚಿನ ಡೇಟಾ ಅಗತ್ಯವಿದೆ)",
    },
    "FAILED": {
        "en": "Failed",
        "hi": "विफल (सुरक्षा सीमा उल्लंघन)",
        "kn": "ವಿಫಲವಾಗಿದೆ (ಸುರಕ್ಷತಾ ಗಡಿ ಉಲ್ಲಂಘನೆ)",
    },
    "ALLOWED": {
        "en": "ALLOWED",
        "hi": "स्वीकृत (ALLOWED)",
        "kn": "ಅನುಮತಿಸಲಾಗಿದೆ (ALLOWED)",
    },
    "DENIED": {
        "en": "DENIED",
        "hi": "अस्वीकृत (DENIED)",
        "kn": "ನಿರಾಕರಿಸಲಾಗಿದೆ (DENIED)",
    },
    "PASS": {
        "en": "PASS",
        "hi": "उत्तीर्ण (PASS)",
        "kn": "ಉತ್ತೀರ್ಣ (PASS)",
    },
    "PROHIBITED": {
        "en": "PROHIBITED",
        "hi": "निषिद्ध (PROHIBITED)",
        "kn": "ನಿಷೇಧಿಸಲಾಗಿದೆ (PROHIBITED)",
    },
}

# ---------------------------------------------------------------------------
# 5. Policy Decision Text
# ---------------------------------------------------------------------------
def localize_policy_decision(
    tool: str,
    action: str,
    reason: str,
    policy_id: Optional[str] = None,
    locale: str = "en",
) -> str:
    loc = (locale or "en").lower()
    pol_str = f"'{policy_id}' " if policy_id else ""
    if action == "ALLOW":
        if loc == "kn":
            return f"ಕ್ರಿಯೆ '{tool}': ನಿರ್ಧಾರ = ಅನುಮತಿಸಲಾಗಿದೆ (ALLOW). ಕಾರಣ: ಸಾರ್ವಭೌಮ ಕೈಗಾರಿಕಾ ನೀತಿ {pol_str}ಅಡಿಯಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಅಧಿಕೃತಗೊಳಿಸಲಾಗಿದೆ."
        if loc == "hi":
            return f"क्रिया '{tool}': निर्णय = स्वीकृत (ALLOW)। कारण: संप्रभु औद्योगिक नीति {pol_str}के तहत स्पष्ट रूप से अधिकृत।"
        return f"Action '{tool}': DECISION = ALLOW. Reason: Explicitly permitted by sovereign industrial policy {pol_str}."
    else:
        if loc == "kn":
            return f"ಕ್ರಿಯೆ '{tool}': ನಿರ್ಧಾರ = ನಿರಾಕರಿಸಲಾಗಿದೆ (DENY). ಕಾರಣ: ಸಾರ್ವಭೌಮ ನೀತಿ {pol_str}ಉಲ್ಲಂಘನೆ ಅಥವಾ ಅನಧಿಕೃತ ನಿಯಂತ್ರಣ ಹಕ್ಕುಗಳು."
        if loc == "hi":
            return f"क्रिया '{tool}': निर्णय = अस्वीकृत (DENY)। कारण: संप्रभु नीति {pol_str}का उल्लंघन या अनधिकृत नियंत्रण विशेषाधिकार।"
        return f"Action '{tool}': DECISION = DENY. Reason: Sovereign policy {pol_str}violation or unauthorized actuation privilege."


# ---------------------------------------------------------------------------
# 6. Verification Summary Generator (Multilingual)
# ---------------------------------------------------------------------------
def localize_verification_summary(
    status: str,
    v_cnt: int,
    tot: int,
    e_cnt: int,
    c_cnt: int,
    locale: str = "en",
) -> str:
    loc = (locale or "en").lower()
    if loc == "kn":
        if status == "VERIFIED":
            return (
                f"ಪರಿಶೀಲಿಸಲಾಗಿದೆ ({tot} ರಲ್ಲಿ {v_cnt} ತಪಾಸಣೆಗಳು ಉತ್ತೀರ್ಣ). "
                f"{e_cnt} ಪರಿಶೀಲಿಸಿದ ಪುರಾವೆ ದಾಖಲೆಗಳು ಮತ್ತು {c_cnt} ನಿರ್ಣಾಯಕ ಗಣಿತ ಲೆಕ್ಕಾಚಾರಗಳಿಂದ ಬೆಂಬಲಿತವಾಗಿದೆ. "
                f"ಮೂಲದ ಸಮಗ್ರತೆ, ನೀತಿ ನಿಯಮಗಳು ಮತ್ತು ಸಾರ್ವಭೌಮ ಗಡಿಗಳು ದೃಢಪಟ್ಟಿವೆ."
            )
        elif status == "REVIEW_REQUIRED":
            return (
                f"ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ: ಸಂವೇದಕ ರೀಡಿಂಗ್‌ಗಳು ಮತ್ತು SOP ಮಿತಿಗಳ ನಡುವೆ ನಿಯತಾಂಕ ವ್ಯತ್ಯಾಸ ಪತ್ತೆಯಾಗಿದೆ. "
                f"ಮುಖ್ಯ ಇಂಜಿನಿಯರ್ ಪರಿಶೀಲನೆಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ."
            )
        elif status == "ACTION_BLOCKED":
            return (
                f"ಕ್ರಮ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ: ಸಾರ್ವಭೌಮ ಶೂನ್ಯ-ವಿಶ್ವಾಸ ನೀತಿಯು ಅನಧಿಕೃತ ಸಾಧನ ನಿಯಂತ್ರಣವನ್ನು ತಡೆದಿದೆ."
            )
        elif status == "QUARANTINED":
            return (
                f"ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ: ಅಸುರಕ್ಷಿತ ಅಥವಾ ಪ್ರಾಂಪ್ಟ್-ಇಂಜೆಕ್ಷನ್ ಹೊಂದಿರುವ ದಾಖಲೆಯನ್ನು ನಿಷ್ಕ್ರಿಯ ಡೇಟಾ ಎಂದು ಪರಿಗಣಿಸಲಾಗಿದೆ."
            )
        return f"ಸ್ಥಿತಿ: {status} ({tot} ರಲ್ಲಿ {v_cnt} ತಪಾಸಣೆಗಳು)."

    if loc == "hi":
        if status == "VERIFIED":
            return (
                f"सत्यापित ({tot} में से {v_cnt} जांच उत्तीर्ण)। "
                f"{e_cnt} सत्यापित साक्ष्य रिकॉर्ड और {c_cnt} नियतात्मक गणितीय गणनाओं द्वारा समर्थित। "
                f"स्रोत अखंडता, नीति नियम और संप्रभु सीमाएं पुष्ट।"
            )
        elif status == "REVIEW_REQUIRED":
            return (
                f"समीक्षा आवश्यक: सेंसर रीडिंग और SOP सीमाओं के बीच पैरामीटर विचरण का पता चला है। "
                f"मुख्य अभियंता की समीक्षा हेतु अनुशंसित।"
            )
        elif status == "ACTION_BLOCKED":
            return (
                f"कार्रवाई अवरुद्ध: संप्रभु शून्य-विश्वास नीति ने अनधिकृत उपकरण संचालन को रोक दिया।"
            )
        elif status == "QUARANTINED":
            return (
                f"संगरोधित: असुरक्षित अथवा संदिग्ध डेटा को निष्क्रिय तकनीकी डेटा के रूप में अलग रखा गया।"
            )
        return f"स्थिति: {status} ({tot} में से {v_cnt} जांच)।"

    # Default English
    if status == "VERIFIED":
        return (
            f"VERIFIED ({v_cnt}/{tot} checks passed). Supported by {e_cnt} verified evidence record(s) "
            f"and {c_cnt} deterministic calculation(s). Provenance, policy, and boundaries confirmed."
        )
    return f"Verification evaluation status: {status} ({v_cnt}/{tot} checks passed)."


# ---------------------------------------------------------------------------
# 7. Helper Lookup Function
# ---------------------------------------------------------------------------
def translate_text(key: str, locale: str = "en", fallback: Optional[str] = None) -> str:
    loc = (locale or "en").lower()
    if loc not in ("kn", "hi"):
        return fallback or key

    # Direct match in check descriptions
    if key in CHECK_DESCRIPTION_TRANSLATIONS:
        return CHECK_DESCRIPTION_TRANSLATIONS[key].get(loc, fallback or key)

    # Direct match in check names
    if key in CHECK_NAME_TRANSLATIONS:
        return CHECK_NAME_TRANSLATIONS[key].get(loc, fallback or key)

    # Verdicts
    if key in VERDICT_TRANSLATIONS:
        return VERDICT_TRANSLATIONS[key].get(loc, fallback or key)

    # Substring matches for dynamic messages
    if "Parameter variances detected" in key and "distinct semantic roles" in key:
        if loc == "kn":
            return "ವಿವಿಧ ಮೂಲಗಳಿಂದ ನಿಯತಾಂಕ ವ್ಯತ್ಯಾಸಗಳು ಪತ್ತೆಯಾಗಿವೆ ಆದರೆ ವಿಭಿನ್ನ ಪಾತ್ರಗಳೆಂದು (ಸಾಮಾನ್ಯ ಕಾರ್ಯಾಚರಣೆ vs ಟ್ರಿಪ್ ಮಿತಿ) ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಸಂಘರ್ಷವಿಲ್ಲ."
        if loc == "hi":
            return "पैरामीटर विचरण पाया गया लेकिन भिन्न भूमिकाओं (सामान्य परिचालन बनाम ट्रिप सीमा) के रूप में सत्यापित। गैर-विरोधाभासी।"

    if "All evidence items possess verifiable source references" in key:
        return CHECK_DESCRIPTION_TRANSLATIONS["All evidence items possess verifiable source references, identifiers, and classifications."].get(loc, key)

    if "Policy trace verified" in key:
        return CHECK_DESCRIPTION_TRANSLATIONS["Policy trace verified: All tool actions were authorized; denied tools were strictly unexecuted."].get(loc, key)

    if "Data classifications verified" in key:
        return CHECK_DESCRIPTION_TRANSLATIONS["Data classifications verified: All evidence items remain within requester clearance ('CONFIDENTIAL')."].get(loc, key)

    if "Supporting evidence and calculations are available" in key:
        return CHECK_DESCRIPTION_TRANSLATIONS["Supporting evidence and calculations are available for synthesis grounding."].get(loc, key)

    if "All" in key and "calculation(s) verified deterministically in Python" in key:
        if loc == "kn":
            return "ಎಲ್ಲಾ ಗಣಿತೀಯ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಪೈಥಾನ್ ಕರ್ನಲ್ ಮೂಲಕ ನಿರ್ಣಾಯಕವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಮೂಲವನ್ನು ಸಂರಕ್ಷಿಸಲಾಗಿದೆ."
        if loc == "hi":
            return "सभी गणितीय गणनाओं को पायथन कर्नेल द्वारा नियतात्मक रूप से सत्यापित किया गया है और स्रोत संरक्षित है।"

    return fallback or key
