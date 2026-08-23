import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  // Mengambil state isDarkMode dari MainLayout
  const { isDarkMode } = useOutletContext() || { isDarkMode: true };

  const theme = {
    cardBg: isDarkMode ? '#14141e' : '#ffffff',
    border: isDarkMode ? '#1f1f2e' : '#e2e8f0',
    textPrimary: isDarkMode ? '#ffffff' : '#1e293b',
    textSecondary: isDarkMode ? '#9ca3af' : '#64748b',
  };

  const chartData = [
    { date: '01 Feb', profit: 60000 },
    { date: '02 Feb', profit: 180000 },
    { date: '03 Feb', profit: 0 },
    { date: '04 Feb', profit: 270000 },
    { date: '05 Feb', profit: 220000 },
    { date: '06 Feb', profit: 70000 },
    { date: '07 Feb', profit: 40000 },
    { date: '08 Feb', profit: 130000 },
    { date: '09 Feb', profit: 0 },
    { date: '10 Feb', profit: 120000 },
    { date: '11 Feb', profit: 90000 },
    { date: '12 Feb', profit: 290000 },
    { date: '13 Feb', profit: 130000 },
    { date: '14 Feb', profit: 160000 },
    { date: '15 Feb', profit: 0 },
    { date: '16 Feb', profit: 0 },
    { date: '17 Feb', profit: 240000 },
    { date: '18 Feb', profit: 190000 },
    { date: '19 Feb', profit: 290000 },
    { date: '20 Feb', profit: 0 },
    { date: '21 Feb', profit: 70000 },
  ];

  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.pageTitle, color: theme.textPrimary }}>Panel Kasir</h1>

      {/* Cards Summary */}
      <div style={styles.metricsGrid}>
        <div style={{ ...styles.metricCard, backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div style={styles.metricHeader}>
            <DollarSign size={20} color="#10b981" />
            <span style={{ ...styles.metricTitle, color: theme.textSecondary }}>Total Penjualan</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.textPrimary }}>Rp 2.450.000</div>
          <span style={{ ...styles.metricSub, color: '#10b981' }}>+12% dari bulan lalu</span>
        </div>

        <div style={{ ...styles.metricCard, backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div style={styles.metricHeader}>
            <ShoppingBag size={20} color="#2563eb" />
            <span style={{ ...styles.metricTitle, color: theme.textSecondary }}>Total Pesanan</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.textPrimary }}>252</div>
          <span style={{ ...styles.metricSub, color: '#2563eb' }}>+5 pesanan hari ini</span>
        </div>

        <div style={{ ...styles.metricCard, backgroundColor: theme.cardBg, borderColor: theme.border }}>
          <div style={styles.metricHeader}>
            <Users size={20} color="#f59e0b" />
            <span style={{ ...styles.metricTitle, color: theme.textSecondary }}>Pelanggan Aktif</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.textPrimary }}>50</div>
          <span style={{ ...styles.metricSub, color: theme.textSecondary }}>Terdaftar di sistem</span>
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ ...styles.chartCard, backgroundColor: theme.cardBg, borderColor: theme.border }}>
        <div style={styles.chartHeader}>
          <h2 style={{ ...styles.chartTitle, color: theme.textPrimary }}>Grafik Pendapatan</h2>
          <div style={styles.chartLegend}>
            <span style={styles.legendBox}></span>
            <span style={{ color: theme.textSecondary }}>Keuntungan (Rp)</span>
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke={theme.textSecondary} fontSize={12} tickLine={false} />
              <YAxis stroke={theme.textSecondary} fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: theme.cardBg, borderColor: theme.border, borderRadius: '6px', color: theme.textPrimary }}
                formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']}
              />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },
  pageTitle: { fontSize: '22px', fontWeight: '600', margin: 0 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' },
  metricCard: { borderRadius: '8px', padding: '18px 20px', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '8px' },
  metricHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  metricTitle: { fontSize: '13px' },
  metricValue: { fontSize: '22px', fontWeight: 'bold' },
  metricSub: { fontSize: '11px' },
  chartCard: { borderRadius: '8px', padding: '20px', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', boxSizing: 'border-box' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: '15px', fontWeight: '600', margin: 0 },
  chartLegend: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' },
  legendBox: { width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' },
};

export default Dashboard;