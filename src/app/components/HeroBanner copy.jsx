import Link from "next/link";

const HeroBanner = () =>{


  
return(

<div className="heroslider-area">
  {/* Heroslider Slider */}
  <div className="heroslider-slider tm-slider-dots tm-slider-dots-left">
    <div
      className="heroslider-singleslider"
      data-bgimage="assets/images/heroslider/1.jpg"
    />
    <div
      className="heroslider-singleslider"
      data-bgimage="assets/images/heroslider/2.jpg"
    />
    <div
      className="heroslider-singleslider"
      data-bgimage="assets/images/heroslider/3.jpg"
    />
  </div>
  {/*// Heroslider Slider */}
  {/* Heroslider Content */}
  <div className="heroslider-contentwrapper">
    <div className="heroslider-overlay2" />
    <div className="container">
      <div className="row">
        <div className="col-lg-7 col-md-8">
          <div className="heroslider-content">
            <h2
              className="wow fadeInUp tm-animated-text"
              data-in-effect="rollIn"
              data-out-effect="fadeOutDown"
              data-out-shuffle="true"
              data-wow-delay="0.5s" style={{ fontWeight:"bold" }}
            >
            YOUR GLOBAL COMMUNITY, CONNECTED
            </h2>
            <p className="wow fadeInUp" data-wow-delay="0.7s">
              Find support, connect with your community, and access vital services – wherever you are in the world.
            </p>
            <Link
              href="/about-us"
              className="tm-button wow fadeInUp"
              data-wow-delay="0.9s"
            >
              About Us
              <b />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/*// Heroslider Content */}
</div>


)

}

export default HeroBanner;