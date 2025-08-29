'use client'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import Sidebar from "@/app/components/Sidebar"

const JobDetails = () => {
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
                  Job Details
                </h4>

                <div className="container my-5">

 <div className="container">
          <div className="row">
            {/* Main Content */}
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4" style={{border:"none"}}>
                <div className="card-body">
                  <h3 className="card-title">Senior Frontend Developer</h3>
                  <p className="text-muted mb-2">Location: <strong>Bangalore, India</strong></p>
                  <p className="text-muted mb-4">Posted: 2 days ago</p>

                  <h5>Job Description</h5>
                  <p>
                    We are seeking a Senior Frontend Developer with experience in React, Next.js, and modern frontend development practices. You will be working closely with our design and backend team to deliver best-in-class UI experiences.
                  </p>

                  <h5>Responsibilities</h5>
                  <ul>
                    <li>Build reusable and scalable components in React/Next.js</li>
                    <li>Integrate REST APIs and third-party libraries</li>
                    <li>Collaborate with cross-functional teams</li>
                    <li>Maintain performance and accessibility standards</li>
                  </ul>

                  <h5>Qualifications</h5>
                  <ul>
                    <li>3+ years experience in frontend development</li>
                    <li>Strong proficiency in JavaScript, HTML, CSS</li>
                    <li>Experience with Tailwind, Bootstrap or similar</li>
                    <li>Familiarity with Git and CI/CD tools</li>
                  </ul>

                  <div className="mt-4">
                    <button className="btn btn-primary px-4">Apply Now</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Job Overview</h5>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item"><strong>Job Type:</strong> Full-Time</li>
                    <li className="list-group-item"><strong>Experience:</strong> 3+ Years</li>
                    <li className="list-group-item"><strong>Salary:</strong> ₹12–18 LPA</li>
                    <li className="list-group-item"><strong>Remote:</strong> Yes</li>
                    <li className="list-group-item"><strong>Posted:</strong> May 28, 2025</li>
                  </ul>
                </div>
              </div>

              <div className="card shadow-sm mt-4">
                <div className="card-body">
                  <h5 className="card-title">Company Info</h5>
                  <div className="d-flex align-items-center mb-2">
                    <img src="/assets/images/logo/logo-dark.png" alt="logo" style={{ width: 50, height: 50 }} />
                    <div className="ms-3">
                      <h6 className="mb-0">TechNova Pvt Ltd</h6>
                      <small className="text-muted">Bangalore, India</small>
                    </div>
                  </div>
                  <p className="text-muted">
                    TechNova is a leading software solutions company delivering digital transformation projects across the globe.
                  </p>
                  <a href="#" className="btn btn-outline-primary btn-sm w-100">View Company Profile</a>
                </div>
              </div>
            </div>
          </div>
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

export default JobDetails
