"use client";

import styles from "./About.module.css";

const HomeAbout = () => {
  return (
    <div className={`tm-section about-us-area ${styles.aboutSection}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12 order-2 order-lg-1">
            <div className={styles.aboutContent}>
              <h2>About Pravasi Mitra</h2>

              <p>
                At Pravasi Mitra, we understand the unique journey and diverse needs of individuals living and working away from their home country. Our core purpose is to simplify and enrich the lives of migrants by providing a dedicated, comprehensive platform that connects them to essential services and a vibrant, supportive community.
              </p>

              <p>
              Pravasi Mitra is a pioneering website and mobile application designed to be your trusted companion, bridging the distance between you and your homeland, and empowering you to thrive wherever you are. We recognize that being away from home brings its own set of challenges, and our platform is meticulously developed to address these with efficiency and care.
              </p>

              <h3>What We Offer</h3>
              <p>Pravasi Mitra is your all-in-one hub for seamless living abroad. Our integrated services include:</p>

              <ul>
                <li>
                  <span>Remittance Services:</span> Facilitating secure, transparent, and efficient money transfers to ensure your hard-earned money reaches your loved ones back home with ease and peace of mind.
                </li>
                <li>
                  <span> Buy/Sell & Marketplace:</span> A dynamic and reliable platform for buying, selling, and trading goods and services within the migrant community, fostering local commerce and helping you find exactly what you need or sell what you no longer require.
                </li>
                <li>
                  <span>Rent/Lease:</span> A dedicated section to help you find suitable accommodation or list your property for rent or lease within the migrant community, making transitions smoother and more convenient.
                </li>
                <li>
                  <span>Inter-Community Services:</span> A wide array of features designed to strengthen community bonds, including event listings, local groups, information sharing, and shared resources to help you settle in, connect, and thrive.
                </li>
              </ul>

              <h3>Our Commitment</h3>
              <p>
               We are committed to building a reliable, user-friendly, and secure platform that evolves with the needs of the global migrant community. Pravasi Mitra aims to foster a sense of belonging, providing practical solutions and facilitating meaningful connections that make life away from home feel a little closer to home.
              </p>
              <p style={{ fontWeight:"bold" }}>Join the Pravasi Mitra community today and experience the difference of having a true "friend" (Mitra) by your side, supporting your journey every step of the way.</p>

              <h3>Our Vision</h3>
              <p>
                To build a global network of empowered and connected migrants, fostering a sense of belonging, security, and prosperity for everyone living away from their homeland.
              </p>
              <p style={{ fontWeight:"bold" }}>Join the Pravasi Mitra community today and experience the difference of having a true "friend" (Mitra) by your side, wherever your journey takes you.</p>

      <div className="container">
  <h3 className="text-center mb-4">Vision & Mission</h3>
  <div className="row">
    {/* Vision Block */}
    <div className="col-md-6 mb-4">
      <div className="p-4 border rounded shadow-sm h-100">
        <h5 className="mb-3 text-primary">Vision</h5>
        <p style={{ textAlign: "justify" }}>
          To build a global network of empowered and connected migrants, fostering a sense of belonging, security, and prosperity for everyone living away from their homeland.
        </p>
      </div>
    </div>

    {/* Mission Block */}
    <div className="col-md-6 mb-4">
      <div className="p-4 border rounded shadow-sm h-100">
        <h5 className="mb-3 text-success">Mission</h5>
        <p style={{ textAlign: "justify" }}>
          To be the indispensable companion for every migrant, providing a comprehensive and supportive ecosystem that bridges distances and simplifies life abroad through a pioneering website and mobile application.
        </p>
      </div>
    </div>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAbout;
