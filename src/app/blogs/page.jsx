// ✅ Server Component — no "use client"

import Header from '../components/Header';
import Footer from '../components/Footer';
import OtherBanner from '../components/OtherBanner';
import Blogs from '../components/Blogs';
import { blogs } from "../../lib/blogsData";

export default function BlogsList() {
  //  console.log("Blogs data:", blogs);
  return (
    <>

      <Header />
      <OtherBanner page_title="Blogs List" banner_image="/assets/banner/Banner7.jpg"/>
      <Blogs blogs={blogs} />
      <Footer />
    </>
  );
}
