import { Suspense } from 'react';
import UsersPageClient from '../admin/users/UsersPageClient';

export default function PersonnelPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageClient mode="personnel" />
    </Suspense>
  );
}
