import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Wrench, Shield, Calendar, Clock, Star, ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, revRes, brRes] = await Promise.allSettled([
          api.get('/services?activeOnly=true'),
          api.get('/reviews'),
          api.get('/admin/branches')
        ]);

        if (svcRes.status === 'fulfilled') setServices(svcRes.value.data.data || []);
        if (revRes.status === 'fulfilled') setReviews(revRes.value.data.data || []);
        if (brRes.status === 'fulfilled') setBranches(brRes.value.data.data || []);
      } catch (err) {
        console.error('Home load error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
        position: 'relative',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(5, 150, 105, 0.15)',
          border: '1px solid var(--royal-gold)',
          color: 'var(--royal-gold)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} /> Premium Intelligent Auto Care
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4rem)',
          lineHeight: 1.15,
          marginBottom: '1.5rem',
          fontWeight: 800
        }}>
          Precision Vehicle Servicing, <br />
          <span className="gradient-text">Zero Compromises</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Book verified scheduled maintenance, computerized diagnostics, and brake overhauls with certified master mechanics. Real-time slot reservations, upfront fixed pricing, and digital health history.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/book" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Book a Service Now <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            Customer Portal
          </Link>
        </div>

        {/* Metric Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '4rem'
        }}>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>10,000+</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Vehicles Serviced</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>4.9 / 5.0</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Verified Customer Rating</div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>100% OEM</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Genuine Parts Guarantee</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How WEbook Works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Frictionless vehicle servicing in four simple steps</p>
        </div>

        <div className="grid-4">
          <div className="glass-card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(212, 175, 55, 0.25)', position: 'absolute', top: '10px', right: '15px' }}>01</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--royal-gold)' }}>Add Vehicle</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Save your car details once (make, model, year, license plate) for fast repeat bookings.
            </p>
          </div>

          <div className="glass-card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(5, 150, 105, 0.3)', position: 'absolute', top: '10px', right: '15px' }}>02</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--primary-light)' }}>Choose Services</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Select from oil flushes, laser alignment, AC overhauls, or comprehensive checks with transparent pricing.
            </p>
          </div>

          <div className="glass-card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(245, 158, 11, 0.2)', position: 'absolute', top: '10px', right: '15px' }}>03</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--accent-amber)' }}>Reserve Slot</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Select your convenient date and guaranteed capacity time slot at the nearest service branch.
            </p>
          </div>

          <div className="glass-card" style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'rgba(16, 185, 129, 0.2)', position: 'absolute', top: '10px', right: '15px' }}>04</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>Track & Pay</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Follow live progress updates from your assigned technician and download official itemized invoices.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Service Packages */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Popular Service Catalog</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Transparent pricing with zero hidden add-ons</p>
          </div>
          <Link to="/book" className="btn btn-outline btn-sm">
            View All & Book
          </Link>
        </div>

        <div className="grid-3">
          {services.slice(0, 6).map((svc) => (
            <div key={svc._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className="badge badge-confirmed">{svc.category}</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--royal-gold)' }}>
                  ${svc.price}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{svc.name}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1 }}>
                {svc.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} /> {svc.durationMinutes} mins
                </div>
                <Link to="/book" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Book <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>What Drivers Say</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Real feedback from verified completed services</p>
          </div>

          <div className="grid-3">
            {reviews.map((rev) => (
              <div key={rev._id} className="glass-card">
                <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.75rem' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  "{rev.comment}"
                </p>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {rev.userId?.name || 'Verified Customer'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
