import Link from "next/link"

const OtherBanner = ({ page_title, banner_image }) => {
  return (
    <div
      className="tm-breadcrumb-area tm-padding-section"
      style={{
        backgroundImage: `url(${banner_image || "/assets/images/bg/breadcrumb-bg-2.jpg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top"

      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="tm-breadcrumb">
              <h2>{page_title}</h2>
              <ul>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>{page_title}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OtherBanner
