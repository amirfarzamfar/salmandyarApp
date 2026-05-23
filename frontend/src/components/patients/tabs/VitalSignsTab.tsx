import { useEffect, useState, useCallback, useMemo } from 'react';
import { patientService } from '@/services/patient.service';
import { VitalSign, CareLevel } from '@/types/patient';
import VitalSignForm from '../VitalSignForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertCircle, X } from 'lucide-react';
import { evaluateVitalAlerts } from '@/utils/vital-alerts';
import {
  createHubConnection,
  isRealtimeEnabled,
  reportSignalRError,
  stopHubConnectionSafely,
} from '@/lib/network';

interface Props {
  patientId: number;
  careLevel?: CareLevel;
}

export default function VitalSignsTab({ patientId, careLevel = CareLevel.Level2 }: Props) {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nextDue, setNextDue] = useState<Date | null>(null);
  const [selectedCareLevel, setSelectedCareLevel] = useState<CareLevel>(careLevel);
  const [now, setNow] = useState(new Date());
  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);

  const expectedTime = useMemo(() => nextDue || new Date(), [nextDue]);
  const vitalsDesc = useMemo(
    () => [...vitals].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()),
    [vitals]
  );
  const alerts = useMemo(() => evaluateVitalAlerts(vitalsDesc), [vitalsDesc]);
  const alertKey = useMemo(() => alerts.map(a => `${a.code}:${a.severity}`).join('|'), [alerts]);
  const showAlertBanner = alerts.length > 0 && dismissedAlertKey !== alertKey;

  useEffect(() => {
    setSelectedCareLevel(careLevel);
  }, [careLevel]);

  // Live timer to update 'now' every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchVitals = useCallback(async () => {
    try {
      const data = await patientService.getVitals(patientId);
      setVitals(data);
    } catch {
      // Mock for preview if API fails
      console.warn("Failed to fetch vitals, using mock data");
      setVitals([
        { id: 1, recordedAt: new Date().toISOString(), measuredAt: new Date().toISOString(), isLateEntry: false, recorderName: 'Nurse 1', systolicBloodPressure: 120, diastolicBloodPressure: 80, meanArterialPressure: 93, pulseRate: 72, respiratoryRate: 18, bodyTemperature: 36.5, oxygenSaturation: 98 }
      ]);
    }
  }, [patientId]);

  // Calculate Next Due based on Last Measured Time + Care Level Interval
  useEffect(() => {
    if (vitals.length > 0) {
      // Sort by measuredAt descending (newest first)
      const sortedVitals = [...vitals].sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
      const lastMeasured = new Date(sortedVitals[0].measuredAt);
      
      const intervalMs = selectedCareLevel * 60 * 60 * 1000;
      const nextSlot = lastMeasured.getTime() + intervalMs;
      
      setNextDue(new Date(nextSlot));
    } else {
      setNextDue(null);
    }
  }, [vitals, selectedCareLevel]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  useEffect(() => {
    if (!patientId || !isRealtimeEnabled()) return;

    const connection = createHubConnection({
      hubPath: '/serviceHub',
    });
    let isActive = true;
    let startPromise: Promise<void> | null = null;

    const startConnection = async () => {
      try {
        startPromise = connection.start();
        await startPromise;
        if (!isActive) {
          await stopHubConnectionSafely(connection);
          return;
        }

        await connection.invoke("JoinPatientGroup", patientId.toString());
        connection.on("ReceiveVitalUpdate", () => {
          fetchVitals();
        });
      } catch (err) {
        if (isActive) {
          reportSignalRError("SignalR vital connection error", err);
        }
      } finally {
        startPromise = null;
      }
    };

    void startConnection();

    return () => {
      isActive = false;
      connection.off("ReceiveVitalUpdate");
      void stopHubConnectionSafely(connection, startPromise);
    };
  }, [patientId, fetchVitals]);

  const handleCareLevelChange = (level: CareLevel) => {
    setSelectedCareLevel(level);
  };

  // Chart Data Preparation
  const chartData = [...vitals].reverse().map(v => ({
    time: new Date(v.measuredAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    sbp: v.systolicBloodPressure,
    dbp: v.diastolicBloodPressure,
    hr: v.pulseRate,
    temp: v.bodyTemperature
  }));

  const getTimeStatus = () => {
    if (!nextDue) return { text: 'هنوز ثبتی انجام نشده', color: 'text-gray-500', bg: 'bg-gray-100' };
    
    const diff = nextDue.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const nextTimeStr = nextDue.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    if (diff < 0) return { text: `تاخیر: ${Math.abs(hours)} ساعت`, color: 'text-red-600', bg: 'bg-red-50' };
    if (diff < 3600000) return { text: `کمتر از ۱ ساعت مانده (نوبت بعدی: ${nextTimeStr})`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    
    return { 
        text: `${hours} ساعت و ${minutes} دقیقه تا نوبت بعد (${nextTimeStr})`, 
        color: 'text-teal-600', 
        bg: 'bg-teal-50' 
    };
  };

  // Helper to determine compliance status
  const getComplianceStatus = (current: VitalSign, prev: VitalSign | undefined) => {
      if (!prev) return { label: 'اولین ثبت', color: 'bg-gray-100 text-gray-600' };

      const diffMs = new Date(current.measuredAt).getTime() - new Date(prev.measuredAt).getTime();
      const intervalMs = selectedCareLevel * 60 * 60 * 1000;
      const tolerance = 30 * 60 * 1000; // 30 mins tolerance

      // Just for display logic: 
      // We assume the care level WAS the same. This is a limitation but best we can do.
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const timeStr = `${diffHours} ساعت و ${diffMins} دقیقه`;

      if (Math.abs(diffMs - intervalMs) <= tolerance) {
          return { label: 'به موقع', color: 'bg-green-100 text-green-700', timeStr };
      } else if (diffMs > intervalMs + tolerance) {
          const delay = Math.floor((diffMs - intervalMs) / (1000 * 60));
          return { label: `تاخیر (${delay} دقیقه)`, color: 'bg-red-100 text-red-700', timeStr };
      } else {
          return { label: 'زودتر از موعد', color: 'bg-yellow-100 text-yellow-700', timeStr };
      }
  };

  const status = getTimeStatus();

  return (
    <div className="space-y-6">
      {showAlertBanner && (
        <div className={`relative rounded-xl border p-4 ${alerts.some(a => a.severity === 'Critical') ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <button
            onClick={() => setDismissedAlertKey(alertKey)}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-white/70 hover:bg-white text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${alerts.some(a => a.severity === 'Critical') ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-900">هشدار علائم حیاتی</div>
              <div className="mt-2 text-xs text-gray-700 flex flex-wrap gap-2">
                {alerts.slice(0, 6).map(a => (
                  <span key={a.code} className={`px-2 py-1 rounded-full border ${a.severity === 'Critical' ? 'bg-white border-red-200 text-red-700' : 'bg-white border-amber-200 text-amber-700'}`}>
                    {a.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between ${status.bg}`}>
          <div>
            <p className="text-sm text-gray-500 font-medium">زمان‌بندی ثبت</p>
            <h3 className={`text-lg font-bold mt-1 ${status.color}`}>{status.text}</h3>
          </div>
          <Clock className={`h-8 w-8 ${status.color} opacity-80`} />
        </div>

        <div className="p-4 rounded-xl border bg-white flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">سطح مراقبت</p>
            <div className="mt-2">
              <select
                value={selectedCareLevel}
                onChange={(e) => handleCareLevelChange(Number(e.target.value) as CareLevel)}
                className="border-gray-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value={CareLevel.Level1}>سطح ۱ — هر ۱۲ ساعت</option>
                <option value={CareLevel.Level2}>سطح ۲ — هر ۶ ساعت</option>
                <option value={CareLevel.Level3}>سطح ۳ — هر ۴ ساعت</option>
                <option value={CareLevel.Level4}>سطح ۴ — هر ۲ ساعت</option>
                <option value={CareLevel.Level5}>سطح ۵ — هر ۱ ساعت</option>
              </select>
            </div>
          </div>
          <Activity className="h-8 w-8 text-blue-500 opacity-80" />
        </div>
        
        <div className="flex items-center justify-end">
           <button 
             onClick={() => setShowForm(true)}
             className="w-full md:w-auto h-full px-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-shadow shadow-md flex items-center justify-center font-bold"
           >
             <Activity className="ml-2 h-5 w-5" />
             ثبت علائم حیاتی جدید
           </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <VitalSignForm 
                patientId={patientId} 
                expectedTime={expectedTime}
                onSuccess={() => { setShowForm(false); fetchVitals(); }} 
                onCancel={() => setShowForm(false)} 
              />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">روند تغییرات ۲۴ ساعت گذشته</h3>
        <div className="h-[300px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontFamily: 'var(--font-vazirmatn)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="sbp" name="فشار سیستول" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="dbp" name="فشار دیاستول" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="hr" name="ضربان قلب" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="temp" name="دما" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
           <h3 className="font-bold text-gray-800">تاریخچه کامل</h3>
           <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">دانلود خروجی CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-medium text-gray-500">زمان ثبت</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">BP (mmHg)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">MAP</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">HR (bpm)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Temp (°C)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">SpO2 (%)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">GCS</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">پرستار</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">فاصله زمانی</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vitals.map((v, index) => {
                const prev = vitals[index + 1]; // Since vitals are reversed (newest first)
                const compliance = getComplianceStatus(v, prev);
                
                return (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(v.measuredAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-xs text-gray-400">{new Date(v.measuredAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700" dir="ltr">{v.systolicBloodPressure}/{v.diastolicBloodPressure}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{v.meanArterialPressure}</td>
                  <td className="px-4 py-3">{v.pulseRate}</td>
                  <td className="px-4 py-3">
                    <span className={`${v.bodyTemperature > 37.5 ? 'text-red-600 font-bold' : ''}`}>{v.bodyTemperature}</span>
                  </td>
                  <td className="px-4 py-3">
                     <span className={`${v.oxygenSaturation < 95 ? 'text-red-600 font-bold' : ''}`}>{v.oxygenSaturation}%</span>
                  </td>
                  <td className="px-4 py-3">{v.glasgowComaScale || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.recorderName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500">{compliance.timeStr || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${compliance.color} inline-block whitespace-nowrap`}>
                        {compliance.label}
                    </span>
                    {v.isLateEntry && (
                      <div className="group relative inline-flex mr-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 cursor-help" />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 z-10">
                          ثبت با تاخیر: {v.delayReason || 'بدون دلیل'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
