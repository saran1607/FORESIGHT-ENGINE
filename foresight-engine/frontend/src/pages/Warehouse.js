import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function Warehouse({ C, onLowStockUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [stockNote, setStockNote] = useState('');
  const [toast, setToast] = useState(null);
  const [newP, setNewP] = useState({
    name: '', category: '', currentStock: '',
    lowStockThreshold: 50, warehouseSection: 'A',
    unit: 'units', costPrice: '', sellingPrice: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/products`);
      setProducts(res.data);
      const low = res.data.filter(p => p.currentStock <= p.lowStockThreshold).length;
      onLowStockUpdate && onLowStockUpdate(low);
    } catch {
      showToast('Cannot connect to backend. Make sure server is running.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const addProduct = async () => {
    if (!newP.name.trim()) return showToast('Product name is required', 'error');
    try {
      await axios.post(`${API}/api/products`, {
        ...newP,
        currentStock: Number(newP.currentStock) || 0,
        costPrice: Number(newP.costPrice) || 0,
        sellingPrice: Number(newP.sellingPrice) || 0,
        lowStockThreshold: Number(newP.lowStockThreshold) || 50,
      });
      setShowAdd(false);
      setNewP({ name: '', category: '', currentStock: '', lowStockThreshold: 50, warehouseSection: 'A', unit: 'units', costPrice: '', sellingPrice: '' });
      showToast('Product added to warehouse!');
      fetchProducts();
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const updateStock = async () => {
    if (!stockQty || isNaN(stockQty) || Number(stockQty) <= 0)
      return showToast('Enter a valid quantity', 'error');
    try {
      await axios.patch(`${API}/api/products/${stockModal.product._id}/stock`, {
        type: stockModal.type, quantity: Number(stockQty), note: stockNote,
      });
      setStockModal(null); setStockQty(''); setStockNote('');
      showToast(`Stock ${stockModal.type === 'add' ? 'added' : 'removed'} successfully!`);
      fetchProducts();
    } catch (e) {
      showToast(e.response?.data?.error || 'Stock update failed', 'error');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product from warehouse?')) return;
    try {
      await axios.delete(`${API}/api/products/${id}`);
      showToast('Product deleted');
      fetchProducts();
    } catch { showToast('Delete failed', 'error'); }
  };

  // Derived stats
  const lowStock = products.filter(p => p.currentStock <= p.lowStockThreshold);
  const totalUnits = products.reduce((s, p) => s + p.currentStock, 0);
  const totalValue = products.reduce((s, p) => s + (p.currentStock * (p.sellingPrice || 0)), 0);
  const fmtVal = v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${Math.round(v)}`;

  // Shared styles
  const card = {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: '12px', padding: '20px',
  };
  const inputStyle = {
    width: '100%', background: C.pageBg,
    border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '9px 13px', color: C.textPrimary,
    fontSize: '13px', fontFamily: C.sans, outline: 'none',
  };

  return (
    <div style={{ maxWidth: '1060px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '28px', zIndex: 999,
          background: toast.type === 'error' ? C.orangeLight : C.violetFaint,
          border: `1px solid ${toast.type === 'error' ? C.orangeBorder : C.lavender}`,
          color: toast.type === 'error' ? C.orange : C.violet,
          borderRadius: '10px', padding: '12px 20px', fontSize: '13px', fontWeight: '500',
          boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>Warehouse</h1>
          <p style={{ color: C.textMuted, marginTop: '5px', fontSize: '13px', margin: '5px 0 0' }}>
            Stock levels · alerts · inventory control
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: C.violet, color: '#fff', border: 'none',
          borderRadius: '9px', padding: '10px 20px', fontSize: '13px',
          fontWeight: '500', cursor: 'pointer', fontFamily: C.sans,
        }}>
          + Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Products', value: products.length, color: C.violet, pct: 70 },
          { label: 'Units in Stock', value: totalUnits.toLocaleString(), color: C.green, pct: 85 },
          {
            label: 'Low Stock Items', value: lowStock.length,
            color: lowStock.length > 0 ? C.orange : C.green,
            pct: lowStock.length > 0 ? (lowStock.length / Math.max(products.length, 1)) * 100 : 0,
            warn: lowStock.length > 0,
          },
        ].map((s, i) => (
          <div key={i} style={{
            ...card,
            borderTop: `3px solid ${s.color}`,
            ...(s.warn ? { borderColor: C.orangeBorder, background: C.orangeLight } : {}),
          }}>
            <div style={{
              fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '8px', fontWeight: '500',
              color: s.warn ? C.orange : C.textFaint,
            }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '600', color: s.color }}>{s.value}</div>
            <div style={{ marginTop: '10px', height: '3px', background: s.warn ? '#fed7aa' : C.violetLight, borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '2px', opacity: 0.6 }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Value card */}
      <div style={{ ...card, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '9.5px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontWeight: '500' }}>Estimated Stock Value</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: C.violetDark, fontFamily: C.mono }}>{fmtVal(totalValue)}</div>
        </div>
        <div style={{ fontSize: '13px', color: C.textMuted }}>
          {products.length} products · {totalUnits.toLocaleString()} total units
        </div>
      </div>

      {/* Orange warning banner */}
      {lowStock.length > 0 && (
        <div style={{
          background: C.orangeLight,
          border: `1px solid ${C.orangeBorder}`,
          borderLeft: `4px solid ${C.orange}`,
          borderRadius: '10px', padding: '14px 18px',
          marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <span style={{ fontSize: '20px', marginTop: '1px' }}>⚡</span>
          <div>
            <div style={{ fontWeight: '600', color: C.orangeDark, fontSize: '14px' }}>
              Immediate action needed — {lowStock.length} product{lowStock.length > 1 ? 's' : ''} critically low
            </div>
            <div style={{ fontSize: '12px', color: C.orange, marginTop: '4px' }}>
              {lowStock.map(p => `${p.name}: ${p.currentStock} ${p.unit} (threshold ${p.lowStockThreshold})`).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.borderFaint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: C.textPrimary }}>Product Inventory</div>
          <div style={{ fontSize: '11px', color: C.textFaint }}>{products.length} items</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.textMuted }}>
            <div style={{ width: '36px', height: '36px', border: `2px solid ${C.violetLight}`, borderTop: `2px solid ${C.violet}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 14px' }}></div>
            Loading inventory...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px', color: C.textMuted }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>📦</div>
            <div style={{ fontWeight: '500', color: C.textPrimary, marginBottom: '6px' }}>No products yet</div>
            <div style={{ fontSize: '13px' }}>Click "Add Product" to get started</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderFaint}` }}>
                {['Product', 'Section', 'Stock', 'Alert at', 'Value', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '9px', color: C.textFaint,
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '500',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const isLow = p.currentStock <= p.lowStockThreshold;
                const pct = Math.min((p.currentStock / (p.lowStockThreshold * 2)) * 100, 100);
                return (
                  <tr key={p._id}
                    style={{ borderBottom: `1px solid ${C.borderFaint}`, background: isLow ? '#fffbf7' : 'transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => !isLow && (e.currentTarget.style.background = C.pageBg)}
                    onMouseLeave={e => !isLow && (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: '500', color: isLow ? C.orangeDark : C.textPrimary }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: isLow ? C.orangeMid : C.textFaint, marginTop: '2px' }}>{p.category || '—'}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: C.mono, color: C.textSecondary, fontSize: '12px' }}>{p.warehouseSection}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontFamily: C.mono, fontWeight: '600', color: isLow ? C.orange : C.textPrimary, fontSize: '13px' }}>
                        {p.currentStock.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: '400', color: C.textFaint }}>{p.unit}</span>
                      </div>
                      <div style={{ marginTop: '5px', height: '3px', background: isLow ? C.orangeBorder : C.violetLight, borderRadius: '2px', width: '70px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: isLow ? C.orange : C.violet, borderRadius: '2px', opacity: 0.7 }}></div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: C.mono, color: C.textSecondary, fontSize: '12px' }}>{p.lowStockThreshold}</td>
                    <td style={{ padding: '13px 16px', fontFamily: C.mono, color: C.textSecondary, fontSize: '12px' }}>
                      {p.sellingPrice ? `₹${(p.currentStock * p.sellingPrice).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {isLow ? (
                        <span style={{ background: C.orangeLight, color: C.orange, border: `1px solid ${C.orangeBorder}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>⚠ Low</span>
                      ) : (
                        <span style={{ background: C.violetFaint, color: C.violet, border: `1px solid ${C.lavender}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>✓ OK</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { label: '+ Add', type: 'add', color: C.green, bg: C.greenLight },
                          { label: '− Remove', type: 'remove', color: C.orange, bg: C.orangeLight },
                        ].map(b => (
                          <button key={b.type} onClick={() => setStockModal({ product: p, type: b.type })} style={{
                            background: b.bg, color: b.color,
                            border: `1px solid ${b.type === 'add' ? C.greenBorder : C.orangeBorder}`,
                            borderRadius: '6px', padding: '4px 10px', fontSize: '11px',
                            cursor: 'pointer', fontFamily: C.sans, fontWeight: '500',
                          }}>{b.label}</button>
                        ))}
                        <button onClick={() => deleteProduct(p._id)} style={{
                          background: 'transparent', color: C.textFaint,
                          border: `1px solid ${C.border}`, borderRadius: '6px',
                          padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontFamily: C.sans,
                        }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(76,29,149,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: C.white, borderRadius: '16px', padding: '28px', width: '520px', border: `1px solid ${C.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '17px', fontWeight: '600', color: C.textPrimary, marginBottom: '6px' }}>Add New Product</div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '24px' }}>Fill in the warehouse details for this product</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Product Name *', key: 'name' },
                { label: 'Category', key: 'category', ph: 'e.g. Fruits' },
                { label: 'Current Stock', key: 'currentStock', type: 'number' },
                { label: 'Low Stock Alert At', key: 'lowStockThreshold', type: 'number' },
                { label: 'Warehouse Section', key: 'warehouseSection', ph: 'A / B / C' },
                { label: 'Unit', key: 'unit', ph: 'units / kg / boxes' },
                { label: 'Cost Price (₹)', key: 'costPrice', type: 'number' },
                { label: 'Selling Price (₹)', key: 'sellingPrice', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: '11px', color: C.textFaint, marginBottom: '5px', fontWeight: '500' }}>{f.label}</div>
                  <input style={inputStyle} type={f.type || 'text'} placeholder={f.ph || ''}
                    value={newP[f.key]} onChange={e => setNewP({ ...newP, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={addProduct} style={{ flex: 1, background: C.violet, color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: C.sans }}>
                Save Product
              </button>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'transparent', color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '12px', fontSize: '13px', cursor: 'pointer', fontFamily: C.sans }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(76,29,149,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: C.white, borderRadius: '16px', padding: '28px', width: '380px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '17px', fontWeight: '600', color: C.textPrimary, marginBottom: '4px' }}>
              {stockModal.type === 'add' ? '📥 Add Stock' : '📤 Remove Stock'}
            </div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '22px' }}>
              <strong style={{ color: C.textPrimary }}>{stockModal.product.name}</strong> · Current stock: {stockModal.product.currentStock} {stockModal.product.unit}
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: C.textFaint, marginBottom: '5px', fontWeight: '500' }}>Quantity *</div>
              <input style={inputStyle} type="number" placeholder="Enter quantity" value={stockQty} onChange={e => setStockQty(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', color: C.textFaint, marginBottom: '5px', fontWeight: '500' }}>Note (optional)</div>
              <input style={inputStyle} placeholder="e.g. Received from supplier" value={stockNote} onChange={e => setStockNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={updateStock} style={{
                flex: 1, border: 'none', borderRadius: '9px', padding: '12px',
                fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: C.sans,
                background: stockModal.type === 'add' ? C.green : C.orange, color: '#fff',
              }}>
                Confirm {stockModal.type === 'add' ? 'Add' : 'Remove'}
              </button>
              <button onClick={() => { setStockModal(null); setStockQty(''); setStockNote(''); }} style={{
                flex: 1, background: 'transparent', color: C.textSecondary,
                border: `1px solid ${C.border}`, borderRadius: '9px', padding: '12px',
                fontSize: '13px', cursor: 'pointer', fontFamily: C.sans,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
