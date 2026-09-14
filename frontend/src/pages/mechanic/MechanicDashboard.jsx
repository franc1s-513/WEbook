import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Clock, Calendar, CheckCircle2, User, Car, Plus, Trash2, Check, FileText } from 'lucide-react';

const MechanicDashboard = () => {
  const { user, showToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [activeJob, setActiveJob] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [mechanicNotes, setMechanicNotes] = useState('');
  const [parts, setParts] = useState([]);
  const [partNameInput, setPartNameInput] = useState('');
  const [partCostInput, setPartCostInput] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await api.get('/mechanic/jobs');
      setJobs(res.data.data || []);
    } catch (err) {
      showToast('Error loading assigned jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openUpdateModal = (job) => {
    setActiveJob(job);
    setNewStatus(job.status === 'CONFIRMED' ? 'IN_PROGRESS' : job.status);
    setMechanicNotes(job.mechanicNotes || '');
    setParts(job.partsUsed || []);
    setPartNameInput('');
    setPartCostInput('');
  };

  const addPart = () => {
    if (!partNameInput.trim() || !partCostInput) return;
    setParts([...parts, { partName: partNameInput.trim(), cost: Number(partCostInput) }]);
    setPartNameInput('');
    setPartCostInput('');
  };

  const removePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!activeJob) return;

    try {
      await api.put(`/mechanic/jobs/${activeJob._id}/status`, {
        status: newStatus,
        mechanicNotes,
        partsUsed: parts
      });
      showToast('Job status and technician notes updated', 'success');
      setActiveJob(null);
      fetchJobs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return <span className="badge badge-confirmed">Scheduled</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Done</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
            Technician Workbench — <span className="gradient-text">{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Service bay queue, diagnostic reports, and spare parts installation log
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your service roster...
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Wrench size={36} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Jobs Currently Assigned</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            All assigned jobs will appear here when dispatched by the service director.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => (
            <div key={job._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job #{job._id.slice(-6).toUpperCase()}</span>
                {getStatusBadge(job.status)}
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {job.vehicleId ? `${job.vehicleId.year} ${job.vehicleId.make} ${job.vehicleId.model}` : 'Vehicle'}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Reg: {job.vehicleId?.regNumber} • {job.vehicleId?.fuelType}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={13} color="var(--primary)" /> <strong>Schedule:</strong> {job.date} ({job.timeSlot})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={13} color="var(--primary)" /> <strong>Customer:</strong> {job.userId?.name} ({job.userId?.phone || 'No phone'})
                </div>
                {job.notes && (
                  <div style={{ color: 'var(--accent-amber)', marginTop: '4px' }}>
                    <strong>Customer Note:</strong> "{job.notes}"
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Scope of Work:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', color: 'var(--text-primary)' }}>
                  {job.serviceIds?.map((s) => (
                    <li key={s._id}>{s.name}</li>
                  ))}
                </ul>
              </div>

              {job.mechanicNotes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(6, 182, 212, 0.05)', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                  <strong>Your Notes:</strong> {job.mechanicNotes}
                </div>
              )}

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => openUpdateModal(job)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.88rem' }}
                >
                  <Wrench size={14} /> Update Job Progress & Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status & Parts Modal */}
      {activeJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Update Job #{activeJob._id.slice(-6).toUpperCase()}</h3>
              <button onClick={() => setActiveJob(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Service Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="CONFIRMED">Confirmed / On Hold</option>
                  <option value="IN_PROGRESS">In Progress (Active in Bay)</option>
                  <option value="COMPLETED">Completed (Inspection Passed)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Technician Diagnostic Notes & Recommendations
                </label>
                <textarea
                  rows={3}
                  value={mechanicNotes}
                  onChange={(e) => setMechanicNotes(e.target.value)}
                  placeholder="Record work carried out, fluids flushed, brake pad wear % remaining, or safety advisories..."
                />
              </div>

              {/* Parts Section */}
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Installed Replacement Parts (Added to Invoice)
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={partNameInput}
                    onChange={(e) => setPartNameInput(e.target.value)}
                    placeholder="Part Name (e.g. Bosch Air Filter)"
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    min="0"
                    value={partCostInput}
                    onChange={(e) => setPartCostInput(e.target.value)}
                    placeholder="Cost ($)"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={addPart} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
                    <Plus size={16} /> Add
                  </button>
                </div>

                {parts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                    {parts.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>{p.partName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontWeight: 600 }}>${p.cost}</span>
                          <button type="button" onClick={() => removePart(idx)} style={{ color: 'var(--accent-rose)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setActiveJob(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;
