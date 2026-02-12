-- Create physicians table for provider profiles
CREATE TABLE physicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    specialty TEXT,
    practice_name TEXT,
    practice_address TEXT,
    practice_phone TEXT,
    default_pathway_id UUID REFERENCES care_pathways(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_physicians_user_id ON physicians(user_id);

-- Reuse existing trigger function from patient app
CREATE TRIGGER update_physicians_updated_at
    BEFORE UPDATE ON physicians
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE physicians ENABLE ROW LEVEL SECURITY;
