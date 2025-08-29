// app/components/LocationAlert.jsx
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AlertService from './alertService';

export default function LocationAlert() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'missingLocation') {
      AlertService.error(
        "⚠ Please update Current City, Current Country, Destination City, and Destination Country first."
      );
    }
  }, [searchParams]);

  return null;
}
