"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { AssignmentDto, AssignmentType, ShiftSlot } from "@/types/assignment";
import { assignmentService } from "@/services/assignment.service";
import { toast } from "react-hot-toast";
import { nursePortalService } from "@/services/nurse-portal.service";
import { Loader2, X, Calendar as CalendarIcon } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const schema = z.object({
  patientId: z.string().min(1, "انتخاب بیمار الزامی است"),
  caregiverId: z.string().min(1, "انتخاب پرستار الزامی است"),
  assignmentType: z.string(),
  shiftSlot: z.string().optional(),
  startDate: z.string().min(1, "تاریخ شروع الزامی است"), // We will store ISO string here
  endDate: z.string().optional(),
  isPrimaryCaregiver: z.boolean(),
  notes: z.string().optional()
});

interface AssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AssignmentDto | null;
}

export function AssignmentWizard({ isOpen, onClose, onSuccess, initialData }: AssignmentWizardProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, control, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      caregiverId: "",
      assignmentType: AssignmentType.ShiftBased.toString(),
      shiftSlot: ShiftSlot.Morning.toString(),
      isPrimaryCaregiver: true,
      startDate: "",
      endDate: "",
      notes: ""
    }
  });

  const assignmentType = watch("assignmentType");

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (initialData) {
        // Pre-fill form for editing
        setValue("patientId", initialData.patientId.toString());
        setValue("caregiverId", initialData.caregiverId);
        setValue("assignmentType", initialData.assignmentType.toString());
        if (initialData.shiftSlot) setValue("shiftSlot", initialData.shiftSlot.toString());
        setValue("startDate", initialData.startDate);
        if (initialData.endDate) setValue("endDate", initialData.endDate);
        setValue("isPrimaryCaregiver", initialData.isPrimaryCaregiver);
        setValue("notes", initialData.notes);
      } else {
        reset({
          patientId: "",
          caregiverId: "",
          assignmentType: AssignmentType.ShiftBased.toString(),
          shiftSlot: ShiftSlot.Morning.toString(),
          isPrimaryCaregiver: true,
          startDate: "",
          endDate: "",
          notes: ""
        });
      }
    }
  }, [isOpen, initialData]);

  const fetchData = async () => {
    const patientsData = await nursePortalService.getMyPatients(); 
    setPatients(patientsData);
    
    setCaregivers([
      { id: "nurse-1-id", firstName: "سارا", lastName: "محمدی" },
      { id: "nurse-2-id", firstName: "مریم", lastName: "کاظمی" },
      { id: "nurse-3-id", firstName: "زهرا", lastName: "حسینی" }
    ]);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        patientId: parseInt(data.patientId),
        caregiverId: data.caregiverId,
        assignmentType: parseInt(data.assignmentType),
        shiftSlot: data.shiftSlot ? parseInt(data.shiftSlot) : undefined,
        startDate: data.startDate, 
        endDate: data.endDate || undefined, 
        isPrimaryCaregiver: data.isPrimaryCaregiver,
        notes: data.notes || ""
      };

      if (initialData) {
        await assignmentService.update(initialData.id, payload);
        toast.success("تخصیص با موفقیت ویرایش شد");
      } else {
        await assignmentService.create(payload);
        toast.success("تخصیص با موفقیت ایجاد شد");
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "خطا در عملیات");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">تخصیص پرستار به بیمار</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">بیمار</label>
              <select 
                {...register("patientId")}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                <option value="">انتخاب کنید...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              {errors.patientId && <p className="text-rose-500 text-xs mt-1">{errors.patientId.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">پرستار</label>
              <select 
                {...register("caregiverId")}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                <option value="">انتخاب کنید...</option>
                {caregivers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
              {errors.caregiverId && <p className="text-rose-500 text-xs mt-1">{errors.caregiverId.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع تخصیص</label>
              <select 
                {...register("assignmentType")}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                <option value={AssignmentType.Daily}>روزانه</option>
                <option value={AssignmentType.Monthly}>ماهانه</option>
                <option value={AssignmentType.ShiftBased}>شیفتی</option>
                <option value={AssignmentType.TwentyFourHour}>۲۴ ساعته</option>
              </select>
            </div>

            {assignmentType === AssignmentType.ShiftBased.toString() && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نوبت شیفت</label>
                <select 
                  {...register("shiftSlot")}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value={ShiftSlot.Morning}>صبح</option>
                  <option value={ShiftSlot.Evening}>عصر</option>
                  <option value={ShiftSlot.Night}>شب</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ شروع</label>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value ? new Date(value) : undefined}
                    onChange={(date: any) => {
                      // date is a DateObject
                      if (date) {
                        onChange(new Date(date.valueOf()).toISOString());
                      } else {
                        onChange(undefined);
                      }
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-sans"
                    containerClassName="w-full"
                    placeholder="انتخاب تاریخ..."
                  />
                )}
              />
              {errors.startDate && <p className="text-rose-500 text-xs mt-1">{errors.startDate.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ پایان (اختیاری)</label>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value ? new Date(value) : undefined}
                    onChange={(date: any) => {
                      if (date) {
                        onChange(new Date(date.valueOf()).toISOString());
                      } else {
                        onChange(undefined);
                      }
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-sans"
                    containerClassName="w-full"
                    placeholder="انتخاب تاریخ..."
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <input 
              type="checkbox" 
              id="isPrimary" 
              {...register("isPrimaryCaregiver")}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              پرستار اصلی (مسئول پرونده)
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات تکمیلی</label>
            <input 
              {...register("notes")} 
              placeholder="یادداشت‌های ضروری..." 
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={onClose}>انصراف</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {initialData ? "ویرایش تخصیص" : "ثبت تخصیص"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
