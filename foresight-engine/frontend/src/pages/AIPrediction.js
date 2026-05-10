import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5000';
const fmt = v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${Math.round(v)}`;

const CustomTooltip = ({ active, payload, label, C }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid #ede9fe`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: "'DM Mono', monospace" }}>
      <div style={{ color: '#6b7280', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: '500' }}>{p.name}: {p.name === 'Revenue' ? fmt(p.value) : p.value.toLocaleString()}</div>
      ))}
    </div>
  );
};

export default function AIPrediction({ C }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = f => {
    if (f?.name?.endsWith('.csv')) { setFile(f); setError(''); }
    else setError('Please upload a .csv file only.');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    const form = new FormData();
    form.append('csv', file);
    try {
      const res = await axios.post(`${API}/api/predict`, form);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Check your CSV format and make sure backend is running.');
    }
    setLoading(false);
  };

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '22px' };

  const StatCard = ({ label, value, sub, color, mono }) => (
    <div style={{ ...card, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '9.5px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '600', color, fontFamily: mono ? C.mono : C.sans }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '5px' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: '1060px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>AI Prediction</h1>
        <p style={{ color: C.textMuted, marginTop: '5px', fontSize: '13px', margin: '5px 0 0' }}>
          Random Forest + Linear Regression · next month revenue forecast
        </p>
      </div>

      {!result && !loading && (
        <div style={{ maxWidth: '560px' }}>
          <div style={card}>
            <div style={{ fontSize: '13px', color: C.textFaint, marginBottom: '20px', fontFamily: C.mono, background: C.pageBg, padding: '10px 14px', borderRadius: '8px' }}>
              CSV columns needed: Date · Product · Quantity · Revenue
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('csvIn').click()}
              style={{
                border: `2px dashed ${dragging ? C.violet : C.lavender}`,
                borderRadius: '10px', padding: '48px 24px',
                cursor: 'pointer', textAlign: 'center',
                background: dragging ? C.violetFaint : C.pageBg,
                transition: 'all 0.2s', marginBottom: '18px',
              }}
            >
              <input id="csvIn" type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
              <div style={{ color: file ? C.violet : C.textSecondary, fontWeight: file ? '500' : '400', fontSize: '14px' }}>
                {file ? `✅  ${file.name}` : 'Drag & drop your CSV here'}
              </div>
              <div style={{ fontSize: '12px', color: C.textFaint, marginTop: '4px' }}>
                {file ? 'Click to change file' : 'or click to browse'}
              </div>
            </div>

            {error && (
              <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderLeft: `3px solid ${C.orange}`, borderRadius: '8px', padding: '11px 14px', color: C.orangeDark, fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!file} style={{
              width: '100%', background: file ? C.violet : C.violetLight,
              color: file ? '#fff' : C.lavender, border: 'none', borderRadius: '9px',
              padding: '13px', fontSize: '14px', fontWeight: '500',
              cursor: file ? 'pointer' : 'not-allowed', fontFamily: C.sans, transition: 'all 0.15s',
            }}>
              🔮 Run AI Prediction
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ width: '42px', height: '42px', border: `3px solid ${C.violetLight}`, borderTop: `3px solid ${C.violet}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <div style={{ color: C.textPrimary, fontWeight: '500', marginBottom: '6px' }}>Training AI model on your data...</div>
          <div style={{ color: C.textMuted, fontSize: '12px', fontFamily: C.mono }}>Random Forest + Linear Regression running</div>
        </div>
      )}

      {result && (
        <div>
          {/* Critical demand warning */}
          {result.predictedDemandWarning && (
            <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderLeft: `4px solid ${C.orange}`, borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div>
                <div style={{ fontWeight: '600', color: C.orangeDark, fontSize: '14px' }}>Critical: Predicted demand exceeds total warehouse stock</div>
                <div style={{ fontSize: '12px', color: C.orange, marginTop: '3px' }}>AI predicts {result.predicted_qty?.toLocaleString()} units needed — check your warehouse and restock immediately</div>
              </div>
            </div>
          )}

          {/* Low stock warnings from warehouse */}
          {result.warehouseWarnings?.length > 0 && (
            <div style={{ background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderLeft: `4px solid ${C.orange}`, borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div>
                <div style={{ fontWeight: '600', color: C.orangeDark, fontSize: '14px' }}>Warehouse low stock alert — AI cross-reference</div>
                <div style={{ fontSize: '12px', color: C.orange, marginTop: '3px' }}>{result.warehouseWarnings.map(w => `${w.name}: ${w.stock} units`).join(' · ')}</div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
            <StatCard label="RF Predicted Revenue" value={fmt(result.predicted_revenue_rf)} sub={`Next month: ${result.next_month}`} color={C.violet} mono />
            <StatCard label="LR Cross-Check" value={fmt(result.predicted_revenue_lr)} sub="Linear Regression" color={C.violetMid} mono />
            <StatCard label="Units to Prepare" value={result.predicted_qty?.toLocaleString()} sub="inventory needed" color={C.green} mono />
            <StatCard label="AI Confidence" value={`${result.confidence}%`} sub={`R² ${result.r2_score}`} color={result.confidence > 70 ? C.green : C.orange} />
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary, marginBottom: '18px' }}>Monthly Revenue Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderFaint} />
                  <XAxis dataKey="label" tick={{ fill: C.textFaint, fontSize: 10 }} />
                  <YAxis tickFormatter={fmt} tick={{ fill: C.textFaint, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip C={C} />} />
                  <Line type="monotone" dataKey="total_revenue" stroke={C.violet} strokeWidth={2} dot={{ fill: C.violet, r: 3 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={card}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary, marginBottom: '18px' }}>Units Sold Per Month</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderFaint} />
                  <XAxis dataKey="label" tick={{ fill: C.textFaint, fontSize: 10 }} />
                  <YAxis tick={{ fill: C.textFaint, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip C={C} />} />
                  <Bar dataKey="total_qty" fill={C.lavender} radius={[4, 4, 0, 0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            {[
              { title: '🔥 Fast-Selling Products', data: result.top_products, color: C.green, bg: C.greenLight, border: C.greenBorder },
              { title: '🐢 Slow-Moving Products', data: result.slow_products, color: C.orange, bg: C.orangeLight, border: C.orangeBorder },
            ].map((section, si) => (
              <div key={si} style={card}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: section.color, marginBottom: '16px' }}>{section.title}</div>
                {section.data?.map((p, i) => {
                  const name = p[result.product_col] || Object.values(p)[0];
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.borderFaint}`, fontSize: '13px' }}>
                      <span style={{ color: C.textPrimary, fontWeight: '500' }}>{name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: C.textFaint, fontFamily: C.mono, fontSize: '11px' }}>{(p.total_qty || 0).toLocaleString()} units</span>
                        <span style={{ background: section.bg, color: section.color, border: `1px solid ${section.border}`, padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                          {fmt(p.total_revenue || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div style={{ ...card, borderLeft: `4px solid ${C.violet}` }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: C.violet, marginBottom: '12px' }}>🤖 AI Summary for {result.next_month}</div>
            <p style={{ color: C.textSecondary, lineHeight: 1.8, fontSize: '13px', margin: 0 }}>
              Trained on <strong style={{ color: C.textPrimary }}>{result.total_months} months</strong> of sales data.
              Random Forest predicts <strong style={{ color: C.violet }}>{fmt(result.predicted_revenue_rf)}</strong> revenue for {result.next_month},
              cross-validated by Linear Regression at <strong style={{ color: C.violetMid }}>{fmt(result.predicted_revenue_lr)}</strong>.
              Prepare approximately <strong style={{ color: result.confidence > 70 ? C.green : C.orange }}>{result.predicted_qty?.toLocaleString()} units</strong> of inventory.
              Model R² score: <strong style={{ color: C.textPrimary, fontFamily: C.mono }}>{result.r2_score}</strong> with{' '}
              <strong style={{ color: result.confidence > 70 ? C.green : C.orange }}>{result.confidence}% confidence</strong>.
            </p>
          </div>

          <button onClick={() => { setResult(null); setFile(null); }} style={{
            background: 'transparent', border: `1px solid ${C.border}`, color: C.textMuted,
            borderRadius: '8px', padding: '9px 20px', cursor: 'pointer',
            fontSize: '12px', fontFamily: C.sans, marginTop: '20px',
          }}>← Upload New CSV</button>
        </div>
      )}
    </div>
  );
}
