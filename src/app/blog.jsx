import Header from "@/app/components/Header";
import OtherBanner from "@/app/components/OtherBanner";
import Footer from "@/app/components/Footer";
import { fetchBlogs } from "@/lib/api";
import Blogs from "@/app/components/Blogs";


const BlogsList =({blogs}) =>{

return(

<>
<Header />
<OtherBanner page_title="Blogs List" />

<Blogs blogs={blogs} />

<Footer />
</>

)



}

export default BlogsList;

// Server-side fetch
export async function getServerSideProps() {
  alert('a')
  const blogs = await fetchBlogs();
  return {
    props: {
      blogs: blogs.slice(0, 10), // Limit to 10 posts
    },
  };
}