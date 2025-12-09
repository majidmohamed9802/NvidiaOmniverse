import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardMetrics, Product } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_sales: 0,
    total_units: 0,
    total_transactions: 0,
    total_profit: 0
  });
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [slowMovers, setSlowMovers] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      const data = response.data;
      
      setMetrics(data.metrics);
      setLowStock(data.alerts.low_stock || []);
      setSlowMovers(data.alerts.slow_movers || []);
      setTopPerformers(data.top_performers || []);
      
      const catData = [
        { category: 'T-Shirts', revenue: data.category_performance.tshirts.revenue, units: data.category_performance.tshirts.units },
        { category: 'Handbags', revenue: data.category_performance.handbags.revenue, units: data.category_performance.handbags.units }
      ];
      setCategoryData(catData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard Overview</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">£{metrics.total_sales.toLocaleString()}</div>
            <div className="metric-label">Total Sales</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.total_units.toLocaleString()}</div>
            <div className="metric-label">Units Sold</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🛒</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.total_transactions.toLocaleString()}</div>
            <div className="metric-label">Transactions</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">£{metrics.total_profit.toLocaleString()}</div>
            <div className="metric-label">Total Profit</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Category Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8B4513" name="Revenue (£)" />
              <Bar dataKey="units" fill="#A0522D" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-section">
          <h2>Top 3 Performers</h2>
          <div className="performers-list">
            {topPerformers.slice(0, 3).map((product, index) => (
              <div key={product.product_code} className="performer-item">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{product.name}</div>
                  <div className="performer-stats">
                    {product.total_units} units • £{product.total_revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alerts-grid">
        <div className="alert-section low-stock-alert">
          <h2>⚠️ Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="no-alerts">All items well stocked</p>
          ) : (
            <div className="alert-list">
              {lowStock.map(item => (
                <div key={item.product_code} className="alert-item">
                  <div className="alert-name">{item.name}</div>
                  <div className="alert-details">
                    Stock: {item.current_stock} units | Avg Weekly: {item.avg_weekly_sales}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="alert-section slow-movers-alert">
          <h2>📉 Slow Movers</h2>
          {slowMovers.length === 0 ? (
            <p className="no-alerts">No slow moving items</p>
          ) : (
            <div className="alert-list">
              {slowMovers.map(item => (
                <div key={item.product_code} className="alert-item">
                  <div className="alert-name">{item.name}</div>
                  <div className="alert-details">
                    Avg: {item.avg_weekly_sales} units/week | {item.weeks_below_threshold} weeks below threshold
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
