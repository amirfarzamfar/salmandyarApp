"use client";

import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { AssignmentDto } from "@/types/assignment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns-jalali";
import { Loader2 } from "lucide-react";

interface ShiftAuditModalProps {
  assignment: AssignmentDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShiftAuditModal({ assignment, isOpen, onClose }: ShiftAuditModalProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['shift-audit', assignment?.id],
    queryFn: () => assignment ? assignmentService.getAuditLogs(assignment.id) : Promise.resolve([]),
    enabled: !!assignment && isOpen
  });

  const translateAction = (action: string) => {
    switch (action) {
      case "Create": return "ایجاد شیفت";
      case "Update": return "ویرایش اطلاعات";
      case "UpdateStatus": return "تغییر وضعیت";
      default: return action;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>تاریخچه تغییرات شیفت</DialogTitle>
          <DialogDescription>
            {assignment && `شیفت ${assignment.caregiverName} برای ${assignment.patientName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log: any, idx: number) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2 border-b pb-2 dark:border-gray-700">
                    <div>
                      <span className="font-bold text-teal-700 dark:text-teal-400">{translateAction(log.action)}</span>
                      <span className="text-xs text-gray-500 mr-2">توسط: {log.userId || 'سیستم'}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium" dir="ltr">
                      {format(new Date(log.createdAt), 'yyyy/MM/dd HH:mm:ss')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
                      {JSON.stringify(JSON.parse(log.details || '{}'), null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              تاریخچه‌ای برای این شیفت ثبت نشده است.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
