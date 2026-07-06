const portalRoles = new Set(["Patient", "Elderly", "PatientFamily"]);
const caregiverRoles = new Set(["Nurse", "AssistantNurse", "ElderlyCareAssistant", "Physiotherapist"]);
const adminRoles = new Set(["Admin", "Supervisor", "SuperAdmin", "Manager"]);

export function resolveRoleHomePath(role?: string | null) {
  if (!role) {
    return "/dashboard";
  }

  if (portalRoles.has(role)) {
    return "/portal";
  }

  if (caregiverRoles.has(role)) {
    return "/nurse-portal";
  }

  if (adminRoles.has(role)) {
    return "/dashboard";
  }

  return "/dashboard";
}
