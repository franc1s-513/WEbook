import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Car, Wrench, Shield, CheckCircle2, ArrowLeft, FileText, Star } from 'lucide-react';
import InvoiceModal from '../components/booking/InvoiceModal';
import ReviewModal from '../components/booking/ReviewModal';

const BookingDetail = () => {
  const { id } = useParams();
  const { showToast } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Booking Not Found</h3>
        <Link to="/my-bookings" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Bookings</Link>
      </div>
    );
  }

  // Status timeline steps
  const steps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
  const currentStepIdx = steps.indexOf(booking.status);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/my-bookings" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to My Bookings
        </Link>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking #{booking._id.toUpperCase()}</span>
            <h1 style={{ fontSize: '1.6rem', marginTop: '4px' }}>
              {booking.vehicleId?.year} {booking.vehicleId?.make} {booking.vehicleId?.model}
            </h1>
            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Reg: {booking.vehicleId?.regNumber}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={() => setInvoiceModalOpen(true)} className="btn btn-secondary btn-sm">
              <FileText size={16} /> View Invoice
            </button>
            {booking.status === 'COMPLETED' && (
              <button onClick={() => setReviewModalOpen(true)} className="btn btn-primary btn-sm">
                <Star size={16} /> Rate Service
              </button>
            )}
          </div>
        </div>

        {/* Status Pipeline Visualizer */}
        {booking.status !== 'CANCELLED' ? (
          <div style={{ margin: '1.5rem 0 2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = booking.status === st;

                return (
                  <div key={st} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      margin: '0 auto 0.5rem',
                      background: isPassed ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                      color: isPassed ? '#030712' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 15px var(--primary-glow)' : 'none'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 500 }}>
                      {st.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: 'var(--accent-rose)', marginBottom: '1.5rem', textAlign: 'center' }}>
            This appointment was cancelled.
          </div>
        )}

        {/* Booking Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Appointment Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
              <div><strong>Date:</strong> {booking.date}</div>
              <div><strong>Slot:</strong> {booking.timeSlot}</div>
              <div><strong>Center:</strong> {booking.branchId?.name}</div>
              <div><strong>Address:</strong> {booking.branchId?.address}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Assigned Mechanic</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
              <div><strong>Technician:</strong> {booking.mechanicId ? booking.mechanicId.name : 'Pending assignment'}</div>
              <div><strong>Contact:</strong> {booking.mechanicId ? booking.mechanicId.phone : 'WEbook Central Dispatch'}</div>
              <div><strong>Payment:</strong> {booking.paymentStatus.toUpperCase()} ({booking.paymentMethod})</div>
            </div>
          </div>
        </div>

        {/* Services & Technician Notes */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Service Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {booking.serviceIds?.map((s) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span>{s.name} ({s.category})</span>
                <span style={{ fontWeight: 600 }}>${s.price}</span>
              </div>
            ))}
          </div>

          {booking.partsUsed && booking.partsUsed.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.4rem' }}>
                Replacement Parts Fitted:
              </div>
              {booking.partsUsed.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>{p.partName}</span>
                  <span>${p.cost}</span>
                </div>
              ))}
            </div>
          )}

          {booking.mechanicNotes && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                Technician Diagnostic Notes:
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {booking.mechanicNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {invoiceModalOpen && (
        <InvoiceModal bookingId={booking._id} onClose={() => setInvoiceModalOpen(false)} />
      )}
      {reviewModalOpen && (
        <ReviewModal bookingId={booking._id} onClose={() => setReviewModalOpen(false)} onSuccess={fetchDetail} />
      )}
    </div>
  );
};

export default BookingDetail;
