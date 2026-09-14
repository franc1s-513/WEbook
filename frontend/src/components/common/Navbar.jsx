import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Calendar, Car, Shield, LogOut, User, Menu, X, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(7, 10, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)'
          }}>
            <Wrench size={20} color="#030712" />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
              WE<span className="gradient-text">book</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Vehicle Service Portal
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          <Link to="/" style={{
            color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}>
            Home
          </Link>

          {/* Customer Specific Links */}
          {user && user.role === 'customer' && (
            <>
              <Link to="/dashboard" style={{
                color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Dashboard
              </Link>
              <Link to="/vehicles" style={{
                color: isActive('/vehicles') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                My Vehicles
              </Link>
              <Link to="/book" style={{
                color: isActive('/book') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Book Service
              </Link>
              <Link to="/my-bookings" style={{
                color: isActive('/my-bookings') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                My Bookings
              </Link>
            </>
          )}

          {/* Admin Specific Links */}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={{
                color: isActive('/admin/dashboard') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Admin Dashboard
              </Link>
              <Link to="/admin/bookings" style={{
                color: isActive('/admin/bookings') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Manage Bookings
              </Link>
              <Link to="/admin/services" style={{
                color: isActive('/admin/services') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Service Catalog
              </Link>
              <Link to="/admin/reports" style={{
                color: isActive('/admin/reports') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}>
                Reports
              </Link>
            </>
          )}

          {/* Mechanic Specific Links */}
          {user && user.role === 'mechanic' && (
            <Link to="/mechanic/jobs" style={{
              color: isActive('/mechanic/jobs') ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              Mechanic Jobs
            </Link>
          )}
        </div>

        {/* User Status / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.04)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? 'rgba(244, 63, 94, 0.2)' :
                              user.role === 'mechanic' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                  color: user.role === 'admin' ? 'var(--accent-rose)' :
                         user.role === 'mechanic' ? 'var(--accent-amber)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', lineHeight: 1.1 }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', color: 'var(--text-primary)', padding: '0.4rem' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1rem 1.5rem 1.5rem',
          background: '#0a0f1d',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {user?.role === 'customer' && (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/vehicles" onClick={() => setMobileMenuOpen(false)}>My Vehicles</Link>
              <Link to="/book" onClick={() => setMobileMenuOpen(false)}>Book Service</Link>
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
              <Link to="/admin/bookings" onClick={() => setMobileMenuOpen(false)}>Manage Bookings</Link>
              <Link to="/admin/services" onClick={() => setMobileMenuOpen(false)}>Service Catalog</Link>
              <Link to="/admin/reports" onClick={() => setMobileMenuOpen(false)}>Reports</Link>
            </>
          )}
          {user?.role === 'mechanic' && (
            <Link to="/mechanic/jobs" onClick={() => setMobileMenuOpen(false)}>Mechanic Jobs</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
