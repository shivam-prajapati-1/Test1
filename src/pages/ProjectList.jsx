import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Plus, Folder, Pencil, Trash2 } from 'lucide-react';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject._id, newTitle, newDesc);
        setProjects(projects.map(p => p._id === editingProject._id ? updated : p));
      } else {
        const newProj = await api.createProject(newTitle, newDesc);
        setProjects([...projects, newProj]);
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
    setEditingProject(null);
    setNewTitle('');
    setNewDesc('');
  };

  const openEditModal = (p, e) => {
    e.stopPropagation();
    setEditingProject(p);
    setNewTitle(p.title);
    setNewDesc(p.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.deleteProject(id);
        setProjects(projects.filter(p => p._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <header className="bg-white shadow-sm sticky-top py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
            <Folder size={24} className="text-primary" /> Projects
          </h1>
          <div className="d-flex gap-2">
            <Button onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
              <Plus size={18} /> New Project
            </Button>
            <Button variant="outline-danger" onClick={() => { logout(); navigate('/login'); }} className="d-flex align-items-center gap-2 text-danger border-danger" style={{ background: 'transparent' }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-5">
        {loading ? (
          <div className="text-center text-muted">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <p>No projects found. Create one to get started!</p>
          </div>
        ) : (
          <div className="row g-4">
            {projects.map(p => (
              <div className="col-md-6 col-lg-4" key={p._id}>
                <Card onClick={() => navigate(`/projects/${p._id}`)} className="h-100 position-relative">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="h5 fw-bold mb-0 text-truncate pe-2">{p.title}</h3>
                    <div className="d-flex gap-1 shrink-0">
                      <button className="btn btn-sm btn-light p-1 border-0" onClick={(e) => openEditModal(p, e)}>
                        <Pencil size={16} className="text-muted" />
                      </button>
                      <button className="btn btn-sm btn-light p-1 border-0" onClick={(e) => handleDelete(p._id, e)}>
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                  <p className="text-muted mb-0 small">{p.description || 'No description provided.'}</p>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Simple Modal overlay using inline styles with Bootstrap classes inside */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <div style={{ width: '100%', maxWidth: '500px', padding: '1rem' }}>
            <Card>
              <h2 className="h4 fw-bold mb-4">{editingProject ? 'Edit Project' : 'Create Project'}</h2>
              <form onSubmit={handleCreate}>
                <Input 
                  label="Project Title" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  required 
                />
                <Input 
                  label="Description" 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                />
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button type="button" variant="light" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create')}
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

export default ProjectList;
