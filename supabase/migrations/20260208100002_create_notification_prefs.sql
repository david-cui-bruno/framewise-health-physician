-- Create physician notification preferences table
CREATE TABLE physician_notification_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL UNIQUE REFERENCES physicians(id) ON DELETE CASCADE,
    onboarding_complete BOOLEAN DEFAULT TRUE,
    all_videos_complete BOOLEAN DEFAULT TRUE,
    qa_concern BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_notification_prefs_updated_at
    BEFORE UPDATE ON physician_notification_prefs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE physician_notification_prefs ENABLE ROW LEVEL SECURITY;
