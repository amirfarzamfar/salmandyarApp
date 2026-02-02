'use client';

import { useEffect, useState } from 'react';
import { serviceCatalogService } from '@/services/service-catalog.service';
import { ServiceDefinition, ServiceCategory } from '@/types/service';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceFormSchema, ServiceFormValues } from '@/components/services/ServiceFormSchema';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      category: ServiceCategory.Nursing,
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceCatalogService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (editingId) {
        await serviceCatalogService.update(editingId, data as any);
      } else {
        await serviceCatalogService.create(data as any);
      }
      setIsModalOpen(false);
      fetchServices();
      reset();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: ServiceDefinition) => {
    setEditingId(service.id);
    setValue('title', service.title);
    setValue('category', service.category);
    setValue('description', service.description);
    setValue('isActive', service.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این خدمت اطمینان دارید؟')) {
      try {
        await serviceCatalogService.delete(id);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const getCategoryLabel = (category: ServiceCategory) => {
    switch (category) {
      case ServiceCategory.Nursing: return 'پرستاری';
      case ServiceCategory.Medical: return 'پزشکی';
      case ServiceCategory.Rehabilitation: return 'توانبخشی';
      case ServiceCategory.PersonalCare: return 'مراقبت شخصی';
      case ServiceCategory.Emergency: return 'اورژانسی';
      case ServiceCategory.Other: return 'سایر';
      default: return 'نامشخص';
    }
  };

  const filteredServices = services.filter(s =>
    s.title.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت خدمات (Service Catalog)</h1>
        <button
          onClick={() => {
            setEditingId(null);
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="ml-2 h-5 w-5" />
          تعریف خدمت جدید
        </button>
      </div>

      <div className="flex items-center space-x-4 space-x-reverse bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در خدمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">نام خدمت</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">دسته‌بندی</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">وضعیت</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    هیچ خدمتی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryLabel(service.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {service.isActive ? (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="h-4 w-4 ml-1" />
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="ویرایش"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'ویرایش خدمت' : 'تعریف خدمت جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام خدمت</label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                    <select
                      {...register('category', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value={ServiceCategory.Nursing}>پرستاری</option>
                      <option value={ServiceCategory.Medical}>پزشکی</option>
                      <option value={ServiceCategory.Rehabilitation}>توانبخشی</option>
                      <option value={ServiceCategory.PersonalCare}>مراقبت شخصی</option>
                      <option value={ServiceCategory.Emergency}>اورژانسی</option>
                      <option value={ServiceCategory.Other}>سایر</option>
                    </select>
                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                  </div>

                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="isActive"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                  سرویس فعال باشد
                </label>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
