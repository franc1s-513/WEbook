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
      background: 'rgba(6, 11, 9, 0.9)',
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
            background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)',
            border: '1.5px solid var(--royal-gold)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--royal-gold-glow)'
          }}>
            <Wrench size={20} color="var(--royal-gold)" />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
              WE<span className="gradient-text">book</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--royal-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Vehicle Service Portal
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          <Link to="/" style={{
            color: isActive('/') ? 'var(--royal-gold)' : 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '0.9rem',
            borderBottom: isActive('/') ? '2px solid var(--royal-gold)' : '2px solid transparent',
            paddingBottom: '2px',
            transition: 'color 0.2s'
          }}>
            Home
          </Link>

          {/* Customer Specific Links */}
          {user && user.role === 'customer' && (
            <>
              <Link to="/dashboard" style={{
                color: isActive('/dashboard') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/dashboard') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Dashboard
              </Link>
              <Link to="/vehicles" style={{
                color: isActive('/vehicles') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/vehicles') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                My Vehicles
              </Link>
              <Link to="/book" style={{
                color: isActive('/book') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/book') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Book Service
              </Link>
              <Link to="/my-bookings" style={{
                color: isActive('/my-bookings') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/my-bookings') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                My Bookings
              </Link>
            </>
          )}

          {/* Admin Specific Links */}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={{
                color: isActive('/admin/dashboard') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/admin/dashboard') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Admin Dashboard
              </Link>
              <Link to="/admin/bookings" style={{
                color: isActive('/admin/bookings') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/admin/bookings') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Manage Bookings
              </Link>
              <Link to="/admin/services" style={{
                color: isActive('/admin/services') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/admin/services') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Service Catalog
              </Link>
              <Link to="/admin/reports" style={{
                color: isActive('/admin/reports') ? 'var(--royal-gold)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.9rem',
                borderBottom: isActive('/admin/reports') ? '2px solid var(--royal-gold)' : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                Reports
              </Link>
            </>
          )}

          {/* Mechanic Specific Links */}
          {user && user.role === 'mechanic' && (
            <Link to="/mechanic/jobs" style={{
              color: isActive('/mechanic/jobs') ? 'var(--royal-gold)' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.9rem',
              borderBottom: isActive('/mechanic/jobs') ? '2px solid var(--royal-gold)' : '2px solid transparent',
              paddingBottom: '2px'
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
                background: 'rgba(212, 175, 55, 0.08)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--royal-gold)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'var(--royal-gold)',
                  border: '1px solid var(--royal-gold)',
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
                  <span style={{ fontSize: '0.65rem', color: 'var(--royal-gold)', textTransform: 'capitalize' }}>
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
          background: '#091711',
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
