'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';

import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroBanner from "./components/HeroBanner";
import Services from "./components/Services";
import HomeAbout from "./components/HomeAbout";
import Blogs from "./components/Blogs";
import Testimonials from "./components/Testimonials";
import Loader from './components/Loader';
import LoadScriptOnRouteChange from './components/LoadScriptOnRouteChange';
export default function Home() {

   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // simulate load

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  return (
    <>
     <LoadScriptOnRouteChange />
  <Header />
  <HeroBanner />
  <Services />
  <HomeAbout />
  <Testimonials />
  <Blogs />
  <Footer />
    </>

  );
}
