"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { CheckCircle2, Clock, CalendarDays, Plus, Timer, MoreVertical, X, Save, Loader2, Bell, Trash2, Edit2, AlertCircle, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { serviceReminderService, ServiceReminder } from "@/services/service-reminder.service";
import { serviceCatalogService } from "@/services/service-catalog.service";
import { CareService, PatientList } from "@/types/patient";
import { ServiceDefinition, CareServiceStatus } from "@/types/service";
import { toast } from "react-hot-toast";
import ServiceReminderForm from "@/components/patients/ServiceReminderForm";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { careServiceFormSchema, CareServiceFormValues } from "@/components/patients/CareServiceFormSchema";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import Swal from 'sweetalert2';

export function ServiceTracker({ patientId }: { patientId?: number }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'reminders'>('today');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<CareService[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [definitions, setDefinitions] = useState<ServiceDefinition[]>([]);
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [editingService, setEditingService] = useState<CareService | null>(null);
  const [editingReminder, setEditingReminder] = useState<ServiceReminder | null>(null);

  const isGlobalMode = !patientId;

  // Form setup for Service
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CareServiceFormValues>({
    resolver: zodResolver(careServiceFormSchema),
    defaultValues: {
        performedAt: new Date().toISOString(),
    }
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  useEffect(() => {
    if (editingService) {
        if (isGlobalMode) {
             // We need to map the careRecipientId if in global mode
             // Since CareService type might not have careRecipientId explicitly exposed in frontend type but backend returns it, 
             // let's assume we can get it. If not, we need to ensure backend DTO has it.
             // Looking at CareServiceDto in backend, it has CareRecipientId.
             // Looking at frontend type CareService, it doesn't have it. I should add it to type if missing.
             // It's missing in frontend type. I'll cast it for now or rely on backend data.
             const s = editingService as any;
             setValue('careRecipientId', s.careRecipientId);
        }
        setValue('serviceDefinitionId', editingService.serviceDefinitionId);
        setValue('performedAt', editingService.performedAt as any);
        setValue('startTime', editingService.startTime as any);
        setValue('endTime', editingService.endTime as any);
        setValue('description', editingService.description);
        setValue('notes', editingService.notes);
        setIsAdding(true);
    } else {
        reset({ performedAt: new Date().toISOString() });
    }
  }, [editingService, setValue, reset, isGlobalMode]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      let fetchedServices: CareService[] = [];
      let fetchedReminders: ServiceReminder[] = [];

      if (patientId) {
          const [servicesData, remindersData] = await Promise.all([
            nursePortalService.getPatientServices(patientId),
            serviceReminderService.getAll(patientId)
          ]);
          fetchedServices = servicesData;
          fetchedReminders = remindersData;
      } else {
          // Global mode: fetch all patients then aggregate (since no bulk endpoint yet)
          const myPatients = await nursePortalService.getMyPatients();
          setPatients(myPatients);

          const servicesPromises = myPatients.map(p => nursePortalService.getPatientServices(p.id).then(res => res.map(s => ({...s, careRecipientId: p.id, patientName: `${p.firstName} ${p.lastName}`} as any))));
          const remindersPromises = myPatients.map(p => serviceReminderService.getAll(p.id).then(res => res.map(r => ({...r, careRecipientId: p.id, patientName: `${p.firstName} ${p.lastName}`} as any))));

          const servicesResults = await Promise.all(servicesPromises);
          const remindersResults = await Promise.all(remindersPromises);

          fetchedServices = servicesResults.flat();
          fetchedReminders = remindersResults.flat();
      }

      const definitionsData = await serviceCatalogService.getAll();
      
      setServices(fetchedServices);
      setReminders(fetchedReminders);
      setDefinitions(definitionsData.filter(d => d.isActive));

    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  const onServiceSubmit = async (data: CareServiceFormValues) => {
    try {
      const targetPatientId = patientId || data.careRecipientId;
      if (!targetPatientId) {
          toast.error("لطفاً بیمار را انتخاب کنید");
          return;
      }

      const payload = {
        careRecipientId: targetPatientId,
        serviceDefinitionId: data.serviceDefinitionId,
        performedAt: data.performedAt,
        startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
        description: data.description || '',
        notes: data.notes || '',
        status: CareServiceStatus.Planned
      };

      if (editingService) {
         await nursePortalService.updateService(editingService.id, { ...payload, status: editingService.status });
         toast.success("خدمت با موفقیت ویرایش شد");
      } else {
         await nursePortalService.addService(targetPatientId, payload);
         toast.success("خدمت جدید با موفقیت ثبت شد");
      }
      
      setIsAdding(false);
      setEditingService(null);
      reset();
      fetchData();
    } catch (error) {
      console.error("Error saving service", error);
      toast.error("خطا در ذخیره خدمت");
    }
  };

  const handleDeleteService = async (id: number) => {
      if (await confirmDelete()) {
          try {
              await nursePortalService.deleteService(id);
              toast.success("خدمت حذف شد");
              fetchData();
          } catch (error) {
              toast.error("خطا در حذف خدمت");
          }
      }
  };

  const handleDeleteReminder = async (id: number) => {
      if (await confirmDelete()) {
          try {
              await serviceReminderService.delete(id);
              toast.success("یادآور حذف شد");
              fetchData();
          } catch (error) {
              toast.error("خطا در حذف یادآور");
          }
      }
  };

  const confirmDelete = async () => {
      const result = await Swal.fire({
          title: 'آیا اطمینان دارید؟',
          text: "این عملیات قابل بازگشت نیست!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'بله، حذف شود',
          cancelButtonText: 'انصراف'
      });
      return result.isConfirmed;
  };

  // Filter services based on tab
  const todayServices = services.filter(s => {
      const d = new Date(s.performedAt || s.startTime || '');
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const upcomingServices = services.filter(s => {
      const d = new Date(s.performedAt || s.startTime || '');
      const today = new Date();
      return d > today;
  });
  
  const displayedServices = activeTab === 'today' ? todayServices : upcomingServices;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-medical-500" />
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">برنامه مراقبتی</h2>
            </div>
            
             <button 
                onClick={() => {
                    if (activeTab === 'reminders') {
                        setEditingReminder(null);
                        setIsAdding(true);
                    } else {
                        setEditingService(null);
                        setIsAdding(true);
                    }
                }}
                className="w-10 h-10 rounded-xl bg-medical-500 text-white shadow-glow-medical flex items-center justify-center hover:bg-medical-600 transition-all active:scale-95"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-neutral-warm-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
            {[
                { id: 'today', label: 'امروز' },
                { id: 'upcoming', label: 'آینده' },
                { id: 'reminders', label: 'یادآوری‌ها' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsAdding(false); setEditingService(null); setEditingReminder(null); }}
                    className={cn(
                        "flex-1 min-w-[80px] py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                        activeTab === tab.id 
                            ? "bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm" 
                            : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Reminders List */}
        {activeTab === 'reminders' && (
             <motion.div
                key="reminders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
             >
                {reminders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-medium text-sm border-2 border-dashed border-gray-100 rounded-3xl">
                        یادآوری تنظیم نشده است
                    </div>
                ) : (
                    reminders.map(reminder => (
                        <PortalCard key={reminder.id} className="relative overflow-hidden group">
                             <div className={`absolute top-0 right-0 w-1 h-full ${reminder.isSent ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                             <div className="flex justify-between items-start pl-2">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{reminder.serviceTitle}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                        {isGlobalMode && (reminder as any).patientName && (
                                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                <User className="w-3 h-3" />
                                                <span>{(reminder as any).patientName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />
                                            <span>{new Date(reminder.scheduledTime).toLocaleDateString('fa-IR')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(reminder.scheduledTime).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        {reminder.notifyPatient && <span className="bg-gray-100 dark:bg-gray-700 text-[10px] px-1.5 py-0.5 rounded text-gray-500">بیمار</span>}
                                        {reminder.notifySupervisor && <span className="bg-gray-100 dark:bg-gray-700 text-[10px] px-1.5 py-0.5 rounded text-gray-500">سوپروایزر</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingReminder(reminder); setIsAdding(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteReminder(reminder.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                             </div>
                        </PortalCard>
                    ))
                )}
             </motion.div>
        )}

        {/* Services List */}
        {activeTab !== 'reminders' && (
            <motion.div
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
            >
                {displayedServices.length === 0 ? (
                     <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-medium text-sm border-2 border-dashed border-gray-100 rounded-3xl">
                        خدمتی یافت نشد
                    </div>
                ) : (
                    displayedServices.map(service => (
                        <PortalCard key={service.id} className="relative overflow-hidden group">
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        service.status === CareServiceStatus.Completed ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                                    )}>
                                        {service.status === CareServiceStatus.Completed ? <CheckCircle2 size={24} /> : <Timer size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{service.serviceTitle}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                                            {isGlobalMode && (service as any).patientName && (
                                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                    <User className="w-3 h-3" />
                                                    <span>{(service as any).patientName}</span>
                                                </div>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {service.startTime ? new Date(service.startTime).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) : 'تعیین نشده'}
                                            </span>
                                            {service.performerName && (
                                                <>
                                                    <span>•</span>
                                                    <span>{service.performerName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingService(service); setIsAdding(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteService(service.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                             </div>
                        </PortalCard>
                    ))
                )}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            >
                {/* Service Form */}
                {activeTab !== 'reminders' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">
                                {editingService ? 'ویرایش خدمت' : 'ثبت خدمت جدید'}
                            </h3>
                            <button onClick={() => { setIsAdding(false); setEditingService(null); reset(); }} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onServiceSubmit)} className="space-y-5">
                            {/* Patient Selector for Global Mode */}
                            {isGlobalMode && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">انتخاب بیمار</label>
                                    <select 
                                        {...register('careRecipientId', { valueAsNumber: true, required: 'انتخاب بیمار الزامی است' })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-medical-500 text-sm font-medium"
                                        disabled={!!editingService} // Disable changing patient on edit
                                    >
                                        <option value="">انتخاب کنید...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                        ))}
                                    </select>
                                    {errors.careRecipientId && <p className="text-red-500 text-xs mt-1 mr-1">{errors.careRecipientId.message}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">نوع خدمت</label>
                                <select 
                                    {...register('serviceDefinitionId', { valueAsNumber: true })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-medical-500 text-sm font-medium"
                                >
                                    <option value="">انتخاب کنید...</option>
                                    {definitions.map(d => (
                                        <option key={d.id} value={d.id}>{d.title}</option>
                                    ))}
                                </select>
                                {errors.serviceDefinitionId && <p className="text-red-500 text-xs mt-1 mr-1">{errors.serviceDefinitionId.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">تاریخ</label>
                                    <Controller
                                        control={control}
                                        name="performedAt"
                                        render={({ field: { onChange, value } }) => (
                                            <DatePicker
                                                value={value ? new Date(value) : new Date()}
                                                onChange={(date: any) => onChange(date?.toDate().toISOString())}
                                                calendar={persian}
                                                locale={persian_fa}
                                                inputClass="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-medical-500 text-sm font-medium text-center"
                                                containerClassName="w-full"
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">ساعت شروع</label>
                                    <Controller
                                        control={control}
                                        name="startTime"
                                        render={({ field: { onChange, value } }) => (
                                            <DatePicker
                                                disableDayPicker
                                                format="HH:mm"
                                                plugins={[<TimePicker key="time" />]} 
                                                value={value ? new Date(value) : undefined}
                                                onChange={(date: any) => onChange(date?.toDate().toISOString())}
                                                calendar={persian}
                                                locale={persian_fa}
                                                inputClass="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-medical-500 text-sm font-medium text-center"
                                                containerClassName="w-full"
                                                placeholder="--:--"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">توضیحات</label>
                                <textarea 
                                    {...register('description')}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-medical-500 text-sm font-medium resize-none placeholder-gray-400"
                                    placeholder="توضیحات تکمیلی..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-4 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl font-black text-sm shadow-glow-medical transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                {editingService ? 'ویرایش خدمت' : 'ثبت خدمت'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Reminder Form */}
                {activeTab === 'reminders' && (
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem]">
                        <ServiceReminderForm 
                            patientId={patientId || 0} // Will be handled inside form if 0
                            definitions={definitions}
                            initialData={editingReminder || undefined}
                            onSuccess={() => { setIsAdding(false); setEditingReminder(null); fetchData(); }}
                            onCancel={() => { setIsAdding(false); setEditingReminder(null); }}
                            isGlobalMode={isGlobalMode}
                            patients={patients}
                        />
                    </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
