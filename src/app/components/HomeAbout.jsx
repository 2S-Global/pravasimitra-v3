"use client";

import Link from "next/link";
import { Box, Button, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useEffect, useState } from "react";

const sliderImages = [
  "/assets/blog/IMG-2.jpg",
  "/assets/blog/IMG-9.jpg",
  "/assets/blog/IMG-7.jpg",
  "/assets/blog/IMG-10.jpg",
];

const HomeAbout = () => {
  const [current, setCurrent] = useState(0);

  // Auto play every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrent(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length
    );
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % sliderImages.length);
  };

  return (
    <>
      <div className="tm-section about-us-area bg-white tm-padding-section">
        <div className="container">
          <div className="row">
            {/* Left Text Content */}
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="about-content">
                <h2>About Pravasi Mitra</h2>
                <p style={{ textAlign: "justify" }}>
                  At Pravasi Mitra, we understand the unique journey and diverse
                  needs of individuals living and working away from their home
                  country. Our core purpose is to simplify and enrich the lives
                  of migrants by providing a dedicated, comprehensive platform
                  that connects them to essential services and a vibrant,
                  supportive community. Pravasi Mitra is a pioneering website
                  and mobile application designed to be your trusted companion,
                  bridging the distance between you and your homeland, and
                  empowering you to thrive wherever you are. We recognize that
                  being away from home brings its own set of challenges, and our
                  platform is meticulously developed to address these with
                  efficiency and care.
                </p>

                <Link href="/about-us" className="tm-button">
                  About Us <b />
                </Link>
              </div>
            </div>

            {/* Right Image Slider */}
            <div className="col-lg-5 order-1 order-lg-2 offset-1 slider-new">
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                <img
                  src={sliderImages[current]}
                  alt={`Slide ${current + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: 400,
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                {/* Arrows */}
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                  }}
                >
                  <ArrowBackIos />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translateY(-50%)",
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                  }}
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeAbout;
