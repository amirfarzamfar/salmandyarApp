'use client';

import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  notificationSettingsService,
  NotificationDeliveryLog,
  NotificationEventConfiguration,
  NotificationResolvedRecipient,
  NotificationSettings,
  UpdateNotificationSettingsDto,
} from '@/services/notification-settings.service';
import { Bell, Mail, MessageSquare, Save, Send, ShieldCheck } from 'lucide-react';

const roleOptions = [
  'SuperAdmin',
  'Admin',
  'Manager',
  'Supervisor',
  'Nurse',
  'AssistantNurse',
  'Physiotherapist',
  'ElderlyCareAssistant',
  'Patient',
  'PatientFamily',
];

type SmsProviderKey =
  | 'LogOnly'
  | 'Kavenegar'
  | 'SmsIr'
  | 'Melipayamak'
  | 'Ghasedak'
  | 'Twilio'
  | 'Generic';

const smsProviderProfiles: Record<
  SmsProviderKey,
  {
    label: string;
    description: string;
    senderLabel: string;
    baseUrlLabel: string;
    usernameLabel: string;
    apiKeyLabel: string;
    apiSecretLabel: string;
    passwordLabel: string;
    baseUrlPlaceholder: string;
    requiredFields: string[];
  }
> = {
  LogOnly: {
    label: 'LogOnly',
    description: 'فقط برای توسعه و تست. پیامک ارسال واقعی نمی‌شود و فقط در لاگ ثبت می‌گردد.',
    senderLabel: 'شماره فرستنده',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'Password',
    baseUrlPlaceholder: '',
    requiredFields: ['هیچ فیلدی برای ارسال واقعی لازم نیست'],
  },
  Kavenegar: {
    label: 'کاوه‌نگار',
    description: 'پیکربندی مستقیم برای API رسمی Kavenegar.',
    senderLabel: 'شماره فرستنده',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'Password',
    baseUrlPlaceholder: 'https://api.kavenegar.com',
    requiredFields: ['API Key', 'شماره فرستنده اختیاری'],
  },
  SmsIr: {
    label: 'SMS.ir',
    description: 'پیکربندی مستقیم برای سرویس پیامکی SMS.ir.',
    senderLabel: 'Line Number',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'Password',
    baseUrlPlaceholder: 'https://api.sms.ir',
    requiredFields: ['API Key', 'Line Number'],
  },
  Melipayamak: {
    label: 'ملی‌پیامک',
    description: 'پیکربندی مستقیم برای REST API ملی‌پیامک.',
    senderLabel: 'شماره خط',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'نام کاربری پنل',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'رمز عبور پنل',
    baseUrlPlaceholder: 'https://rest.payamak-panel.com/api',
    requiredFields: ['نام کاربری پنل', 'رمز عبور پنل', 'شماره خط'],
  },
  Ghasedak: {
    label: 'قاصدک',
    description: 'پیکربندی مستقیم برای API رسمی Ghasedak.',
    senderLabel: 'Line Number',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'Password',
    baseUrlPlaceholder: 'https://api.ghasedak.me',
    requiredFields: ['API Key', 'Line Number اختیاری'],
  },
  Twilio: {
    label: 'Twilio',
    description: 'برای ارسال بین‌المللی. همچنان در سیستم باقی می‌ماند ولی تمرکز اصلی روی providerهای ایرانی است.',
    senderLabel: 'From Number',
    baseUrlLabel: 'Base URL',
    usernameLabel: 'Account SID',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'Auth Token',
    passwordLabel: 'Password',
    baseUrlPlaceholder: 'https://api.twilio.com/2010-04-01',
    requiredFields: ['Account SID', 'Auth Token', 'From Number'],
  },
  Generic: {
    label: 'Generic',
    description: 'برای هر provider سفارشی یا سرویس‌های ایرانی دیگر که API اختصاصی متفاوت دارند.',
    senderLabel: 'شماره فرستنده',
    baseUrlLabel: 'API URL',
    usernameLabel: 'Username',
    apiKeyLabel: 'API Key',
    apiSecretLabel: 'API Secret',
    passwordLabel: 'Password',
    baseUrlPlaceholder: 'https://provider.example.com/api/send',
    requiredFields: ['API URL معتبر', 'بسته به مستندات سرویس'],
  },
};

