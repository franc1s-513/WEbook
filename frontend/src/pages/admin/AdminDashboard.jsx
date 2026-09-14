import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight, User, Wrench } from 'lucide-react';
import InvoiceModal from '../../components/booking/InvoiceModal';

const AdminDashboard = () => {
  const { showToast } = useAuth();
  const [reports, setReports] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [repRes, bRes] = await Promise.all([
        api.get('/admin/reports'),
        api.get('/admin/bookings')
      ]);
      setReports(repRes.data.data);
      setRecentBookings(bRes.data.data || []);
    } catch (err) {
      showToast('Error loading admin analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      showToast(`Status updated to ${status}`, 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending</span>;
      case 'CONFIRMED': return <span className="badge badge-confirmed">Confirmed</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Completed</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">Cancelled</span>;
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
            Operations & Service Control <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Service center throughput, revenue velocity, and schedule monitoring
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/admin/bookings" className="btn btn-primary">
            Manage All Bookings
          </Link>
          <Link to="/admin/services" className="btn btn-secondary">
            Service Catalog
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Revenue</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <DollarSign size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-emerald)' }}>
            ${reports?.totalRevenue || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From completed & paid services</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Bookings</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
            {reports?.totalBookings || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All-time customer appointments</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pending Approval</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="var(--accent-amber)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-amber)' }}>
            {reports?.statusCounts?.PENDING || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires staff confirmation</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>In Progress / Active</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Wrench size={20} color="var(--secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--secondary)' }}>
            {(reports?.statusCounts?.CONFIRMED || 0) + (reports?.statusCounts?.IN_PROGRESS || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently on shop floor</div>
        </div>
      </div>

      {/* Recent Bookings Operations Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Recent Bookings Pipeline</h3>
          <Link to="/admin/bookings" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            All Bookings <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading bookings...</div>
        ) : recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No bookings recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer & Vehicle</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date & Slot</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Services</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Technician</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 5).map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.userId?.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                        {b.vehicleId ? `${b.vehicleId.make} ${b.vehicleId.model} (${b.vehicleId.regNumber})` : 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{b.date}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '200px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.serviceIds?.map((s) => s.name).join(', ')}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      ${b.totalAmount}
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem', color: b.mechanicId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {b.mechanicId ? b.mechanicId.name.split(' ')[0] : 'Unassigned'}
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getStatusBadge(b.status)}
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'CONFIRMED')}
                            className="btn btn-primary btn-sm"
                            title="Approve & Confirm"
                          >
                            Approve
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'IN_PROGRESS')}
                            className="btn btn-secondary btn-sm"
                            title="Start Service"
                          >
                            Start
                          </button>
                        )}
                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'COMPLETED')}
                            className="btn btn-secondary btn-sm"
                            title="Mark Completed"
                            style={{ color: 'var(--accent-emerald)' }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceId(b._id)}
                          className="btn btn-secondary btn-sm"
                          title="Invoice"
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoiceId && (
        <InvoiceModal bookingId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
