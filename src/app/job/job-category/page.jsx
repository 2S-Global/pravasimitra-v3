'use client'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import Sidebar from "@/app/components/Sidebar"

const JobCategory = () => {
  return (
    <>
      <Header />
      <OtherBanner page_title="Dashboard" />

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
                  Search Jobs
                </h4>

                <div className="container mt-4">

                  <div className="row g-4">
                    {[
                      { id: 1, label: "Construction Job", image: "/assets/images/Construction_Job.png" },
                      { id: 2, label: "Domestic Job", image: "/assets/images/Domestic_Job.png" },
                      { id: 3, label: "Transport Job", image: "/assets/images/Transport_Job.png" },
                      { id: 4, label: "Delivery Job", image: "/assets/images/Delivery_Job.png" },
                      { id: 5, label: "Gardening Job", image: "/assets/images/Gardening_Job.png" },
                      { id: 6, label: "Support Staffs", image: "/assets/images/Support_Staffs.png" },
                    ].map(job => (
                      <div key={job.id} className="col-6 col-md-4 " style={{ cursor: "pointer" }}>
                        <div className="card text-center shadow-sm h-100 p-3 jobcategory-card" style={{border: "none"}}>
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <img
                              src={job.image}
                              alt={job.label}
                              style={{ width: "70px", height: "70px", objectFit: "contain" }}
                              className="mb-2"
                            />
                            <p className="mb-0 fw-bold">{job.label}</p>
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

export default JobCategory
