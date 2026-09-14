import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { Car, Calendar, CheckCircle2, Clock, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import InvoiceModal from '../components/booking/InvoiceModal';
import ReviewModal from '../components/booking/ReviewModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/bookings/my')
      ]);
      setVehicles(vRes.data.data || []);
      setBookings(bRes.data.data || []);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeBookings = bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

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
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track active maintenance, schedule bookings, and manage your garage
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/vehicles" className="btn btn-secondary">
            <Car size={16} /> My Vehicles
          </Link>
          <Link to="/book" className="btn btn-primary">
            <Plus size={16} /> Book Service
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Registered Vehicles</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Car size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem' }}>{vehicles.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for maintenance</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Bookings</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Clock size={20} color="var(--secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: activeBookings.length > 0 ? 'var(--secondary)' : 'inherit' }}>
            {activeBookings.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In pipeline / scheduled</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Completed Services</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <CheckCircle2 size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-emerald)' }}>
            {completedBookings.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical invoices available</div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Active Appointments */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Active Appointments</h3>
            <Link to="/my-bookings" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading appointments...</p>
          ) : activeBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No active bookings currently.</p>
              <Link to="/book" className="btn btn-primary btn-sm">Schedule Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeBookings.slice(0, 3).map((booking) => (
                <div key={booking._id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {booking.vehicleId ? `${booking.vehicleId.year} ${booking.vehicleId.make} ${booking.vehicleId.model}` : 'Vehicle'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>
                        {booking.vehicleId?.regNumber}
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Calendar size={14} /> {booking.date} | {booking.timeSlot}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Services: {booking.serviceIds?.map((s) => s.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Garage Preview */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>My Garage</h3>
            <Link to="/vehicles" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Manage Vehicles <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading garage...</p>
          ) : vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No vehicles registered yet.</p>
              <Link to="/vehicles" className="btn btn-secondary btn-sm">Add Vehicle</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vehicles.map((v) => (
                <div key={v._id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.year} {v.make} {v.model}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Reg: <strong style={{ color: 'var(--text-primary)' }}>{v.regNumber}</strong> • {v.fuelType}
                    </div>
                  </div>
                  <Link to={`/book?vehicleId=${v._id}`} className="btn btn-outline btn-sm">
                    Book Service
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedInvoiceId && (
        <InvoiceModal bookingId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />
      )}
      {selectedReviewId && (
        <ReviewModal bookingId={selectedReviewId} onClose={() => setSelectedReviewId(null)} onSuccess={fetchData} />
      )}
    </div>
  );
};

export default Dashboard;
