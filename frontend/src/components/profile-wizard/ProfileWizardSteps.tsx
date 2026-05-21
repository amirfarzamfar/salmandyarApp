import React, { useState, useEffect } from 'react';
import { PatientProfileDto } from '@/services/patient-profile.service';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface Props {
  currentStep: number;
  formData: Partial<PatientProfileDto>;
  onNext: (data: Partial<PatientProfileDto>) => void;
  onPrev: () => void;
  isSaving: boolean;
}

export default function ProfileWizardSteps({ currentStep, formData, onNext, onPrev, isSaving }: Props) {
  const [localData, setLocalData] = useState<Partial<PatientProfileDto>>(formData);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Handle nested objects based on name dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setLocalData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PatientProfileDto] as any || {}),
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleNextClick = () => {
    onNext(localData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">اطلاعات هویتی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد ملی</label>
                <input type="text" name="nationalCode" value={localData.nationalCode || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جنسیت</label>
                <select name="gender" value={localData.gender || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Male">مرد</option>
                  <option value="Female">زن</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ تولد</label>
                <input type="date" name="dateOfBirth" value={localData.dateOfBirth ? new Date(localData.dateOfBirth).toISOString().split('T')[0] : ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام پدر</label>
                <input type="text" name="fatherName" value={localData.fatherName || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت تأهل</label>
                <select name="maritalStatus" value={localData.maritalStatus || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Single">مجرد</option>
                  <option value="Married">متاهل</option>
                  <option value="Widowed">همسر فوت شده</option>
                  <option value="Divorced">مطلقه</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملیت</label>
                <input type="text" name="nationality" value={localData.nationality || 'ایرانی'} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">اطلاعات تماس</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره موبایل</label>
                <input type="tel" name="mobileNumber" value={localData.mobileNumber || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">استان</label>
                <input type="text" name="address.state" value={localData.address?.state || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شهر</label>
                <input type="text" name="address.city" value={localData.address?.city || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد پستی</label>
                <input type="text" name="address.postalCode" value={localData.address?.postalCode || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس دقیق</label>
                <textarea name="address.fullAddress" value={localData.address?.fullAddress || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 border-b pb-2">تماس اضطراری</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام فرد اضطراری</label>
                <input type="text" name="emergencyContact.name" value={localData.emergencyContact?.name || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تماس اضطراری</label>
                <input type="tel" name="emergencyContact.phoneNumber" value={localData.emergencyContact?.phoneNumber || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبت</label>
                <input type="text" name="emergencyContact.relationship" value={localData.emergencyContact?.relationship || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">اطلاعات فیزیکی و پایه</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قد (سانتی‌متر)</label>
                <input type="number" name="height" value={localData.height || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وزن (کیلوگرم)</label>
                <input type="number" name="weight" value={localData.weight || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">گروه خونی</label>
                <select name="bloodGroup" value={localData.bloodGroup || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr">
                  <option value="">انتخاب کنید</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            
            {localData.height && localData.weight && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <span className="text-blue-800 dark:text-blue-300 font-medium">BMI محاسبه شده: </span>
                <span className="font-bold text-lg text-blue-900 dark:text-blue-200" dir="ltr">
                  {(localData.weight / Math.pow(localData.height / 100, 2)).toFixed(1)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت حرکتی</label>
                <select name="mobilityStatus" value={localData.mobilityStatus || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Independent">مستقل</option>
                  <option value="NeedsAssistance">نیاز به کمک</option>
                  <option value="Bedridden">بستری (بدون حرکت)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توانایی راه رفتن</label>
                <input type="text" name="walkingAbility" value={localData.walkingAbility || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="مثال: فقط با کمک راه میرود" />
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input type="checkbox" name="usesWheelchair" checked={localData.usesWheelchair || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">استفاده از ویلچر</span>
                </label>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input type="checkbox" name="usesWalker" checked={localData.usesWalker || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">استفاده از واکر</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">سوابق پزشکی و بیماری‌های زمینه‌ای</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'medicalHistory.hasDiabetes', label: 'دیابت' },
                { name: 'medicalHistory.hasHypertension', label: 'فشار خون' },
                { name: 'medicalHistory.hasHeartDisease', label: 'بیماری قلبی' },
                { name: 'medicalHistory.hasCOPD', label: 'COPD' },
                { name: 'medicalHistory.hasAsthma', label: 'آسم' },
                { name: 'medicalHistory.hasKidneyFailure', label: 'نارسایی کلیه' },
                { name: 'medicalHistory.hasStroke', label: 'سکته مغزی' },
                { name: 'medicalHistory.hasAlzheimers', label: 'آلزایمر' },
                { name: 'medicalHistory.hasParkinsons', label: 'پارکینسون' },
                { name: 'medicalHistory.hasCancer', label: 'سرطان' },
                { name: 'medicalHistory.hasPsychiatricDisorders', label: 'بیماری‌های روانپزشکی' },
              ].map((item) => (
                <label key={item.name} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    name={item.name} 
                    checked={(localData.medicalHistory as any)?.[item.name.split('.')[1]] || false} 
                    onChange={handleChange} 
                    className="w-5 h-5 text-blue-600 rounded border-gray-300" 
                  />
                  <span className="mr-3 text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
            
            {/* Conditional Branching Example */}
            {localData.medicalHistory?.hasDiabetes && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mt-4 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-orange-800 dark:text-orange-300 font-semibold mb-2">سوالات تکمیلی دیابت</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">نوع دیابت</label>
                    <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 border-orange-200">
                      <option>نوع 1</option>
                      <option>نوع 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">میانگین قند خون ناشتا</label>
                    <input type="number" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 border-orange-200" dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سایر بیماری‌ها</label>
              <textarea name="medicalHistory.otherDiseases" value={localData.medicalHistory?.otherDiseases || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="لطفاً در صورت وجود سایر بیماری‌ها اینجا ذکر کنید..." />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">داروها و آلرژی</h2>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                نکته: لیست دقیق داروها را می‌توانید بعد از تکمیل پروفایل در بخش «مدیریت داروها» ثبت کنید.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">آلرژی و حساسیت‌ها</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع حساسیت</label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="">انتخاب کنید</option>
                    <option value="Drug">دارویی</option>
                    <option value="Food">غذایی</option>
                    <option value="Respiratory">تنفسی</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توضیحات</label>
                  <input type="text" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="نام دارو یا ماده حساسیت‌زا" />
                </div>
              </div>
              <Button type="button" variant="outline" className="mt-2">
                + افزودن آلرژی دیگر
              </Button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">اطلاعات درمانی و تجهیزات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">پزشک معالج</label>
                <input type="text" name="attendingPhysician" value={localData.attendingPhysician || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تماس پزشک</label>
                <input type="tel" name="physicianPhone" value={localData.physicianPhone || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سابقه بستری (بیمارستان‌های قبلی)</label>
                <textarea name="hospitalizationHistory" value={localData.hospitalizationHistory || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سابقه جراحی</label>
                <textarea name="surgeryHistory" value={localData.surgeryHistory || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 border-b pb-2">تجهیزات پزشکی در منزل / شرایط خاص</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'hasHomeOxygen', label: 'اکسیژن در منزل' },
                { name: 'hasVentilator', label: 'ونتیلاتور' },
                { name: 'hasTracheostomy', label: 'تراکئوستومی' },
                { name: 'hasPEG', label: 'لوله تغذیه (PEG)' },
                { name: 'hasUrinaryCatheter', label: 'سوند ادراری' },
                { name: 'hasBedsore', label: 'زخم بستر' },
              ].map((item) => (
                <label key={item.name} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    name={item.name} 
                    checked={(localData as any)[item.name] || false} 
                    onChange={handleChange} 
                    className="w-5 h-5 text-blue-600 rounded border-gray-300" 
                  />
                  <span className="mr-3 text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Conditional */}
            {localData.hasHomeOxygen && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">جزئیات اکسیژن‌تراپی</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">میزان اکسیژن دریافتی (لیتر بر دقیقه)</label>
                    <input type="number" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 border-blue-200" dir="ltr" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">ارزیابی سالمند (Elderly Assessment)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سطح هوشیاری</label>
                <select name="elderlyAssessment.consciousnessLevel" value={localData.elderlyAssessment?.consciousnessLevel || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Alert">کاملاً هوشیار (Alert)</option>
                  <option value="Lethargic">خواب‌آلوده (Lethargic)</option>
                  <option value="Stupor">استوپور</option>
                  <option value="Coma">کما</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">خطر سقوط (Fall Risk)</label>
                <select name="elderlyAssessment.fallRisk" value={localData.elderlyAssessment?.fallRisk || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Low">کم</option>
                  <option value="Medium">متوسط</option>
                  <option value="High">زیاد</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختلال بلع</label>
                <select name="elderlyAssessment.swallowingDisorder" value={localData.elderlyAssessment?.swallowingDisorder || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="None">ندارد</option>
                  <option value="Mild">خفیف (نیاز به غذای نرم)</option>
                  <option value="Severe">شدید (NGT/PEG)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت تغذیه</label>
                <select name="elderlyAssessment.nutritionStatus" value={localData.elderlyAssessment?.nutritionStatus || ''} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <option value="">انتخاب کنید</option>
                  <option value="Good">خوب</option>
                  <option value="Fair">متوسط</option>
                  <option value="Poor">ضعیف</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input type="checkbox" name="elderlyAssessment.hasUrinaryIncontinence" checked={localData.elderlyAssessment?.hasUrinaryIncontinence || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">بی‌اختیاری ادرار</span>
                </label>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input type="checkbox" name="elderlyAssessment.hasFecalIncontinence" checked={localData.elderlyAssessment?.hasFecalIncontinence || false} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">بی‌اختیاری مدفوع</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">مدارک و فایل‌ها</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">لطفاً مدارک پزشکی و هویتی خود را جهت بررسی بهتر بارگذاری کنید.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'NationalId', label: 'تصویر کارت ملی' },
                { id: 'Insurance', label: 'دفترچه بیمه' },
                { id: 'LabTest', label: 'آخرین آزمایشات' },
                { id: 'CT_MRI', label: 'گزارش CT Scan / MRI' },
                { id: 'Prescription', label: 'نسخه پزشک' },
              ].map(doc => (
                <div key={doc.id} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                    <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{doc.label}</h4>
                  <p className="text-xs text-gray-500 mb-3">PDF, JPG, PNG تا ۵ مگابایت</p>
                  <Button variant="outline" size="sm">انتخاب فایل</Button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {renderStepContent()}
      </div>

      <div className="mt-10 pt-6 border-t flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={currentStep === 1 || isSaving}
          className="flex items-center"
        >
          <ChevronRight className="w-4 h-4 ml-2" />
          مرحله قبل
        </Button>
        
        <div className="flex items-center text-sm text-gray-500">
          {isSaving && (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
              در حال ذخیره...
            </span>
          )}
        </div>

        <Button 
          onClick={handleNextClick} 
          disabled={isSaving}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          {currentStep === 8 ? 'تکمیل نهایی' : 'مرحله بعد'}
          {currentStep !== 8 && <ChevronLeft className="w-4 h-4 mr-2" />}
        </Button>
      </div>
    </div>
  );
}
