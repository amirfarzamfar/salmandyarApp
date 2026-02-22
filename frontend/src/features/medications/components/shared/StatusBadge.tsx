import { cn } from '@/lib/utils';
import { DoseStatus } from '@/types/medication';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DoseStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    [DoseStatus.Scheduled]: {
      label: 'Scheduled',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock,
    },
    [DoseStatus.Taken]: {
      label: 'Taken',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: Check,
    },
    [DoseStatus.Missed]: {
      label: 'Missed',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: X,
    },
    [DoseStatus.Refused]: {
      label: 'Refused',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: AlertCircle,
    },
    [DoseStatus.Pending]: { // Assuming Pending exists or maps to Scheduled
        label: 'Pending',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: Clock
    }
  };

  const config = statusConfig[status] || statusConfig[DoseStatus.Scheduled];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
};
