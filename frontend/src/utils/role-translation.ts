export const roleTranslations: Record<string, string> = {
  'Admin': 'ادمین',
  'Manager': 'مدیر',
  'Supervisor': 'سوپروایزر',
  'Nurse': 'پرستار',
  'AssistantNurse': 'کمک پرستار',
  'Physiotherapist': 'فیزیوتراپیست',
  'ElderlyCareAssistant': 'مراقب سالمند',
  'Elderly': 'سالمند',
  'Patient': 'بیمار',
  'PatientFamily': 'خانواده بیمار',
  'Family': 'خانواده', // Fallback
  'SuperAdmin': 'سوپر ادمین'
};

export const translateRole = (role?: string): string => {
  if (!role) return '';
  return roleTranslations[role] || role;
};
