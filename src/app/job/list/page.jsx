'use client'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import Sidebar from "@/app/components/Sidebar"

const JobList = () => {
  return (
    <>
      <Header />
      <OtherBanner page_title="Buy & Sell" />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            <Sidebar />

            <div className="profile-info col-md-9">
              <form method="post" action="" className="tm-form tm-login-form tm-form-bordered form-card">
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline"
                  }}
                >
                  Buy & Sell
                </h4>

                <div className="container my-5">




{/* Page Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold">Find Your Dream Job</h2>
        <p className="text-muted">Browse through the latest job opportunities</p>
      </div>

      {/* Search & Filters */}
      <div className="row mb-4 align-items-end">
        <div className="col-md-6 mb-3 mb-md-0">
          <input
            type="text"
            className="form-control"
            placeholder="Search by job title, company, or location"
          />
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option value="">Category</option>
            <option>Construction</option>
            <option>Delivery</option>
            <option>Support</option>
            <option>Domestic</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100">Search Jobs</button>
        </div>
      </div>

      {/* Job Cards */}
      <div className="row g-4">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div className="col-md-6 col-lg-4" key={id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">Delivery Driver</h5>
                <p className="card-text text-muted mb-1">
                  <i className="bi bi-building me-1"></i> FastExpress Pvt Ltd
                </p>
                <p className="card-text text-muted">
                  <i className="bi bi-geo-alt me-1"></i> Mumbai, India
                </p>
                <span className="badge bg-success mb-3">Full Time</span>
                <p className="small text-muted">
                  Earn up to ₹20,000/month + Incentives. Bike and license required.
                </p>
              </div>
              <div className="card-footer bg-transparent border-0">
                <button className="btn btn-outline-primary w-100">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>





</div>


                {/* Floating Button */}
                <button
                  className="btn btn-danger rounded-circle position-fixed"
                  style={{ bottom: 20, right: 20, width: 50, height: 50 }}
                >
                  <img src="/assets/images/icon-sos.png" alt="" style={{ maxWidth: 25 }} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default JobList
