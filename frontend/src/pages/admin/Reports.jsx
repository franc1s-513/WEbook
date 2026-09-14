import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { DollarSign, Calendar, TrendingUp, Award, BarChart3 } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data.data);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Calculating analytics and trends...</div>;
  }

  const maxServiceCount = reports?.popularServices?.[0]?.count || 1;

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>
          Revenue & Service <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Historical business metrics, capacity distribution, and demand forecasting
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Gross Revenue</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <DollarSign size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-emerald)' }}>
            ${reports?.totalRevenue || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From completed invoices and advance payments</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Completed Services</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <Award size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary)' }}>
            {reports?.statusCounts?.COMPLETED || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Successfully inspected & delivered</div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fulfillment Ratio</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={20} color="var(--secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--secondary)' }}>
            {reports?.totalBookings ? Math.round(((reports.statusCounts.COMPLETED || 0) / reports.totalBookings) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completion rate across all bookings</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Most Popular Services */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Popular Service Packages</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {reports?.popularServices?.map((item, idx) => {
              const pct = Math.round((item.count / maxServiceCount) * 100);
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.count} bookings</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Pipeline Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(reports?.statusCounts || {}).map(([st, count]) => (
              <div key={st} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{st.replace('_', ' ')}</span>
                <span className={`badge ${
                  st === 'COMPLETED' ? 'badge-completed' :
                  st === 'CONFIRMED' ? 'badge-confirmed' :
                  st === 'IN_PROGRESS' ? 'badge-progress' :
                  st === 'CANCELLED' ? 'badge-cancelled' : 'badge-pending'
                }`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
