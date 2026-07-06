'use client';

import type { AxiosError } from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal, { type SweetAlertOptions } from 'sweetalert2';
import { toast } from 'react-hot-toast';
import {
  Activity,
  Ban,
  CheckCircle,
  Clock3,
  Eye,
  KeyRound,
  Lock,
  Pencil,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Wifi
} from 'lucide-react';
import {
  userService,
  type AdminResetPasswordDto,
  type CreateAdminUserDto,
  type PermissionDefinitionDto,
  type RoleCatalogDto,
  type RoleManagementDto,
  type SetUserLockDto,
  type UpdateAdminUserDto,
  type UpdateUserContactVerificationDto,
  type UpdateUserPermissionsDto,
  type UserDetailDto,
  type UserFilterDto,
  type UserListDto
} from '@/services/user.service';
import { patientService } from '@/services/patient.service';
import { assignmentService } from '@/services/assignment.service';
import { AssignmentStatus, AssignmentType, ShiftSlot } from '@/types/assignment';
import type { PatientList } from '@/types/patient';
import { translateRole } from '@/utils/role-translation';
import { PatientSelfServiceAccessModal } from '@/components/admin/users/PatientSelfServiceAccessModal';
import CaregiverProfileWizard from '@/components/caregiver-profile/CaregiverProfileWizard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const caregiverRoles = ['Nurse', 'AssistantNurse', 'Physiotherapist', 'ElderlyCareAssistant'];

type UserFormState = CreateAdminUserDto;
type RoleFormState = { name: string; permissions: string[] };
type PermissionGroup = { key: string; title: string; permissions: PermissionDefinitionDto[] };
type DetailSection = 'overview' | 'employment-profile';
type AssignmentFormState = {
  patientId: string;
  assignmentType: AssignmentType;
  shiftSlot?: ShiftSlot;
  startDate: string;
  endDate: string;
  isPrimaryCaregiver: boolean;
  notes: string;
};

const emptyUserForm: UserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  nationalCode: '',
  password: '',
  roles: [],
  isActive: true,
  emailConfirmed: false,
  phoneNumberConfirmed: false,
  adminNotes: ''
};

const emptyRoleForm: RoleFormState = {
  name: '',
  permissions: []
};

const emptyAssignmentForm: AssignmentFormState = {
  patientId: '',
  assignmentType: AssignmentType.ShiftBased,
  shiftSlot: ShiftSlot.Morning,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  isPrimaryCaregiver: true,
  notes: ''
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ error?: string; message?: string }>;
  return axiosError.response?.data?.error || axiosError.response?.data?.message || fallback;
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('fa-IR');
};

const formatDateOnly = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fa-IR');
};

const formatAssignmentType = (value: number) => {
  switch (value) {
    case AssignmentType.Daily:
      return 'روزانه';
    case AssignmentType.Monthly:
      return 'ماهانه';
    case AssignmentType.ShiftBased:
      return 'شیفتی';
    case AssignmentType.TwentyFourHour:
      return '۲۴ ساعته';
    default:
      return 'نامشخص';
  }
};

const formatShiftSlot = (value?: number) => {
  switch (value) {
    case ShiftSlot.Morning:
      return 'صبح';
    case ShiftSlot.Evening:
      return 'عصر';
    case ShiftSlot.Night:
      return 'شب';
    case ShiftSlot.Long:
      return 'لانگ';
    case ShiftSlot.TwentyFourHour:
      return '۲۴ ساعته';
    default:
      return '-';
  }
};

const formatAssignmentStatus = (value: number) => {
  switch (value) {
    case AssignmentStatus.Active:
      return 'فعال';
    case AssignmentStatus.Completed:
      return 'تکمیل‌شده';
    case AssignmentStatus.Cancelled:
      return 'لغوشده';
    case AssignmentStatus.Suspended:
      return 'تعلیق‌شده';
    default:
      return 'نامشخص';
  }
};

const canManageSelfService = (user: Pick<UserListDto, 'roles'>) =>
  user.roles.includes('Patient') || user.roles.includes('Elderly');

const canReceiveAssignments = (user: Pick<UserListDto, 'roles'>) =>
  user.roles.some((role) => caregiverRoles.includes(role));

