import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { SavedScene } from '../types';
import './SceneGallery.css';

const SceneGallery: React.FC = () => {
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedScene, setSelectedScene] = useState<SavedScene | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [command, setCommand] = useState('');

  useEffect(() => {
    loadSavedScenes();
  }, []);

  const loadSavedScenes = () => {
    const stored = localStorage.getItem('saved_scenes');
    if (stored) {
      setSavedScenes(JSON.parse(stored));
    }
  };

  const handleSaveScene = async () => {
    if (!sceneName) {
      alert('Please enter a scene name');
      return;
    }

    try {
      const viewport = document.querySelector('.scene-viewport');
      if (viewport) {
        const canvas = await html2canvas(viewport as HTMLElement);
        const thumbnail = canvas.toDataURL('image/png');

        const newScene: SavedScene = {
          id: `scene-${Date.now()}`,
          name: sceneName,
          thumbnail,
          timestamp: new Date().toISOString(),
          products: []
        };

        const updated = [...savedScenes, newScene];
        setSavedScenes(updated);
        localStorage.setItem('saved_scenes', JSON.stringify(updated));

        setSceneName('');
        alert('Scene saved successfully!');
      }
    } catch (error) {
      console.error('Error capturing scene:', error);
      alert('Error saving scene. Please try again.');
    }
  };

  const deleteScene = (sceneId: string) => {
    if (confirm('Delete this scene?')) {
      const updated = savedScenes.filter(s => s.id !== sceneId);
      setSavedScenes(updated);
      localStorage.setItem('saved_scenes', JSON.stringify(updated));
    }
  };

  const quickCommands = [
    { label: 'Front Window', command: 'Place featured handbag display in the front window with spotlight' },
    { label: 'Center Table', command: 'Arrange t-shirt folding table in the center of main floor' },
    { label: 'Jewelry Counter', command: 'Position necklace display on the right jewelry counter' },
    { label: 'Fitting Room Path', command: 'Clear pathway from entrance to fitting rooms' }
  ];

  return (
    <div className="scene-gallery">
      <div className="flex items-center justify-between mb-6">
        <h1 className="scene-title">3D Omniverse Viewer</h1>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
          <div className="text-sm font-semibold text-gray-700">Powered by</div>
          <div className="bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">NVIDIA</div>
        </div>
      </div>

      <div className="scene-sections">
        <div className="saved-scenes-section">
          <div className="section-header">
            <h2>📸 Saved Scenes</h2>
            <button className="new-scene-btn" onClick={() => setShowBuilder(!showBuilder)}>
              {showBuilder ? '← Back to Gallery' : '+ New Scene'}
            </button>
          </div>

          {!showBuilder && (
            <>
              {savedScenes.length === 0 ? (
                <div className="no-scenes">
                  <div className="no-scenes-icon">🎨</div>
                  <p>No scenes saved yet</p>
                  <p className="no-scenes-hint">Create your first scene using the Scene Builder below</p>
                </div>
              ) : (
                <div className="scenes-grid">
                  {savedScenes.map(scene => (
                    <div key={scene.id} className="scene-card">
                      <div className="scene-thumbnail" onClick={() => { setSelectedScene(scene); setShowPreview(true); }}>
                        <img src={scene.thumbnail} alt={scene.name} />
                        <div className="scene-overlay">
                          <span>👁️ Preview</span>
                        </div>
                      </div>
                      <div className="scene-info">
                        <h3>{scene.name}</h3>
                        <p className="scene-timestamp">
                          {new Date(scene.timestamp).toLocaleDateString()}
                        </p>
                        <button 
                          className="delete-scene-btn"
                          onClick={() => deleteScene(scene.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {showBuilder && (
          <div className="scene-builder-section">
            <h2>🎮 Scene Builder</h2>
            
            <div className="builder-controls">
              <div className="control-group">
                <label>Scene Name:</label>
                <input
                  type="text"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="e.g., Summer Window Display"
                  className="scene-name-input"
                />
              </div>

              <div className="control-group">
                <label>Natural Language Command:</label>
                <textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., Move the leather tote bag to the front window display with accent lighting"
                  className="command-textarea"
                  rows={3}
                />
              </div>

              <div className="quick-commands">
                <label>Quick Commands:</label>
                <div className="quick-btns">
                  {quickCommands.map((qc, i) => (
                    <button
                      key={i}
                      className="quick-cmd-btn"
                      onClick={() => setCommand(qc.command)}
                    >
                      {qc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="scene-viewport">
              <div className="viewport-placeholder">
                <div className="placeholder-icon">🏬</div>
                <h3>3D Scene Preview</h3>
                <p>This is where your Omniverse scene would render</p>
                <p className="integration-note">
                  <strong>Integration Note:</strong> Install @nvidia/omniverse-webrtc-streaming-library
                  and connect to your Kit streaming server to see live 3D scenes here
                </p>
                <div className="mock-scene-elements">
                  <div className="mock-element">📦 T-Shirt Display</div>
                  <div className="mock-element">👜 Handbag Rack</div>
                  <div className="mock-element">🪟 Window Display</div>
                </div>
              </div>
            </div>

            <div className="builder-actions">
              <button className="execute-btn" onClick={() => alert(`Executing: ${command}`)}>
                Execute Command
              </button>
              <button className="save-scene-btn" onClick={handleSaveScene}>
                💾 Save Scene
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scene Preview Modal */}
      {showPreview && selectedScene && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="scene-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedScene.name}</h2>
              <button className="modal-close" onClick={() => setShowPreview(false)}>&times;</button>
            </div>
            <div className="preview-content">
              <img src={selectedScene.thumbnail} alt={selectedScene.name} />
              <div className="preview-info">
                <p><strong>Saved:</strong> {new Date(selectedScene.timestamp).toLocaleString()}</p>
                <button className="load-scene-btn">
                  Load in Omniverse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneGallery;
