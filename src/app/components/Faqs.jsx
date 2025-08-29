"use client";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    question:
      "What is Pravasi Mitra?",
    answer:
      "Pravasi Mitra is a global platform designed for migrants to buy, sell, rent, lease, or advertise products and services. It connects individuals across countries, making community support and transactions seamless and secure.",
  },
  {
    question: "What kind of products or services can I list?",
    answer:
      "You can list properties (for sale or rent), vehicles, electronic items, household goods, job opportunities, and community services such as transport, food, tuition, etc., as long as they comply with our terms.",
  },
  {
    question:
      "How is my data and communication protected?",
    answer:
      "We use secure encryption and privacy measures. Your personal details are never shared publicly, and messages are routed through our secure system.",
  },
  {
    question: "How do I contact a seller or buyer?",
    answer: "Click on any listing to view the seller’s contact options (like phone, chat, or email). You must be logged in to access some features.",
  },
  {
    question: " Can I list property for rent or lease abroad?",
    answer:
      "Yes, you can list properties in any country. Ensure that you include clear details, rental terms, and any legal requirements relevant to that location.",
  },
];

const Faqs = () => {
  return (
    <main className="main-content">
      <Box sx={{ py: 6, backgroundColor: "#f7f7f7" }}>
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h2 style={{ fontWeight: 600, fontSize: "2rem" }}>
                Frequently Asked Questions
              </h2>
              {/* <p style={{ color: "#666" }}>
                আমাদের প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী পড়ুন
              </p> */}
            </div>
          </div>

          <div className="row align-items-start">
            {/* Left image */}
            <div className="col-lg-6 mb-4 mb-lg-0 pb-5">
              <Box
                component="img"
                src="/assets/images/others/faq-image.png"
                alt="faq"
                sx={{ width: "100%", borderRadius: "16px", boxShadow: 3 }}
              />
            </div>

            {/* Right accordion */}
            <div className="col-lg-6 pb-5">
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  defaultExpanded={index === 0}
                  sx={{
                    mb: 2,
                    borderRadius: "12px",
                    boxShadow: 2,
                    "&:before": { display: "none" },
                    backgroundColor: "#fff",
                    transition: "0.3s",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: "#0d6efd" }} />}
                    sx={{
                      backgroundColor: "#f1f1f1",
                      borderRadius: "12px 12px 0 0",
                      px: 3,
                      py: 1.5,
                    }}
                  >
                    <Typography fontWeight={600}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, py: 2 }}>
                    <Typography sx={{ textAlign: "justify", color: "#555" }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </Box>
    </main>
  );
};

export default Faqs;
