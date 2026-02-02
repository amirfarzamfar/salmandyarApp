'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { reportConfigService } from '@/services/report-config.service';
import { nursingReportService } from '@/services/nursing-report.service';
import { ReportCategory, SubmitNursingReportDto } from '@/types/report';

interface Props {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function NursingReportForm({ patientId, onSuccess, onCancel }: Props) {
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [itemValues, setItemValues] = useState<Record<number, string>>({});
  const [generatedReport, setGeneratedReport] = useState('');

  const { register, handleSubmit, watch, setValue } = useForm<SubmitNursingReportDto>({
    defaultValues: {
      careRecipientId: patientId,
      shift: 'Morning',
      content: ''
    }
  });

  useEffect(() => {
    const loadConfig = async () => {
      const data = await reportConfigService.getCategories();
      setCategories(data);
      
      // Initialize values
      const initialValues: Record<number, string> = {};
      data.forEach(cat => {
        cat.items.forEach(item => {
          initialValues[item.id] = item.defaultValue;
          item.subItems.forEach(sub => {
            initialValues[sub.id] = sub.defaultValue;
          });
        });
      });
      setItemValues(initialValues);
    };
    loadConfig();
  }, []);

  // Watch for changes to regenerate report
  useEffect(() => {
    generateReport();
  }, [checkedItems, itemValues, selectedCategoryId]);

  const generateReport = () => {
    if (!selectedCategoryId) {
        setGeneratedReport('');
        setValue('content', '');
        return;
    }

    let reportText = '';
    
    // Only process the selected category
    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    if (activeCategory) {
      const catItems: string[] = [];
      
      activeCategory.items.forEach(item => {
        if (checkedItems[item.id]) {
          let itemText = itemValues[item.id] || item.title;
          
          // Check subitems
          const activeSubItems = item.subItems.filter(sub => checkedItems[sub.id]);
          if (activeSubItems.length > 0) {
            const subTexts = activeSubItems.map(sub => itemValues[sub.id] || sub.title).join('، ');
            itemText += ` (${subTexts})`;
          }
          
          catItems.push(itemText);
        }
      });

      if (catItems.length > 0) {
        reportText += `**${activeCategory.title}**: ${catItems.join(' - ')}.\n`;
      }
    }

    setGeneratedReport(reportText);
    setValue('content', reportText);
  };

  const handleItemCheck = (itemId: number, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleItemValueChange = (itemId: number, value: string) => {
    setItemValues(prev => ({ ...prev, [itemId]: value }));
  };

  const onSubmit = async (data: SubmitNursingReportDto) => {
    // Only submit items for the selected category
    if (!selectedCategoryId) {
        alert('لطفا نوع گزارش را انتخاب کنید');
        return;
    }

    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    if (!activeCategory) return;

    // Create a Set of valid item/subitem IDs for this category for fast lookup
    const validItemIds = new Set<number>();
    activeCategory.items.forEach(item => {
        validItemIds.add(item.id);
        item.subItems.forEach(sub => validItemIds.add(sub.id));
    });

    // Prepare items list filtering only valid IDs
    const items = Object.keys(checkedItems)
      .filter(key => {
        const id = Number(key);
        return checkedItems[id] && validItemIds.has(id);
      })
      .map(key => ({
        itemId: Number(key),
        isChecked: true,
        value: itemValues[Number(key)]
      }));

    await nursingReportService.createReport({
      ...data,
      careRecipientId: patientId,
      items
    });
    
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto my-4 border">
      <h2 className="text-xl font-bold mb-4">ثبت گزارش پرستاری جدید</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <label className="block text-sm font-bold mb-1">نوع گزارش</label>
            <select 
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">انتخاب نوع گزارش</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-bold mb-1">شیفت</label>
            <select {...register('shift')} className="w-full border p-2 rounded">
              <option value="Morning">صبح</option>
              <option value="Evening">عصر</option>
              <option value="Night">شب</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Checklist */}
          <div className="border rounded p-4 h-96 overflow-y-auto bg-gray-50">
            <h3 className="font-bold mb-2 sticky top-0 bg-gray-50 pb-2 border-b">چک‌لیست مراقبت‌ها</h3>
            
            {!selectedCategoryId && (
              <div className="text-center text-gray-500 mt-10">
                لطفا ابتدا نوع گزارش را انتخاب کنید
              </div>
            )}

            {categories
              .filter(cat => cat.id === selectedCategoryId)
              .map(cat => (
              <div key={cat.id} className="mb-4">
                <h4 className="font-bold text-blue-700 mb-2">{cat.title}</h4>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item.id} className="ml-2">
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id={`item-${item.id}`}
                          checked={!!checkedItems[item.id]}
                          onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                          className="mt-1.5"
                        />
                        <div className="flex-1">
                          <label htmlFor={`item-${item.id}`} className="font-medium cursor-pointer">{item.title}</label>
                          {checkedItems[item.id] && (
                            <textarea 
                              className="w-full mt-1 text-sm border p-1 rounded"
                              rows={2}
                              value={itemValues[item.id] || ''}
                              onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* SubItems */}
                      {item.subItems && item.subItems.length > 0 && checkedItems[item.id] && (
                        <div className="ml-6 mt-2 border-r-2 border-gray-300 pr-2 space-y-2">
                          {item.subItems.map(sub => (
                            <div key={sub.id} className="flex items-start gap-2">
                              <input 
                                type="checkbox" 
                                id={`sub-${sub.id}`}
                                checked={!!checkedItems[sub.id]}
                                onChange={(e) => handleItemCheck(sub.id, e.target.checked)}
                                className="mt-1.5"
                              />
                              <div className="flex-1">
                                <label htmlFor={`sub-${sub.id}`} className="text-sm cursor-pointer">{sub.title}</label>
                                {checkedItems[sub.id] && (
                                  <input 
                                    className="w-full mt-1 text-xs border p-1 rounded"
                                    value={itemValues[sub.id] || ''}
                                    onChange={(e) => handleItemValueChange(sub.id, e.target.value)}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <h3 className="font-bold mb-2">پیش‌نمایش گزارش</h3>
            <div className="flex-1">
                <textarea 
                    {...register('content')}
                    className="w-full h-full border p-4 rounded font-iransans leading-7"
                    placeholder="متن گزارش اینجا تولید می‌شود..."
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">متن بالا به صورت خودکار تولید شده است و قابل ویرایش می‌باشد.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border rounded hover:bg-gray-100">انصراف</button>
          <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-bold">ثبت نهایی گزارش</button>
        </div>
      </form>
    </div>
  );
}
