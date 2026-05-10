import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function StockLog({ C }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/api/transactions`)
      .then(r => setTxns(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' };

  const formatDate = d => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + '  ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const added = txns.filter(t => t.type === 'add').reduce((s, t) => s + t.quantity, 0);
  const removed = txns.filter(t => t.type === 'remove').reduce((s, t) => s + t.quantity, 0);
  const filtered = filter === 'all' ? txns : txns.filter(t => t.type === filter);

  return (
    <div style={{ maxWidth: '1060px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>Stock Log</h1>
        <p style={{ color: C.textMuted, marginTop: '5px', fontSize: '13px', margin: '5px 0 0' }}>
          Full history of all stock additions and removals
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Transactions', value: txns.length, color: C.violet },
          { label: 'Units Added', value: added.toLocaleString(), color: C.green },
          { label: 'Units Removed', value: removed.toLocaleString(), color: C.orange },
        ].map((s, i) => (
          <div key={i} style={{ ...card, borderTop: `3px solid ${s.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: '9.5px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: '500' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: s.color, fontFamily: C.mono }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'add', 'remove'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
            cursor: 'pointer', fontFamily: C.sans, border: 'none', transition: 'all 0.15s',
            background: filter === f ? C.violet : C.white,
            color: filter === f ? '#fff' : C.textSecondary,
            boxShadow: filter === f ? 'none' : `inset 0 0 0 1px ${C.border}`,
          }}>
            {f === 'all' ? 'All' : f === 'add' ? '📥 Added' : '📤 Removed'}
            <span style={{
              marginLeft: '6px', fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
              background: filter === f ? 'rgba(255,255,255,0.2)' : C.violetFaint,
              color: filter === f ? '#fff' : C.violet,
            }}>
              {f === 'all' ? txns.length : txns.filter(t => t.type === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.textMuted }}>
            <div style={{ width: '36px', height: '36px', border: `2px solid ${C.violetLight}`, borderTop: `2px solid ${C.violet}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }}></div>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px', color: C.textMuted }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>📭</div>
            <div style={{ fontWeight: '500', color: C.textPrimary, marginBottom: '6px' }}>No transactions yet</div>
            <div style={{ fontSize: '13px' }}>Add or remove stock from the Warehouse page to see activity here</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderFaint}` }}>
                {['Type', 'Product', 'Quantity', 'Note', 'Date & Time'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '9px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id}
                  style={{ borderBottom: `1px solid ${C.borderFaint}`, background: t.type === 'remove' ? '#fffbf7' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = t.type === 'remove' ? '#fff7ed' : C.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = t.type === 'remove' ? '#fffbf7' : 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                      background: t.type === 'add' ? C.greenLight : C.orangeLight,
                      color: t.type === 'add' ? C.green : C.orange,
                      border: `1px solid ${t.type === 'add' ? C.greenBorder : C.orangeBorder}`,
                    }}>
                      {t.type === 'add' ? '📥 Added' : '📤 Removed'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: C.textPrimary }}>{t.product}</td>
                  <td style={{ padding: '12px 16px', fontFamily: C.mono, fontWeight: '600', color: t.type === 'add' ? C.green : C.orange }}>
                    {t.type === 'add' ? '+' : '−'}{t.quantity}
                  </td>
                  <td style={{ padding: '12px 16px', color: C.textSecondary }}>{t.note || '—'}</td>
                  <td style={{ padding: '12px 16px', color: C.textFaint, fontFamily: C.mono, fontSize: '11px' }}>{formatDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
