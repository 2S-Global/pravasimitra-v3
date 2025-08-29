'use-client'
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import Sidebar from "@/app/components/Sidebar"


const MyAccount = () =>{

    return(
       <>
      <Header />
      <OtherBanner page_title="My Account" /> 


<div className="tm-section tm-login-register-area bg-white tm-padding-section">
  <div className="container">
    <div className="row col-md-12">
       
       <Sidebar />

      <div className="profile-info col-md-9">
        <form
          method="post"
          action=""
          className="tm-form tm-login-form tm-form-bordered form-card"
        >
          <h4
            style={{
              textAlign: "center",
              fontWeight: "bold",
              textDecoration: "underline"
            }}
          >
            Profile Information
          </h4>
          <div className="tm-form-inner">
            <div className="row col-md-12">
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="username">Name</label>
                  <input
                    type="text"
                     className="form-control"
                    name="fullname"
                    id="username"
                    defaultValue=""
                    required="required"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="fathername">Father's Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fathername"
                    id="fathername"
                    defaultValue=""
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="mothername">Mother's Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mothername"
                    id="mothername"
                    defaultValue=""
                  />
                </div>
              </div>
            </div>
            <div className="row col-md-12">
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="spouse">Spouse Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="spouse"
                    id="spouse"
                    defaultValue=""
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    id="email"
                    defaultValue=""
                    required="required"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="tm-form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="text" name="phone" id="phone" className="form-control" defaultValue="" />
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row">
                <div className="col-md-6 d-flex flex-column ">
                  <div className="tm-form-field">
                    <label htmlFor="dob">Date of Birth</label>
                    <input type="date" name="dob" id="dob" className="form-control" defaultValue="" />
                  </div>
                </div>
                <div className="col-md-6 d-flex flex-column ">
                  <div className="tm-form-field">
                    <label htmlFor="gender">Gender</label>
                    <select name="gender" id="gender" className="form-control">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br />
          
          <h4
            style={{
              textAlign: "center",
              fontWeight: "bold",
              textDecoration: "underline"
            }}
          >
            Other Information
          </h4>
          <div className="tm-form-inner">
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="passport_number">Passport Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="passport_number"
                      id="passport_number"
                      defaultValue=""
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="passport_exp">Passport Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      name="passport_exp"
                      id="passport_exp"
                      defaultValue=""
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="visa_num">Visa Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="visa_num"
                      id="visa_num"
                      defaultValue=""
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="visa_exp">Visa Expiry</label>
                    <input
                      type="date"
                      className="form-control"
                      name="visa_exp"
                      id="visa_exp"
                      defaultValue=""
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="bmet">BMET Number</label>
                    <input type="text" name="bmet" id="bmet" className="form-control" defaultValue="" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tm-form-field">
                    <label htmlFor="bra">BRA ID</label>
                    <input type="text" name="bra" id="bra" className="form-control" defaultValue="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="tm-form-field"
            style={{ textAlign: "-webkit-center" }}
          >
            <div className="form-group" style={{ display: "inline-flex" }}>
              <input type="button" defaultValue="Back" className="buttoncustomback" />
              <input type="submit" name="submit" defaultValue="Submit" className="buttoncustom" />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>






       <Footer />
       </>
    )

}

export default MyAccount