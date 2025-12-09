import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import './SceneBuilder.css';

const SceneBuilder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="scene-builder-page">
      <ThemeToggle />
      
      <header className="scene-header">
        <div>
          <h1>Scene Builder</h1>
          <p className="header-subtitle">Choose your workspace</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/merchandiser/user-stories')}>
          Back to Stories
        </button>
      </header>

      <div className="builder-options">
        <div className="builder-card" onClick={() => navigate('/merchandiser/layout')}>
          <div className="builder-icon">2D</div>
          <h2>2D Scene Builder</h2>
          <p>Design store layouts with drag-and-drop interface. Perfect for planning and quick iterations.</p>
          <button className="btn btn-primary">Open 2D Builder</button>
        </div>

        <div className="builder-card" onClick={() => navigate('/merchandiser/scenes')}>
          <div className="builder-icon">3D</div>
          <h2>3D Omniverse Viewer</h2>
          <p>Visualize your store in immersive 3D. View realistic renders powered by NVIDIA Omniverse.</p>
          <button className="btn btn-primary">Open 3D Viewer</button>
        </div>
      </div>
    </div>
  );
};

export default SceneBuilder;
