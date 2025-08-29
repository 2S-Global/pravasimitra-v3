

const Contact = () =>{

    return(
<main className="main-content">
  <div className="tm-section contact-us-area tm-padding-section bg-white">
    <div className="container">
      <div className="row justify-content-center mt-30-reverse">
        <div className="col-lg-4 col-md-6 col-sm-6 mt-30">
          <div
            className="tm-contact-block text-center"
            style={{ height: "100%" }}
          >
            <span className="tm-contact-icon">
              <i className="flaticon-placeholder" />
            </span>
            <h5>Address</h5>
            <p style={{ textAlign: "left" }}>
              971 US Highway 202N STE N Branchburg NJ 08876
            </p>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-6 mt-30">
          <div
            className="tm-contact-block text-center"
            style={{ height: "100%" }}
          >
            <span className="tm-contact-icon">
              <i className="flaticon-call" />
            </span>
            <h5>Phone</h5>
            <p>
              <a href="tel://+919831823898">+971 521710457</a>
            </p>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-6 mt-30">
          <div
            className="tm-contact-block text-center"
            style={{ height: "100%" }}
          >
            <span className="tm-contact-icon">
              <i className="flaticon-email-1" />
            </span>
            <h5>Email Address</h5>
            <p>
              Email:{" "}
              <a href="mailto:info@pravasimitra.us">
               info@pravasimitra.us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="container tm-padding-section-top">
      <div className="row no-gutters">
        <div className="col-lg-7">
          <div className="tm-contact-formwrapper">
            <h5>Let’s get in touch</h5>
            <form method="post" id="tm-contactform" className="tm-contact-form">
              <div className="tm-contact-formfield">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Name*"
                  required="required"
                />
              </div>
              <div className="tm-contact-formfield">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email*"
                  required="required"
                />
              </div>
              <div className="tm-contact-formfield">
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  placeholder="Subject*"
                  required="required"
                />
              </div>
              <div className="tm-contact-formfield">
                <textarea
                  name="message"
                  id="message"
                  cols={30}
                  rows={5}
                  required="required"
                  placeholder="Message*"
                  defaultValue={""}
                />
              </div>
              <div className="tm-contact-formfield">
                <button type="submit" className="tm-button">
                  Send Message <b />
                </button>
              </div>
            </form>
            <p className="form-messages" />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="tm-contact-map">
            {/* <div id="google-map"></div> */}
            <div className="mapouter" style={{ width: "100%" }}>
              <div className="gmap_canvas" style={{ width: "100%" }}>
                <iframe
                  width="100%"
                  height={560}
                  id="gmap_canvas"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d780.0879906859071!2d55.308375683941456!3d25.24561977226052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1721634510897!5m2!1sen!2sus"
                  frameBorder={0}
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                />
                <a href="https://timenowin.net/">online clock</a>
                <br />
                <a href="https://www.analarmclock.com/" />
                <br />
                <style
                  dangerouslySetInnerHTML={{
                    __html:
                      "\n                                    .mapouter{position: relative;text-align: right;height: 560px;width: 100%;}\n                                "
                  }}
                />
                <a href="https://www.mapembed.net">html map area</a>
                <style
                  dangerouslySetInnerHTML={{
                    __html:
                      "\n                                    .gmap_canvas{overflow: hidden;background: none !important;height: 560px;width: 100%;}\n                                "
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>


    )
}

export default Contact