-- Allow authenticated physicians to upload to discharge-docs bucket
CREATE POLICY "physicians_upload_discharge_docs" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'discharge-docs');

CREATE POLICY "physicians_read_discharge_docs" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'discharge-docs');
