import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

// Chart.js
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement
);

import dashboardService from "../services/dashboard";
import ordersService from "../services/orders";
import productsService from "../services/products";
import categoriesService from "../services/categories";
import { useAuth } from "../context/AuthContext";
import { hasPerm } from "../utils/hasPermission";

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
  const { user: authUser } = useAuth();
  const canRead = hasPerm(authUser, "report", "read");

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date range filters
  const [range, setRange] = useState(defaultRange(30));
  const [preset, setPreset] = useState(30);

  const reportRef = useRef(null);

  // Helper function to format currency with dot separator
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "Rp 0";
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format with dot separator manually for Indonesian format
    const formatted = numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return `Rp ${formatted}`;
  };

  // Load dashboard data
  useEffect(() => {
    let mounted = true;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Try new dashboard endpoint first, fallback to legacy if not available
        try {
          const data = await dashboardService.getComplete(range.start, range.end);
          if (mounted) {
            setDashboardData(data);
          }
        } catch (newApiError) {
          
          // Fallback to orders, products, categories, and users data
          try {
            const [orders, products, categories] = await Promise.all([
              ordersService.getAll().catch(() => []),
              productsService.getAll().catch(() => []),
              categoriesService.getAll().catch(() => []),
            ]);
            

            
            // Helper function to resolve customer names
            const resolveCustomerName = (order) => {
              // Priority 1: Use customerName from backend if available
              if (order.customerName) {
                return order.customerName;
              }
              
              // Priority 2: Try other customer name field variations
              if (order.customer) return order.customer;
              if (order.customer_name) return order.customer_name;
              
              // If no customer name available, return Unknown Customer
              return "Unknown Customer";
            };
            
            // Filter orders by date range
            const startDate = new Date(range.start + "T00:00:00");
            const endDate = new Date(range.end + "T23:59:59");
            
            const filteredOrders = orders.filter(order => {
              const orderDate = new Date(order.createdAt || order.date || Date.now());
              return orderDate >= startDate && orderDate <= endDate;
            });
            
            // Calculate metrics from orders data
            const totalRevenue = filteredOrders.reduce((sum, order) => {
              const orderTotal = order.totalAmount || 
                (order.items || []).reduce((itemSum, item) => 
                  itemSum + (item.quantity || item.qty || 0) * (item.price || 0), 0
                );
              return sum + orderTotal;
            }, 0);
            

            
            // Status counts
            const statusCounts = {};
            filteredOrders.forEach(order => {
              const status = order.status || "Unknown";
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
              status,
              count,
              percentage: `${((count / filteredOrders.length) * 100).toFixed(1)}%`
            }));
            
            // Generate revenue chart data (daily)
            const revenueMap = {};
            const startLoop = new Date(startDate);
            const endLoop = new Date(endDate);
            
            // Initialize all dates with 0
            for (let d = new Date(startLoop); d <= endLoop; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().slice(0, 10);
              revenueMap[dateStr] = { revenue: 0, orderCount: 0 };
            }
            
            // Fill with actual data
            filteredOrders.forEach(order => {
              const orderDate = new Date(order.createdAt || order.date || Date.now()).toISOString().slice(0, 10);
              const orderTotal = order.totalAmount || 
                (order.items || []).reduce((itemSum, item) => 
                  itemSum + (item.quantity || item.qty || 0) * (item.price || 0), 0
                );
              
              if (revenueMap[orderDate]) {
                revenueMap[orderDate].revenue += orderTotal;
                revenueMap[orderDate].orderCount += 1;
              }
            });
            
            const revenueChart = Object.entries(revenueMap).map(([date, data]) => ({
              date,
              revenue: data.revenue,
              orderCount: data.orderCount
            }));
            
            // Debug: Log data structure
            console.log("📦 Products sample:", products[0]);
            console.log("� Productis length:", products.length);
            console.log("� OCategories sample:", categories[0]);
            console.log("📂 Categories length:", categories?.length || 0);
            console.log("🛒 Orders sample:", filteredOrders[0]);
            console.log("👥 Users sample:", users[0]);
            console.log("👥 Users length:", users?.length || 0);
            
            // Debug: Verify customer resolution capability
            if (filteredOrders[0]) {
              console.log("🔍 Dashboard - Order fields:", Object.keys(filteredOrders[0]));
              console.log("🔍 Dashboard - Order userId fields:", {
                userId: filteredOrders[0].userId,
                user_id: filteredOrders[0].user_id,
                customerId: filteredOrders[0].customerId,
                customer_id: filteredOrders[0].customer_id,
                customerName: filteredOrders[0].customerName
              });
              
              // Test customer resolution with first order
              const testCustomerName = resolveCustomerName(filteredOrders[0]);
              console.log("🧪 Dashboard - Customer resolution test result:", testCustomerName);
              
              if (testCustomerName !== "Unknown Customer") {
                console.log("🎉 SUCCESS: Customer resolution working!");
              } else {
                console.log("⚠️ ISSUE: Customer resolution failed - check userId or users data");
              }
            }
            
            // If categories failed to load, create fallback
            const categoriesData = categories || [];
            
            // Calculate top products from orders
            const productMap = {};
            filteredOrders.forEach(order => {
              (order.items || []).forEach(item => {
                const productId = item.productId || item.id;
                const quantity = item.quantity || item.qty || 0;
                const revenue = quantity * (item.price || 0);
                
                if (!productMap[productId]) {
                  const product = products.find(p => p.id === productId);
                  let categoryName = "Uncategorized";
                  
                  // Get category name from product (multiple field variations)
                  if (product) {
                    // First try direct category name fields
                    if (product.categoryName) {
                      categoryName = product.categoryName;
                    } else if (product.category_name) {
                      categoryName = product.category_name;
                    } else if (product.category) {
                      categoryName = product.category;
                    } else {
                      // Try mapping categoryId to category name
                      const categoryId = product.categoryId || product.category_id;
                      if (categoryId && categoriesData.length > 0) {
                        const category = categoriesData.find(c => 
                          c.id === categoryId || 
                          c.id === parseInt(categoryId) || 
                          String(c.id) === String(categoryId)
                        );
                        categoryName = category?.name || category?.categoryName || `Category ${categoryId}`;
                      } else if (categoryId) {
                        categoryName = `Category ${categoryId}`;
                      }
                    }
                  }
                  
                  productMap[productId] = {
                    productName: product?.name || `Product ${productId}`,
                    category: categoryName,
                    quantity: 0,
                    revenue: 0
                  };
                  

                }
                
                productMap[productId].quantity += quantity;
                productMap[productId].revenue += revenue;
              });
            });
            
            const topProducts = Object.values(productMap)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10);
            
            // Calculate top categories
            const categoryMap = {};
            topProducts.forEach(product => {
              const category = product.category;
              if (!categoryMap[category]) {
                categoryMap[category] = {
                  categoryName: category,
                  quantity: 0,
                  revenue: 0
                };
              }
              categoryMap[category].quantity += product.quantity;
              categoryMap[category].revenue += product.revenue;
            });
            

            
            // Add percentages to categories
            const topCategories = Object.values(categoryMap)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10)
              .map(category => ({
                ...category,
                percentage: `${((category.revenue / totalRevenue) * 100).toFixed(1)}%`
              }));
            
            // Recent orders (last 10)
            const recentOrders = filteredOrders
              .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
              .slice(0, 10)
              .map(order => ({
                orderId: order.orderId || order.id,
                orderCode: order.orderCode || `ORD${order.id}`,
                customerName: resolveCustomerName(order),
                status: order.status || "Unknown",
                total: order.totalAmount || 0,
                date: new Date(order.createdAt || order.date || Date.now()).toLocaleDateString(),
                time: new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString()
              }));
            

            
            // Construct dashboard data structure
            const fallbackData = {
              overview: {
                totalRevenue: {
                  title: "Total Revenue",
                  value: formatCurrency(totalRevenue),
                  subtitle: `Period: ${range.start} → ${range.end}`,
                  trend: "stable",
                  trendValue: "0%"
                },
                totalOrders: {
                  title: "Total Orders", 
                  value: String(filteredOrders.length),
                  subtitle: "Orders in selected period",
                  trend: "stable",
                  trendValue: "0%"
                },
                totalProducts: {
                  title: "Total Products",
                  value: String(products.length),
                  subtitle: "Products in catalog",
                  trend: "stable", 
                  trendValue: "0%"
                },

                revenueChart,
                ordersByStatus,
                topProducts,
                topCategories,
                recentOrders
              }
            };
            

            
            if (mounted) {
              setDashboardData(fallbackData);
            }
          } catch (fallbackError) {
            console.error("Fallback data loading failed:", fallbackError);
            throw fallbackError;
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        if (mounted) {
          // Create empty data structure to prevent crashes
          setDashboardData({
            overview: {
              totalRevenue: { title: "Total Revenue", value: formatCurrency(0), subtitle: "No data", trend: "stable", trendValue: "0%" },
              totalOrders: { title: "Total Orders", value: "0", subtitle: "No data", trend: "stable", trendValue: "0%" },
              totalProducts: { title: "Total Products", value: "0", subtitle: "No data", trend: "stable", trendValue: "0%" },
              revenueChart: [],
              ordersByStatus: [],
              topProducts: [],
              topCategories: [],
              recentOrders: []
            }
          });
          Swal.fire("Error", "Failed to load dashboard data: " + error.message, "error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadDashboardData();
    return () => (mounted = false);
  }, [range]);

  const applyPreset = (days) => {
    setPreset(days);
    setRange(defaultRange(days));
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    
    const pdf = new jsPDF({ unit: "px", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = pageWidth / canvas.width;
    const renderedHeight = canvas.height * ratio;
    
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, renderedHeight);
    pdf.save(`dashboard-report-${range.start}_to_${range.end}.pdf`);
  };

  const downloadCSV = () => {
    if (!dashboardData?.overview?.recentOrders) return;
    
    const rows = [
      ["Order ID", "Order Code", "Customer", "Status", "Total", "Date", "Time"],
    ];

    dashboardData.overview.recentOrders.forEach((order) => {
      rows.push([
        order.orderId,
        order.orderCode,
        order.customerName,
        order.status,
        order.total,
        order.date,
        order.time,
      ]);
    });

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `dashboard-report-${range.start}_to_${range.end}.csv`);
  };

  const exportXLSX = () => {
    if (!dashboardData?.overview?.recentOrders) return;
    
    const data = dashboardData.overview.recentOrders.map((order) => ({
      orderId: order.orderId,
      orderCode: order.orderCode,
      customerName: order.customerName,
      status: order.status,
      total: order.total,
      date: order.date,
      time: order.time,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recent Orders");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `dashboard-report-${range.start}_to_${range.end}.xlsx`
    );
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

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};

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
              className={`btn btn-sm ${preset === 7 ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => applyPreset(7)}
            >
              7d
            </button>
            <button
              className={`btn btn-sm ${preset === 30 ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => applyPreset(30)}
            >
              30d
            </button>
            <button
              className={`btn btn-sm ${preset === 90 ? "btn-dark" : "btn-outline-dark"}`}
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

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
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
              <div className="small text-muted">{overview.totalRevenue?.title || "Total Revenue"}</div>
              <div className="h5 fw-bold">{overview.totalRevenue?.value || formatCurrency(0)}</div>
              <div className="small text-muted">
                {overview.totalRevenue?.subtitle || `Period: ${range.start} → ${range.end}`}
              </div>
              {overview.totalRevenue?.trend && (
                <div className={`small ${overview.totalRevenue.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  <i className={`bi bi-arrow-${overview.totalRevenue.trend === 'up' ? 'up' : 'down'}`}></i>
                  {overview.totalRevenue.trendValue}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
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
              <div className="small text-muted">{overview.totalOrders?.title || "Total Orders"}</div>
              <div className="h5 fw-bold">{overview.totalOrders?.value || "0"}</div>
              <div className="small text-muted">
                {overview.totalOrders?.subtitle || "Orders in selected period"}
              </div>
              {overview.totalOrders?.trend && (
                <div className={`small ${overview.totalOrders.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  <i className={`bi bi-arrow-${overview.totalOrders.trend === 'up' ? 'up' : 'down'}`}></i>
                  {overview.totalOrders.trendValue}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
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
              <div className="small text-muted">{overview.totalProducts?.title || "Total Products"}</div>
              <div className="h5 fw-bold">{overview.totalProducts?.value || "0"}</div>
              <div className="small text-muted">
                {overview.totalProducts?.subtitle || "Products in catalog"}
              </div>
              {overview.totalProducts?.trend && (
                <div className={`small ${overview.totalProducts.trend === 'up' ? 'text-success' : overview.totalProducts.trend === 'stable' ? 'text-muted' : 'text-danger'}`}>
                  <i className={`bi bi-arrow-${overview.totalProducts.trend === 'up' ? 'up' : overview.totalProducts.trend === 'stable' ? 'right' : 'down'}`}></i>
                  {overview.totalProducts.trendValue}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <div ref={reportRef}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="fw-bold">Revenue Chart</h6>
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
              <div style={{ height: 300 }}>
                {overview.revenueChart && overview.revenueChart.length > 0 ? (
                  <Line
                    data={{
                      labels: overview.revenueChart.map((item) => item.date),
                      datasets: [
                        {
                          label: "Revenue",
                          data: overview.revenueChart.map((item) => item.revenue),
                          borderColor: "#0d6efd",
                          backgroundColor: "rgba(13,110,253,0.1)",
                          tension: 0.3,
                          fill: true,
                          pointBackgroundColor: "#0d6efd",
                          pointBorderColor: "#ffffff",
                          pointBorderWidth: 2,
                          pointRadius: 4,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Revenue: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: { 
                          grid: { display: false },
                          ticks: {
                            maxTicksLimit: 7 // Limit number of date labels
                          }
                        },
                        y: { 
                          grid: { color: "#f1f5f9" },
                          ticks: {
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <p className="text-muted">No revenue data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold mb-3">Orders by Status</h6>
            <div style={{ height: 250 }}>
              {overview.ordersByStatus && overview.ordersByStatus.length > 0 ? (
                <Doughnut
                  data={{
                    labels: overview.ordersByStatus.map((item) => item.status),
                    datasets: [
                      {
                        data: overview.ordersByStatus.map((item) => item.count),
                        backgroundColor: [
                          "#0d6efd", // Primary
                          "#198754", // Success
                          "#ffc107", // Warning
                          "#dc3545", // Danger
                          "#6c757d", // Secondary
                          "#0dcaf0", // Info
                          "#f8f9fa", // Light
                        ],
                        borderWidth: 2,
                        borderColor: "#fff",
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const item = overview.ordersByStatus[context.dataIndex];
                            return `${item.status}: ${item.count} (${item.percentage})`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">No order status data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div
            className="card p-4 bg-white shadow-sm"
            style={{ borderRadius: "20px", border: "1px solid #e5e7eb" }}
          >
            <h6 className="fw-bold mb-3">Top Products</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topProducts && overview.topProducts.length > 0 ? (
                    overview.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{product.productName}</div>
                          <small className="text-muted">{product.category}</small>
                        </td>
                        <td className="text-end">{product.quantity}</td>
                        <td className="text-end">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No products data</td>
                    </tr>
                  )}
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
            <h6 className="fw-bold mb-3">Top Categories</h6>
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topCategories && overview.topCategories.length > 0 ? (
                    overview.topCategories.map((category, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{category.categoryName}</div>
                          <small className="text-muted">{category.percentage}</small>
                        </td>
                        <td className="text-end">{category.quantity}</td>
                        <td className="text-end">{formatCurrency(category.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No categories data</td>
                    </tr>
                  )}
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
            <h6 className="fw-bold mb-3">Recent Orders</h6>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentOrders && overview.recentOrders.length > 0 ? (
                    overview.recentOrders.slice(0, 10).map((order, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium">{order.orderCode}</div>
                          <small className="text-muted">{order.date} {order.time}</small>
                        </td>
                        <td>
                          <div className="fw-medium">{order.customerName}</div>
                          <small className={`badge ${
                            order.status === 'COMPLETED' ? 'bg-success' :
                            order.status === 'SHIPPING' ? 'bg-info' :
                            order.status === 'PAID' ? 'bg-primary' :
                            order.status === 'PENDING_PAYMENT' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {order.status}
                          </small>
                        </td>
                        <td className="text-end">{formatCurrency(order.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No recent orders</td>
                    </tr>
                  )}
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