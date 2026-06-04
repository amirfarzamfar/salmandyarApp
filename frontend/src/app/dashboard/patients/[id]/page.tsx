import { Suspense } from 'react';
import PatientProfilePageClient from './PatientProfilePageClient';

export default function PatientProfilePage() {
  return (
    <Suspense fallback={null}>
      <PatientProfilePageClient />
    </Suspense>
  );
}
