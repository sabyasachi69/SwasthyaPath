export type FacilityFilter = "all" | "hospital" | "clinic" | "pharmacy" | "diagnostic";

export type SymptomGuidance = {
  category: string;
  recommendedKind: Exclude<FacilityFilter, "all">;
  urgent: boolean;
  severity: "emergency" | "routine";
  triageLevel: 2 | 5;
  possibleConditions: string[];
  redFlags: string[];
};

type GuidanceRule = SymptomGuidance & { keywords: string[] };

// This is deliberately a small, deterministic navigation aid. It runs only in
// the browser, is not saved or sent to an API, and does not diagnose conditions.
const rules: GuidanceRule[] = [
  {
    category: "Urgent symptoms",
    recommendedKind: "hospital",
    urgent: true,
    severity: "emergency",
    triageLevel: 5,
    possibleConditions: ["A potentially urgent heart, breathing, neurological or injury-related problem"],
    redFlags: ["Sudden or severe symptoms may need emergency care"],
    keywords: ["chest pain", "chest discomfort", "difficulty breathing", "cannot breathe", "shortness of breath", "severe bleeding", "unconscious", "stroke", "seizure"],
  },
  {
    category: "Respiratory symptoms",
    recommendedKind: "clinic",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A respiratory or fever-related illness"],
    redFlags: [],
    keywords: ["cough", "cold", "fever", "jwara", "bukhar", "sore throat", "breathing", "asthma"],
  },
  {
    category: "Digestive symptoms",
    recommendedKind: "clinic",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A digestive or abdominal health concern"],
    redFlags: [],
    keywords: ["stomach", "abdominal", "vomit", "diarrhea", "diarrhoea", "indigestion", "nausea"],
  },
  {
    category: "Headache or general symptoms",
    recommendedKind: "clinic",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A headache or general health concern"],
    redFlags: [],
    keywords: ["headache", "migraine", "dizziness", "weakness", "fatigue", "body pain"],
  },
  {
    category: "Skin or allergy symptoms",
    recommendedKind: "clinic",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A skin or allergy-related concern"],
    redFlags: [],
    keywords: ["rash", "itch", "allergy", "skin", "swelling"],
  },
  {
    category: "Medicines and everyday care",
    recommendedKind: "pharmacy",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A medicine or everyday care need"],
    redFlags: [],
    keywords: ["medicine", "medication", "prescription refill", "tablet", "pharmacy"],
  },
  {
    category: "Tests and screening",
    recommendedKind: "diagnostic",
    urgent: false,
    severity: "routine",
    triageLevel: 2,
    possibleConditions: ["A test or screening need"],
    redFlags: [],
    keywords: ["blood test", "test", "scan", "x-ray", "diagnostic", "lab"],
  },
];

export function symptomGuidance(value: string): SymptomGuidance | null {
  const input = value.trim().toLowerCase();
  if (input.length < 3) return null;
  const match = rules.find((rule) => rule.keywords.some((keyword) => input.includes(keyword)));
  return match ? {
    category: match.category,
    recommendedKind: match.recommendedKind,
    urgent: match.urgent,
    severity: match.severity,
    triageLevel: match.triageLevel,
    possibleConditions: match.possibleConditions,
    redFlags: match.redFlags,
  } : null;
}

export function selectedFacilityKind(
  guidance: SymptomGuidance | null,
  manualOverride: FacilityFilter | null,
): FacilityFilter {
  return manualOverride ?? guidance?.recommendedKind ?? "all";
}
