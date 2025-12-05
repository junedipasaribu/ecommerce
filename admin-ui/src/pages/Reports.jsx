import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Reports = () => {
  // DATA CHART
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    datasets: [
      {
        label: "Sales",
        data: [350, 490, 650, 520, 610, 490, 610, 650, 760],
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        barThickness: 26,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#6b7280" } },
      x: { ticks: { color: "#6b7280" } },
    },
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* ================= CALCULATION CARDS ================= */}
      <div className="row g-4">
        {/* Total Product */}
        <div className="col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center justify-content-between"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div>
              <h6 className="text-muted">Total Product</h6>
              <h4 className="fw-bold">1.258</h4>
            </div>
            <div
              className="p-3 rounded-circle"
              style={{ background: "#dbeafe" }}
            >
              <i className="bi bi-box-seam fs-4 text-primary"></i>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center justify-content-between"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div>
              <h6 className="text-muted">Orders</h6>
              <h4 className="fw-bold">1.258</h4>
            </div>
            <div
              className="p-3 rounded-circle"
              style={{ background: "#dcfce7" }}
            >
              <i className="bi bi-cart-check fs-4 text-success"></i>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center justify-content-between"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div>
              <h6 className="text-muted">User</h6>
              <h4 className="fw-bold">5</h4>
            </div>
            <div
              className="p-3 rounded-circle"
              style={{ background: "#fef9c3" }}
            >
              <i className="bi bi-people fs-4 text-warning"></i>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center justify-content-between"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div>
              <h6 className="text-muted">Revenue</h6>
              <h4 className="fw-bold">Rp 1.258.256</h4>
            </div>
            <div
              className="p-3 rounded-circle"
              style={{ background: "#fae8ff" }}
            >
              <i className="bi bi-coin fs-4 text-danger"></i>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHART AND PANELS ================= */}
      <div className="row mt-4">
        {/* Sales Overview */}
        <div className="col-md-8">
          <div
            className="p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h3 className="fw-bold mb-4">Sales Overview</h3>
            <Bar data={chartData} options={chartOptions} height={120} />
          </div>
        </div>

        {/* RIGHT PANELS */}
        <div className="col-md-4">
          {/* Recent Orders */}
          <div
            className="p-4 bg-white shadow-sm mb-4"
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
              height: "380px",
            }}
          >
            <h5 className="fw-bold mb-3">Recent Orders</h5>

            <div style={{ height: "300px", overflowY: "auto" }}>
              {[
                { id: "#12", name: "Jhon Rizal", status: "Processing" },
                { id: "#15", name: "Doe", status: "Shipped" },
                { id: "#25", name: "Doel", status: "Pending" },
                { id: "#75", name: "Ujang", status: "Processing" },
                { id: "#85", name: "Doel", status: "Shipped" },
                { id: "#86", name: "Dila", status: "Processing" },
                { id: "#98", name: "Dalla", status: "Processing" },
              ].map((order, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between py-2 border-bottom"
                  style={{ fontSize: "14px" }}
                >
                  <div>
                    <strong>{order.id}</strong>
                    <div className="text-muted">{order.name}</div>
                  </div>
                  <span>{order.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div
            className="p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h5 className="fw-bold mb-3">Top Categories</h5>

            <div className="d-flex justify-content-between text-muted mb-2">
              <span>Categories</span>
              <span>Sales</span>
            </div>

            {[
              { name: "Medicine", sales: "Rp. 1.200.000" },
              { name: "Personal Care", sales: "Rp. 1.500.000" },
              { name: "Vitamin", sales: "Rp. 100.000" },
              { name: "Suplemen", sales: "Rp. 500.000" },
            ].map((cat, index) => (
              <div
                key={index}
                className="d-flex justify-content-between py-2 border-bottom"
                style={{ fontSize: "14px" }}
              >
                <span>{cat.name}</span>
                <span>{cat.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
