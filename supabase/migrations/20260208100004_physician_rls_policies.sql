-- Helper function: get physician_id from current auth user
CREATE OR REPLACE FUNCTION get_physician_id()
RETURNS UUID AS $$
    SELECT id FROM physicians WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PHYSICIANS table policies
-- ============================================
CREATE POLICY "physicians_select_own" ON physicians
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "physicians_update_own" ON physicians
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- DISCHARGE_SCANS table policies
-- ============================================
CREATE POLICY "discharge_scans_select_own" ON discharge_scans
    FOR SELECT USING (physician_id = get_physician_id());

CREATE POLICY "discharge_scans_insert_own" ON discharge_scans
    FOR INSERT WITH CHECK (physician_id = get_physician_id());

CREATE POLICY "discharge_scans_update_own" ON discharge_scans
    FOR UPDATE USING (physician_id = get_physician_id());

-- ============================================
-- NOTIFICATION_PREFS table policies
-- ============================================
CREATE POLICY "notif_prefs_select_own" ON physician_notification_prefs
    FOR SELECT USING (physician_id = get_physician_id());

CREATE POLICY "notif_prefs_insert_own" ON physician_notification_prefs
    FOR INSERT WITH CHECK (physician_id = get_physician_id());

CREATE POLICY "notif_prefs_update_own" ON physician_notification_prefs
    FOR UPDATE USING (physician_id = get_physician_id());

-- ============================================
-- PATIENTS table: physician access to assigned patients
-- (Additive — does NOT modify existing patient-owned policies)
-- ============================================
CREATE POLICY "physicians_view_assigned_patients" ON patients
    FOR SELECT USING (
        id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );

-- ============================================
-- PATIENT_CARE_ASSIGNMENTS: physician access
-- ============================================
CREATE POLICY "physicians_view_own_assignments" ON patient_care_assignments
    FOR SELECT USING (physician_id = get_physician_id());

CREATE POLICY "physicians_insert_assignments" ON patient_care_assignments
    FOR INSERT WITH CHECK (physician_id = get_physician_id());

-- ============================================
-- Read-only access to patient engagement data
-- for patients assigned to the physician
-- ============================================
CREATE POLICY "physicians_view_video_progress" ON video_progress
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );

CREATE POLICY "physicians_view_quiz_responses" ON quiz_responses
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );

CREATE POLICY "physicians_view_qa_search_log" ON qa_search_log
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );

CREATE POLICY "physicians_view_satisfaction" ON satisfaction_feedback
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );

CREATE POLICY "physicians_view_telemetry" ON video_telemetry
    FOR SELECT USING (
        patient_id IN (
            SELECT patient_id FROM patient_care_assignments
            WHERE physician_id = get_physician_id()
        )
    );
