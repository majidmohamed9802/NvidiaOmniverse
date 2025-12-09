import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './VMUserStories.css';

const VMUserStories: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="vm-stories-page">
      <ThemeToggle />
      
      <main className="vm-main">
        <header className="vm-header">
          <div>
            <div className="logo-section">
              <span className="logo-badge">INFOSYS</span>
              <span className="logo-text">AI STUDIO</span>
            </div>
            <h1>The Visual Merchandiser User Stories</h1>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </header>

        <div className="vm-content">
          <div className="stories-grid">
            {/* Product Intake */}
            <div className="story-card blue-1" onClick={() => navigate('/merchandiser/analytics-dashboard')}>
              <div className="story-image" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }}>
                <div className="image-placeholder">Product Intake & SKU</div>
              </div>
              <button className="story-button">
                Product Intake & SKU Prioritization
              </button>
            </div>

            {/* Display Builder */}
            <div className="story-card blue-2" onClick={() => navigate('/merchandiser/scene-builder')}>
              <div className="story-image" style={{ background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)' }}>
                <div className="image-placeholder"> Display Story Builder</div>
              </div>
              <button className="story-button">
                Display Story Builder
              </button>
            </div>

            {/* Scheduling - Coming Soon */}
            <div className="story-card blue-3 disabled">
              <div className="coming-soon-badge">COMING SOON</div>
              <div className="card-content-centered">
                <button className="story-button disabled">
                  Scheduling & Rotation
                </button>
              </div>
            </div>

            {/* Install - Coming Soon */}
            <div className="story-card blue-4 disabled">
              <div className="coming-soon-badge">COMING SOON</div>
              <div className="card-content-centered">
                <button className="story-button disabled">
                  Install & Prop Management
                </button>
              </div>
            </div>
          </div>

          <div className="capabilities-grid">
            <button className="capability-button disabled">Compliance & Quality</button>
            <button className="capability-button disabled">Corporate Communication</button>
            <button className="capability-button disabled">Sales-to-Display Analytics</button>
            <button className="capability-button disabled">Optional Epics</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VMUserStories;
