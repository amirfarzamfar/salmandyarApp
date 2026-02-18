"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Patient, CareLevel } from "@/types/patient";
import { User, Calendar, Activity, MapPin, FileText, Stethoscope, HeartPulse, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export function PatientDetailsModal({ isOpen, onClose, patient }: PatientDetailsModalProps) {
  if (!patient) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
        
        {/* Header Background */}
        <div className="relative h-32 bg-gradient-to-r from-teal-500 to-emerald-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                             <User className="w-12 h-12 text-gray-400" />
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>
        </div>

        <div className="pt-14 pb-8 px-6 md:px-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{patient.firstName} {patient.lastName}</h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                        {getCareLevelLabel(patient.careLevel)}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                        سن: {patient.age} سال
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InfoItem icon={Activity} label="تشخیص اولیه" value={patient.primaryDiagnosis} className="md:col-span-2 bg-blue-50/50 border-blue-100" />
                <InfoItem icon={HeartPulse} label="وضعیت فعلی" value={patient.currentStatus} />
                <InfoItem icon={Stethoscope} label="پرستار مسئول" value={patient.responsibleNurseName || "تعیین نشده"} />
                <InfoItem icon={Calendar} label="تاریخ تولد" value={new Date(patient.dateOfBirth).toLocaleDateString('fa-IR')} />
                <InfoItem icon={MapPin} label="آدرس" value={patient.address} />
            </div>

            <div className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                        <FileText size={16} />
                        <h3>سوابق پزشکی</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {patient.medicalHistory || "سابقه‌ای ثبت نشده است."}
                    </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-sm">
                        <ShieldCheck size={16} />
                        <h3>نیازهای ویژه</h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {patient.needs || "مورد خاصی ثبت نشده است."}
                    </p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
