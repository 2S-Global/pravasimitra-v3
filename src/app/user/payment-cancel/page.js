'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentCancelledPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = 'Payment Cancelled';
  }, []);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div className="card shadow-lg p-4 text-center border-0" style={{ maxWidth: '480px' }}>
        
        {/* Icon */}
        <div className="mb-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-x-circle-fill fs-1"></i>
          </div>
        </div>

        {/* Title */}
        <h2 className="fw-bold text-danger mb-2">Payment Cancelled</h2>
        <p className="text-muted mb-4">
          Your payment was not completed. If this was a mistake, you can try again or choose another payment method.
        </p>

        {/* Buttons */}
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="/cart" className="btn btn-primary px-4">
            Try Again
          </Link>
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => router.push('/user/my-account')}
          >
            Back to Home
          </button>
        </div>

        {/* Support */}
        {/* <div className="mt-4 small text-muted">
          Need help? <Link href="/contact" className="text-decoration-none">Contact Support</Link>
        </div> */}
      </div>
    </div>
  );
}
