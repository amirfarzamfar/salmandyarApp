import { useMemo, useState } from 'react';
import { X, History, BellRing, Save } from 'lucide-react';
import { Medication, MedicationInventoryTransactionType } from '@/types/medication';
import {
  useMedicationAlertHistory,
  useMedicationInventoryTransactions,
  useUpdateMedicationInventory,
} from '../../hooks/useMedications';
import { StockStatusBadge } from '../shared/StockStatusBadge';
import { toast } from 'react-hot-toast';

interface InventoryManagementModalProps {
  medication: Medication;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryManagementModal = ({ medication, isOpen, onClose }: InventoryManagementModalProps) => {
  const [transactionType, setTransactionType] = useState<MedicationInventoryTransactionType>(MedicationInventoryTransactionType.ManualIncrease);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'alerts'>('transactions');

  const { data: transactions, isLoading: transactionsLoading } = useMedicationInventoryTransactions(isOpen ? medication.id : undefined);
  const { data: alerts, isLoading: alertsLoading } = useMedicationAlertHistory(isOpen ? medication.id : undefined);
  const { mutateAsync: updateInventory, isPending } = useUpdateMedicationInventory();

  const quantityLabel = useMemo(() => {
    return transactionType === MedicationInventoryTransactionType.Adjustment ? 'موجودی نهایی' : 'مقدار';
  }, [transactionType]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (quantity < 0) {
      toast.error('مقدار نمی‌تواند منفی باشد.');
      return;
    }

    await updateInventory({
      id: medication.id,
      data: {
        transactionType,
        quantity,
        notes,
      },
    });

    toast.success('موجودی دارو به‌روزرسانی شد.');
    setNotes('');
    setQuantity(transactionType === MedicationInventoryTransactionType.Adjustment ? medication.totalQuantity : 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">مدیریت موجودی دارو</h3>
            <p className="mt-1 text-sm text-gray-500">{medication.name} - {medication.dosage}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <StockStatusBadge medication={medication} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3 border">
                <div className="text-gray-500">موجودی فعلی</div>
                <div className="mt-1 text-lg font-bold text-gray-900">{medication.totalQuantity}</div>
              </div>
              <div className="rounded-2xl bg-white p-3 border">
                <div className="text-gray-500">کسر در هر دوز</div>
                <div className="mt-1 text-lg font-bold text-gray-900">{medication.doseQuantity}</div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-white p-4 border">
              <label className="block text-sm font-medium text-gray-700">نوع عملیات</label>
              <select
                value={transactionType}
                onChange={(event) => setTransactionType(Number(event.target.value))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value={MedicationInventoryTransactionType.ManualIncrease}>افزایش موجودی</option>
                <option value={MedicationInventoryTransactionType.ManualDecrease}>کاهش دستی</option>
                <option value={MedicationInventoryTransactionType.Adjustment}>اصلاح موجودی</option>
              </select>

              <label className="block text-sm font-medium text-gray-700">{quantityLabel}</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />

              <label className="block text-sm font-medium text-gray-700">توضیحات</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                placeholder="مثلاً: شارژ مجدد از داروخانه"
              />

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isPending ? 'در حال ثبت...' : 'ثبت تغییر موجودی'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold ${activeTab === 'transactions' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500'}`}
              >
                <History className="h-4 w-4" />
                تاریخچه موجودی
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold ${activeTab === 'alerts' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500'}`}
              >
                <BellRing className="h-4 w-4" />
                تاریخچه هشدارها
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {activeTab === 'transactions' ? (
                transactionsLoading ? (
                  <div className="py-8 text-center text-sm text-gray-500">در حال بارگذاری تراکنش‌ها...</div>
                ) : !transactions?.length ? (
                  <div className="py-8 text-center text-sm text-gray-500">تراکنشی برای این دارو ثبت نشده است.</div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-bold text-gray-900">{item.transactionTypeLabel}</div>
                          <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('fa-IR')}</div>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-4">
                          <div>تغییر: {item.quantityChanged}</div>
                          <div>قبل: {item.quantityBefore}</div>
                          <div>بعد: {item.quantityAfter}</div>
                          <div>کاربر: {item.performedByName || 'سیستم'}</div>
                        </div>
                        {item.notes && <div className="mt-2 text-sm text-gray-700">{item.notes}</div>}
                      </div>
                    ))}
                  </div>
                )
              ) : alertsLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">در حال بارگذاری هشدارها...</div>
              ) : !alerts?.length ? (
                <div className="py-8 text-center text-sm text-gray-500">هشداری برای این دارو ثبت نشده است.</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-bold text-gray-900">{item.channelLabel}</div>
                        <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('fa-IR')}</div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">{item.message}</div>
                      <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                        <div>گیرنده: {item.recipient}</div>
                        <div>نوع: {item.alertTypeLabel}</div>
                        <div>وضعیت: {item.deliveryStatusLabel}</div>
                      </div>
                      {item.errorMessage && <div className="mt-2 text-sm text-red-600">{item.errorMessage}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
