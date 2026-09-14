import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Filter, Calendar, Wrench, CheckCircle2, X, User, FileText, Check } from 'lucide-react';
import InvoiceModal from '../../components/booking/InvoiceModal';

const ManageBookings = () => {
  const { showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookingForAssign, setSelectedBookingForAssign] = useState(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = '/admin/bookings?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;

      const [bRes, mRes, brRes] = await Promise.all([
        api.get(url),
        api.get('/admin/mechanics'),
        api.get('/admin/branches')
      ]);

      setBookings(bRes.data.data || []);
      setMechanics(mRes.data.data || []);
      setBranches(brRes.data.data || []);
    } catch (err) {
      showToast('Error loading bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      showToast(`Booking marked as ${status}`, 'success');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const openAssignModal = (booking) => {
    setSelectedBookingForAssign(booking);
    setSelectedMechanicId(booking.mechanicId ? booking.mechanicId._id : '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingForAssign) return;

    try {
      await api.put(`/admin/bookings/${selectedBookingForAssign._id}/assign`, {
        mechanicId: selectedMechanicId
      });
      showToast('Technician assigned successfully', 'success');
      setAssignModalOpen(false);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Assignment failed', 'error');
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
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Booking Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Approve schedules, dispatch master mechanics, and update job status
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Filter size={16} /> Filters:
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          />
        </div>

        {(statusFilter || dateFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading bookings catalog...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No bookings matching the selected criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vehicle</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Schedule</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Assigned Tech</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{b.userId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.userId?.email}</div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div>{b.vehicleId ? `${b.vehicleId.year} ${b.vehicleId.make} ${b.vehicleId.model}` : 'Vehicle'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{b.vehicleId?.regNumber}</div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{b.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.timeSlot}</div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>${b.totalAmount}</div>
                      <div style={{ fontSize: '0.72rem', color: b.paymentStatus === 'paid' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {b.paymentStatus.toUpperCase()} ({b.paymentMethod})
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {getStatusBadge(b.status)}
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <button
                        onClick={() => openAssignModal(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                      >
                        <Wrench size={13} /> {b.mechanicId ? b.mechanicId.name.split(' ')[0] : 'Assign Tech'}
                      </button>
                    </td>

                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'CONFIRMED')}
                            className="btn btn-primary btn-sm"
                            title="Confirm Booking"
                          >
                            Approve
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'IN_PROGRESS')}
                            className="btn btn-secondary btn-sm"
                            title="Set In Progress"
                          >
                            In Progress
                          </button>
                        )}
                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'COMPLETED')}
                            className="btn btn-secondary btn-sm"
                            title="Complete Job"
                            style={{ color: 'var(--accent-emerald)' }}
                          >
                            Complete
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusUpdate(b._id, 'CANCELLED')}
                            className="btn btn-danger btn-sm"
                            title="Reject/Cancel"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceId(b._id)}
                          className="btn btn-secondary btn-sm"
                          title="Invoice"
                        >
                          <FileText size={14} />
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

      {/* Mechanic Assignment Modal */}
      {assignModalOpen && selectedBookingForAssign && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Assign Technician</h3>
              <button onClick={() => setAssignModalOpen(false)} className="btn btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Booking: #{selectedBookingForAssign._id.slice(-6).toUpperCase()} • {selectedBookingForAssign.vehicleId?.make} {selectedBookingForAssign.vehicleId?.model}
            </p>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Select Certified Mechanic
                </label>
                <select
                  value={selectedMechanicId}
                  onChange={(e) => setSelectedMechanicId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Mechanic --</option>
                  {mechanics.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setAssignModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoiceId && (
        <InvoiceModal bookingId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}
    </div>
  );
};

export default ManageBookings;
