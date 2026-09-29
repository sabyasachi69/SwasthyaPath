export type FacilityFilter = "all" | "hospital" | "clinic" | "pharmacy" | "diagnostic";

export type SymptomGuidance = {
  category: string;
  recommendedKind: Exclude<FacilityFilter, "all">;
  urgent: boolean;
};

type GuidanceRule = SymptomGuidance & { keywords: string[] };

// This is deliberately a small, deterministic navigation aid. It runs only in
// the browser, is not saved or sent to an API, and does not diagnose conditions.
const rules: GuidanceRule[] = [
  {
    category: "Urgent symptoms",
    recommendedKind: "hospital",
    urgent: true,
    keywords: ["chest pain", "chest discomfort", "difficulty breathing", "cannot breathe", "shortness of breath", "severe bleeding", "unconscious", "stroke", "seizure"],
  },
  {
    category: "Respiratory symptoms",
    recommendedKind: "clinic",
    urgent: false,
    keywords: ["cough", "cold", "fever", "sore throat", "breathing", "asthma"],
  },
  {
    category: "Digestive symptoms",
    recommendedKind: "clinic",
    urgent: false,
    keywords: ["stomach", "abdominal", "vomit", "diarrhea", "diarrhoea", "indigestion", "nausea"],
  },
  {
    category: "Headache or general symptoms",
    recommendedKind: "clinic",
    urgent: false,
    keywords: ["headache", "migraine", "dizziness", "weakness", "fatigue", "body pain"],
  },
  {
    category: "Skin or allergy symptoms",
    recommendedKind: "clinic",
    urgent: false,
    keywords: ["rash", "itch", "allergy", "skin", "swelling"],
  },
  {
    category: "Medicines and everyday care",
    recommendedKind: "pharmacy",
    urgent: false,
    keywords: ["medicine", "medication", "prescription refill", "tablet", "pharmacy"],
  },
  {
    category: "Tests and screening",
    recommendedKind: "diagnostic",
    urgent: false,
    keywords: ["blood test", "test", "scan", "x-ray", "diagnostic", "lab"],
  },
];

export function symptomGuidance(value: string): SymptomGuidance | null {
  const input = value.trim().toLowerCase();
  if (input.length < 3) return null;
  const match = rules.find((rule) => rule.keywords.some((keyword) => input.includes(keyword)));
  return match ? { category: match.category, recommendedKind: match.recommendedKind, urgent: match.urgent } : null;
}
