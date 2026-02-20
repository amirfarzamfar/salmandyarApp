import { useEffect, useState } from 'react';
import { patientService } from '@/services/patient.service';
import { userService, UserListDto } from '@/services/user.service';
import { serviceCatalogService } from '@/services/service-catalog.service';
import { serviceReminderService, ServiceReminder } from '@/services/service-reminder.service';
import { CareService } from '@/types/patient';
import { ServiceDefinition, CareServiceStatus, ServiceCategory } from '@/types/service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { careServiceFormSchema, CareServiceFormValues } from '@/components/patients/CareServiceFormSchema';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { Plus, CheckCircle, Clock, XCircle, AlertCircle, Bell, Calendar, ChevronDown } from 'lucide-react';
import ServiceReminderForm from '../ServiceReminderForm';

export default function CareServicesTab({ patientId }: { patientId: number }) {
  const [services, setServices] = useState<CareService[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [definitions, setDefinitions] = useState<ServiceDefinition[]>([]);
  const [performers, setPerformers] = useState<UserListDto[]>([]);
  const [performerSearch, setPerformerSearch] = useState('');
  const [isPerformerOpen, setIsPerformerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'reminders'>('history');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CareServiceFormValues>({
    resolver: zodResolver(careServiceFormSchema),
    defaultValues: {
      performedAt: new Date().toISOString(),
    }
  });

  useEffect(() => {
    fetchData();

    if (!patientId) return;

    const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5016/serviceHub", {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

    const startConnection = async () => {
        try {
            await connection.start();
            await connection.invoke("JoinPatientGroup", patientId.toString());
            
            connection.on("ReceiveServiceUpdate", () => {
                fetchData();
            });
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
        }
    };
    
    startConnection();

    return () => {
        connection.stop();
    };
  }, [patientId]);

  const fetchData = async () => {
    try {
      const [servicesData, definitionsData, remindersData, usersData] = await Promise.all([
        patientService.getServices(patientId),
        serviceCatalogService.getAll(),
        serviceReminderService.getAll(patientId),
        userService.getUsers({ pageNumber: 1, pageSize: 100, isActive: true })
      ]);
      setServices(servicesData);
      setDefinitions(definitionsData.filter(d => d.isActive));
      setReminders(remindersData);
      setPerformers(usersData.items);
    } catch (error) {
      console.error(error);
      setServices([]);
      setDefinitions([]);
      setReminders([]);
      setPerformers([]);
    }
  };

  const onSubmit = async (data: CareServiceFormValues) => {
    try {
      await patientService.addService({
        careRecipientId: patientId,
        serviceDefinitionId: data.serviceDefinitionId,
        performedAt: data.performedAt,
        startTime: undefined,
        endTime: undefined,
        description: data.description || '',
        notes: data.notes || '',
        performerId: data.performerId || undefined
      });
      setIsFormOpen(false);
      reset();
      setPerformerSearch('');
      fetchData();
    } catch (error) {
      console.error("Error adding service", error);
      alert("خطا در ثبت خدمت. لطفاً مجدداً تلاش کنید.");
    }
  };

  const getStatusBadge = (status: CareServiceStatus) => {
    switch (status) {
      case CareServiceStatus.Completed:
        return <span className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 ml-1" /> انجام شده</span>;
      case CareServiceStatus.Planned:
        return <span className="flex items-center text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3 ml-1" /> برنامه‌ریزی شده</span>;
      case CareServiceStatus.Canceled:
        return <span className="flex items-center text-red-600 text-xs bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3 ml-1" /> لغو شده</span>;
      default:
        return null;
    }
  };

  const ReminderTimeline = () => (
    <div className="relative border-r border-gray-200 mr-4 space-y-8 py-4">
        {reminders.length === 0 ? (
             <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 ml-4">
                هنوز یادآوری تنظیم نشده است.
            </div>
        ) : (
            reminders.map((reminder) => {
                const isPast = new Date(reminder.scheduledTime) < new Date();
                const statusColor = reminder.isSent ? 'bg-green-500' : isPast ? 'bg-red-500' : 'bg-blue-500';
                
                return (
                    <div key={reminder.id} className="relative">
                        {/* Timeline Dot */}
                        <div className={`absolute -right-1.5 top-4 w-3 h-3 rounded-full ${statusColor} ring-4 ring-white`}></div>
                        
                        {/* Content Card */}
                        <div className="mr-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-1 h-full ${statusColor}`}></div>
                            
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{reminder.serviceTitle}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${reminder.isSent ? 'bg-green-50 text-green-700' : isPast ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {reminder.isSent ? 'ارسال شده' : isPast ? 'سررسید شده' : 'در انتظار'}
                                </span>
                            </div>
                            
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                                <Calendar className="w-4 h-4 ml-2" />
                                {new Date(reminder.scheduledTime).toLocaleDateString('fa-IR')} 
                                <span className="mx-2">|</span>
                                <Clock className="w-4 h-4 ml-2" />
                                {new Date(reminder.scheduledTime).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            
                            {reminder.note && (
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                                    {reminder.note}
                                </p>
                            )}
                            
                            <div className="flex gap-2 text-xs text-gray-400 border-t pt-2">
                                <span>گیرندگان:</span>
                                {reminder.notifyPatient && <span className="bg-gray-100 px-2 rounded">بیمار</span>}
                                {reminder.notifyAdmin && <span className="bg-gray-100 px-2 rounded">ادمین</span>}
                                {reminder.notifySupervisor && <span className="bg-gray-100 px-2 rounded">سوپروایزر</span>}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b">
        <button 
            className={`pb-3 px-4 font-medium transition-colors relative ${activeSubTab === 'history' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSubTab('history')}
        >
            تاریخچه خدمات
            {activeSubTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>}
        </button>
        <button 
            className={`pb-3 px-4 font-medium transition-colors relative ${activeSubTab === 'reminders' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSubTab('reminders')}
        >
            یادآوری‌ها
            {activeSubTab === 'reminders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">
            {activeSubTab === 'history' ? 'خدمات انجام شده' : 'برنامه زمان‌بندی و یادآوری‌ها'}
        </h3>
        
        {activeSubTab === 'history' ? (
            <button 
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-teal-700 transition-colors"
            >
                <Plus className="w-4 h-4 ml-2" />
                {isFormOpen ? 'بستن فرم' : 'ثبت خدمت جدید'}
            </button>
        ) : (
            <button 
                onClick={() => setIsReminderFormOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                <Bell className="w-4 h-4 ml-2" />
                تنظیم یادآور جدید
            </button>
        )}
      </div>

      {/* Reminder Form Modal */}
      {isReminderFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <ServiceReminderForm 
                patientId={patientId}
                definitions={definitions}
                onSuccess={() => { setIsReminderFormOpen(false); fetchData(); }}
                onCancel={() => setIsReminderFormOpen(false)}
            />
        </div>
      )}

      {/* Service History Form */}
      {isFormOpen && activeSubTab === 'history' && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">فرم ثبت خدمت</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع خدمت</label>
                        <select 
                            {...register('serviceDefinitionId', { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="">انتخاب کنید...</option>
                            {definitions.map(d => (
                                <option key={d.id} value={d.id}>{d.title}</option>
                            ))}
                        </select>
                        {errors.serviceDefinitionId && <p className="text-red-500 text-xs mt-1">{errors.serviceDefinitionId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ انجام</label>
                        <Controller
                          control={control}
                          name="performedAt"
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              value={value ? new Date(value) : new Date()}
                              onChange={(date: any) => {
                                if (date && date.isValid) {
                                  onChange(date.toDate().toISOString());
                                }
                              }}
                              calendar={persian}
                              locale={persian_fa}
                              calendarPosition="bottom-right"
                              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-center"
                              containerStyle={{ width: "100%" }}
                            />
                          )}
                        />
                         {errors.performedAt && <p className="text-red-500 text-xs mt-1">{errors.performedAt.message}</p>}
                    </div>
                </div>
                
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">پرستار/مسئول (اختیاری)</label>
                    <Controller
                        control={control}
                        name="performerId"
                        render={({ field: { onChange, value } }) => {
                            const selectedUser = performers.find(u => u.id === value);
                            
                            return (
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pr-3 pl-10 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="جستجو و انتخاب..."
                                        value={isPerformerOpen ? performerSearch : (selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : performerSearch)}
                                        onChange={(e) => {
                                            setPerformerSearch(e.target.value);
                                            setIsPerformerOpen(true);
                                            if (!e.target.value) onChange(undefined);
                                        }}
                                        onFocus={() => {
                                            setIsPerformerOpen(true);
                                            if (selectedUser) setPerformerSearch(`${selectedUser.firstName} ${selectedUser.lastName}`);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setIsPerformerOpen(false), 200);
                                        }}
                                    />
                                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    
                                    {isPerformerOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {performers.filter(u => 
                                                `${u.firstName} ${u.lastName} ${u.role}`.includes(performerSearch)
                                            ).map(u => (
                                                <div
                                                    key={u.id}
                                                    className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm border-b last:border-0"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        onChange(u.id);
                                                        setPerformerSearch(`${u.firstName} ${u.lastName}`);
                                                        setIsPerformerOpen(false);
                                                    }}
                                                >
                                                    <div className="font-medium text-gray-800">{u.firstName} {u.lastName}</div>
                                                    <div className="text-xs text-gray-500">{u.role}</div>
                                                </div>
                                            ))}
                                            {performers.filter(u => `${u.firstName} ${u.lastName} ${u.role}`.includes(performerSearch)).length === 0 && (
                                                <div className="px-4 py-2 text-sm text-gray-500">کاربری یافت نشد</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                    <textarea 
                        {...register('description')}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        placeholder="توضیحات تکمیلی..."
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'در حال ثبت...' : 'ثبت نهایی'}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* Content Area */}
      {activeSubTab === 'history' ? (
          <div className="space-y-4">
            {services.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    هنوز خدمتی ثبت نشده است.
                </div>
            ) : (
                services.map(s => (
                <div key={s.id} className="bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{s.serviceTitle}</h4>
                            {getStatusBadge(s.status)}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                        {s.notes && <p className="text-xs text-gray-500 mt-1 italic">یادداشت: {s.notes}</p>}
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-1 text-sm text-gray-500 min-w-[150px] border-t md:border-t-0 md:border-r border-gray-100 md:pr-4 pt-2 md:pt-0">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(s.performedAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <span>انجام دهنده:</span>
                            <span className="font-medium text-gray-700">{s.performerName}</span>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
      ) : (
          <ReminderTimeline />
      )}
    </div>
  );
}
