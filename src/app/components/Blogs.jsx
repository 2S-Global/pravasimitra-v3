import Link from "next/link";
import { blogs } from "@/lib/blogsData"; // ✅ Import directly

const Blogs = () => {
  return (
    <div className="tm-section latest-blog-area tm-padding-section bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="tm-section-title text-center">
              <h2>How Pravasi Mitra Helps</h2>
              <p style={{ textAlign:"justify" }}>
                Pravasi Mitra empowers migrants with essential services like
                remittances, a dynamic marketplace (buy/sell, rent/lease), and
                vital community support. Users from diverse backgrounds share
                how the platform has significantly eased their lives and
                connected them to crucial resources.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {blogs.map((blog, index) => (
            <div className="col-md-4 mb-4" key={blog.id}>
              <div className="tm-blog">
                <div className="tm-blog-image">
                  <img src={blog.image} alt={`Blog image ${index + 1}`} />
                </div>
                <div className="tm-blog-content">
                  <h4>
                    <Link href={`/blogdetails/${blog.id}`}>{blog.title}</Link>
                  </h4>
                  {/* <div className="tm-blog-meta">
                    <span>By {blog.userId}</span>
                    <span>{blog.date}</span>
                  </div> */}
                  <p>{blog.body.slice(0, 80)}...</p>
                  <div className="tm-blog-contentbottom">
                    <Link
                      href={`/blogdetails/${blog.id}`}
                      className="tm-readmore"
                    >
                      Read more <i className="fas fa-chevron-right" />
                    </Link>
                    {/* <a href="#">Comment 02</a> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
