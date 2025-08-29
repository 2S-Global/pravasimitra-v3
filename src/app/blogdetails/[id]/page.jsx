// app/blogs/[id]/page.js
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OtherBanner from "../../components/OtherBanner";
import { blogs } from "@/lib/blogsData";

export default function BlogDetails({ params }) {
  const blog = blogs.find((b) => b.id === parseInt(params.id));


 return (
    <>
      <Header />
      <OtherBanner page_title={blog.title} />
      <div className="tm-section bg-white tm-padding-section">
        <div className="container">
          <div className="row gy-5 align-items-start">
            {/* Blog Image (on top in mobile view) */}
            <div className="col-12 col-lg-6 order-lg-2">
              <img
                src={blog.image}
                alt={blog.title}
                className="img-fluid rounded shadow"
                style={{  objectFit: "cover", width: "100%" }}
              />
              {/* <div className="mt-3 text-muted small">
                <i className="bi bi-person-fill"></i> <strong>{blog.userId}</strong> &nbsp;|&nbsp;
                <i className="bi bi-calendar-event"></i> {blog.date}
              </div> */}
            </div>

            {/* Blog Content */}
            <div className="col-12 col-lg-6 order-lg-1">
              <h2 className="mb-4">{blog.title}</h2>
              {blog.description.split("\n\n").map((para, index) => (
                <p
                  key={index}
                  style={{ textAlign: "justify", marginBottom: "1em", lineHeight: "1.8", fontSize: "1.05rem" }}
                  dangerouslySetInnerHTML={{ __html: para.trim() }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
