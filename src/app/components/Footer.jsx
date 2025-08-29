import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer
      className="footer"
      data-bgimage="assets/images/bg/bg-image-1.jpg"
      data-black-overlay={9}
    >
      {/* Footer Widgets */}
      <div className={`footer-toparea ${styles.tmPaddingSection}`} >
        <div className="container">
          <div className="row widgets footer-widgets">
            <div className="col-lg-6 col-md-6 col-12">
              {/* Single Widget (Widget Info) */}
              <div className="single-widget widget-info row">
                <div className="col-lg-4 col-md-4 col-12">
                <a href="/" className="widget-info-logo">
                  <img
                    src="/assets/images/logo/logo-dark.png"
                    alt="footer logo"
                    style={{ maxWidth: "80%" }}
                  />
                </a>
                </div >
                    <div className="col-lg-8 col-md-8 col-12">
                <p style={{ textAlign: "justify",lineHeight:"2.4" }}>
                  Pravasi Mitra is a platfrom and mobile app acting as a
                  comprehensive "companion" for migrants abroad. It offers vital
                  inter-community services like secure remittance, a dynamic
                  marketplace for buying/selling/renting, and various other
                  community-based resources. Its goal is to simplify life away
                  from home, fostering connection and support for global
                  migrants.
                </p>
                </div>
                <ul className="widget-info-social">
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter" />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f" />
                    </a>
                  </li>
                  {/*  <li>
                <a href="#">
                  <i className="fab fa-skype" />
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fab fa-pinterest-p" />
                </a>
              </li> */}
                </ul>
              </div>
              {/*// Single Widget (Widget Info) */}
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              {/* Single Widget (Widget Contact) */}
              <div className="single-widget widget-contact">
                <h5 className="widget-title">Contact Us</h5>
                <ul>
                  <li>
                    <i className="fas fa-map-marker-alt" />
                    <p>971 US Highway 202N STE N Branchburg NJ 08876</p>
                  </li>
                  <li>
                    <i className="fas fa-envelope" />
                    <p>
                      Email:{" "}
                      <a href="mailto:info@pravasimitra.us">
                        info@pravasimitra.us
                      </a>
                    </p>
                    {/* <p>Skype: <a href="#">example.name</a></p> */}
                  </li>
                  <li>
                    <i className="fas fa-phone" />
                    <p>
                      <a href="tel://+12022152529">+1(202) 215 2529</a>
                    </p>
                    {/* <p><a href="#">1-800-915-6271</a></p> */}
                  </li>
                </ul>
              </div>
              {/*// Single Widget (Widget Contact) */}
            </div>
         {/* <div className="col-lg-3 col-md-6 col-12">

  <div className="single-widget widget-recentpost">
    <h5 className="widget-title">Menu</h5>
    <ul>
      <li>
        <a href="/about-us">About Us</a>
      </li>
      <li>
        <a href="/blogs">Blogs</a>
      </li>
      <li>
        <a href="/faq">FAQ</a>
      </li>
      <li>
        <a href="/contact-us">Contact</a>
      </li>
    </ul>
  </div>

</div> */}

            <div className="col-lg-3 col-md-6 col-12">
              {/* Single Widget (Widget Newsletter) */}
              <div className="single-widget widget-newsletter">
                <h5 className="widget-title">Get In Touch</h5>
                <p>
                  Get Business news, tip and solutions to your problems from our
                  experts.
                </p>
                <form id="tm-mailchimp-form" className="widget-newsletter-form">
                  <input
                    id="mc-email"
                    type="text"
                    placeholder="Enter email address"
                  />
                  <button id="mc-submit" type="submit" className="tm-button">
                    Subscribe Now <b />
                  </button>
                </form>
                {/* Mailchimp Alerts */}
                <div className="tm-mailchimp-alerts">
                  <div className="tm-mailchimp-submitting" />
                  <div className="mailchimp-success" />
                  <div className="tm-mailchimp-error" />
                </div>
                {/*// Mailchimp Alerts */}
              </div>
              {/*// Single Widget (Widget Newsletter) */}
            </div>
          </div>
        </div>
      </div>
      {/*// Footer Widgets */}
      {/* Footer */}
      <div className="footer-bottomarea">
        <div className="container">
          <p className="footer-copyright">
            © 2025. Designed by{" "}
            <a target="_blank" href="https://www.2sglobal.co/">
              2S Global Technologies Ltd{" "}
            </a>
          </p>
        </div>
      </div>
      {/*// Footer */}
    </footer>
  );
};

export default Footer;
