import { useEffect, useState } from 'react';
import { patientService } from '@/services/patient.service';
import { CareService, NursingReport, VitalSign } from '@/types/patient';

type TimelineItem = {
    type: 'vital' | 'service' | 'report';
    date: Date;
    title: string;
    description: string;
    author: string;
};

export default function TimelineTab({ patientId }: { patientId: number }) {
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
        // In real app, we might have a dedicated timeline endpoint or fetch all and merge
        try {
            const [vitals, services, reports] = await Promise.all([
                patientService.getVitals(patientId).catch(() => [] as VitalSign[]),
                patientService.getServices(patientId).catch(() => [] as CareService[]),
                patientService.getReports(patientId).catch(() => [] as NursingReport[])
            ]);

            const timelineItems: TimelineItem[] = [
                ...vitals.map(v => ({
                    type: 'vital' as const,
                    date: new Date(v.recordedAt),
                    title: 'ثبت علائم حیاتی',
                    description: `BP: ${v.systolicBloodPressure}/${v.diastolicBloodPressure}, Pulse: ${v.pulseRate}`,
                    author: v.recorderName
                })),
                ...services.map(s => ({
                    type: 'service' as const,
                    date: new Date(s.performedAt),
                    title: `خدمت: ${s.serviceType}`,
                    description: s.description,
                    author: s.performerName
                })),
                ...reports.map(r => ({
                    type: 'report' as const,
                    date: new Date(r.createdAt),
                    title: 'گزارش پرستاری',
                    description: r.content,
                    author: r.authorName
                }))
            ].sort((a, b) => b.date.getTime() - a.date.getTime());

            setItems(timelineItems);
        } catch {
             // Mock
             setItems([
                 { type: 'vital', date: new Date(), title: 'ثبت علائم حیاتی', description: 'BP: 120/80', author: 'Nurse 1' }
             ]);
        }
    };
    fetch();
  }, [patientId]);

  return (
    <div className="relative border-r border-gray-200 mr-4">
      {items.map((item, idx) => (
        <div key={idx} className="mb-8 mr-6 relative">
          <div className={`absolute -right-9 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
              item.type === 'vital' ? 'border-red-500' : 
              item.type === 'service' ? 'border-blue-500' : 'border-green-500'
          }`}>
              <div className={`w-2 h-2 rounded-full ${
                   item.type === 'vital' ? 'bg-red-500' : 
                   item.type === 'service' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
             <div className="flex justify-between">
                 <h4 className="font-bold text-gray-900">{item.title}</h4>
                 <span className="text-xs text-gray-500">{item.date.toLocaleString('fa-IR')}</span>
             </div>
             <p className="text-sm text-gray-600 mt-1">{item.description}</p>
             <p className="text-xs text-gray-400 mt-2 text-left">{item.author}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
