import assert from "node:assert/strict";
import test from "node:test";
import { selectedFacilityKind, symptomGuidance } from "../../src/domain/symptom-guidance";

test("fever guidance selects a clinic without diagnosing", () => {
  const guidance = symptomGuidance("fever and cough");
  assert.equal(guidance?.category, "Respiratory symptoms");
  assert.equal(guidance?.recommendedKind, "clinic");
  assert.equal(guidance?.triageLevel, 2);
});

test("chest pain maps to level 5 and a hospital", () => {
  const guidance = symptomGuidance("chest pain and difficulty breathing");
  assert.equal(guidance?.recommendedKind, "hospital");
  assert.equal(guidance?.triageLevel, 5);
  assert.equal(guidance?.urgent, true);
});

test("headache maps to level 2 and a clinic", () => {
  const guidance = symptomGuidance("headache");
  assert.equal(guidance?.recommendedKind, "clinic");
  assert.equal(guidance?.triageLevel, 2);
});

test("Hinglish aliases map to fever guidance", () => {
  assert.equal(symptomGuidance("jwara")?.category, "Respiratory symptoms");
  assert.equal(symptomGuidance("bukhar")?.category, "Respiratory symptoms");
});

test("manual facility choice overrides a demo recommendation", () => {
  assert.equal(selectedFacilityKind(symptomGuidance("headache"), "hospital"), "hospital");
});

test("vague entries do not force a facility type", () => {
  assert.equal(symptomGuidance("help"), null);
});
