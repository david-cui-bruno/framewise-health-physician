export const APP_NAME = "Framewise Health";
export const APP_DESCRIPTION = "Physician Portal";

export const ROUTES = {
  LOGIN: "/login",
  PATIENTS: "/patients",
  PATIENT_DETAIL: (id: string) => `/patients/${id}`,
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
  SCANNER: "/scanner",
} as const;
