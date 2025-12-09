import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Recommendation, TeamMember, ActionPlan } from '../types';
import './TeamManagement.css';

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember>>({});
  const [tasks, setTasks] = useState<Recommendation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Recommendation | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [newTask, setNewTask] = useState({ action: '', reason: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeamData();
    fetchTasks();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/team/members');
      setTeamMembers(response.data.team_members);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recommendations');
      setTasks(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.action || !newTask.reason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/recommendations/create', {
        action: newTask.action,
        reason: newTask.reason,
        priority: newTask.priority
      });
      setShowCreateModal(false);
      setNewTask({ action: '', reason: '', priority: 'medium' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAssignTask = async (taskId: string, memberId: string) => {
    try {
      await axios.post('http://localhost:5000/api/recommendations/assign', {
        insight_id: taskId,
        team_member: memberId
      });
      fetchTasks();
      fetchTeamData();
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/recommendations/${taskId}/status`, { status });
      fetchTasks();
      fetchTeamData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const viewMemberTasks = async (memberId: string) => {
    setSelectedMember(memberId);
    setShowTasksModal(true);
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
        steps: ['Error loading plan'],
        tools_needed: [],
        safety_notes: [],
        estimated_time: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const memberTasks = selectedMember ? tasks.filter(t => t.assigned_to === selectedMember) : [];

  return (
    <div className="team-management">
      <div className="team-header-section">
        <h1>Team Management</h1>
        <button className="create-task-btn" onClick={() => setShowCreateModal(true)}>
          + Create Task Manually
        </button>
      </div>

      <div className="team-members-grid">
        {Object.entries(teamMembers).map(([id, member]) => (
          <div key={id} className="team-member-card-modern">
            <div className="member-avatar">{member.name.charAt(0)}</div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <div className="member-role-badge">{member.role}</div>
            </div>
            <div className="member-stats-row">
              <div className="stat-box">
                <div className="stat-num">{member.tasks_completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{member.tasks_total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">{member.success_rate}%</div>
                <div className="stat-label">Success</div>
              </div>
            </div>
            <button className="view-tasks-btn" onClick={() => viewMemberTasks(id)}>
              View Tasks
            </button>
          </div>
        ))}
      </div>

      <div className="tasks-section-modern">
        <h2>Active Tasks</h2>
        {tasks.length === 0 ? (
          <p className="no-tasks-message">No tasks created yet. Click "+ Create Task Manually" to add one.</p>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className="task-card-modern">
                <div className="task-card-header-modern">
                  <span 
                    className="priority-badge-modern" 
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                  {task.product_code && <span className="product-code-tag">{task.product_code}</span>}
                </div>

                <h3 className="task-action-title">{task.action}</h3>
                <p className="task-reason-text">{task.reason}</p>

                <div className="task-actions-row">
                  <select
                    value={task.assigned_to || ''}
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                    className="assign-select-modern"
                  >
                    <option value="">Unassigned</option>
                    {Object.entries(teamMembers).map(([id, member]) => (
                      <option key={id} value={id}>{member.name}</option>
                    ))}
                  </select>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="status-select-modern"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button className="action-plan-btn" onClick={() => viewActionPlan(task)}>
                    Action Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Action *</label>
                <input
                  type="text"
                  value={newTask.action}
                  onChange={(e) => setNewTask({...newTask, action: e.target.value})}
                  placeholder="e.g., Rearrange window display"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Reason/Details *</label>
                <textarea
                  value={newTask.reason}
                  onChange={(e) => setNewTask({...newTask, reason: e.target.value})}
                  placeholder="Explain why this task is needed"
                  className="form-textarea"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button className="submit-btn" onClick={handleCreateTask}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Tasks Modal */}
      {showTasksModal && (
        <div className="modal-overlay" onClick={() => setShowTasksModal(false)}>
          <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{teamMembers[selectedMember!]?.name}'s Tasks</h2>
              <button className="modal-close" onClick={() => setShowTasksModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {memberTasks.length === 0 ? (
                <p className="no-tasks-message">No tasks assigned yet</p>
              ) : (
                <div className="member-tasks-list">
                  {memberTasks.map(task => (
                    <div key={task.id} className="member-task-item">
                      <div className="task-header-mini">
                        <span 
                          className="priority-badge-mini"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                        <span className={`status-badge-modern status-${task.status}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4>{task.action}</h4>
                      <p>{task.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Plan Modal */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content-large-modern" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Action Plan</h2>
              <button className="modal-close" onClick={() => setShowPlanModal(false)}>&times;</button>
            </div>
            <div className="modal-body-scroll">
              {loading ? (
                <div className="loading-state">Loading action plan...</div>
              ) : actionPlan && (
                <div className="action-plan-content">
                  <div className="plan-section">
                    <h3>Steps:</h3>
                    <ol>
                      {actionPlan.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                  <div className="plan-section">
                    <h3>Tools Needed:</h3>
                    <ul>
                      {actionPlan.tools_needed.map((tool, i) => <li key={i}>{tool}</li>)}
                    </ul>
                  </div>
                  <div className="plan-section">
                    <h3>Safety Notes:</h3>
                    <ul>
                      {actionPlan.safety_notes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  </div>
                  <div className="plan-section">
                    <h3>Estimated Time:</h3>
                    <p className="time-estimate">{actionPlan.estimated_time}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
