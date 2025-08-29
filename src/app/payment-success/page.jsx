'use client'

import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import { useRouter } from 'next/navigation'

const PaymentSuccess = () => {
  const router = useRouter()

  return (
    <>
      <Header />
      <OtherBanner page_title="Payment Successful" banner_image="/assets/images/bg/furniture_banner.jpg" />

      <section className="py-5 bg-light">
        <div className="container text-center">
          <div className="bg-white p-5 shadow rounded-4 mx-auto" style={{ maxWidth: 600 }}>
            <img
              src="/assets/icon-success.png"
              alt="Success"
              className="d-block mx-auto mb-4"
              style={{ width: 80 }}
            />
            <h2 className="fw-bold text-success mb-2">Payment Successful!</h2>
            <p className="text-muted mb-4">Thank you for your purchase. Your order has been placed successfully.</p>

            <div className="text-start bg-light p-4 rounded-3 mb-4">
              <h5 className="fw-bold mb-3">Order Summary</h5>
              <p><strong>Order ID:</strong> #ORD123456</p>
              <p><strong>Total Amount:</strong> ₹26,500</p>
              <p><strong>Payment Method:</strong> Card</p>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => router.push('/user/orders')}>
                View My Orders
              </button>
              <button className="btn btn-success rounded-pill px-4" onClick={() => router.push('/')}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default PaymentSuccess
