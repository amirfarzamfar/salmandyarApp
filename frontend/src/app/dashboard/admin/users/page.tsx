import { Suspense } from 'react';
import UsersPageClient from './UsersPageClient';

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageClient />
    </Suspense>
  );
}
