import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './Landing.css';

interface LoginCredentials {
  email: string;
  password: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });

  const handleCardClick = (role: string) => {
    setSelectedRole(role);
    setShowLogin(true);
  };

  const handleLogin = () => {
    // Define all users with their roles
    const users: Record<string, { id: string; name: string; role: string }> = {
      // Visual Merchandisers
      'merchandiser@store.com': { id: 'merchandiser1', name: 'Visual Merchandiser', role: 'merchandiser' },
      'vm@store.com': { id: 'vm1', name: 'VM Lead', role: 'merchandiser' },
      
      // Store Associates
      'sarah@store.com': { id: 'sarah', name: 'Sarah', role: 'associate' },
      'alex@store.com': { id: 'alex', name: 'Alex', role: 'associate' },
      
      // Store Managers (future)
      'mike@store.com': { id: 'mike', name: 'Mike', role: 'manager' }
    };

    const user = users[credentials.email];
    
    if (user && credentials.password === 'demo123') {
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Route based on role
      if (user.role === 'associate') {
        navigate(`/tasks/${user.id}`);
      } else if (user.role === 'merchandiser') {
        navigate('/merchandiser/user-stories');
      } else if (user.role === 'manager') {
        // Future: navigate('/manager')
        alert('Store Manager interface coming soon!');
        navigate('/merchandiser/user-stories'); // Temporary
      }
    } else {
      alert('Invalid credentials. Try: merchandiser@store.com / demo123 or sarah@store.com / demo123');
    }
  };

  return (
    <div className="landing-page">
      <ThemeToggle />
      <div className="landing-header">
        <div className="infosys-logo">
          <span className="logo-badge">INFOSYS</span>
          <span className="ai-studio">AI STUDIO</span>
        </div>
      </div>

      <div className="landing-content">
        <h1 className="welcome-text">WELCOME TO THE INFOSYS AI STUDIO</h1>
        <h2 className="main-title">CHOOSE YOUR<br/>USE CASE TYPE</h2>

        <div className="use-cases-grid">
          {/* Visual Merchandiser */}
          <div className="use-case-card" onClick={() => handleCardClick('merchandiser')}>
            <div className="card-image merchandiser-bg">
              <div className="image-overlay">Visual Merchandiser</div>
            </div>
            <h3 className="card-title">The Visual Merchandiser</h3>
            <p className="card-description">
              From curating inspiring displays and planning new layouts, use GenAI to instantly 
              rank SKUs, generate on-brand product stories, and build creative storyboards for 
              every seasonal change.
            </p>
            <button className="card-action-btn green">
              <span>Product Intake & SKU Prioritization</span>
              <span className="btn-arrow">→</span>
            </button>
            <p className="capability-text">Capability epic: Display Story Builder</p>
          </div>

          {/* Store Associate */}
          <div className="use-case-card" onClick={() => handleCardClick('associate')}>
            <div className="card-image associate-bg">
              <div className="image-overlay">Store Associate</div>
            </div>
            <h3 className="card-title">The Store Associate</h3>
            <p className="card-description">
              Always on the move, rely on GenAI for real-time rotation notes, automated setup 
              guidance, and mobile alerts, making floor changes CX-friendly smooth and error-free.
            </p>
            <button className="card-action-btn blue">
              <span>Task Management & Execution</span>
              <span className="btn-arrow">→</span>
            </button>
            <p className="capability-text">Capability epic: Install & Prop Management</p>
          </div>

          {/* Store Manager - Coming Soon */}
          <div className="use-case-card disabled" onClick={() => handleCardClick('manager')}>
            <div className="card-image manager-bg">
              <div className="image-overlay">Store Manager</div>
              <div className="coming-soon-badge">COMING SOON</div>
            </div>
            <h3 className="card-title">The Store Manager</h3>
            <p className="card-description">
              Balancing performance and compliance, use GenAI to flag slow sellers, monitor sales 
              uplift by zone, and react to AI-powered checks that guarantee brand standards.
            </p>
            <button className="card-action-btn teal disabled">
              <span>Scheduling & Performance</span>
              <span className="btn-arrow">→</span>
            </button>
            <p className="capability-text">Capability epic: Sales-to-Display Analytics</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogin(false)}>×</button>
            <h2>
              {selectedRole === 'associate' && 'Store Associate Login'}
              {selectedRole === 'merchandiser' && 'Visual Merchandiser Login'}
              {selectedRole === 'manager' && 'Store Manager Login'}
            </h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={credentials.email}
                onChange={e => setCredentials({...credentials, email: e.target.value})}
                placeholder="Enter your email"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                placeholder="Enter password"
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button className="login-btn" onClick={handleLogin}>Login</button>
            <div className="demo-info">
              {selectedRole === 'merchandiser' && (
                <>
                  <p><strong>Demo Credentials:</strong></p>
                  <p>merchandiser@store.com / demo123</p>
                  <p>vm@store.com / demo123</p>
                </>
              )}
              {selectedRole === 'associate' && (
                <>
                  <p><strong>Demo Credentials:</strong></p>
                  <p>sarah@store.com / demo123</p>
                  <p>alex@store.com / demo123</p>
                </>
              )}
              {selectedRole === 'manager' && (
                <>
                  <p><strong>Demo Credentials:</strong></p>
                  <p>mike@store.com / demo123</p>
                  <p className="coming-soon-text">(Interface coming soon)</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Infosys branding footer */}
      <div className="infosys-footer">
        <div className="infosys-badge">INFOSYS</div>
        <span className="ai-studio-text">AI STUDIO</span>
      </div>
    </div>
  );
};

export default Landing;
