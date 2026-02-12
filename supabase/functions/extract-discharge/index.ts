import { createClient } from "npm:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { scan_id, file_storage_path } = await req.json();

    // Update status to processing
    await supabase
      .from("discharge_scans")
      .update({ status: "processing" })
      .eq("id", scan_id);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("discharge-docs")
      .download(file_storage_path);

    if (downloadError || !fileData) {
      await supabase
        .from("discharge_scans")
        .update({ status: "failed" })
        .eq("id", scan_id);

      return jsonResponse({ error: "Failed to download file" }, 400);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    const mediaType = file_storage_path.endsWith(".pdf")
      ? "application/pdf"
      : file_storage_path.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

    // Call Claude Vision API
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: `You are extracting structured data from a hospital discharge document. Extract ALL available clinical information. Return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

{
  "patient_name": "full name as string, or null if not found",
  "discharge_date": "YYYY-MM-DD format, or null",
  "weight_admission_kg": number or null,
  "weight_discharge_kg": number or null,
  "resting_heart_rate_bpm": number or null,
  "heart_rhythm": "Sinus" | "Atrial Fibrillation" | "Not Known" | null,
  "blood_pressure": "systolic/diastolic as string like 118/72, or null",
  "nyha_class": "I" | "II" | "III" | "IV" | null,
  "ejection_fraction_pct": number (e.g. 35 for 35%), or null,
  "lv_assessment_method": "echocardiogram" or other method string, or null,
  "lv_assessment_date": "YYYY-MM-DD or null",
  "potassium": number or null,
  "sodium": number or null,
  "urea": number or null,
  "creatinine": number or null,
  "egfr": number or null,
  "medications": [{"name": "med name", "dosage": "dose", "frequency": "freq"}],
  "patient_specific_instructions": "all patient-specific instructions as a single string, or null",
  "care_plan_notes": "care plan / next steps notes, or null",
  "follow_up_date": "YYYY-MM-DD or null",
  "follow_up_instructions": "follow-up details, or null",
  "diagnosis": "primary diagnosis or reason for admission, or null"
}

Important: Extract the ejection fraction percentage, blood pressure, and NYHA class carefully — these are critical clinical values. For medications, include all listed with dosage and frequency if available. For patient-specific instructions, capture the handwritten/typed notes verbatim.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const claudeData = await claudeResponse.json();

    if (!claudeResponse.ok) {
      await supabase
        .from("discharge_scans")
        .update({
          status: "failed",
          extracted_data: { error: claudeData },
        })
        .eq("id", scan_id);

      return jsonResponse(
        { error: claudeData.error?.message ?? "Claude API error" },
        500
      );
    }

    let extractedText = claudeData.content?.[0]?.text ?? "{}";

    // Strip markdown code fences if Claude wrapped the JSON
    extractedText = extractedText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(extractedText);
    } catch {
      await supabase
        .from("discharge_scans")
        .update({ status: "failed", extracted_data: { raw: extractedText } })
        .eq("id", scan_id);

      return jsonResponse(
        { error: "Failed to parse extraction result" },
        500
      );
    }

    // Update the discharge_scans record with extracted data
    await supabase
      .from("discharge_scans")
      .update({
        status: "review",
        extracted_data: extracted,
      })
      .eq("id", scan_id);

    return jsonResponse({ success: true, extracted_data: extracted });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});
