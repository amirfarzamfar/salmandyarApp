"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Patient, CareLevel } from "@/types/patient";
import { User, Calendar, Activity, MapPin, FileText, Stethoscope, HeartPulse, ShieldCheck } from "lucide-react";
import { PatientProfileDto } from "@/services/patient-profile.service";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  profile?: PatientProfileDto | null;
}

export function PatientDetailsModal({ isOpen, onClose, patient, profile }: PatientDetailsModalProps) {
  if (!patient) return null;

  const formatText = (value: string | null | undefined) => {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : "ثبت نشده";
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const m = today.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--;
    return age;
  };

  const formatDateFa = (value: string | null | undefined) => {
    if (!value) return "ثبت نشده";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "ثبت نشده";
    return d.toLocaleDateString("fa-IR");
  };

  const getProfileDateOfBirth = () => {
    const value = profile?.dateOfBirth;
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const profileDob = getProfileDateOfBirth();
  const displayAge = profileDob ? calculateAge(profileDob) : patient.age;
  const displayDob = profileDob ? profileDob.toLocaleDateString("fa-IR") : formatDateFa(patient.dateOfBirth);

  const displayAddress = (() => {
    const full = formatText(profile?.address?.fullAddress);
    if (full !== "ثبت نشده") return full;

    const parts = [profile?.address?.state, profile?.address?.city, profile?.address?.postalCode]
      .map((x) => (x ?? "").trim())
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" - ");

    return formatText(patient.address);
  })();

  const displayMedicalHistory = (() => {
    const mh = profile?.medicalHistory;
    if (!mh) return "ثبت نشده";

    const labels: Array<{ key: keyof typeof mh; label: string }> = [
      { key: "hasDiabetes", label: "دیابت" },
      { key: "hasHypertension", label: "فشار خون" },
      { key: "hasHeartDisease", label: "بیماری قلبی" },
      { key: "hasCOPD", label: "COPD" },
      { key: "hasAsthma", label: "آسم" },
      { key: "hasKidneyFailure", label: "نارسایی کلیه" },
      { key: "hasStroke", label: "سابقه سکته" },
      { key: "hasAlzheimers", label: "آلزایمر" },
      { key: "hasParkinsons", label: "پارکینسون" },
      { key: "hasCancer", label: "سرطان" },
      { key: "hasPsychiatricDisorders", label: "اختلالات روانپزشکی" }
    ];

    const active = labels
      .filter((x) => Boolean(mh[x.key]))
      .map((x) => x.label);

    const other = (mh.otherDiseases ?? "").trim();
    if (other.length > 0) active.push(other);

    if (active.length === 0) return "ثبت نشده";
    return active.join("، ");
  })();

  const displayMedicalNeeds = (() => {
    const items: string[] = [];

    const neededEquipment = profile?.neededHomeMedicalEquipment ?? [];
    items.push(...neededEquipment.filter(Boolean));

    const other = (profile?.otherNeededHomeMedicalEquipment ?? "").trim();
    if (other.length > 0) items.push(other);

    if (profile?.hasHomeOxygen) items.push("اکسیژن خانگی");
    if (profile?.hasVentilator) items.push("ونتیلاتور");
    if (profile?.hasTracheostomy) items.push("تراکئوستومی");
    if (profile?.hasPEG) items.push("PEG");
    if (profile?.hasUrinaryCatheter) items.push("سوند ادراری");
    if (profile?.hasBedsore) items.push("زخم بستر");

    const unique = Array.from(new Set(items.map((x) => x.trim()).filter(Boolean)));
    if (unique.length === 0) return "ثبت نشده";
    return unique.join("، ");
  })();

  const getStatusMeta = (status: string | null | undefined) => {
    switch ((status ?? "").toLowerCase()) {
      case "stable":
        return { label: "پایدار", badgeClassName: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "critical":
        return { label: "بحرانی", badgeClassName: "bg-rose-50 text-rose-700 border-rose-100" };
      case "recovering":
        return { label: "در حال بهبود", badgeClassName: "bg-amber-50 text-amber-800 border-amber-100" };
      default:
        return { label: "نامشخص", badgeClassName: "bg-gray-50 text-gray-700 border-gray-100" };
    }
  };

  const getCareLevelLabel = (level: CareLevel) => {
    switch (level) {
      case CareLevel.Level1: return "سطح ۱ (مراقبت ویژه)";
      case CareLevel.Level2: return "سطح ۲ (مراقبت گسترده)";
      case CareLevel.Level3: return "سطح ۳ (مراقبت متوسط)";
      case CareLevel.Level4: return "سطح ۴ (مراقبت پایه)";
      case CareLevel.Level5: return "سطح ۵ (مراقبت حداقل)";
      default: return "نامشخص";
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | number, className?: string }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 ${className}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const statusMeta = getStatusMeta(patient.currentStatus);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[95vw] md:w-full max-w-2xl bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {/* Header Background */}
        <div className="relative h-28 md:h-32 bg-gradient-to-r from-teal-500 to-emerald-600 overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shadow-xl">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                             <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-4 h-4 md:w-5 md:h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        </div>

        <div className="pt-12 pb-6 px-4 md:pt-14 md:pb-8 md:px-8">
            <div className="text-center mb-6 md:mb-8">
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  {patient.firstName} {patient.lastName}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  جزئیات کامل پرونده بیمار شامل تشخیص، پرستار مسئول، تاریخ تولد، آدرس و نیازهای پزشکی.
                </DialogDescription>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                        {getCareLevelLabel(patient.careLevel)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusMeta.badgeClassName}`}>
                        وضعیت: {statusMeta.label}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                        سن: {displayAge} سال
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                <InfoItem icon={Activity} label="تشخیص" value={formatText(patient.primaryDiagnosis)} className="sm:col-span-2 bg-blue-50/50 border-blue-100" />
                <InfoItem icon={Stethoscope} label="پرستار مسئول" value={formatText(patient.responsibleNurseName ?? "تعیین نشده")} />
                <InfoItem icon={Calendar} label="تاریخ تولد" value={displayDob} />
                <InfoItem icon={MapPin} label="آدرس" value={displayAddress} />
            </div>

            <div className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                        <FileText size={16} />
                        <h3>سوابق پزشکی</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        {displayMedicalHistory}
                    </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-sm">
                        <ShieldCheck size={16} />
                        <h3>نیازهای پزشکی</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        {displayMedicalNeeds}
                    </p>
                </div>

                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                    <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm">
                        <ShieldCheck size={16} />
                        <h3>نیازهای ویژه (ادمین)</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        {formatText(patient.needs)}
                    </p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