export default function UsersPageClient({ mode = 'users' }: { mode?: 'users' | 'personnel' }) {
  const isPersonnelMode = mode === 'personnel';
  const searchParams = useSearchParams();
  const selfServiceMode = searchParams.get('selfService') === '1';
  const userFormDialogRef = useRef<HTMLDivElement | null>(null);
  const roleDialogRef = useRef<HTMLDivElement | null>(null);
  const detailDialogRef = useRef<HTMLDivElement | null>(null);

  const [users, setUsers] = useState<UserListDto[]>([]);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<UserListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<UserFilterDto>({
    pageNumber: 1,
    pageSize: mode === 'personnel' ? 200 : 10,
    searchTerm: '',
    role: '',
    isActive: undefined,
    isLocked: undefined
  });
  const [roleCatalog, setRoleCatalog] = useState<RoleCatalogDto>({ roles: [], availablePermissions: [] });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetailDto | null>(null);
  const [detailSection, setDetailSection] = useState<DetailSection>('overview');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRoleName, setEditingRoleName] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormState>(emptyRoleForm);
  const [savingRole, setSavingRole] = useState(false);
  const [rolePermissionSearch, setRolePermissionSearch] = useState('');
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(emptyAssignmentForm);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [userPermissionDraft, setUserPermissionDraft] = useState<string[]>([]);
  const [userPermissionSearch, setUserPermissionSearch] = useState('');
  const [savingUserPermissions, setSavingUserPermissions] = useState(false);

  const roleOptions = useMemo(
    () =>
      roleCatalog.roles
        .map((role) => role.name)
        .filter((role) => (isPersonnelMode ? caregiverRoles.includes(role) : true)),
    [isPersonnelMode, roleCatalog.roles]
  );
  const eligibleUsers = useMemo(() => users.filter(canManageSelfService), [users]);
  const permissionDefinitionMap = useMemo(
    () => new Map(roleCatalog.availablePermissions.map((permission) => [permission.key, permission])),
    [roleCatalog.availablePermissions]
  );
  const permissionGroups = useMemo(
    () => buildPermissionGroups(roleCatalog.availablePermissions),
    [roleCatalog.availablePermissions]
  );
  const rolePermissionGroups = useMemo(
    () => filterPermissionGroups(permissionGroups, rolePermissionSearch),
    [permissionGroups, rolePermissionSearch]
  );
  const userPermissionGroups = useMemo(
    () => filterPermissionGroups(permissionGroups, userPermissionSearch),
    [permissionGroups, userPermissionSearch]
  );

  const getPermissionLabel = (permission: string) =>
    permissionDefinitionMap.get(permission)?.displayName || permission;

  const fireContextualAlert = (options: SweetAlertOptions) => {
    const target =
      detailDialogRef.current ||
      roleDialogRef.current ||
      userFormDialogRef.current ||
      document.body;

    return Swal.fire({
      target,
      heightAuto: false,
      ...options
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers(filter);
      const nextUsers = isPersonnelMode ? result.items.filter(canReceiveAssignments) : result.items;
      setUsers(nextUsers);
      setTotalCount(isPersonnelMode ? nextUsers.length : result.totalCount);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'دریافت لیست کاربران انجام نشد.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleCatalog = async () => {
    try {
      const catalog = await userService.getRoleCatalog();
      setRoleCatalog(catalog);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'دریافت فهرست نقش‌ها انجام نشد.'));
    }
  };

  const fetchUserDetail = async (userId: string, openDialog: boolean = true) => {
    setDetailLoading(true);
    try {
      const detail = await userService.getUserById(userId);
      setSelectedUser(detail);
      setDetailSection('overview');
      setUserPermissionDraft(detail.directPermissions);
      setUserPermissionSearch('');
      if (openDialog) {
        setDetailOpen(true);
      }
      if (canReceiveAssignments(detail)) {
        await ensurePatientsLoaded();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'دریافت جزئیات کاربر انجام نشد.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const ensurePatientsLoaded = async () => {
    if (patientsLoaded) return;
    try {
      const data = await patientService.getAll();
      setPatients(data);
      setPatientsLoaded(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'دریافت لیست بیماران انجام نشد.'));
    }
  };

  useEffect(() => {
    void fetchRoleCatalog();
  }, []);

  useEffect(() => {
    if (isPersonnelMode || !selfServiceMode) return;
    setFilter((current) => ({
      ...current,
      role: current.role || 'Patient',
      pageNumber: 1
    }));
  }, [isPersonnelMode, selfServiceMode]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      void fetchUsers();
    }, filter.searchTerm ? 400 : 0);

    return () => clearTimeout(debounce);
  }, [filter]);

  const openCreateUserDialog = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserFormOpen(true);
  };

  const openEditUserDialog = async (userId: string) => {
    try {
      const detail = await userService.getUserById(userId);
      setEditingUserId(userId);
      setUserForm({
        firstName: detail.firstName,
        lastName: detail.lastName,
        email: detail.email || '',
        phoneNumber: detail.phoneNumber,
        nationalCode: detail.nationalCode || '',
        password: '',
        roles: detail.roles,
        isActive: detail.isActive,
        emailConfirmed: detail.emailConfirmed,
        phoneNumberConfirmed: detail.phoneNumberConfirmed,
        adminNotes: detail.adminNotes || ''
      });
      setUserFormOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'بارگذاری اطلاعات کاربر انجام نشد.'));
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.phoneNumber.trim()) {
      toast.error('نام، نام خانوادگی و شماره موبایل الزامی است.');
      return;
    }

    if (!editingUserId && userForm.password.trim().length < 6) {
      toast.error('برای کاربر جدید، رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (userForm.roles.length === 0) {
      toast.error('حداقل یک نقش برای کاربر انتخاب کنید.');
      return;
    }

    setSavingUser(true);
    try {
      if (editingUserId) {
        const payload: UpdateAdminUserDto = {
          firstName: userForm.firstName.trim(),
          lastName: userForm.lastName.trim(),
          email: userForm.email?.trim() || undefined,
          phoneNumber: userForm.phoneNumber.trim(),
          nationalCode: userForm.nationalCode?.trim() || undefined,
          roles: userForm.roles,
          isActive: userForm.isActive,
          emailConfirmed: userForm.emailConfirmed,
          phoneNumberConfirmed: userForm.phoneNumberConfirmed,
          adminNotes: userForm.adminNotes?.trim() || undefined
        };
        await userService.updateUser(editingUserId, payload);
        toast.success('کاربر با موفقیت ویرایش شد.');
      } else {
        const payload: CreateAdminUserDto = {
          ...userForm,
          firstName: userForm.firstName.trim(),
          lastName: userForm.lastName.trim(),
          email: userForm.email?.trim() || undefined,
          phoneNumber: userForm.phoneNumber.trim(),
          nationalCode: userForm.nationalCode?.trim() || undefined,
          password: userForm.password.trim(),
          adminNotes: userForm.adminNotes?.trim() || undefined
        };
        await userService.createUser(payload);
        toast.success('کاربر جدید ایجاد شد.');
      }

      setUserFormOpen(false);
      setUserForm(emptyUserForm);
      setEditingUserId(null);
      await Promise.all([fetchUsers(), fetchRoleCatalog()]);
      if (selectedUser) {
        await fetchUserDetail(selectedUser.id, false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ذخیره کاربر انجام نشد.'));
    } finally {
      setSavingUser(false);
    }
  };

  const handleStatusChange = async (user: UserListDto) => {
    const nextIsActive = !user.isActive;
    let reason: string | undefined;

    if (!nextIsActive) {
      const result = await fireContextualAlert({
        title: 'غیرفعال‌کردن کاربر',
        input: 'text',
        inputLabel: 'دلیل غیرفعال‌سازی',
        inputPlaceholder: 'در صورت نیاز دلیل را وارد کنید...',
        showCancelButton: true,
        confirmButtonText: 'ثبت',
        cancelButtonText: 'انصراف'
      });
      if (!result.isConfirmed) return;
      reason = result.value || undefined;
    }

    try {
      await userService.changeStatus(user.id, nextIsActive, reason);
      toast.success(nextIsActive ? 'کاربر فعال شد.' : 'کاربر غیرفعال شد.');
      await fetchUsers();
      if (selectedUser?.id === user.id) {
        await fetchUserDetail(user.id, false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تغییر وضعیت کاربر انجام نشد.'));
    }
  };

  const handleLockToggle = async (user: UserListDto) => {
    const nextLocked = !user.isLocked;
    let payload: SetUserLockDto = { isLocked: nextLocked };

    if (nextLocked) {
      const result = await fireContextualAlert({
        title: 'قفل‌کردن حساب کاربری',
        input: 'text',
        inputLabel: 'دلیل قفل شدن حساب',
        inputPlaceholder: 'اختیاری',
        showCancelButton: true,
        confirmButtonText: 'قفل شود',
        cancelButtonText: 'انصراف'
      });
      if (!result.isConfirmed) return;
      payload = { isLocked: true, reason: result.value || undefined };
    }

    try {
      await userService.setLock(user.id, payload);
      toast.success(nextLocked ? 'حساب کاربری قفل شد.' : 'قفل حساب برداشته شد.');
      await fetchUsers();
      if (selectedUser?.id === user.id) {
        await fetchUserDetail(user.id, false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'عملیات قفل/بازکردن حساب انجام نشد.'));
    }
  };

  const handleResetPassword = async (user: UserListDto) => {
    const result = await fireContextualAlert({
      title: `ریست رمز عبور ${user.firstName} ${user.lastName}`,
      input: 'password',
      inputLabel: 'رمز عبور جدید',
      inputPlaceholder: 'حداقل ۶ کاراکتر',
      showCancelButton: true,
      confirmButtonText: 'ثبت',
      cancelButtonText: 'انصراف'
    });

    if (!result.isConfirmed || !result.value) return;
    const payload: AdminResetPasswordDto = { newPassword: result.value };

    try {
      await userService.resetPassword(user.id, payload);
      toast.success('رمز عبور با موفقیت ریست شد.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ریست رمز عبور انجام نشد.'));
    }
  };

  const handleForceLogout = async (user: UserListDto) => {
    const result = await fireContextualAlert({
      title: 'خروج اجباری',
      text: `آیا از خروج اجباری ${user.firstName} ${user.lastName} اطمینان دارید؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'انصراف'
    });

    if (!result.isConfirmed) return;

    try {
      await userService.forceLogout(user.id);
      toast.success('خروج اجباری با موفقیت انجام شد.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'خروج اجباری انجام نشد.'));
    }
  };

  const handleDeleteUser = async (user: UserListDto) => {
    const result = await fireContextualAlert({
      title: 'حذف کاربر',
      text: `حساب ${user.firstName} ${user.lastName} حذف شود؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'انصراف',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      await userService.deleteUser(user.id);
      toast.success('کاربر حذف شد.');
      setDetailOpen(false);
      setSelectedUser(null);
      await Promise.all([fetchUsers(), fetchRoleCatalog()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'حذف کاربر انجام نشد.'));
    }
  };

  const handleUpdateVerification = async (userId: string, payload: UpdateUserContactVerificationDto) => {
    try {
      await userService.updateContactVerification(userId, payload);
      toast.success('وضعیت تایید تماس‌ها به‌روزرسانی شد.');
      await fetchUsers();
      await fetchUserDetail(userId, false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'به‌روزرسانی تایید تماس انجام نشد.'));
    }
  };

  const toggleRolePermission = (permission: string) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission]
    }));
  };

  const toggleUserPermission = (permission: string) => {
    setUserPermissionDraft((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return;

    const payload: UpdateUserPermissionsDto = {
      permissions: [...userPermissionDraft].sort((left, right) => left.localeCompare(right))
    };

    setSavingUserPermissions(true);
    try {
      await userService.updatePermissions(selectedUser.id, payload);
      toast.success('دسترسی‌های مستقیم کاربر به‌روزرسانی شد.');
      await Promise.all([fetchUsers(), fetchUserDetail(selectedUser.id, false)]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ذخیره دسترسی‌های مستقیم کاربر انجام نشد.'));
    } finally {
      setSavingUserPermissions(false);
    }
  };

  const openRoleDialogForCreate = () => {
    setEditingRoleName(null);
    setRoleForm(emptyRoleForm);
    setRolePermissionSearch('');
    setRoleDialogOpen(true);
  };

  const openRoleDialogForEdit = (role: RoleManagementDto) => {
    setEditingRoleName(role.name);
    setRoleForm({ name: role.name, permissions: role.permissions });
    setRolePermissionSearch('');
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      toast.error('نام نقش الزامی است.');
      return;
    }

    setSavingRole(true);
    try {
      if (editingRoleName) {
        await userService.updateRole(editingRoleName, { name: roleForm.name.trim(), permissions: roleForm.permissions });
        toast.success('نقش با موفقیت به‌روزرسانی شد.');
      } else {
        await userService.createRole({ name: roleForm.name.trim(), permissions: roleForm.permissions });
        toast.success('نقش جدید ایجاد شد.');
      }

      setRoleDialogOpen(false);
      setEditingRoleName(null);
      setRoleForm(emptyRoleForm);
      await Promise.all([fetchRoleCatalog(), fetchUsers()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ذخیره نقش انجام نشد.'));
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role: RoleManagementDto) => {
    const result = await fireContextualAlert({
      title: 'حذف نقش',
      text: `نقش ${role.name} حذف شود؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'انصراف'
    });

    if (!result.isConfirmed) return;

    try {
      await userService.deleteRole(role.name);
      toast.success('نقش حذف شد.');
      await Promise.all([fetchRoleCatalog(), fetchUsers()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'حذف نقش انجام نشد.'));
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedUser) return;
    if (!assignmentForm.patientId || !assignmentForm.startDate) {
      toast.error('بیمار و تاریخ شروع الزامی هستند.');
      return;
    }

    setSavingAssignment(true);
    try {
      await assignmentService.create({
        patientId: Number(assignmentForm.patientId),
        caregiverId: selectedUser.id,
        assignmentType: assignmentForm.assignmentType,
        shiftSlot: assignmentForm.assignmentType === AssignmentType.ShiftBased ? assignmentForm.shiftSlot : undefined,
        startDate: new Date(assignmentForm.startDate).toISOString(),
        endDate: assignmentForm.endDate ? new Date(assignmentForm.endDate).toISOString() : undefined,
        isPrimaryCaregiver: assignmentForm.isPrimaryCaregiver,
        notes: assignmentForm.notes.trim()
      });
      toast.success('تخصیص بیمار با موفقیت ثبت شد.');
      setAssignmentForm(emptyAssignmentForm);
      await fetchUserDetail(selectedUser.id, false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'ثبت تخصیص بیمار انجام نشد.'));
    } finally {
      setSavingAssignment(false);
    }
  };

  const renderRoles = (roles: string[]) => (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <span key={role} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {translateRole(role)}
        </span>
      ))}
    </div>
  );

  const renderActionButtons = (user: UserListDto) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void fetchUserDetail(user.id)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          جزئیات
        </span>
      </button>
      <button
        type="button"
        onClick={() => void openEditUserDialog(user.id)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <span className="inline-flex items-center gap-1">
          <Pencil className="h-3.5 w-3.5" />
          ویرایش
        </span>
      </button>
      {!isPersonnelMode && canManageSelfService(user) && (
        <button
          type="button"
          onClick={() => setSelectedUserForAccess(user)}
          className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
        >
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            دسترسی ثبت اطلاعات
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isPersonnelMode ? 'مدیریت پرسنل' : 'مرکز مدیریت کاربران'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isPersonnelMode
              ? 'مدیریت پرسنل درمانی، پروفایل استخدامی، تخصیص بیماران، مدارک، وضعیت همکاری و عملیات منابع انسانی.'
              : 'ایجاد و ویرایش کاربران، مدیریت نقش‌ها و دسترسی‌ها، امنیت حساب، لاگ فعالیت و تخصیص بیماران.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isPersonnelMode && (
            <button
              type="button"
              onClick={openRoleDialogForCreate}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                نقش‌ها و دسترسی‌ها
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={openCreateUserDialog}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700"
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {isPersonnelMode ? 'پرسنل جدید' : 'کاربر جدید'}
            </span>
          </button>
        </div>
      </div>

      <div className={`rounded-2xl p-4 shadow-sm ${isPersonnelMode ? 'border border-indigo-200 bg-indigo-50/70' : 'border border-teal-200 bg-teal-50/70'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ${isPersonnelMode ? 'text-indigo-700' : 'text-teal-700'}`}>
              {isPersonnelMode ? <Shield className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isPersonnelMode ? 'مدیریت حرفه‌ای پرسنل و پروفایل استخدامی' : 'مدیریت دسترسی ثبت اطلاعات بیمار و سالمند'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isPersonnelMode
                  ? 'در این بخش فقط پرسنل درمانی نمایش داده می‌شوند و مدیریت پروفایل استخدامی، مدارک، وضعیت همکاری و تخصیص‌ها از همین صفحه انجام می‌شود.'
                  : 'برای کاربران دارای نقش «بیمار» یا «سالمند» می‌توانید از همین صفحه دسترسی ثبت علائم حیاتی و کاردکس دارویی را مدیریت کنید.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isPersonnelMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'Nurse', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط پرستار
                </button>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'AssistantNurse', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط کمک‌پرستار
                </button>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'ElderlyCareAssistant', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط سالمندیار
                </button>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'Physiotherapist', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط فیزیوتراپ
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'Patient', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط بیماران
                </button>
                <button
                  type="button"
                  onClick={() => setFilter((current) => ({ ...current, role: 'Elderly', pageNumber: 1 }))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  فقط سالمندان
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, role: '', pageNumber: 1 }))}
              className="rounded-xl border border-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white/60"
            >
              {isPersonnelMode ? 'همه پرسنل' : 'همه کاربران'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
            {isPersonnelMode ? `پرسنل قابل مدیریت در این صفحه: ${users.length}` : `کاربران قابل تنظیم در این صفحه: ${eligibleUsers.length}`}
          </span>
          {!isPersonnelMode && selfServiceMode && (
            <span className="rounded-full bg-teal-700 px-3 py-1 font-medium text-white">
              حالت مدیریت دسترسی فعال است
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">جستجو</label>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filter.searchTerm}
              onChange={(event) => setFilter((current) => ({ ...current, searchTerm: event.target.value, pageNumber: 1 }))}
              placeholder="نام، ایمیل، شماره موبایل یا کد ملی..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-4 pr-10 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">نقش</label>
          <select
            value={filter.role}
            onChange={(event) => setFilter((current) => ({ ...current, role: event.target.value, pageNumber: 1 }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="">همه نقش‌ها</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {translateRole(role)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">وضعیت</label>
          <select
            value={filter.isActive === undefined ? '' : filter.isActive.toString()}
            onChange={(event) =>
              setFilter((current) => ({
                ...current,
                isActive: event.target.value === '' ? undefined : event.target.value === 'true',
                pageNumber: 1
              }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="">همه</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">قفل حساب</label>
          <select
            value={filter.isLocked === undefined ? '' : filter.isLocked.toString()}
            onChange={(event) =>
              setFilter((current) => ({
                ...current,
                isLocked: event.target.value === '' ? undefined : event.target.value === 'true',
                pageNumber: 1
              }))
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="">همه</option>
            <option value="true">قفل شده</option>
            <option value="false">باز</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-right">
            <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-6 py-4">کاربر</th>
                <th className="px-6 py-4">نقش‌ها</th>
                <th className="px-6 py-4">تماس و تایید</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">آخرین ورود</th>
                <th className="px-6 py-4">عضویت</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    کاربری یافت نشد.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="align-top transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                          {user.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{user.nationalCode || 'بدون کد ملی'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{renderRoles(user.roles)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-slate-700">{user.phoneNumber}</div>
                        <div className="text-xs text-slate-500">{user.email || '-'}</div>
                        <div className="flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-1 text-xs ${user.phoneNumberConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            موبایل {user.phoneNumberConfirmed ? 'تایید شده' : 'تایید نشده'}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-xs ${user.emailConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            ایمیل {user.emailConfirmed ? 'تایید شده' : 'تایید نشده'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded-full px-2 py-1 text-xs ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {user.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs ${user.isLocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {user.isLocked ? 'قفل شده' : 'باز'}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs ${user.isOnline ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>
                          {user.isOnline ? 'آنلاین' : 'آفلاین'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(user.lastLoginDate)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDateOnly(user.createdAt)}</td>
                    <td className="px-6 py-4">{renderActionButtons(user)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-200 lg:hidden">
          {loading ? (
            <div className="px-4 py-10 text-center text-slate-500">در حال بارگذاری...</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-10 text-center text-slate-500">کاربری یافت نشد.</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{user.phoneNumber}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${user.isOnline ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.isOnline ? 'آنلاین' : 'آفلاین'}
                  </span>
                </div>
                {renderRoles(user.roles)}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">وضعیت</div>
                    <div className="mt-1 text-slate-700">{user.isActive ? 'فعال' : 'غیرفعال'}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">آخرین ورود</div>
                    <div className="mt-1 text-slate-700">{formatDateTime(user.lastLoginDate)}</div>
                  </div>
                </div>
                {renderActionButtons(user)}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-slate-500">
            نمایش {totalCount === 0 ? 0 : (filter.pageNumber - 1) * filter.pageSize + 1} تا {Math.min(filter.pageNumber * filter.pageSize, totalCount)} از {totalCount} {isPersonnelMode ? 'پرسنل' : 'کاربر'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, pageNumber: Math.max(1, current.pageNumber - 1) }))}
              disabled={filter.pageNumber === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              قبلی
            </button>
            <button
              type="button"
              onClick={() => setFilter((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}
              disabled={filter.pageNumber * filter.pageSize >= totalCount}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              بعدی
            </button>
          </div>
        </div>
      </div>

      <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
        <DialogContent ref={userFormDialogRef} className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingUserId ? (isPersonnelMode ? 'ویرایش پرسنل' : 'ویرایش کاربر') : isPersonnelMode ? 'ایجاد پرسنل جدید' : 'ایجاد کاربر جدید'}</DialogTitle>
            <DialogDescription>
              {isPersonnelMode
                ? 'اطلاعات پایه پرسنل، نقش شغلی، وضعیت فعال‌بودن و اطلاعات تماس را از همین پنجره مدیریت کنید.'
                : 'اطلاعات پایه کاربر، نقش‌ها، وضعیت فعال‌بودن و تایید اطلاعات تماس را از همین پنجره مدیریت کنید.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="نام" value={userForm.firstName} onChange={(value) => setUserForm((current) => ({ ...current, firstName: value }))} />
            <Field label="نام خانوادگی" value={userForm.lastName} onChange={(value) => setUserForm((current) => ({ ...current, lastName: value }))} />
            <Field label="شماره موبایل" value={userForm.phoneNumber} onChange={(value) => setUserForm((current) => ({ ...current, phoneNumber: value }))} />
            <Field label="ایمیل" value={userForm.email || ''} onChange={(value) => setUserForm((current) => ({ ...current, email: value }))} />
            <Field label="کد ملی" value={userForm.nationalCode || ''} onChange={(value) => setUserForm((current) => ({ ...current, nationalCode: value }))} />
            {!editingUserId && (
              <Field label="رمز عبور اولیه" type="password" value={userForm.password} onChange={(value) => setUserForm((current) => ({ ...current, password: value }))} />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-800">نقش‌ها</div>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => {
                const selected = userForm.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setUserForm((current) => ({
                        ...current,
                        roles: selected ? current.roles.filter((item) => item !== role) : [...current.roles, role]
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      selected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {translateRole(role)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextAreaField
              label="یادداشت ادمین"
              value={userForm.adminNotes || ''}
              onChange={(value) => setUserForm((current) => ({ ...current, adminNotes: value }))}
            />
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={userForm.isActive}
                  onChange={(event) => setUserForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                کاربر فعال باشد
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={userForm.phoneNumberConfirmed}
                  onChange={(event) => setUserForm((current) => ({ ...current, phoneNumberConfirmed: event.target.checked }))}
                />
                شماره موبایل تایید شده است
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={userForm.emailConfirmed}
                  onChange={(event) => setUserForm((current) => ({ ...current, emailConfirmed: event.target.checked }))}
                />
                ایمیل تایید شده است
              </label>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setUserFormOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={() => void handleSaveUser()}
              disabled={savingUser}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {savingUser ? 'در حال ذخیره...' : editingUserId ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent ref={roleDialogRef} className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>مدیریت نقش‌ها و سطوح دسترسی</DialogTitle>
            <DialogDescription>
              نقش‌های جدید بسازید، مجوزهای role-based را تنظیم کنید و بدون تغییر ساختار پروژه، سطوح دسترسی تازه اضافه کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              {roleCatalog.roles.map((role) => (
                <div key={role.name} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-bold text-slate-900">{translateRole(role.name)}</div>
                        {role.isSystemRole && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">سیستمی</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">نام داخلی: {role.name}</div>
                      <div className="mt-2 text-xs text-slate-500">تعداد کاربران: {role.userCount}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openRoleDialogForEdit(role)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        ویرایش
                      </button>
                      {!role.isSystemRole && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteRole(role)}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissions.length === 0 ? (
                      <span className="text-xs text-slate-500">سطح دسترسی اختصاصی تعریف نشده است.</span>
                    ) : (
                      role.permissions.map((permission) => (
                        <span key={permission} className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                          {getPermissionLabel(permission)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">{editingRoleName ? 'ویرایش نقش' : 'نقش جدید'}</div>
                  <div className="text-xs text-slate-500">نقش و سطح دسترسی آن را تعریف کنید.</div>
                </div>
                {!editingRoleName && (
                  <button
                    type="button"
                    onClick={() => setRoleForm(emptyRoleForm)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    پاک‌سازی
                  </button>
                )}
              </div>

              <Field label="نام نقش" value={roleForm.name} onChange={(value) => setRoleForm((current) => ({ ...current, name: value }))} />

              <div className="mt-4">
                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-700">سطوح دسترسی</div>
                    <div className="text-xs text-slate-500">Permissionها بر اساس ماژول‌های سیستم گروه‌بندی شده‌اند.</div>
                  </div>
                  <input
                    value={rolePermissionSearch}
                    onChange={(event) => setRolePermissionSearch(event.target.value)}
                    placeholder="جست‌وجوی دسترسی..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:max-w-xs"
                  />
                </div>
                <div className="space-y-4">
                  {rolePermissionGroups.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                      دسترسی منطبق با جست‌وجو پیدا نشد.
                    </div>
                  ) : (
                    rolePermissionGroups.map((group) => (
                      <div key={group.key} className="rounded-2xl border border-slate-200 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{group.title}</div>
                            <div className="text-xs text-slate-500">{group.permissions.length} دسترسی</div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setRoleForm((current) => ({
                                ...current,
                                permissions: Array.from(
                                  new Set([
                                    ...current.permissions,
                                    ...group.permissions.map((permission) => permission.key)
                                  ])
                                )
                              }))
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                          >
                            انتخاب همه گروه
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                          {group.permissions.map((permission) => {
                            const checked = roleForm.permissions.includes(permission.key);
                            return (
                              <label key={permission.key} className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleRolePermission(permission.key)}
                                  className="mt-1"
                                />
                                <span className="space-y-1">
                                  <span className="block font-medium text-slate-900">{permission.displayName}</span>
                                  <span className="block text-xs text-slate-500">{permission.description}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveRole()}
                  disabled={savingRole}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {savingRole ? 'در حال ذخیره...' : editingRoleName ? 'ذخیره نقش' : 'ایجاد نقش'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoleName(null);
                    setRoleForm(emptyRoleForm);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  فرم جدید
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDetailSection('overview');
          }
        }}
      >
        <DialogContent ref={detailDialogRef} className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{isPersonnelMode ? 'جزئیات پرسنل' : 'جزئیات کاربر'}</DialogTitle>
            <DialogDescription>
              {isPersonnelMode
                ? 'نمای کامل وضعیت حساب، پروفایل استخدامی، مدارک، لاگ‌ها و تخصیص‌های پرسنل.'
                : 'نمای کامل وضعیت حساب، تایید تماس، لاگ‌ها و تخصیص‌های کاربر.'}
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !selectedUser ? (
            <div className="py-12 text-center text-slate-500">در حال بارگذاری جزئیات...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{selectedUser.phoneNumber}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderRoles(selectedUser.roles)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusChip icon={<CheckCircle className="h-3.5 w-3.5" />} active={selectedUser.isActive} activeLabel="فعال" inactiveLabel="غیرفعال" />
                  <StatusChip icon={<Lock className="h-3.5 w-3.5" />} active={selectedUser.isLocked} activeLabel="قفل شده" inactiveLabel="باز" activeClassName="bg-amber-100 text-amber-700" />
                  <StatusChip icon={<Wifi className="h-3.5 w-3.5" />} active={selectedUser.isOnline} activeLabel="آنلاین" inactiveLabel="آفلاین" activeClassName="bg-cyan-100 text-cyan-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <InfoCard title="اطلاعات پایه">
                  <InfoRow label="ایمیل" value={selectedUser.email || '-'} />
                  <InfoRow label="موبایل" value={selectedUser.phoneNumber} />
                  <InfoRow label="کد ملی" value={selectedUser.nationalCode || '-'} />
                  <InfoRow label="تاریخ عضویت" value={formatDateTime(selectedUser.createdAt)} />
                  <InfoRow label="آخرین ورود" value={formatDateTime(selectedUser.lastLoginDate)} />
                  <InfoRow label="IP آخرین ورود" value={selectedUser.lastLoginIp || '-'} />
                </InfoCard>

                <InfoCard title="امنیت و تایید">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateVerification(selectedUser.id, {
                            emailConfirmed: !selectedUser.emailConfirmed,
                            phoneNumberConfirmed: selectedUser.phoneNumberConfirmed
                          })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        {selectedUser.emailConfirmed ? 'لغو تایید ایمیل' : 'تایید ایمیل'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateVerification(selectedUser.id, {
                            emailConfirmed: selectedUser.emailConfirmed,
                            phoneNumberConfirmed: !selectedUser.phoneNumberConfirmed
                          })
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        {selectedUser.phoneNumberConfirmed ? 'لغو تایید موبایل' : 'تایید موبایل'}
                      </button>
                    </div>
                    <InfoRow label="قفل تا" value={formatDateTime(selectedUser.lockoutEnd)} />
                    <InfoRow label="دلیل غیرفعال‌سازی" value={selectedUser.banReason || '-'} />
                    <InfoRow label="یادداشت ادمین" value={selectedUser.adminNotes || '-'} />
                  </div>
                </InfoCard>

                <InfoCard title="عملیات مدیریتی">
                  <div className="flex flex-wrap gap-2">
                    <ActionButton onClick={() => void openEditUserDialog(selectedUser.id)} icon={<Pencil className="h-4 w-4" />} label="ویرایش کاربر" />
                    {isPersonnelMode && canReceiveAssignments(selectedUser) && (
                  <>
                    <ActionButton
                      onClick={() => setDetailSection('employment-profile')}
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label="مدیریت پروفایل استخدامی"
                      className={detailSection === 'employment-profile' ? 'border-teal-200 bg-teal-50 text-teal-700' : ''}
                    />
                    <Link
                      href={`/dashboard/personnel/employment-profile?userId=${selectedUser.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      صفحه مستقل
                    </Link>
                  </>
                )}
                    <ActionButton onClick={() => void handleStatusChange(selectedUser)} icon={<Ban className="h-4 w-4" />} label={selectedUser.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'} />
                    <ActionButton onClick={() => void handleLockToggle(selectedUser)} icon={<Lock className="h-4 w-4" />} label={selectedUser.isLocked ? 'بازکردن قفل' : 'قفل حساب'} />
                    <ActionButton onClick={() => void handleResetPassword(selectedUser)} icon={<KeyRound className="h-4 w-4" />} label="ریست رمز عبور" />
                    <ActionButton onClick={() => void handleForceLogout(selectedUser)} icon={<Shield className="h-4 w-4" />} label="خروج اجباری" />
                    {canManageSelfService(selectedUser) && (
                      <ActionButton onClick={() => setSelectedUserForAccess(selectedUser)} icon={<Clock3 className="h-4 w-4" />} label="دسترسی ثبت اطلاعات" />
                    )}
                    <ActionButton
                      onClick={() => void handleDeleteUser(selectedUser)}
                      icon={<Trash2 className="h-4 w-4" />}
                      label="حذف کاربر"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    />
                  </div>
                </InfoCard>
              </div>

              {isPersonnelMode && canReceiveAssignments(selectedUser) && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailSection('overview')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      detailSection === 'overview'
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    نمای کلی کاربر
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailSection('employment-profile')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      detailSection === 'employment-profile'
                        ? 'bg-teal-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    پروفایل استخدامی
                  </button>
                </div>
              )}

              {isPersonnelMode && detailSection === 'employment-profile' && canReceiveAssignments(selectedUser) ? (
                <InfoCard title="مدیریت پروفایل استخدامی پرسنل">
                  <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-7 text-teal-800">
                    در این بخش ادمین می‌تواند پروفایل استخدامی، مدارک، وضعیت تایید، توضیحات اصلاح، ثبت نهایی اجباری و Audit اختصاصی این پرسنل را بدون خروج از مدیریت پرسنل مشاهده و ویرایش کند.
                  </div>
                  <CaregiverProfileWizard adminUserId={selectedUser.id} />
                </InfoCard>
              ) : (
                <>
              <InfoCard title="سطوح دسترسی موثر">
                <div className="flex flex-wrap gap-2">
                  {selectedUser.effectivePermissions.length === 0 ? (
                    <span className="text-sm text-slate-500">برای نقش‌های این کاربر سطح دسترسی اختصاصی تعریف نشده است.</span>
                  ) : (
                    selectedUser.effectivePermissions.map((permission) => (
                      <span key={permission} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                        {getPermissionLabel(permission)}
                      </span>
                    ))
                  )}
                </div>
              </InfoCard>

              <InfoCard title="دسترسی‌های مستقیم کاربر">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-slate-500">
                      این دسترسی‌ها علاوه بر نقش‌های کاربر اعمال می‌شوند و در `Effective Permissions` لحاظ می‌شوند.
                    </div>
                    <input
                      value={userPermissionSearch}
                      onChange={(event) => setUserPermissionSearch(event.target.value)}
                      placeholder="جست‌وجوی دسترسی کاربر..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm md:max-w-xs"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedUser.directPermissions.length === 0 ? (
                      <span className="text-sm text-slate-500">برای این کاربر هنوز دسترسی مستقیم تعریف نشده است.</span>
                    ) : (
                      selectedUser.directPermissions.map((permission) => (
                        <span key={permission} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                          {getPermissionLabel(permission)}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    {userPermissionGroups.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                        دسترسی منطبق با جست‌وجو پیدا نشد.
                      </div>
                    ) : (
                      userPermissionGroups.map((group) => (
                        <div key={group.key} className="rounded-2xl border border-slate-200 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium text-slate-900">{group.title}</div>
                              <div className="text-xs text-slate-500">{group.permissions.length} دسترسی</div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setUserPermissionDraft((current) =>
                                  Array.from(
                                    new Set([
                                      ...current,
                                      ...group.permissions.map((permission) => permission.key)
                                    ])
                                  )
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              افزودن همه گروه
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                            {group.permissions.map((permission) => {
                              const checked = userPermissionDraft.includes(permission.key);
                              return (
                                <label key={permission.key} className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleUserPermission(permission.key)}
                                    className="mt-1"
                                  />
                                  <span className="space-y-1">
                                    <span className="block font-medium text-slate-900">{permission.displayName}</span>
                                    <span className="block text-xs text-slate-500">{permission.description}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveUserPermissions()}
                      disabled={savingUserPermissions}
                      className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {savingUserPermissions ? 'در حال ذخیره...' : 'ذخیره دسترسی‌های مستقیم'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserPermissionDraft(selectedUser.directPermissions)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      بازنشانی به وضعیت ذخیره‌شده
                    </button>
                  </div>
                </div>
              </InfoCard>

              {canReceiveAssignments(selectedUser) && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
                  <InfoCard title="تخصیص بیماران">
                    <div className="space-y-3">
                      {selectedUser.assignedPatients.length === 0 ? (
                        <div className="text-sm text-slate-500">هنوز بیماری به این کاربر تخصیص داده نشده است.</div>
                      ) : (
                        selectedUser.assignedPatients.map((assignment) => (
                          <div key={assignment.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="font-medium text-slate-900">{assignment.patientName}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {formatAssignmentType(assignment.assignmentType)} | شیفت: {formatShiftSlot(assignment.shiftSlot)}
                                </div>
                              </div>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                {formatAssignmentStatus(assignment.status)}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-3">
                              <div>شروع: {formatDateOnly(assignment.startDate)}</div>
                              <div>پایان: {formatDateOnly(assignment.endDate)}</div>
                              <div>{assignment.isPrimaryCaregiver ? 'پرستار اصلی' : 'همکار مراقبتی'}</div>
                            </div>
                            {assignment.notes && <div className="mt-2 text-xs text-slate-500">{assignment.notes}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </InfoCard>

                  <InfoCard title="افزودن تخصیص جدید">
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">بیمار</label>
                        <select
                          value={assignmentForm.patientId}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, patientId: event.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        >
                          <option value="">انتخاب بیمار</option>
                          {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.firstName} {patient.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">نوع تخصیص</label>
                        <select
                          value={assignmentForm.assignmentType}
                          onChange={(event) =>
                            setAssignmentForm((current) => ({
                              ...current,
                              assignmentType: Number(event.target.value) as AssignmentType
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        >
                          <option value={AssignmentType.Daily}>روزانه</option>
                          <option value={AssignmentType.Monthly}>ماهانه</option>
                          <option value={AssignmentType.ShiftBased}>شیفتی</option>
                          <option value={AssignmentType.TwentyFourHour}>۲۴ ساعته</option>
                        </select>
                      </div>
                      {assignmentForm.assignmentType === AssignmentType.ShiftBased && (
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">شیفت</label>
                          <select
                            value={assignmentForm.shiftSlot}
                            onChange={(event) =>
                              setAssignmentForm((current) => ({
                                ...current,
                                shiftSlot: Number(event.target.value) as ShiftSlot
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                          >
                            <option value={ShiftSlot.Morning}>صبح</option>
                            <option value={ShiftSlot.Evening}>عصر</option>
                            <option value={ShiftSlot.Night}>شب</option>
                            <option value={ShiftSlot.Long}>لانگ</option>
                            <option value={ShiftSlot.TwentyFourHour}>۲۴ ساعته</option>
                          </select>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Field
                          label="تاریخ شروع"
                          type="date"
                          value={assignmentForm.startDate}
                          onChange={(value) => setAssignmentForm((current) => ({ ...current, startDate: value }))}
                        />
                        <Field
                          label="تاریخ پایان"
                          type="date"
                          value={assignmentForm.endDate}
                          onChange={(value) => setAssignmentForm((current) => ({ ...current, endDate: value }))}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={assignmentForm.isPrimaryCaregiver}
                          onChange={(event) => setAssignmentForm((current) => ({ ...current, isPrimaryCaregiver: event.target.checked }))}
                        />
                        این کاربر به‌عنوان مراقب اصلی ثبت شود
                      </label>
                      <TextAreaField
                        label="یادداشت تخصیص"
                        value={assignmentForm.notes}
                        onChange={(value) => setAssignmentForm((current) => ({ ...current, notes: value }))}
                      />
                      <button
                        type="button"
                        onClick={() => void handleCreateAssignment()}
                        disabled={savingAssignment}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {savingAssignment ? 'در حال ثبت...' : 'ثبت تخصیص بیمار'}
                      </button>
                    </div>
                  </InfoCard>
                </div>
              )}

              <InfoCard title="لاگ فعالیت‌ها و تغییرات">
                {selectedUser.auditLogs.length === 0 ? (
                  <div className="text-sm text-slate-500">هنوز لاگی برای این کاربر ثبت نشده است.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.auditLogs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-slate-400" />
                            <div className="font-medium text-slate-900">{log.action}</div>
                          </div>
                          <div className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{log.details || '-'}</div>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                          <span>انجام‌دهنده: {log.performedBy}</span>
                          <span>IP: {log.ipAddress || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </InfoCard>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PatientSelfServiceAccessModal
        user={selectedUserForAccess}
        isOpen={Boolean(selectedUserForAccess)}
        onClose={() => setSelectedUserForAccess(null)}
        onSaved={fetchUsers}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

function InfoCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-4 text-sm font-bold text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-left text-slate-800">{value}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  className = ''
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );
}

function StatusChip({
  icon,
  active,
  activeLabel,
  inactiveLabel,
  activeClassName = 'bg-emerald-100 text-emerald-700'
}: {
  icon: React.ReactNode;
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  activeClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${active ? activeClassName : 'bg-slate-100 text-slate-700'}`}>
      {icon}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function buildPermissionGroups(permissions: PermissionDefinitionDto[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();

  permissions.forEach((permission) => {
    const existing = groups.get(permission.group);
    if (existing) {
      existing.permissions.push(permission);
      return;
    }

    groups.set(permission.group, {
      key: permission.group,
      title: permission.groupDisplayName,
      permissions: [permission]
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    permissions: [...group.permissions].sort((left, right) => left.displayName.localeCompare(right.displayName, 'fa'))
  }));
}

function filterPermissionGroups(groups: PermissionGroup[], searchTerm: string): PermissionGroup[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) =>
        [
          permission.displayName,
          permission.description,
          permission.groupDisplayName,
          permission.key
        ].some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    }))
    .filter((group) => group.permissions.length > 0);
}
