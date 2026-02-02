'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { reportConfigService } from '@/services/report-config.service';
import { ReportCategory, ReportItem } from '@/types/report';

export default function ReportConfigManager() {
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<ReportCategory | null>(null);
  const [editingItem, setEditingItem] = useState<ReportItem | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<ReportItem | null>(null);

  const { register: catRegister, handleSubmit: catSubmit, reset: catReset } = useForm<{ title: string; order: number; isActive: boolean }>();
  const { register: itemRegister, handleSubmit: itemSubmit, reset: itemReset } = useForm<{ title: string; defaultValue: string; order: number; isActive: boolean }>();
  const { register: subRegister, handleSubmit: subSubmit, reset: subReset } = useForm<{ title: string; defaultValue: string; order: number; isActive: boolean }>();

  const fetchCategories = async () => {
    try {
      const data = await reportConfigService.getCategories();
      setCategories(data);
      
      // Refresh selections if they exist
      if (selectedCategory) {
          const updatedCat = data.find(c => c.id === selectedCategory.id);
          setSelectedCategory(updatedCat || null);
          
          if (selectedItem && updatedCat) {
              const updatedItem = updatedCat.items.find(i => i.id === selectedItem.id);
              setSelectedItem(updatedItem || null);
          }
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data?.details || '';
      alert(`خطا در بارگذاری دسته‌بندی‌ها:\n${msg}\n${details}`);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Category Handlers ---
  const onCategorySubmit = async (data: any) => {
    console.log('onCategorySubmit called with data:', data);
    try {
      if (editingCategory) {
        console.log('Updating category:', editingCategory.id);
        await reportConfigService.updateCategory(editingCategory.id, { ...data, isActive: data.isActive });
      } else {
        console.log('Creating new category');
        await reportConfigService.createCategory(data);
      }
      setIsCategoryModalOpen(false);
      catReset();
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data?.details || JSON.stringify(error.response?.data || '');
      const inner = error.response?.data?.innerDetails || '';
      alert(`خطا در ذخیره دسته‌بندی:\n${msg}\n${details}\n${inner}`);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        await reportConfigService.deleteCategory(id);
        setSelectedCategory(null);
        setSelectedItem(null);
        fetchCategories();
      } catch (error: any) {
        console.error('Error deleting category:', error);
        alert('خطا در حذف دسته‌بندی: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const openCategoryModal = (cat?: ReportCategory) => {
    setEditingCategory(cat || null);
    catReset(cat ? { title: cat.title, order: cat.order, isActive: cat.isActive } : { title: '', order: 0, isActive: true });
    setIsCategoryModalOpen(true);
  };

  // --- Item Handlers ---
  const onItemSubmit = async (data: any) => {
    if (!selectedCategory) return;
    const payload = { ...data, parentId: null, categoryId: selectedCategory.id };

    try {
      if (editingItem) {
        await reportConfigService.updateItem(editingItem.id, { ...payload, isActive: data.isActive });
      } else {
        await reportConfigService.createItem(payload);
      }
      setIsItemModalOpen(false);
      itemReset();
      setEditingItem(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving item:', error);
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data?.details || '';
      alert(`خطا در ذخیره آیتم:\n${msg}\n${details}`);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      try {
        await reportConfigService.deleteItem(id);
        setSelectedItem(null);
        fetchCategories();
      } catch (error: any) {
        console.error('Error deleting item:', error);
        alert('خطا در حذف آیتم: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const openItemModal = (item?: ReportItem) => {
    setEditingItem(item || null);
    itemReset(item ? { title: item.title, defaultValue: item.defaultValue, order: item.order, isActive: item.isActive } : { title: '', defaultValue: '', order: 0, isActive: true });
    setIsItemModalOpen(true);
  };

  // --- Sub-Item Handlers ---
  const onSubItemSubmit = async (data: any) => {
    if (!selectedCategory || !selectedItem) return;
    const payload = { ...data, parentId: selectedItem.id, categoryId: selectedCategory.id };

    try {
      if (editingSubItem) {
        await reportConfigService.updateItem(editingSubItem.id, { ...payload, isActive: data.isActive });
      } else {
        await reportConfigService.createItem(payload);
      }
      setIsSubItemModalOpen(false);
      subReset();
      setEditingSubItem(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving sub-item:', error);
      const msg = error.response?.data?.message || error.message;
      const details = error.response?.data?.details || '';
      alert(`خطا در ذخیره زیر‌دسته:\n${msg}\n${details}`);
    }
  };

  const handleDeleteSubItem = async (id: number) => {
    if (confirm('آیا از حذف این زیر‌دسته اطمینان دارید؟')) {
      try {
        await reportConfigService.deleteItem(id);
        fetchCategories();
      } catch (error: any) {
        console.error('Error deleting sub-item:', error);
        alert('خطا در حذف زیر‌دسته: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const openSubItemModal = (sub?: ReportItem) => {
    setEditingSubItem(sub || null);
    subReset(sub ? { title: sub.title, defaultValue: sub.defaultValue, order: sub.order, isActive: sub.isActive } : { title: '', defaultValue: '', order: 0, isActive: true });
    setIsSubItemModalOpen(true);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت ساختار گزارش پرستاری</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Column 1: Categories */}
        <div className="col-span-1 bg-white p-4 rounded shadow flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="font-bold text-lg">۱. دسته‌بندی‌ها</h2>
            <button onClick={() => openCategoryModal()} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">+</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-colors ${selectedCategory?.id === cat.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'} ${!cat.isActive ? 'opacity-60 bg-gray-100' : ''}`}
                onClick={() => { setSelectedCategory(cat); setSelectedItem(null); }}
              >
                <span className="font-medium">{cat.title} {!cat.isActive && <span className="text-xs text-red-500">(غیرفعال)</span>}</span>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }} className="text-yellow-600 text-sm p-1 hover:bg-yellow-50 rounded">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="text-red-600 text-sm p-1 hover:bg-red-50 rounded">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Items */}
        <div className="col-span-1 bg-white p-4 rounded shadow flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="font-bold text-lg">۲. آیتم‌های اصلی</h2>
            {selectedCategory && (
                <button onClick={() => openItemModal()} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">+</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {!selectedCategory ? (
                <div className="text-gray-400 text-center mt-10">یک دسته‌بندی انتخاب کنید</div>
            ) : selectedCategory.items.length === 0 ? (
                <div className="text-gray-400 text-center mt-10">هیچ آیتمی وجود ندارد</div>
            ) : (
                selectedCategory.items.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded border cursor-pointer flex flex-col gap-1 transition-colors ${selectedItem?.id === item.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'} ${!item.isActive ? 'opacity-60 bg-gray-100' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex justify-between items-start">
                        <span className="font-medium">{item.title} {!item.isActive && <span className="text-xs text-red-500">(غیرفعال)</span>}</span>
                        <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); openItemModal(item); }} className="text-yellow-600 text-sm p-1 hover:bg-yellow-50 rounded">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="text-red-600 text-sm p-1 hover:bg-red-50 rounded">🗑️</button>
                        </div>
                    </div>
                    {item.defaultValue && <span className="text-xs text-gray-500 truncate">{item.defaultValue}</span>}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Column 3: Sub-Items (Fields) */}
        <div className="col-span-1 bg-white p-4 rounded shadow flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="font-bold text-lg">۳. زیر‌دسته‌ها (فیلدها)</h2>
            {selectedItem && (
                <button onClick={() => openSubItemModal()} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {!selectedItem ? (
                <div className="text-gray-400 text-center mt-10">یک آیتم اصلی انتخاب کنید</div>
            ) : selectedItem.subItems.length === 0 ? (
                <div className="text-gray-400 text-center mt-10">هیچ زیر‌دسته‌ای وجود ندارد</div>
            ) : (
                selectedItem.subItems.map(sub => (
                  <div key={sub.id} className={`p-3 rounded border bg-gray-50 flex flex-col gap-1 ${!sub.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{sub.title} {!sub.isActive && <span className="text-xs text-red-500">(غیرفعال)</span>}</span>
                        <div className="flex gap-2">
                            <button onClick={() => openSubItemModal(sub)} className="text-yellow-600 text-sm p-1 hover:bg-yellow-50 rounded">✏️</button>
                            <button onClick={() => handleDeleteSubItem(sub.id)} className="text-red-600 text-sm p-1 hover:bg-red-50 rounded">🗑️</button>
                        </div>
                    </div>
                    {sub.defaultValue && (
                        <div className="text-xs text-gray-600 bg-white p-1 rounded border mt-1">
                            <span className="font-bold">پیش‌فرض:</span> {sub.defaultValue}
                        </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold text-lg mb-4">{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</h3>
            <form onSubmit={catSubmit(onCategorySubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">عنوان دسته</label>
                <input {...catRegister('title', { required: true })} className="w-full border p-2 rounded" placeholder="مثال: سیستم تنفسی" />
              </div>
              <div>
                <label className="block text-sm mb-1">ترتیب نمایش</label>
                <input type="number" {...catRegister('order', { required: true, valueAsNumber: true })} className="w-full border p-2 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...catRegister('isActive')} id="catIsActive" className="w-4 h-4" />
                <label htmlFor="catIsActive" className="text-sm">فعال</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-gray-600">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold text-lg mb-4">{editingItem ? 'ویرایش آیتم اصلی' : 'افزودن آیتم اصلی'}</h3>
            <form onSubmit={itemSubmit(onItemSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">عنوان آیتم</label>
                <input {...itemRegister('title', { required: true })} className="w-full border p-2 rounded" placeholder="مثال: اکسیژن تراپی" />
              </div>
              <div>
                <label className="block text-sm mb-1">مقدار پیش‌فرض (اختیاری)</label>
                <textarea {...itemRegister('defaultValue')} className="w-full border p-2 rounded" rows={3} />
              </div>
              <div>
                <label className="block text-sm mb-1">ترتیب نمایش</label>
                <input type="number" {...itemRegister('order', { required: true, valueAsNumber: true })} className="w-full border p-2 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...itemRegister('isActive')} id="itemIsActive" className="w-4 h-4" />
                <label htmlFor="itemIsActive" className="text-sm">فعال</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-gray-600">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Item Modal */}
      {isSubItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-bold text-lg mb-4">{editingSubItem ? 'ویرایش زیر‌دسته' : 'افزودن زیر‌دسته جدید'}</h3>
            <form onSubmit={subSubmit(onSubItemSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">عنوان زیر‌دسته (فیلد)</label>
                <input {...subRegister('title', { required: true })} className="w-full border p-2 rounded" placeholder="مثال: نازال" />
              </div>
              <div>
                <label className="block text-sm mb-1">مقدار پیش‌فرض (الگو)</label>
                <textarea 
                    {...subRegister('defaultValue', { required: true })} 
                    className="w-full border p-2 rounded" 
                    rows={4} 
                    placeholder="مثال: اکسیژن تراپی با نازال در حال انجام است 3 تا 6 لیتر" 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">ترتیب نمایش</label>
                <input type="number" {...subRegister('order', { required: true, valueAsNumber: true })} className="w-full border p-2 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...subRegister('isActive')} id="subIsActive" className="w-4 h-4" />
                <label htmlFor="subIsActive" className="text-sm">فعال</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsSubItemModalOpen(false)} className="px-4 py-2 text-gray-600">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
