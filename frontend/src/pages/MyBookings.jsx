import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Car, FileText, Star, XCircle, Wrench, Shield, CheckCircle2 } from 'lucide-react';
import InvoiceModal from '../components/booking/InvoiceModal';
import ReviewModal from '../components/booking/ReviewModal';

const MyBookings = () => {
  const { showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking appointment?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      showToast('Booking cancelled', 'info');
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed', 'error');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending Approval</span>;
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>My Service Bookings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time appointment schedule, service invoices, and rating history
          </p>
        </div>
        <Link to="/book" className="btn btn-primary">
          + Book New Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        {[
          { key: 'ALL', label: `All (${bookings.length})` },
          { key: 'ACTIVE', label: `Active (${bookings.filter((b) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length})` },
          { key: 'COMPLETED', label: `Completed (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
          { key: 'CANCELLED', label: `Cancelled (${bookings.filter((b) => b.status === 'CANCELLED').length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 500,
              background: activeTab === tab.key ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeTab === tab.key ? '1px solid var(--primary)' : '1px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No bookings found in this view.</p>
          <Link to="/book" className="btn btn-primary btn-sm">Book a Service</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredBookings.map((b) => (
            <div key={b._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booking ID: #{b._id.slice(-6).toUpperCase()}</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {b.vehicleId ? `${b.vehicleId.year} ${b.vehicleId.make} ${b.vehicleId.model}` : 'Vehicle'}
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', marginLeft: '0.5rem' }}>
                      ({b.vehicleId?.regNumber})
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {getStatusBadge(b.status)}
                  <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '0.72rem' }}>
                    {b.paymentStatus === 'paid' ? 'PAID' : 'PAY ON VISIT'}
                  </span>
                </div>
              </div>

              {/* Middle Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Schedule & Branch</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                    <Calendar size={14} color="var(--primary)" /> {b.date}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                    <Clock size={14} /> {b.timeSlot}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                    {b.branchId?.name}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Service Packages</div>
                  <div style={{ marginTop: '2px' }}>
                    {b.serviceIds?.map((s) => (
                      <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{s.name}</span>
                        <span style={{ fontWeight: 600 }}>${s.price}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', paddingTop: '4px', fontWeight: 700, color: 'var(--primary)' }}>
                    Total: ${b.totalAmount}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Assigned Technician</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {b.mechanicId ? b.mechanicId.name : 'Awaiting Assignment'}
                  </div>
                  {b.mechanicNotes && (
                    <div style={{ marginTop: '6px', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Tech Notes:</strong> {b.mechanicNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/bookings/${b._id}`} className="btn btn-secondary btn-sm">
                  Full Details
                </Link>

                <button onClick={() => setSelectedInvoiceId(b._id)} className="btn btn-secondary btn-sm">
                  <FileText size={14} /> Tax Invoice
                </button>

                {b.status === 'COMPLETED' && (
                  <button onClick={() => setSelectedReviewId(b._id)} className="btn btn-primary btn-sm">
                    <Star size={14} /> Rate & Review
                  </button>
                )}

                {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(b._id)} className="btn btn-danger btn-sm">
                    <XCircle size={14} /> Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInvoiceId && (
        <InvoiceModal bookingId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}
      {selectedReviewId && (
        <ReviewModal bookingId={selectedReviewId} onClose={() => setSelectedReviewId(null)} onSuccess={fetchBookings} />
      )}
    </div>
  );
};

export default MyBookings;
