export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_id: string;
          onboarding_completed: boolean;
          discharge_date: string | null;
          medications: Json;
          restrictions: string | null;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_id?: string;
          onboarding_completed?: boolean;
          discharge_date?: string | null;
          medications?: Json;
          restrictions?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_id?: string;
          onboarding_completed?: boolean;
          discharge_date?: string | null;
          medications?: Json;
          restrictions?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      physicians: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          specialty: string | null;
          practice_name: string | null;
          practice_address: string | null;
          practice_phone: string | null;
          default_pathway_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          specialty?: string | null;
          practice_name?: string | null;
          practice_address?: string | null;
          practice_phone?: string | null;
          default_pathway_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          specialty?: string | null;
          practice_name?: string | null;
          practice_address?: string | null;
          practice_phone?: string | null;
          default_pathway_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_pathways: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          duration_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          duration_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          duration_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      patient_care_assignments: {
        Row: {
          id: string;
          patient_id: string;
          care_pathway_id: string;
          physician_id: string | null;
          assigned_at: string;
          start_date: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          patient_id: string;
          care_pathway_id: string;
          physician_id?: string | null;
          assigned_at?: string;
          start_date?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          patient_id?: string;
          care_pathway_id?: string;
          physician_id?: string | null;
          assigned_at?: string;
          start_date?: string;
          is_active?: boolean;
        };
      };
      video_modules: {
        Row: {
          id: string;
          care_pathway_id: string;
          module_type: "what_to_do" | "what_to_watch_for" | "what_if_wrong";
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration_seconds: number;
          sort_order: number;
          is_active: boolean;
          transcript: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          care_pathway_id: string;
          module_type: "what_to_do" | "what_to_watch_for" | "what_if_wrong";
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration_seconds: number;
          sort_order?: number;
          is_active?: boolean;
          transcript?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          care_pathway_id?: string;
          module_type?: "what_to_do" | "what_to_watch_for" | "what_if_wrong";
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number;
          sort_order?: number;
          is_active?: boolean;
          transcript?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_progress: {
        Row: {
          id: string;
          patient_id: string;
          video_module_id: string;
          watch_count: number;
          total_watch_time_seconds: number;
          furthest_position_seconds: number;
          is_completed: boolean;
          completed_at: string | null;
          first_watched_at: string | null;
          last_watched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          video_module_id: string;
          watch_count?: number;
          total_watch_time_seconds?: number;
          furthest_position_seconds?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          first_watched_at?: string | null;
          last_watched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          video_module_id?: string;
          watch_count?: number;
          total_watch_time_seconds?: number;
          furthest_position_seconds?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          first_watched_at?: string | null;
          last_watched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_telemetry: {
        Row: {
          id: string;
          patient_id: string;
          video_module_id: string;
          session_id: string;
          event_type: string;
          event_data: Json;
          video_timestamp_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          video_module_id: string;
          session_id: string;
          event_type: string;
          event_data?: Json;
          video_timestamp_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          video_module_id?: string;
          session_id?: string;
          event_type?: string;
          event_data?: Json;
          video_timestamp_seconds?: number | null;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          video_module_id: string;
          question_text: string;
          question_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_module_id: string;
          question_text: string;
          question_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_module_id?: string;
          question_text?: string;
          question_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      quiz_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          option_order: number;
          feedback_text: string | null;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          is_correct?: boolean;
          option_order?: number;
          feedback_text?: string | null;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          is_correct?: boolean;
          option_order?: number;
          feedback_text?: string | null;
        };
      };
      quiz_responses: {
        Row: {
          id: string;
          patient_id: string;
          question_id: string;
          selected_option_id: string;
          is_correct: boolean;
          attempt_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          question_id: string;
          selected_option_id: string;
          is_correct: boolean;
          attempt_number?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          question_id?: string;
          selected_option_id?: string;
          is_correct?: boolean;
          attempt_number?: number;
          created_at?: string;
        };
      };
      satisfaction_feedback: {
        Row: {
          id: string;
          patient_id: string;
          context_type: string;
          context_id: string | null;
          rating_type: string;
          rating_value: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          context_type: string;
          context_id?: string | null;
          rating_type: string;
          rating_value: number;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          context_type?: string;
          context_id?: string | null;
          rating_type?: string;
          rating_value?: number;
          reason?: string | null;
          created_at?: string;
        };
      };
      qa_search_log: {
        Row: {
          id: string;
          patient_id: string;
          search_query: string;
          results_returned: number;
          selected_result_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          search_query: string;
          results_returned?: number;
          selected_result_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          search_query?: string;
          results_returned?: number;
          selected_result_id?: string | null;
          created_at?: string;
        };
      };
      discharge_scans: {
        Row: {
          id: string;
          physician_id: string;
          image_url: string;
          extracted_data: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          physician_id: string;
          image_url: string;
          extracted_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          physician_id?: string;
          image_url?: string;
          extracted_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      physician_notification_prefs: {
        Row: {
          id: string;
          physician_id: string;
          onboarding_complete: boolean;
          all_videos_complete: boolean;
          qa_concern: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          physician_id: string;
          onboarding_complete?: boolean;
          all_videos_complete?: boolean;
          qa_concern?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          physician_id?: string;
          onboarding_complete?: boolean;
          all_videos_complete?: boolean;
          qa_concern?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

// Table row types
export type Patient = Tables<"patients">;
export type Physician = Tables<"physicians">;
export type CarePathway = Tables<"care_pathways">;
export type PatientCareAssignment = Tables<"patient_care_assignments">;
export type VideoModule = Tables<"video_modules">;
export type VideoProgress = Tables<"video_progress">;
export type VideoTelemetry = Tables<"video_telemetry">;
export type QuizQuestion = Tables<"quiz_questions">;
export type QuizOption = Tables<"quiz_options">;
export type QuizResponse = Tables<"quiz_responses">;
export type SatisfactionFeedback = Tables<"satisfaction_feedback">;
export type QASearchLog = Tables<"qa_search_log">;
export type DischargeScan = Tables<"discharge_scans">;
export type PhysicianNotificationPrefs = Tables<"physician_notification_prefs">;
