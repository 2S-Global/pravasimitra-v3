'use client'

import { useState } from "react"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import OtherBanner from "@/app/components/OtherBanner"
import Sidebar from "@/app/components/Sidebar"
import { useRouter } from 'next/navigation'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const router = useRouter()

  // Mock data (replace with real data fetching)
  const stats = {
    buySellItems: 124,
    buySellContacts: 37,
    rentLeaseItems: 85,
    rentLeaseContacts: 21,
    marketplaceItems: 59,
  }

  const sections = [
    {
      title: 'Rent & Lease',
      image: '/assets/images/rent.png',
      path: '/rent-lease',
      items: stats.rentLeaseItems,
      contacts: stats.rentLeaseContacts,
      color: '#4a90e2',
    },
    {
      title: 'Buy & Sell',
      image: '/assets/images/BUY__SELL.png',
      path: '/buy-sell',
      items: stats.buySellItems,
      contacts: stats.buySellContacts,
      color: '#50c878',
    },
    {
      title: 'Marketplace',
      image: '/assets/images/marketplace.png',
      path: '/marketplace',
      items: stats.marketplaceItems,
      contacts: null,
      color: '#f5a623',
    }
  ]

  // Chart data for Bar (Items & Contacts)
  const barData = {
    labels: sections.map(s => s.title),
    datasets: [
      {
        label: 'Items',
        data: sections.map(s => s.items),
        backgroundColor: sections.map(s => s.color),
      },
      {
        label: 'Contacts',
        data: sections.map(s => s.contacts ?? 0),
        backgroundColor: sections.map(s => s.color).map(c => c + 'aa'), // lighter shade
      },
    ],
  }

  // Chart options for Bar
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Items and Contacts Overview',
        font: { size: 18 },
      },
    },
  }

  // Chart data for Pie (Distribution of items)
  const pieData = {
    labels: sections.map(s => s.title),
    datasets: [
      {
        label: 'Items Distribution',
        data: sections.map(s => s.items),
        backgroundColor: sections.map(s => s.color),
        hoverOffset: 30,
      }
    ]
  }

  // Chart options for Pie
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Items Distribution by Category',
        font: { size: 18 },
      },
    },
  }

  return (
    <>
      <Header />
      <OtherBanner page_title="Dashboard" banner_image="/assets/images/bg/dashboard.jpg" />

      <div className="tm-section tm-login-register-area bg-white tm-padding-section">
        <div className="container">
          <div className="row col-md-12">
            {/* <Sidebar /> */}

            <div className="profile-info col-md-12">
              <div className="tm-form tm-form-bordered form-card p-4">
                <h4
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    marginBottom: '1.5rem',
                  }}
                >
                  Dashboard
                </h4>

                <div className="row g-4 justify-content-center mb-5">
                  {sections.map(({ title, image, path, items, contacts, color }) => (
                    <div
                      key={title}
                      className="col-12 col-sm-6 col-md-4"
                      onClick={() => router.push(path)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="shadow rounded p-4 h-100 d-flex flex-column align-items-center"
                        style={{ borderLeft: `6px solid ${color}`, backgroundColor: '#fafafa', transition: 'transform 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <img
                          src={image}
                          alt={title}
                          style={{ width: 70, height: 70, objectFit: "contain", marginBottom: 15 }}
                        />
                        <h5 className="fw-bold mb-2">{title}</h5>
                        <hr style={{ width: '60%', margin: '10px 0' }} />
                        <div style={{ width: '100%' }}>
                          <div className="d-flex justify-content-between mb-2" style={{ fontWeight: '600', color }}>
                            <span>Items</span>
                            <span>{items}</span>
                          </div>
                          {contacts !== null && (
                            <div className="d-flex justify-content-between" style={{ fontWeight: '600', color }}>
                              <span>Contacts</span>
                              <span>{contacts}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="row g-4">
                  <div className="col-12 col-lg-6">
                    <Bar options={barOptions} data={barData} />
                  </div>
                  <div className="col-12 col-lg-6">
                    <Pie options={pieOptions} data={pieData} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Dashboard
