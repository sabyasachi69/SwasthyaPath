import assert from "node:assert/strict";
import test from "node:test";
import { symptomGuidance } from "../../src/domain/symptom-guidance";

test("symptom guidance selects a navigation category without diagnosing", () => {
  assert.deepEqual(symptomGuidance("fever and cough"), {
    category: "Respiratory symptoms",
    recommendedKind: "clinic",
    urgent: false,
  });
});

test("urgent phrases direct the directory toward hospitals", () => {
  assert.deepEqual(symptomGuidance("chest pain and difficulty breathing"), {
    category: "Urgent symptoms",
    recommendedKind: "hospital",
    urgent: true,
  });
});

test("vague entries do not force a facility type", () => {
  assert.equal(symptomGuidance("help"), null);
});
