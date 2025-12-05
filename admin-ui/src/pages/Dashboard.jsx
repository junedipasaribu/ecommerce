import React, { useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Chart.js
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);
import ordersService from "../services/orders";
import productsService from "../services/products";
import customersService from "../services/customers";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";

// Small helper: format currency
const fmt = (n) => `Rp ${Number(n || 0).toLocaleString()}`;

const defaultRange = (days = 30) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const { user: authUser } = useAuth();
  const canRead = hasPerm(authUser, "report", "read");

  // filters
  const [range, setRange] = useState(defaultRange(30));
  const [preset, setPreset] = useState(30);

  useEffect(() => {
    let mounted = true;
    ordersService.getAll().then((list) => mounted && setOrders(list || []));
    productsService.getAll().then((list) => mounted && setProducts(list || []));
    customersService
      .getAll()
      .then((list) => mounted && setCustomers(list || []));
    return () => (mounted = false);
  }, []);

  // ensure orders have a createdAt for demo: derive from id if missing
  const ordersWithDates = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const total = orders.length || 30;
    return orders.map((o, i) => ({
      ...o,
      createdAt:
        o.createdAt ||
        new Date(now - (total - (o.id || i)) * day).toISOString(),
    }));
  }, [orders]);

  const filtered = useMemo(() => {
    const s = new Date(range.start + "T00:00:00");
    const e = new Date(range.end + "T23:59:59");
    return ordersWithDates.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= s && d <= e;
    });
  }, [ordersWithDates, range]);

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = pageWidth / imgWidth;
    const renderedHeight = imgHeight * ratio;

    if (renderedHeight <= pageHeight) {
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, renderedHeight);
      pdf.save(`report-${range.start}_to_${range.end}.pdf`);
      return;
    }

    // Multi-page: slice canvas vertically into pages
    const sourcePageHeight = Math.floor(pageHeight / ratio);
    let y = 0;
    let page = 0;
    while (y < imgHeight) {
      const h = Math.min(sourcePageHeight, imgHeight - y);
      // create temporary canvas to hold the slice
      const tmp = document.createElement("canvas");
      tmp.width = imgWidth;
      tmp.height = h;
      const ctx = tmp.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, y, imgWidth, h, 0, 0, imgWidth, h);

      const imgData = tmp.toDataURL("image/jpeg", 0.9);
      const drawHeight = h * ratio;
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, drawHeight);

      y += h;
      page += 1;
    }

    pdf.save(`report-${range.start}_to_${range.end}.pdf`);
  };
  const revenueByDay = useMemo(() => {
    const map = {}; // date -> revenue
    const s = new Date(range.start + "T00:00:00");
    const e = new Date(range.end + "T23:59:59");
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      map[d.toISOString().slice(0, 10)] = 0;
    }
    filtered.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().slice(0, 10);
      const total = (o.items || []).reduce(
        (s, it) => s + (it.qty || 0) * (it.price || 0),
        0
      );
      map[date] = (map[date] || 0) + total;
    });
    return Object.keys(map).map((k) => ({ date: k, revenue: map[k] }));
  }, [filtered, range]);

  const reportRef = useRef(null);

  const downloadCSV = () => {
    const rows = [
      [
        "Order ID",
        "Date",
        "Customer",
        "Phone",
        "Status",
        "Payment",
        "Resi",
        "Total",
        "Items",
      ],
    ];

    filtered.forEach((o) => {
      const total = (o.items || []).reduce(
        (s, it) => s + (it.qty || 0) * (it.price || 0),
        0
      );
      const items = (o.items || [])
        .map((it) => `${it.productId}x${it.qty}`)
        .join(";");
      rows.push([
        o.orderId || o.id,
        new Date(o.createdAt).toLocaleString(),
        o.customer || "-",
        o.noHp || "-",
        o.status || "-",
        o.paymentMethod || "-",
        o.resi || "-",
        total,
        items,
      ]);
    });

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `report-orders-${range.start}_to_${range.end}.csv`);
  };

  const exportXLSX = () => {
    const data = filtered.map((o) => {
      const total = (o.items || []).reduce(
        (s, it) => s + (it.qty || 0) * (it.price || 0),
        0
      );
      return {
        orderId: o.orderId || o.id,
        date: new Date(o.createdAt).toLocaleString(),
        customer: o.customer || "-",
        phone: o.noHp || "-",
        status: o.status || "-",
        payment: o.paymentMethod || "-",
        resi: o.resi || "-",
        total,
        items: (o.items || [])
          .map((it) => `${it.productId}x${it.qty}`)
          .join(";"),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `report-orders-${range.start}_to_${range.end}.xlsx`
    );
  };

  // aggregate metrics for the report
  const metrics = useMemo(() => {
    const totals = filtered.map((o) =>
      (o.items || []).reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0)
    );
    const totalRevenue = totals.reduce((s, v) => s + v, 0);
    const ordersCount = filtered.length;
    const avgOrder = ordersCount ? Math.round(totalRevenue / ordersCount) : 0;

    // top products by revenue/qty
    const prodMap = {};
    filtered.forEach((o) => {
      (o.items || []).forEach((it) => {
        const id = it.productId;
        const rev = (it.qty || 0) * (it.price || 0);
        prodMap[id] = prodMap[id] || { id, qty: 0, revenue: 0 };
        prodMap[id].qty += it.qty || 0;
        prodMap[id].revenue += rev;
      });
    });
    const topProducts = Object.values(prodMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // status counts
    const statusCounts = {};
    filtered.forEach((o) => {
      const s = o.status || "unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // top categories by revenue
    const catMap = {};
    Object.values(prodMap).forEach((p) => {
      const prod = products.find((x) => x.id === p.id) || {};
      const cat = prod.category || "Uncategorized";
      catMap[cat] = catMap[cat] || { name: cat, revenue: 0, qty: 0 };
      catMap[cat].revenue += p.revenue || 0;
      catMap[cat].qty += p.qty || 0;
    });
    const topCategories = Object.values(catMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      ordersCount,
      avgOrder,
      topProducts,
      statusCounts,
      topCategories,
    };
  }, [filtered, products]);

  const applyPreset = (days) => {
    setPreset(days);
    setRange(defaultRange(days));
  };

  if (!canRead) {
    return (
      <div className="card shadow-sm">
        <div className="card-body">
          <h5>Dashboard</h5>
          <p className="text-muted">
            You don't have permission to view reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
        <h3 className="fw-bold">Dashboard</h3>

        <div className="d-flex gap-2 align-items-center">
          <div className="input-group input-group-sm">
            <span className="input-group-text">From</span>
            <input
              className="form-control form-control-sm"
              type="date"
              value={range.start}
              onChange={(e) =>
                setRange((r) => ({ ...r, start: e.target.value }))
              }
            />
            <span className="input-group-text">To</span>
            <input
              className="form-control form-control-sm"
              type="date"
              value={range.end}
              onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            />
          </div>
          <div className="btn-group btn-group-sm ms-2" role="group">
            <button
              className={`btn btn-sm ${
                preset === 7 ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => applyPreset(7)}
            >
              7d
            </button>
            <button
              className={`btn btn-sm ${
                preset === 30 ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => applyPreset(30)}
            >
              30d
            </button>
            <button
              className={`btn btn-sm ${
                preset === 90 ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => applyPreset(90)}
            >
              90d
            </button>
          </div>
          <button className="btn btn-primary btn-sm ms-2" onClick={downloadCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div
              className="p-3 rounded-circle me-3"
              style={{ background: "#dbeafe" }}
            >
              <i className="bi bi-coin fs-5 text-primary"></i>
            </div>
            <div className="flex-grow-1">
              <div className="small text-muted">Total Revenue</div>
              <div className="h5 fw-bold">{fmt(metrics.totalRevenue)}</div>
              <div className="small text-muted">
                Period: {range.start} → {range.end}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div
              className="p-3 rounded-circle me-3"
              style={{ background: "#dcfce7" }}
            >
              <i className="bi bi-cart-check fs-5 text-success"></i>
            </div>
            <div className="flex-grow-1">
              <div className="small text-muted">Orders</div>
              <div className="h5 fw-bold">{metrics.ordersCount}</div>
              <div className="small text-muted">
                Avg: {fmt(metrics.avgOrder)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div
              className="p-3 rounded-circle me-3"
              style={{ background: "#fef9c3" }}
            >
              <i className="bi bi-box-seam fs-5 text-warning"></i>
            </div>
            <div className="flex-grow-1">
              <div className="small text-muted">Products Sold</div>
              <div className="h5 fw-bold">{metrics.topProducts.length}</div>
              <div className="small text-muted">Top products by revenue</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div
            className="p-4 bg-white shadow-sm d-flex align-items-center"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div
              className="p-3 rounded-circle me-3"
              style={{ background: "#fae8ff" }}
            >
              <i className="bi bi-people fs-5 text-danger"></i>
            </div>
            <div className="flex-grow-1">
              <div className="small text-muted">Customers</div>
              <div className="h5 fw-bold">{customers.length}</div>
              <div className="small text-muted">Total customers in system</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div ref={reportRef}>
              <div className="d-flex justify-content-between align-items-start">
                <h6 className="fw-bold">Revenue</h6>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={downloadCSV}
                  >
                    CSV
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={exportXLSX}
                  >
                    XLSX
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={exportPDF}
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <div className="mt-2" style={{ height: 200 }}>
                <Line
                  data={{
                    labels: revenueByDay.map((r) => r.date),
                    datasets: [
                      {
                        label: "Revenue",
                        data: revenueByDay.map((r) => r.revenue),
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13,110,253,0.1)",
                        tension: 0.3,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: "#f1f5f9" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold">Orders by status</h6>
            <div className="mt-2">
              {Object.entries(metrics.statusCounts).map(([k, v]) => (
                <div key={k} className="d-flex justify-content-between">
                  <div className="text-capitalize">{k}</div>
                  <div className="fw-bold">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3">
        <div className="col-12 col-lg-4">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold">Top Products</h6>
            <div className="table-responsive mt-2">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topProducts.map((tp) => {
                    const prod = products.find((p) => p.id === tp.id) || {
                      name: `#${tp.id}`,
                    };
                    return (
                      <tr key={tp.id}>
                        <td>{prod.name}</td>
                        <td className="text-end">{tp.qty}</td>
                        <td className="text-end">{fmt(tp.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold">Top Categories</h6>
            <div className="d-flex justify-content-between text-muted mb-2 mt-2">
              <span>Category</span>
              <span>Revenue</span>
            </div>
            {metrics.topCategories.map((c) => {
              const pct = metrics.totalRevenue
                ? (c.revenue / metrics.totalRevenue) * 100
                : 0;
              return (
                <div
                  key={c.name}
                  className="d-flex justify-content-between py-2 border-bottom"
                  style={{ fontSize: 14 }}
                >
                  <span>{c.name}</span>
                  <span className="fw-bold">
                    {fmt(c.revenue)}
                    <small className="text-muted ms-2">{pct.toFixed(1)}%</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div
            className="p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold">Recent Orders</h6>
            <div className="table-responsive mt-2">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map((o) => {
                    const total = (o.items || []).reduce(
                      (s, it) => s + (it.qty || 0) * (it.price || 0),
                      0
                    );
                    return (
                      <tr key={o.orderId || o.id}>
                        <td>{o.orderId || o.id}</td>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="text-end">{fmt(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
