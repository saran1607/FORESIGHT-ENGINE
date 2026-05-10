import React, { useState } from 'react';
import Warehouse from './pages/Warehouse';
import AIPrediction from './pages/AIPrediction';
import StockLog from './pages/StockLog';

export const C = {
  // Backgrounds
  pageBg: '#faf5ff',
  white: '#ffffff',
  surfaceLight: '#f5f3ff',

  // Violet (brand)
  violet: '#7c3aed',
  violetDark: '#4c1d95',
  violetMid: '#6d28d9',
  violetLight: '#ede9fe',
  violetFaint: '#f5f3ff',
  lavender: '#c4b5fd',
  lavenderFaint: '#ddd6fe',

  // Orange (warnings/alerts)
  orange: '#ea580c',
  orangeLight: '#fff7ed',
  orangeBorder: '#fed7aa',
  orangeMid: '#f97316',
  orangeDark: '#9a3412',

  // Status
  green: '#059669',
  greenLight: '#ecfdf5',
  greenBorder: '#6ee7b7',

  // Text
  textPrimary: '#1a1a2e',
  textSecondary: '#6b7280',
  textMuted: '#a78bfa',
  textFaint: '#c4b5fd',

  // Borders
  border: '#ede9fe',
  borderFaint: '#f5f3ff',

  // Fonts
  sans: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="9" fill={C.violetFaint}/>
    <ellipse cx="18" cy="18" rx="8" ry="5.5" stroke={C.violet} strokeWidth="1.5" fill="none"/>
    <circle cx="18" cy="18" r="2.4" fill={C.violet}/>
    <path d="M5 18 Q8 12 12 18" stroke={C.lavender} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M31 18 Q28 12 24 18" stroke={C.lavender} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M2 18 Q6 8 12 18" stroke={C.lavenderFaint} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M34 18 Q30 8 24 18" stroke={C.lavenderFaint} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

export default function App() {
  const [page, setPage] = useState('warehouse');
  const [lowStockCount, setLowStockCount] = useState(0);

  const navItems = [
    { id: 'warehouse', label: 'Warehouse', icon: '🏭' },
    { id: 'ai', label: 'AI Prediction', icon: '🔮' },
    { id: 'log', label: 'Stock Log', icon: '📋' },
  ];

  return (
    <div style={{ fontFamily: C.sans, background: C.pageBg, minHeight: '100vh', display: 'flex' }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.pageBg}; }
        ::-webkit-scrollbar-thumb { background: ${C.violetLight}; border-radius: 4px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '210px', flexShrink: 0,
        background: C.white,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <Logo />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: C.textPrimary, letterSpacing: '0.07em', lineHeight: 1.3 }}>
                FORESIGHT<br />ENGINE
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '18px 12px', flex: 1 }}>
          <div style={{ fontSize: '9px', color: C.lavender, textTransform: 'uppercase', letterSpacing: '0.14em', padding: '0 8px', marginBottom: '10px', fontWeight: '500' }}>
            Navigation
          </div>
          {navItems.map(item => {
            const isActive = page === item.id;
            const showBadge = item.id === 'warehouse' && lowStockCount > 0;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 10px', border: 'none',
                borderRadius: '9px', cursor: 'pointer', fontFamily: C.sans,
                fontSize: '13px', fontWeight: isActive ? '500' : '400',
                marginBottom: '3px', transition: 'all 0.15s',
                background: isActive ? C.violetFaint : 'transparent',
                color: isActive ? C.violet : C.textSecondary,
                borderLeft: isActive ? `2.5px solid ${C.violet}` : '2.5px solid transparent',
                textAlign: 'left',
              }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {showBadge && (
                  <span style={{
                    background: C.orangeLight, color: C.orange,
                    border: `1px solid ${C.orangeBorder}`,
                    fontSize: '9px', padding: '1px 7px', borderRadius: '10px', fontWeight: '600',
                  }}>{lowStockCount} low</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: C.violetFaint, border: `1px solid ${C.lavender}`,
            borderRadius: '20px', padding: '4px 12px', fontSize: '10px', color: C.violet,
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.violet, animation: 'pulse 2s infinite' }}></div>
            System live
          </div>
          <div style={{ fontSize: '9px', color: C.lavenderFaint, marginTop: '8px', fontFamily: C.mono }}>
            v2.0 · full stack
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: '210px', flex: 1, padding: '36px 32px', minHeight: '100vh', animation: 'fadeUp 0.25s ease' }} key={page}>
        {page === 'warehouse' && <Warehouse C={C} onLowStockUpdate={setLowStockCount} />}
        {page === 'ai'        && <AIPrediction C={C} />}
        {page === 'log'       && <StockLog C={C} />}
      </main>
    </div>
  );
}
