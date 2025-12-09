import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MerchandiserApp from './pages/MerchandiserApp';
import TaskView from './pages/TaskView';
import VMUserStories from './pages/VMUserStories';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SceneBuilder from './pages/SceneBuilder';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/merchandiser" element={<MerchandiserApp />} />
        <Route path="/merchandiser/user-stories" element={<VMUserStories />} />
        <Route path="/merchandiser/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/merchandiser/scene-builder" element={<SceneBuilder />} />
        <Route path="/merchandiser/layout" element={<MerchandiserApp />} />
        <Route path="/merchandiser/scenes" element={<MerchandiserApp />} />
        <Route path="/tasks/:userId" element={<TaskView />} />
      </Routes>
    </Router>
  );
};

export default App;
