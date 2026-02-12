-- Create discharge_scans table for scanned documents and AI extraction
CREATE TABLE discharge_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES physicians(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    extracted_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'review', 'confirmed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discharge_scans_physician ON discharge_scans(physician_id);
CREATE INDEX idx_discharge_scans_status ON discharge_scans(status);

CREATE TRIGGER update_discharge_scans_updated_at
    BEFORE UPDATE ON discharge_scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE discharge_scans ENABLE ROW LEVEL SECURITY;
