import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';
import './AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any>({});
  const [selectedMember, setSelectedMember] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchTeamMembers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/team/members');
      setTeamMembers(response.data.team_members || {});
      const memberIds = Object.keys(response.data.team_members || {});
      if (memberIds.length > 0) setSelectedMember(memberIds[0]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    setSelectedFilter('');
    setShowGraphs(false);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setShowGraphs(true);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/insights/generate', {
        product_code: selectedFilter,
        time_period: 'all'
      });
      setInsight(response.data.insight);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!insight || !selectedMember) {
      alert('Please select a team member');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/recommendations/assign', {
        insight_id: `insight-${Date.now()}`,
        team_member: selectedMember,
        action: insight.recommendation.action,
        reason: insight.recommendation.reason,
        product_code: selectedFilter
      });
      const memberName = teamMembers[selectedMember]?.name || 'team member';
      alert(`Task assigned to ${memberName} successfully!`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const salesData = Array.from({length: 12}, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    sales: Math.floor(Math.random() * 50000) + 30000,
    revenue: Math.floor(Math.random() * 100000) + 50000
  }));

  const categoryData = [
    { name: 'T-Shirts', value: 45, color: '#0070C0' },
    { name: 'Handbags', value: 35, color: '#FF6B6B' },
    { name: 'Accessories', value: 20, color: '#4ECDC4' }
  ];

  const weeklyData = Array.from({length: 7}, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    visitors: Math.floor(Math.random() * 500) + 200,
    sales: Math.floor(Math.random() * 300) + 100
  }));

  const stockTable = products.map(p => ({
    name: p.name,
    code: p.product_code,
    stock: Math.floor(Math.random() * 100),
    status: Math.random() > 0.5 ? 'Normal' : 'Slow Mover'
  }));

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="analytics-dashboard">
      <ThemeToggle />
      
      <header className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="header-subtitle">Product insights and performance metrics</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/merchandiser/scene-builder')}>
            Switch to Scene Builder
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="filter-section">
        <div className="filter-controls">
          <select className="input" value={filterType} onChange={(e) => handleFilterTypeChange(e.target.value)}>
            <option value="">Select Filter Type</option>
            <option value="all">All Products</option>
            <option value="category">By Category</option>
            <option value="specific">By Specific Item</option>
          </select>

          {filterType === 'category' && (
            <select className="input" value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {filterType === 'specific' && (
            <select className="input" value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.product_code} value={p.product_code}>{p.name}</option>
              ))}
            </select>
          )}

          {filterType === 'all' && (
            <button className="btn btn-primary" onClick={() => setShowGraphs(true)}>Show All Products</button>
          )}
        </div>
      </div>

      {showGraphs && (
        <>
          <div className="charts-grid">
            <div className="chart-card chart-large">
              <h3>Sales & Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#0070C0" strokeWidth={3} name="Sales" />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6B6B" strokeWidth={3} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Weekly Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="visitors" fill="#4ECDC4" name="Visitors" />
                  <Bar dataKey="sales" fill="#95E1D3" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Revenue Forecast</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#FFA07A" fill="#FFA07A" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stock-table-section">
            <h2>Stock Status</h2>
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Code</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockTable.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>{item.stock}</td>
                    <td className={item.status === 'Slow Mover' ? 'slow-mover' : 'normal'}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="insights-section">
        <h2>AI-Powered Insights</h2>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !showGraphs}>
          {loading ? 'Analyzing...' : 'Generate AI Insights'}
        </button>

        {insight && (
          <>
            <table className="insights-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Insight</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Product Analysis</td>
                  <td>{insight.analysis}</td>
                  <td>
                    <strong>Action:</strong> {insight.recommendation.action}<br/>
                    <strong>Reason:</strong> {insight.recommendation.reason}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="assign-section">
              <label>Assign to Team Member:</label>
              <div className="assign-controls">
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="input">
                  {Object.entries(teamMembers).map(([id, member]: [string, any]) => (
                    <option key={id} value={id}>{member.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAssign}>Assign Task</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
