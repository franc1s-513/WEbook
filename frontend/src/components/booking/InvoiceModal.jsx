import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

const InvoiceModal = ({ bookingId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/payments/${bookingId}/invoice`);
        setInvoice(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchInvoice();
    }
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (!bookingId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem' }}>Service Tax Invoice</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Generating official invoice...
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        ) : invoice ? (
          <div id="printable-invoice">
            {/* Invoice Top Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice No:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{invoice.invoiceNumber}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Date: {new Date(invoice.issueDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Status:</span>
                <div>
                  <span className={`badge ${invoice.payment.status === 'paid' ? 'badge-completed' : 'badge-pending'}`}>
                    {invoice.payment.status} ({invoice.payment.method})
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Txn ID: {invoice.payment.transactionId}
                </div>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Billed To:</h4>
                <div style={{ fontWeight: 600 }}>{invoice.customer.name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{invoice.customer.email}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{invoice.customer.phone || 'Phone: N/A'}</div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Vehicle Information:</h4>
                <div style={{ fontWeight: 600 }}>{invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 500 }}>Reg: {invoice.vehicle.regNumber}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Fuel: {invoice.vehicle.fuelType}</div>
              </div>
            </div>

            {/* Service Center & Technician */}
            <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location: </span>
              <strong>{invoice.branch.name}</strong> — {invoice.branch.address}
              <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Technician: </span>
              <strong>{invoice.mechanic}</strong>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Item Description</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Category</th>
                  <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 0.4rem', fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: '0.75rem 0.4rem', color: 'var(--text-muted)' }}>{item.category}</td>
                    <td style={{ padding: '0.75rem 0.4rem', textAlign: 'right', fontWeight: 600 }}>
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pricing Summary Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', fontSize: '0.9rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                <span>${invoice.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tax (8% GST/VAT):</span>
                <span>${invoice.pricing.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span>Total Due:</span>
                <span>${invoice.pricing.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceModal;
