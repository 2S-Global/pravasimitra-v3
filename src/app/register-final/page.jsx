'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import OtherBanner from '@/app/components/OtherBanner';
import AlertService from '@/app/components/alertService';

export default function RegisterFinalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('registerData');
    if (!storedData) {
      // Redirect to registration page if no data
      router.push('/register');
      return;
    }
    setUserData(JSON.parse(storedData));

    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(`/api/membership/list-plan`);
        if (data.success) {
          setPackages(data.data);
        } else {
          AlertService.error('Failed to load membership plans');
        }
      } catch (error) {
        console.error(error);
        AlertService.error('Something went wrong while fetching plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [router]);

  const handleSelect = async (pkg) => {
    setLoading(true);
    try {
      AlertService.message(`Redirecting to payment for ${pkg.name}...`);

      // Save selected plan in sessionStorage
      sessionStorage.setItem('selectedPlan', JSON.stringify(pkg));

      const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND; 
      const successUrl = `${FRONTEND_URL}/payment-successMembership?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${FRONTEND_URL}/payment-cancelled`;

      const { data } = await axios.post(`/api/membership-payment`, {
        cartItems: [{ title: pkg.name, price: pkg.price, quantity: 1 }],
        successUrl,
        cancelUrl
      });

      if (!data || !data.url) throw new Error(data?.error || 'Unable to start payment process');

      // Save Stripe session ID in sessionStorage
      if (data.id) sessionStorage.setItem('stripeSessionId', data.id);

      window.location.href = data.url;

    } catch (error) {
      console.error(error);
      AlertService.error(error.message || 'Payment process failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <OtherBanner page_title="Confirm Your Details & Select Package" />

      <main className="min-vh-100 bg-light py-5 px-3">
        <div className="container">
          {userData && (
            <div className="mb-5 p-4 bg-white rounded shadow-sm">
              <h4 className="text-primary fw-bold mb-3">Your Details</h4>
              <div className="row">
                <div className="col-md-6 mb-2"><strong>Name:</strong> {userData.name}</div>
                <div className="col-md-6 mb-2"><strong>Email:</strong> {userData.email}</div>
                <div className="col-md-6 mb-2"><strong>Mobile:</strong> {userData.mobile}</div>
              </div>
            </div>
          )}

          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Choose Your Package</h2>
            <p className="text-muted">Select the package that suits your needs and get started today.</p>
          </div>

          {loadingPlans ? (
            <div className="text-center">Loading plans...</div>
          ) : (
            <div className="row g-4">
              {packages.map((pkg) => (
                <div className="col-md-4" key={pkg._id}>
                  <div className="card h-100 shadow-sm border-0 rounded hover-shadow">
                    <div className="card-body d-flex flex-column">
                      <h4 className="fw-bold text-primary">{pkg.name}</h4>
                      <h2 className="fw-bold mt-2 mb-3">
                        £{pkg.price}{' '}
                        <small className="fs-6 text-muted">/ {pkg.durationInDays} days</small>
                      </h2>
                      <ul className="list-unstyled mt-3 mb-4 flex-grow-1">
                        <li className="d-flex justify-content-between">
                          <span>Buy/Sell Limit:</span> <span>{pkg.limits.buySell}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Rent/Lease Limit:</span> <span>{pkg.limits.rentLease}</span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span>Marketplace Limit:</span> <span>{pkg.limits.marketplace}</span>
                        </li>
                      </ul>
                      <button
                        className="btn btn-primary mt-auto"
                        onClick={() => handleSelect(pkg)}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Select Package'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
        }
      `}</style>
    </>
  );
}
