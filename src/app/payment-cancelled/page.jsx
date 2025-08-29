'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentCancelledPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    document.title = 'Payment Cancelled';

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/user/register');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div
        className="card shadow-lg p-4 text-center border-0 animate__animated animate__fadeIn"
        style={{ maxWidth: '480px' }}
      >
        {/* Icon */}
        <div className="mb-4">
          <div
            className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto"
            style={{ width: '90px', height: '90px' }}
          >
            <i className="bi bi-x-circle-fill fs-1"></i>
          </div>
        </div>

        {/* Title */}
        <h2 className="fw-bold text-danger mb-2">Payment Cancelled</h2>
        <p className="text-muted mb-4">
          Your payment was not completed. If this was a mistake, you can try again or choose another payment method.
        </p>

        {/* Countdown */}
        <div className="text-muted small mb-3">
          Redirecting to your signup in <strong>{countdown}</strong> seconds...
        </div>

        {/* Buttons */}
        {/* <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="/contact" className="btn btn-outline-secondary px-4">
            Contact Support
          </Link>
        </div> */}
      </div>
    </div>
  );
}
