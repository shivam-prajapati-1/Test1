import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, ArrowLeft, CheckCircle2, Clock, Circle, Pencil, Trash2 } from 'lucide-react';

const TaskList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setSubmitting(true);
    try {
      if (editingTask) {
        const updated = await api.updateTask(editingTask._id, { title: newTaskTitle }, projectId);
        setTasks(tasks.map(t => t._id === editingTask._id ? updated : t));
      } else {
        const newTask = await api.createTask(projectId, newTaskTitle);
        setTasks([...tasks, newTask]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setNewTaskTitle('');
  };

  const openEditModal = (t) => {
    setEditingTask(t);
    setNewTaskTitle(t.title);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId, projectId);
        setTasks(tasks.filter(t => t._id !== taskId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateStatus = async (taskId, status) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
    try {
      await api.updateTask(taskId, { status }, projectId);
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={20} className="text-success" />;
      case 'In Progress': return <Clock size={20} className="text-primary" />;
      default: return <Circle size={20} className="text-warning" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Done') return 'bg-success bg-opacity-10 text-success';
    if (status === 'In Progress') return 'bg-primary bg-opacity-10 text-primary';
    return 'bg-warning bg-opacity-10 text-warning';
  };

  return (
    <div className="bg-light min-vh-100">
      <header className="bg-white shadow-sm sticky-top py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => navigate('/projects')} 
              className="btn btn-link text-muted p-0 text-decoration-none"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="h4 fw-bold mb-0">Project Tasks</h1>
          </div>
          <div className="d-flex gap-2">
            <Button onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
              <Plus size={18} /> Add Task
            </Button>
            <Button variant="outline-danger" onClick={() => { logout(); navigate('/login'); }} className="d-flex align-items-center gap-2 text-danger border-danger" style={{ background: 'transparent' }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-5">
        {loading ? (
          <div className="text-center text-muted">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <p>No tasks found. Create one to get started!</p>
            <Button onClick={() => setShowModal(true)} className="mt-3">
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {tasks.map(t => (
              <Card key={t._id} className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    {getStatusIcon(t.status)}
                    <span 
                      className={`fs-5 ${t.status === 'Done' ? 'text-muted text-decoration-line-through' : 'fw-medium'}`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                    <select 
                      className="form-select form-select-sm shadow-none" 
                      style={{ width: 'auto' }}
                      value={t.status}
                      onChange={(e) => updateStatus(t._id, e.target.value)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <div className="d-flex gap-1 ms-2 border-start ps-3">
                      <button className="btn btn-sm btn-light p-1 border-0" onClick={() => openEditModal(t)}>
                        <Pencil size={16} className="text-muted" />
                      </button>
                      <button className="btn btn-sm btn-light p-1 border-0" onClick={() => handleDelete(t._id)}>
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <div style={{ width: '100%', maxWidth: '500px', padding: '1rem' }}>
            <Card>
              <h2 className="h4 fw-bold mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
              <form onSubmit={handleCreate}>
                <Input 
                  label="Task Title" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  required 
                />
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button type="button" variant="light" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingTask ? 'Save Changes' : 'Add')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
