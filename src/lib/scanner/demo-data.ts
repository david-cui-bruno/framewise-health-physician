/**
 * Hardcoded clinical data for the YC demo.
 * Values match the sample discharge packet (Heart Failure — Winnipeg Regional Health Authority).
 */
export const DEMO_EXTRACTED_DATA = {
  name: "David Cui",
  email: "david.cui@example.com",
  care_pathway_id: "",
  discharge_date: "2026-02-06",
  weight_admission_kg: "86.5",
  weight_discharge_kg: "82.3",
  resting_heart_rate_bpm: "68",
  heart_rhythm: "Sinus",
  blood_pressure: "118/72",
  nyha_class: "II",
  ejection_fraction_pct: "25",
  lv_assessment_method: "Echocardiogram",
  lv_assessment_date: "2026-02-01",
  potassium: "4.3",
  sodium: "138",
  urea: "6.8",
  creatinine: "1.1",
  egfr: "72",
  medications: [
    { name: "Sacubitril/Valsartan", dosage: "49/51 mg", frequency: "Twice daily" },
    { name: "Bisoprolol", dosage: "5 mg", frequency: "Once daily" },
    { name: "Dapagliflozin", dosage: "10 mg", frequency: "Once daily" },
    { name: "Spironolactone", dosage: "25 mg", frequency: "Once daily" },
    { name: "Furosemide", dosage: "40 mg", frequency: "Once daily" },
  ],
  patient_specific_instructions:
    "Take diuretics earlier in the day. Weigh yourself every morning after using the bathroom. Bring all medications to follow-up appointment.",
  care_plan_notes:
    "Patient clinically stable on optimized GDMT. Discharge with close outpatient follow-up. Consider referral to cardiac rehabilitation.",
  follow_up_date: "2026-02-20",
  follow_up_instructions:
    "Cardiology clinic Friday Feb 20. Repeat bloods (U&E, eGFR) 1 week post-discharge.",
  diagnosis: "Heart Failure with reduced ejection fraction (HFrEF)",
};
