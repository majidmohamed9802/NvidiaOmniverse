import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Recommendation, ActionPlan, User } from '../types';
import './TaskView.css';

const TaskView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Recommendation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTask, setSelectedTask] = useState<Recommendation | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === userId) {
        setCurrentUser(user);
        fetchTasks(userId);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [userId, navigate]);

  const fetchTasks = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/team/${userId}/tasks`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/recommendations/${taskId}/status`, {
        status: newStatus
      });
      fetchTasks(userId!);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const viewActionPlan = async (task: Recommendation) => {
    setSelectedTask(task);
    setLoading(true);
    setShowPlanModal(true);

    try {
      const response = await axios.post('http://localhost:5000/api/team/action-plan', {
        recommendation: {
          action: task.action,
          reason: task.reason,
          product_code: task.product_code
        }
      });
      setActionPlan(response.data.action_plan);
    } catch (error) {
      console.error('Error fetching action plan:', error);
      setActionPlan({
        steps: ['Error loading action plan. Please try again.'],
        tools_needed: [],
        safety_notes: [],
        estimated_time: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-view-container">
      <div className="task-header">
        <div>
          <h1>Welcome, {currentUser.name}</h1>
          <p className="task-subtitle">Your Assigned Tasks</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <div className="no-tasks-icon">📋</div>
          <h2>No tasks assigned yet</h2>
          <p>Check back later for new assignments</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card-associate">
              <div className="task-card-header">
                <span 
                  className="priority-badge-task"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority.toUpperCase()} PRIORITY
                </span>
                {task.product_code && (
                  <span className="product-code-tag-task">{task.product_code}</span>
                )}
              </div>

              <h3 className="task-action">{task.action}</h3>
              <p className="task-reason">{task.reason}</p>

              <div className="task-card-footer">
                <div className="status-section">
                  <label>Status:</label>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="status-select-task"
                    style={{ borderColor: getStatusColor(task.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button 
                  className="action-plan-button-task"
                  onClick={() => viewActionPlan(task)}
                >
                  View Action Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Plan Modal */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Action Plan</h2>
              <button className="modal-close" onClick={() => setShowPlanModal(false)}>&times;</button>
            </div>
            <div className="modal-body-scroll">
              {loading ? (
                <div className="loading-spinner">Loading action plan...</div>
              ) : actionPlan ? (
                <>
                  <div className="plan-section">
                    <h3>Task: {selectedTask?.action}</h3>
                    <p className="task-reason-modal">{selectedTask?.reason}</p>
                  </div>

                  <div className="plan-section">
                    <h3>Steps to Complete:</h3>
                    <ol className="steps-list">
                      {actionPlan.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="plan-section">
                    <h3>Tools Needed:</h3>
                    <ul className="tools-list">
                      {actionPlan.tools_needed.map((tool, index) => (
                        <li key={index}>{tool}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-section">
                    <h3>Safety Notes:</h3>
                    <ul className="safety-list">
                      {actionPlan.safety_notes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-section">
                    <h3>Estimated Time:</h3>
                    <p className="estimated-time">{actionPlan.estimated_time}</p>
                  </div>
                </>
              ) : (
                <div>No action plan available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskView;
