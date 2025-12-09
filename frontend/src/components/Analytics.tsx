import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product, AIInsight } from '../types';
import './Analytics.css';

const Analytics: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stock');
      setProducts(response.data.products || []);
      if (response.data.products && response.data.products.length > 0) {
        setSelectedProduct(response.data.products[0].product_code);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/insights/generate', {
        product_code: selectedProduct,
        time_period: timePeriod
      });
      
      setInsight(response.data.insight);
      const product = products.find(p => p.product_code === selectedProduct);
      setProductDetails(product || null);
      
      // Mock chart data
      const mockData = Array.from({length: 12}, (_, i) => ({
        week: `W${i+1}`,
        units: Math.floor(Math.random() * 20) + 5
      }));
      setChartData(mockData);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const [teamMembers, setTeamMembers] = useState<Record<string, any>>({});
  const [selectedMember, setSelectedMember] = useState<string>('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/team/members');
      setTeamMembers(response.data.team_members || {});
      const memberIds = Object.keys(response.data.team_members || {});
      if (memberIds.length > 0) {
        setSelectedMember(memberIds[0]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
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
        product_code: selectedProduct
      });
      const memberName = teamMembers[selectedMember]?.name || 'team member';
      alert(`Task assigned to ${memberName} successfully!`);
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  return (
    <div className="analytics">
      <h1 className="analytics-title">Product Analytics & AI Insights</h1>

      <div className="analytics-controls">
        <div className="control-group">
          <label>Select Product:</label>
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="product-select"
          >
            {products.map(product => (
              <option key={product.product_code} value={product.product_code}>
                {product.name} ({product.product_code})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Time Period:</label>
          <select 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
            className="period-select"
          >
            <option value="all">All Time</option>
            <option value="q1">Q1 (Jan-Mar)</option>
            <option value="q2">Q2 (Apr-Jun)</option>
            <option value="q3">Q3 (Jul-Sep)</option>
            <option value="q4">Q4 (Oct-Dec)</option>
            <option value="recent">Recent 4 Weeks</option>
          </select>
        </div>

        <button className="analyze-button" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate AI Insights'}
        </button>
      </div>

      {productDetails && (
        <div className="product-details-card">
          <h3>{productDetails.name}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{productDetails.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cost Price:</span>
              <span className="detail-value">£{productDetails.cost_price.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Selling Price:</span>
              <span className="detail-value">£{productDetails.selling_price.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Margin:</span>
              <span className="detail-value">{productDetails.margin_percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-section">
          <h3>Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="units" stroke="#8B4513" strokeWidth={2} name="Units Sold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {insight && (
        <div className="insights-section">
          <h3>🤖 AI-Generated Insights</h3>
          <div className="insight-content">
            <p className="insight-analysis">{insight.analysis}</p>
            
            <div className="recommendation-card">
              <h4>Recommendation:</h4>
              <div className="recommendation-action">
                <strong>Action:</strong> {insight.recommendation.action}
              </div>
              <div className="recommendation-reason">
                <strong>Reason:</strong> {insight.recommendation.reason}
              </div>
              
              <div className="assign-section">
                <label htmlFor="member-select">Assign to:</label>
                <div className="assign-controls">
                  <select 
                    id="member-select"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="member-select"
                  >
                    {Object.entries(teamMembers).map(([id, member]) => (
                      <option key={id} value={id}>{member.name}</option>
                    ))}
                  </select>
                  <button className="assign-button" onClick={handleAssign}>
                    Assign Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
