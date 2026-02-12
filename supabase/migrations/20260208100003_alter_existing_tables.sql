-- Add physician_id to patient_care_assignments
ALTER TABLE patient_care_assignments
    ADD COLUMN IF NOT EXISTS physician_id UUID REFERENCES physicians(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pca_physician ON patient_care_assignments(physician_id);

-- Add discharge-related fields to patients table
ALTER TABLE patients
    ADD COLUMN IF NOT EXISTS discharge_date DATE,
    ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS restrictions TEXT,
    ADD COLUMN IF NOT EXISTS follow_up_date DATE;
