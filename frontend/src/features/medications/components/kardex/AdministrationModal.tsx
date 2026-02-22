import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Assuming shadcn dialog exists or I'll use standard if not
import { Button } from "@/components/ui/button"; // Assuming shadcn button exists
import { Textarea } from "@/components/ui/textarea"; // Assuming shadcn textarea exists
import { useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";

// Fallback UI components if shadcn not present
const FallbackDialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};

const FallbackButton = ({ children, className, onClick, variant = 'primary', ...props }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-600"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick} {...props}>{children}</button>;
};

interface AdministrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dose: any; // Type this properly later
  onAdminister: (note?: string) => void;
  onSkip: (reason: string) => void;
}

export const AdministrationModal = ({ isOpen, onClose, dose, onAdminister, onSkip }: AdministrationModalProps) => {
  const [note, setNote] = useState("");
  const [action, setAction] = useState<'administer' | 'skip' | null>(null);

  if (!dose) return null;

  const handleConfirm = () => {
    if (action === 'administer') {
      onAdminister(note);
    } else if (action === 'skip') {
      onSkip(note);
    }
    onClose();
  };

  return (
    <FallbackDialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">ثبت مصرف دارو</h3>
            <p className="text-sm text-gray-500 mt-1">آیا از تزریق/مصرف این دارو اطمینان دارید؟</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex gap-4 items-center">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <img src="/icons/pill.svg" alt="" className="w-8 h-8 opacity-50" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/32')} />
          </div>
          <div>
            <h4 className="font-bold text-teal-900 text-lg">{dose.medicationName}</h4>
            <p className="text-teal-700 font-mono">{dose.dosage} - {dose.route}</p>
          </div>
        </div>

        {/* Action Selection */}
        {!action ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAction('administer')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-teal-100 bg-teal-50/50 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
            >
              <div className="p-3 bg-teal-100 text-teal-600 rounded-full group-hover:scale-110 transition-transform">
                <Check className="w-6 h-6" />
              </div>
              <span className="font-bold text-teal-900">مصرف شد</span>
            </button>

            <button
              onClick={() => setAction('skip')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-red-100 bg-red-50/50 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              <div className="p-3 bg-red-100 text-red-600 rounded-full group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="font-bold text-red-900">عدم مصرف</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              {action === 'administer' ? (
                <>
                  <Check className="w-4 h-4 text-teal-600" />
                  یادداشت پرستاری (اختیاری):
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  علت عدم مصرف (الزامی):
                </>
              )}
            </div>
            
            <textarea
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-teal-200 outline-none resize-none"
              rows={3}
              placeholder={action === 'skip' ? "مثلاً: بیمار خواب بود، امتناع کرد..." : "توضیحات تکمیلی..."}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <FallbackButton variant="ghost" onClick={() => setAction(null)} className="flex-1">
                بازگشت
              </FallbackButton>
              <FallbackButton
                variant={action === 'administer' ? 'primary' : 'destructive'}
                className="flex-1"
                disabled={action === 'skip' && !note.trim()}
                onClick={handleConfirm}
              >
                ثبت نهایی
              </FallbackButton>
            </div>
          </div>
        )}
      </div>
    </FallbackDialog>
  );
};
