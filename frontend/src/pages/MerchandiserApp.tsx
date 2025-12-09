import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Analytics from '../components/Analytics';
import TeamManagement from '../components/TeamManagement';
import SceneGallery from '../components/SceneGallery';
import LayoutPlanner from '../components/LayoutPlanner';
import ThemeToggle from '../components/ThemeToggle';
import './MerchandiserApp.css';

const MerchandiserApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    // Set active tab based on route
    if (location.pathname.includes('/layout')) {
      setActiveTab('layout');
    } else if (location.pathname.includes('/scenes')) {
      setActiveTab('scenes');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const isSceneBuilderPage = location.pathname.includes('/layout') || location.pathname.includes('/scenes');

  return (
    <div className={`merchandiser-app ${location.pathname.includes('/scenes') ? 'nvidia-mode' : ''}`}>
      <ThemeToggle />
      <header className="app-header">
        <div className="header-left">
          <div className="logo-section">
            <span className="logo-badge">INFOSYS</span>
            <span className="logo-text">AI STUDIO</span>
          </div>
          <h1 className="app-title">Visual Merchandising Platform</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{currentUser.name || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {isSceneBuilderPage ? (
        <nav className="app-nav">
          <button
            className={`nav-tab ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => { setActiveTab('layout'); navigate('/merchandiser/layout'); }}
          >
            2D Scene Builder
          </button>
          <button
            className={`nav-tab ${activeTab === 'scenes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('scenes'); navigate('/merchandiser/scenes'); }}
          >
            3D Omniverse Viewer
          </button>
        </nav>
      ) : (
        <nav className="app-nav">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`nav-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Management
          </button>
          <button
            className={`nav-tab ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => { setActiveTab('layout'); navigate('/merchandiser/layout'); }}
          >
            2D Scene Builder
          </button>
          <button
            className={`nav-tab ${activeTab === 'scenes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('scenes'); navigate('/merchandiser/scenes'); }}
          >
            3D Omniverse Viewer
          </button>
        </nav>
      )}

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'layout' && <LayoutPlanner />}
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'scenes' && <SceneGallery />}
      </main>
    </div>
  );
};

export default MerchandiserApp;
