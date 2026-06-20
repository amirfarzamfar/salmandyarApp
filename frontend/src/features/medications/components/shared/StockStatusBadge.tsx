import { Medication, MedicationStockStatus } from '@/types/medication';

interface StockStatusBadgeProps {
  medication: Pick<Medication, 'totalQuantity' | 'alertLimit' | 'stockStatus' | 'stockStatusLabel'>;
  compact?: boolean;
}

export const StockStatusBadge = ({ medication, compact = false }: StockStatusBadgeProps) => {
  const palette =
    medication.stockStatus === MedicationStockStatus.OutOfStock
      ? 'bg-red-50 text-red-700 border-red-200'
      : medication.stockStatus === MedicationStockStatus.LowStock
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${palette}`}>
      <span>{medication.stockStatusLabel}</span>
      <span className={compact ? '' : 'opacity-80'}>
        موجودی: {medication.totalQuantity}
      </span>
      {!compact && medication.alertLimit > 0 && (
        <span className="opacity-70">
          آستانه: {medication.alertLimit}
        </span>
      )}
    </div>
  );
};
