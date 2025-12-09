import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Line, Group } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import './LayoutPlanner.css';

interface StoreObject {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ObjectConfig {
  baseWidth: number;
  baseHeight: number;
  imageUrl: string;
  label: string;
  realWorldSize: string;
}

const GRID_SIZE = 40;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

const REAL_OBJECT_SIZES: Record<string, ObjectConfig> = {
  'rack': { 
    baseWidth: 40, baseHeight: 80, 
    imageUrl: 'https://via.placeholder.com/40x80/9333EA/FFFFFF?text=Rack',
    label: 'Clothing Rack', realWorldSize: '1m × 2m'
  },
  'table': { 
    baseWidth: 80, baseHeight: 60, 
    imageUrl: 'https://via.placeholder.com/80x60/3B82F6/FFFFFF?text=Table',
    label: 'Display Table', realWorldSize: '2m × 1.5m'
  },
  'mannequin': { 
    baseWidth: 20, baseHeight: 20, 
    imageUrl: 'https://via.placeholder.com/20x20/EC4899/FFFFFF?text=M',
    label: 'Mannequin', realWorldSize: '0.5m × 0.5m'
  },
  'checkout': { 
    baseWidth: 80, baseHeight: 40, 
    imageUrl: 'https://via.placeholder.com/80x40/10B981/FFFFFF?text=Checkout',
    label: 'Checkout Counter', realWorldSize: '2m × 1m'
  },
  'chair': { 
    baseWidth: 20, baseHeight: 20, 
    imageUrl: 'https://via.placeholder.com/20x20/F59E0B/FFFFFF?text=C',
    label: 'Chair', realWorldSize: '0.5m × 0.5m'
  },
  'fitting-room': { 
    baseWidth: 60, baseHeight: 60, 
    imageUrl: 'https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=Fitting',
    label: 'Fitting Room', realWorldSize: '1.5m × 1.5m'
  }
};

const ObjectImage: React.FC<{obj: StoreObject, config: ObjectConfig, isSelected: boolean, onClick: () => void}> = ({ obj, config, isSelected, onClick }) => {
  const [image] = useImage(config.imageUrl);
  const width = config.baseWidth * obj.scale;
  const height = config.baseHeight * obj.scale;

  return (
    <Group onClick={onClick}>
      {image && (
        <KonvaImage
          image={image}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          stroke={isSelected ? '#0070C0' : '#333'}
          strokeWidth={isSelected ? 4 : 2}
          shadowBlur={isSelected ? 15 : 5}
          shadowColor={isSelected ? '#0070C0' : '#00000033'}
        />
      )}
      <Text
        text={obj.name}
        fontSize={12}
        fill="#0070C0"
        fontStyle="bold"
        align="center"
        width={width}
        offsetX={width / 2}
        offsetY={-height / 2 - 15}
      />
    </Group>
  );
};

const LayoutPlanner: React.FC = () => {
  const [objectConfigs, setObjectConfigs] = useState(REAL_OBJECT_SIZES);
  const [objects, setObjects] = useState<StoreObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [showAddObject, setShowAddObject] = useState(false);
  const [showLoadLayout, setShowLoadLayout] = useState(false);
  
  const [newObjectType, setNewObjectType] = useState({
    key: '', baseWidth: 40, baseHeight: 60, imageUrl: 'https://via.placeholder.com/40x60',
    label: '', realWorldSize: '1m × 1.5m'
  });

  const stageRef = useRef<any>(null);

  useEffect(() => {
    loadSavedLayouts();
  }, []);

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const loadSavedLayouts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/layout/load');
      setSavedLayouts(response.data.layouts || []);
    } catch (error) {
      console.error('Failed to load layouts:', error);
    }
  };

  const handleDragEnd = async (id: string, e: any) => {
    const snappedX = snapToGrid(e.target.x());
    const snappedY = snapToGrid(e.target.y());
    
    e.target.x(snappedX);
    e.target.y(snappedY);
    
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, x: snappedX, y: snappedY } : obj
    ));

    try {
      await axios.post('http://localhost:5000/api/layout/update', {
        object_id: id, x: snappedX, y: snappedY,
        rotation: objects.find(o => o.id === id)?.rotation || 0
      });
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  const handleEnlarge = () => {
    if (!selectedId) return;
    setObjects(objects.map(obj => 
      obj.id === selectedId ? { ...obj, scale: Math.min(obj.scale + 0.25, 3) } : obj
    ));
  };

  const handleShrink = () => {
    if (!selectedId) return;
    setObjects(objects.map(obj => 
      obj.id === selectedId ? { ...obj, scale: Math.max(obj.scale - 0.25, 0.5) } : obj
    ));
  };

  const handleRotate = () => {
    if (!selectedId) return;
    setObjects(objects.map(obj => 
      obj.id === selectedId ? { ...obj, rotation: (obj.rotation + 90) % 360 } : obj
    ));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setObjects(objects.filter(obj => obj.id !== selectedId));
    setSelectedId(null);
  };

  const handleRename = () => {
    if (!selectedId) return;
    const obj = objects.find(o => o.id === selectedId);
    if (!obj) return;
    
    const newName = prompt('Enter new name:', obj.name);
    if (newName) {
      setObjects(objects.map(o => 
        o.id === selectedId ? { ...o, name: newName } : o
      ));
    }
  };

  const addObject = (type: string) => {
    const count = objects.filter(o => o.type === type).length + 1;
    const config = objectConfigs[type];
    const newObject: StoreObject = {
      id: `${type}-${Date.now()}`,
      name: `${config.label} ${count}`,
      type, x: 400, y: 300, scale: 1, rotation: 0
    };
    setObjects([...objects, newObject]);
    setSelectedId(newObject.id);
  };

  const addNewObjectType = () => {
    if (!newObjectType.key || !newObjectType.label) {
      alert('Please fill in key and label');
      return;
    }
    
    setObjectConfigs({
      ...objectConfigs,
      [newObjectType.key]: {
        baseWidth: newObjectType.baseWidth,
        baseHeight: newObjectType.baseHeight,
        imageUrl: newObjectType.imageUrl,
        label: newObjectType.label,
        realWorldSize: newObjectType.realWorldSize
      }
    });
    
    setNewObjectType({ key: '', baseWidth: 40, baseHeight: 60, imageUrl: 'https://via.placeholder.com/40x60', label: '', realWorldSize: '1m × 1.5m' });
    setShowAddObject(false);
  };

  const deleteObjectType = (key: string) => {
    if (confirm(`Delete "${objectConfigs[key].label}" type?`)) {
      const newConfigs = { ...objectConfigs };
      delete newConfigs[key];
      setObjectConfigs(newConfigs);
      setObjects(objects.filter(obj => obj.type !== key));
    }
  };

  const saveLayout = async () => {
    const layoutName = prompt('Layout name:', `Layout ${savedLayouts.length + 1}`);
    if (!layoutName) return;

    try {
      await axios.post('http://localhost:5000/api/layout/save', {
        name: layoutName, layout: objects, timestamp: new Date().toISOString()
      });
      alert('Layout saved!');
      loadSavedLayouts();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save layout');
    }
  };

  const loadLayout = (layout: any) => {
    setObjects(layout.objects || []);
    setShowLoadLayout(false);
    setSelectedId(null);
  };

  const captureScreenshot = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'store-layout.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedObject = objects.find(o => o.id === selectedId);
  const selectedConfig = selectedObject ? objectConfigs[selectedObject.type] : null;

  return (
    <div className="layout-planner">
      <div className="layout-container">
        <div className="layout-sidebar">
          <div className="card">
            <div className="card-header">
              <h3>Objects Palette</h3>
              <button onClick={() => setShowAddObject(!showAddObject)} className="btn btn-primary btn-sm">
                + Add Type
              </button>
            </div>
            
            <div className="object-list">
              {Object.entries(objectConfigs).map(([type, config]) => (
                <div key={type} className="object-item">
                  <button onClick={() => addObject(type)} className="object-btn">
                    <img src={config.imageUrl} alt={config.label} className="object-preview" />
                    <div className="object-info-inline">
                      <span className="object-label">{config.label}</span>
                      <span className="object-size">{config.realWorldSize}</span>
                    </div>
                  </button>
                  <button onClick={() => deleteObjectType(type)} className="btn-delete">×</button>
                </div>
              ))}
            </div>
          </div>

          {showAddObject && (
            <div className="card">
              <h4>Add New Object Type</h4>
              <div className="form-group">
                <input type="text" placeholder="Key" value={newObjectType.key}
                  onChange={e => setNewObjectType({...newObjectType, key: e.target.value})} className="input" />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Label" value={newObjectType.label}
                  onChange={e => setNewObjectType({...newObjectType, label: e.target.value})} className="input" />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Image URL" value={newObjectType.imageUrl}
                  onChange={e => setNewObjectType({...newObjectType, imageUrl: e.target.value})} className="input" />
              </div>
              <button onClick={addNewObjectType} className="btn btn-primary btn-block">Add</button>
            </div>
          )}

          <div className="card">
            <div className="btn-group">
              <button onClick={() => setShowLoadLayout(!showLoadLayout)} className="btn btn-secondary btn-block">
                Load Layouts ({savedLayouts.length})
              </button>
              <button onClick={saveLayout} className="btn btn-primary btn-block">Save Layout</button>
              <button onClick={captureScreenshot} className="btn btn-secondary btn-block">Export PNG</button>
            </div>
          </div>

          {showLoadLayout && savedLayouts.length > 0 && (
            <div className="card layout-list">
              <h4>Saved Layouts</h4>
              <div className="saved-layouts">
                {savedLayouts.map((layout, idx) => (
                  <button key={idx} onClick={() => loadLayout(layout)} className="layout-item">
                    <div className="layout-name">{layout.name || `Layout ${idx + 1}`}</div>
                    <div className="layout-meta">
                      {new Date(layout.timestamp).toLocaleDateString()} • {layout.objects?.length || 0} objects
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="layout-canvas-area">
          <div className="canvas-header">
            <h3>2D Scene Builder</h3>
            <div className="canvas-info">
              <span className="grid-info">Grid: {GRID_SIZE}px (1m)</span>
              <div className="sync-badge">
                <div className="sync-dot" />
                <span>Omniverse Sync</span>
              </div>
            </div>
          </div>

          <div className="canvas-with-controls">
            <div className="canvas-wrapper">
              <Stage 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT}
                ref={stageRef}
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSelectedId(null);
                  }
                }}
              >
                <Layer>
                  {Array.from({ length: CANVAS_WIDTH / GRID_SIZE }).map((_, i) => (
                    <Line key={`v${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_HEIGHT]}
                      stroke="#E5E7EB" strokeWidth={1} />
                  ))}
                  {Array.from({ length: CANVAS_HEIGHT / GRID_SIZE }).map((_, i) => (
                    <Line key={`h${i}`} points={[0, i * GRID_SIZE, CANVAS_WIDTH, i * GRID_SIZE]}
                      stroke="#E5E7EB" strokeWidth={1} />
                  ))}

                  {objects.map((obj) => {
                    const config = objectConfigs[obj.type];
                    if (!config) return null;

                    return (
                      <Group key={obj.id} x={obj.x} y={obj.y} rotation={obj.rotation} draggable
                        onDragEnd={(e) => handleDragEnd(obj.id, e)}>
                        <ObjectImage obj={obj} config={config} isSelected={obj.id === selectedId} 
                          onClick={() => setSelectedId(obj.id)} />
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
            </div>

            {selectedObject && selectedConfig && (
              <div className="canvas-side-controls">
                <div className="control-card">
                  <h4>Selected: {selectedObject.name}</h4>
                  <div className="object-details">
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span>{selectedConfig.label}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Size:</span>
                      <span>{selectedConfig.realWorldSize}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Scale:</span>
                      <span>{selectedObject.scale}x</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Rotation:</span>
                      <span>{selectedObject.rotation}°</span>
                    </div>
                  </div>
                  <div className="btn-group-vertical">
                    <button onClick={handleEnlarge} className="btn btn-primary btn-block">Enlarge</button>
                    <button onClick={handleShrink} className="btn btn-primary btn-block">Shrink</button>
                    <button onClick={handleRotate} className="btn btn-secondary btn-block">Rotate 90°</button>
                    <button onClick={handleRename} className="btn btn-secondary btn-block">Rename</button>
                    <button onClick={handleDelete} className="btn btn-danger btn-block">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPlanner;