const smsProviderOptions = Object.keys(smsProviderProfiles) as SmsProviderKey[];

const defaultSettings: UpdateNotificationSettingsDto = {
  emailEnabled: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpUseSsl: true,
  emailFromAddress: '',
  emailFromName: '',
  emailReplyTo: '',
  emailTimeoutSeconds: 30,
  smtpPasswordConfigured: false,
  clearSmtpPassword: false,
  smsEnabled: false,
  smsProvider: 'LogOnly',
  smsBaseUrl: '',
  smsUsername: '',
  smsApiKey: '',
  smsSenderNumber: '',
  smsSandboxMode: false,
  smsPasswordConfigured: false,
  smsApiSecretConfigured: false,
  clearSmsPassword: false,
  clearSmsApiSecret: false,
  updatedAt: '',
  eventConfigurations: [],
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return axiosError.response?.data?.error || axiosError.response?.data?.message || fallbackMessage;
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<UpdateNotificationSettingsDto>(defaultSettings);
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [resolvedRecipients, setResolvedRecipients] = useState<Record<string, NotificationResolvedRecipient[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailTest, setEmailTest] = useState({ destination: '', subject: 'تست ایمیل سالمندیار', message: 'این یک پیام آزمایشی از تنظیمات اعلان سالمندیار است.' });
  const [smsTest, setSmsTest] = useState({ destination: '', message: 'این یک پیامک آزمایشی از تنظیمات اعلان سالمندیار است.' });

  const emailEnabled = settings.emailEnabled;
  const smsEnabled = settings.smsEnabled;
  const selectedSmsProvider = (smsProviderOptions.includes(settings.smsProvider as SmsProviderKey)
    ? settings.smsProvider
    : 'LogOnly') as SmsProviderKey;
  const smsProviderProfile = smsProviderProfiles[selectedSmsProvider];

  useEffect(() => {
    void loadData();
  }, []);

  const eventConfigurations = useMemo(
    () => settings.eventConfigurations ?? [],
    [settings.eventConfigurations]
  );

  const loadData = async () => {
    try {
      const [settingsData, logsData] = await Promise.all([
        notificationSettingsService.get(),
        notificationSettingsService.getLogs(150),
      ]);

      const nextSettings = {
        ...settingsData,
        smtpPassword: '',
        clearSmtpPassword: false,
        smsPassword: '',
        clearSmsPassword: false,
        smsApiSecret: '',
        clearSmsApiSecret: false,
      };

      setSettings({
        ...nextSettings,
      });
      setLogs(logsData);
      await loadResolvedRecipients(nextSettings.eventConfigurations ?? []);
    } catch (error) {
      console.error(error);
      await Swal.fire('خطا', getApiErrorMessage(error, 'بارگذاری تنظیمات اعلان انجام نشد.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateNotificationSettingsDto = {
        ...settings,
        smtpPort: Number(settings.smtpPort) || 587,
        emailTimeoutSeconds: Number(settings.emailTimeoutSeconds) || 30,
      };
      const updated = await notificationSettingsService.update(payload);
      const nextSettings = {
        ...updated,
        smtpPassword: '',
        clearSmtpPassword: false,
        smsPassword: '',
        clearSmsPassword: false,
        smsApiSecret: '',
        clearSmsApiSecret: false,
      };
      setSettings(nextSettings);
      setLogs(await notificationSettingsService.getLogs(150));
      await loadResolvedRecipients(nextSettings.eventConfigurations ?? []);
      await Swal.fire({
        title: 'ذخیره شد',
        text: 'تنظیمات اعلان با موفقیت به‌روزرسانی شد.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      await Swal.fire('خطا', getApiErrorMessage(error, 'ذخیره تنظیمات انجام نشد.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = (eventKey: string, updater: (event: NotificationEventConfiguration) => NotificationEventConfiguration) => {
    setSettings((prev) => ({
      ...prev,
      eventConfigurations: prev.eventConfigurations.map((item) =>
        item.eventKey === eventKey ? updater(item) : item
      ),
    }));
  };

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const loadResolvedRecipients = async (eventConfigs: NotificationEventConfiguration[]) => {
    const entries = await Promise.all(
      eventConfigs.map(async (eventConfig) => {
        if ((eventConfig.recipientRoles ?? []).length === 0) {
          return [eventConfig.eventKey, []] as const;
        }

        try {
          const recipients = await notificationSettingsService.getResolvedRecipients(eventConfig.eventKey);
          return [eventConfig.eventKey, recipients] as const;
        } catch (error) {
          console.error(error);
          return [eventConfig.eventKey, []] as const;
        }
      })
    );

    setResolvedRecipients(Object.fromEntries(entries));
  };

  const formatChannel = (value: number) =>
    value === 0 ? 'داخل برنامه' : value === 1 ? 'پیامک' : 'ایمیل';

  const formatStatus = (value: number) =>
    value === 0 ? 'موفق' : value === 1 ? 'ناموفق' : 'رد یا غیرفعال';

  const handleTestEmail = async () => {
    if (!emailTest.destination.trim() || !emailTest.subject.trim() || !emailTest.message.trim()) {
      await Swal.fire('اطلاعات ناقص', 'گیرنده، موضوع و متن ایمیل تست را کامل کنید.', 'warning');
      return;
    }

    try {
      await notificationSettingsService.sendTestEmail({
        destination: emailTest.destination.trim(),
        subject: emailTest.subject.trim(),
        message: emailTest.message.trim(),
      });
      setLogs(await notificationSettingsService.getLogs(150));
      await Swal.fire('موفق', 'ایمیل تست ارسال شد.', 'success');
    } catch (error) {
      console.error(error);
      await Swal.fire('خطا', getApiErrorMessage(error, 'ارسال ایمیل تست انجام نشد.'), 'error');
    }
  };

  const handleTestSms = async () => {
    if (!smsTest.destination.trim() || !smsTest.message.trim()) {
      await Swal.fire('اطلاعات ناقص', 'شماره مقصد و متن پیامک تست را کامل کنید.', 'warning');
      return;
    }

    try {
      await notificationSettingsService.sendTestSms({ destination: smsTest.destination.trim(), message: smsTest.message.trim() });
      setLogs(await notificationSettingsService.getLogs(150));
      await Swal.fire('موفق', 'پیامک تست ارسال شد.', 'success');
    } catch (error) {
      console.error(error);
      await Swal.fire('خطا', getApiErrorMessage(error, 'ارسال پیامک تست انجام نشد.'), 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">در حال بارگذاری تنظیمات اعلان...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مرکز مدیریت اعلان‌ها</h1>
          <p className="mt-1 text-sm text-gray-500">
            تنظیم کانال‌های ارسال، قواعد هر نوع هشدار، قالب پیام‌ها و لاگ تحویل.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TransportCard
          title="SMTP ایمیل"
          icon={<Mail className="h-5 w-5" />}
          enabled={emailEnabled}
          onToggle={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
          gradient="from-blue-600 to-blue-500"
        >
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${emailEnabled ? '' : 'pointer-events-none opacity-50'}`}>
            <Field label="Host" value={settings.smtpHost} onChange={(value) => setSettings((prev) => ({ ...prev, smtpHost: value }))} />
            <Field label="Port" type="number" value={String(settings.smtpPort)} onChange={(value) => setSettings((prev) => ({ ...prev, smtpPort: Number(value) || 0 }))} />
            <Field label="Username" value={settings.smtpUser} onChange={(value) => setSettings((prev) => ({ ...prev, smtpUser: value }))} />
            <SecretField
              label={`Password${settings.smtpPasswordConfigured ? ' (ذخیره شده)' : ''}`}
              value={settings.smtpPassword ?? ''}
              clearChecked={!!settings.clearSmtpPassword}
              onChange={(value) => setSettings((prev) => ({ ...prev, smtpPassword: value, clearSmtpPassword: false }))}
              onToggleClear={(checked) => setSettings((prev) => ({ ...prev, clearSmtpPassword: checked, smtpPassword: checked ? '' : prev.smtpPassword }))}
            />
            <Field label="From Address" value={settings.emailFromAddress} onChange={(value) => setSettings((prev) => ({ ...prev, emailFromAddress: value }))} />
            <Field label="From Name" value={settings.emailFromName} onChange={(value) => setSettings((prev) => ({ ...prev, emailFromName: value }))} />
            <Field label="Reply-To" value={settings.emailReplyTo} onChange={(value) => setSettings((prev) => ({ ...prev, emailReplyTo: value }))} />
            <Field label="Timeout (Sec)" type="number" value={String(settings.emailTimeoutSeconds)} onChange={(value) => setSettings((prev) => ({ ...prev, emailTimeoutSeconds: Number(value) || 30 }))} />
            <label className="col-span-full flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.smtpUseSsl}
                onChange={(event) => setSettings((prev) => ({ ...prev, smtpUseSsl: event.target.checked }))}
              />
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              استفاده از SSL/TLS
            </label>
          </div>
        </TransportCard>

        <TransportCard
          title="درگاه پیامک"
          icon={<MessageSquare className="h-5 w-5" />}
          enabled={smsEnabled}
          onToggle={(checked) => setSettings((prev) => ({ ...prev, smsEnabled: checked }))}
          gradient="from-teal-600 to-teal-500"
        >
          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${smsEnabled ? '' : 'pointer-events-none opacity-50'}`}>
            <SelectField
              label="Provider"
              value={settings.smsProvider}
              onChange={(value) => setSettings((prev) => ({ ...prev, smsProvider: value }))}
              options={smsProviderOptions}
            />
            <div className="col-span-full rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
              <div className="font-bold">Provider منتخب: {smsProviderProfile.label}</div>
              <p className="mt-1">{smsProviderProfile.description}</p>
              <p className="mt-2 text-xs">
                فیلدهای مهم: {smsProviderProfile.requiredFields.join('، ')}
              </p>
            </div>
            <Field label={smsProviderProfile.senderLabel} value={settings.smsSenderNumber} onChange={(value) => setSettings((prev) => ({ ...prev, smsSenderNumber: value }))} />
            <Field label={smsProviderProfile.baseUrlLabel} value={settings.smsBaseUrl} placeholder={smsProviderProfile.baseUrlPlaceholder} onChange={(value) => setSettings((prev) => ({ ...prev, smsBaseUrl: value }))} />
            <Field label={smsProviderProfile.usernameLabel} value={settings.smsUsername} onChange={(value) => setSettings((prev) => ({ ...prev, smsUsername: value }))} />
            <Field label={smsProviderProfile.apiKeyLabel} value={settings.smsApiKey} onChange={(value) => setSettings((prev) => ({ ...prev, smsApiKey: value }))} />
            <SecretField
              label={`${smsProviderProfile.apiSecretLabel}${settings.smsApiSecretConfigured ? ' (ذخیره شده)' : ''}`}
              value={settings.smsApiSecret ?? ''}
              clearChecked={!!settings.clearSmsApiSecret}
              onChange={(value) => setSettings((prev) => ({ ...prev, smsApiSecret: value, clearSmsApiSecret: false }))}
              onToggleClear={(checked) => setSettings((prev) => ({ ...prev, clearSmsApiSecret: checked, smsApiSecret: checked ? '' : prev.smsApiSecret }))}
            />
            <SecretField
              label={`${smsProviderProfile.passwordLabel}${settings.smsPasswordConfigured ? ' (ذخیره شده)' : ''}`}
              value={settings.smsPassword ?? ''}
              clearChecked={!!settings.clearSmsPassword}
              onChange={(value) => setSettings((prev) => ({ ...prev, smsPassword: value, clearSmsPassword: false }))}
              onToggleClear={(checked) => setSettings((prev) => ({ ...prev, clearSmsPassword: checked, smsPassword: checked ? '' : prev.smsPassword }))}
            />
            <label className="col-span-full flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.smsSandboxMode}
                onChange={(event) => setSettings((prev) => ({ ...prev, smsSandboxMode: event.target.checked }))}
              />
              ارسال تستی یا سندباکس
            </label>
          </div>
        </TransportCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TestCard
          title="ارسال تست ایمیل"
          actionLabel="ارسال ایمیل تست"
          onAction={handleTestEmail}
        >
          <Field label="گیرنده" value={emailTest.destination} onChange={(value) => setEmailTest((prev) => ({ ...prev, destination: value }))} />
          <Field label="موضوع" value={emailTest.subject} onChange={(value) => setEmailTest((prev) => ({ ...prev, subject: value }))} />
          <TextAreaField label="متن پیام" value={emailTest.message} onChange={(value) => setEmailTest((prev) => ({ ...prev, message: value }))} />
        </TestCard>

        <TestCard
          title="ارسال تست پیامک"
          actionLabel="ارسال پیامک تست"
          onAction={handleTestSms}
        >
          <Field label="شماره مقصد" value={smsTest.destination} onChange={(value) => setSmsTest((prev) => ({ ...prev, destination: value }))} />
          <TextAreaField label="متن پیامک" value={smsTest.message} onChange={(value) => setSmsTest((prev) => ({ ...prev, message: value }))} />
        </TestCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-800">قواعد رویدادها و هشدارها</h2>
        </div>
        <div className="space-y-4">
          {eventConfigurations.map((eventConfig) => (
            <div key={eventConfig.eventKey} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{eventConfig.displayName}</h3>
                  <p className="text-sm text-gray-500">{eventConfig.description}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={eventConfig.isEnabled}
                    onChange={(event) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, isEnabled: event.target.checked }))}
                  />
                  فعال
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventConfig.sendInApp}
                    onChange={(event) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, sendInApp: event.target.checked }))}
                  />
                  داخل برنامه
                </label>
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventConfig.sendSms}
                    onChange={(event) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, sendSms: event.target.checked }))}
                  />
                  پیامک
                </label>
                <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventConfig.sendEmail}
                    onChange={(event) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, sendEmail: event.target.checked }))}
                  />
                  ایمیل
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <h4 className="mb-3 font-bold text-gray-700">گیرندگان</h4>
                  <SelectField
                    label="نقش‌های اضافی"
                    value={eventConfig.recipientRoles.join(', ')}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, recipientRoles: parseList(value) }))}
                    options={roleOptions}
                    freeText
                  />
                  <Field
                    label="ایمیل‌های اضافی"
                    value={eventConfig.additionalEmails.join(', ')}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, additionalEmails: parseList(value) }))}
                    placeholder="a@example.com, b@example.com"
                  />
                  <Field
                    label="شماره‌های اضافی"
                    value={eventConfig.additionalPhones.join(', ')}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, additionalPhones: parseList(value) }))}
                    placeholder="0912..., 0935..."
                  />
                  <ResolvedRecipientsPreview recipients={resolvedRecipients[eventConfig.eventKey] ?? []} />
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <h4 className="mb-3 font-bold text-gray-700">قالب‌ها</h4>
                  <Field
                    label="عنوان داخل برنامه"
                    value={eventConfig.inAppTitleTemplate}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, inAppTitleTemplate: value }))}
                  />
                  <TextAreaField
                    label="متن داخل برنامه"
                    value={eventConfig.inAppBodyTemplate}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, inAppBodyTemplate: value }))}
                  />
                  <TextAreaField
                    label="متن پیامک"
                    value={eventConfig.smsTemplate}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, smsTemplate: value }))}
                  />
                  <Field
                    label="موضوع ایمیل"
                    value={eventConfig.emailSubjectTemplate}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, emailSubjectTemplate: value }))}
                  />
                  <TextAreaField
                    label="بدنه ایمیل"
                    value={eventConfig.emailBodyTemplate}
                    onChange={(value) => updateEvent(eventConfig.eventKey, (current) => ({ ...current, emailBodyTemplate: value }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">لاگ تحویل اعلان‌ها</h2>
            <p className="text-sm text-gray-500">آخرین ارسال‌های موفق، ناموفق یا ردشده</p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            بروزرسانی
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-right">زمان</th>
                <th className="px-4 py-3 text-right">رویداد</th>
                <th className="px-4 py-3 text-right">کانال</th>
                <th className="px-4 py-3 text-right">وضعیت</th>
                <th className="px-4 py-3 text-right">گیرنده</th>
                <th className="px-4 py-3 text-right">Provider</th>
                <th className="px-4 py-3 text-right">شرح</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAtUtc).toLocaleString('fa-IR')}</td>
                  <td className="px-4 py-3">{log.eventDisplayName}</td>
                  <td className="px-4 py-3">{formatChannel(log.channel)}</td>
                  <td className="px-4 py-3">{formatStatus(log.status)}</td>
                  <td className="px-4 py-3">{log.recipient}</td>
                  <td className="px-4 py-3">{log.provider}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {log.errorMessage || log.subject || log.message.slice(0, 120)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    هنوز لاگی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransportCard({
  title,
  icon,
  enabled,
  onToggle,
  gradient,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between bg-gradient-to-r ${gradient} px-5 py-4 text-white`}>
        <div className="flex items-center gap-2 font-bold">
          {icon}
          {title}
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <span>{enabled ? 'فعال' : 'غیرفعال'}</span>
          <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
        </label>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function TestCard({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Send className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
      />
    </label>
  );
}

function SecretField({
  label,
  value,
  clearChecked,
  onChange,
  onToggleClear,
}: {
  label: string;
  value: string;
  clearChecked: boolean;
  onChange: (value: string) => void;
  onToggleClear: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Field label={label} value={value} onChange={onChange} type="password" />
      <label className="flex items-center gap-2 text-xs text-rose-700">
        <input type="checkbox" checked={clearChecked} onChange={(event) => onToggleClear(event.target.checked)} />
        پاک کردن مقدار ذخیره‌شده
      </label>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  freeText = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  freeText?: boolean;
}) {
  if (freeText) {
    return (
      <Field
        label={label}
        value={value}
        onChange={onChange}
        placeholder={options.join(', ')}
      />
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResolvedRecipientsPreview({
  recipients,
}: {
  recipients: NotificationResolvedRecipient[];
}) {
  if (recipients.length === 0) {
    return (
      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        گیرنده‌ای از نقش‌های انتخاب‌شده پیدا نشد.
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-3 text-xs text-emerald-800">
      <div className="font-bold">گیرندگان حل‌شده: {recipients.length} نفر</div>
      <div className="mt-2 space-y-1">
        {recipients.slice(0, 6).map((recipient) => (
          <div key={recipient.userId}>
            {recipient.displayName || recipient.userId}
            {recipient.phoneNumber ? ` | ${recipient.phoneNumber}` : ''}
            {recipient.email ? ` | ${recipient.email}` : ''}
          </div>
        ))}
        {recipients.length > 6 && <div>و {recipients.length - 6} نفر دیگر...</div>}
      </div>
    </div>
  );
}
