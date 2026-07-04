export const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  border: '#334155',
  borderLight: '#475569',
  // Risk levels
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  // Gradients
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  // Chart colors
  chart1: '#6366f1',
  chart2: '#22c55e',
  chart3: '#f59e0b',
  chart4: '#3b82f6',
  chart5: '#ec4899',
};

export const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'low': return Colors.low;
    case 'moderate': return Colors.moderate;
    case 'high': return Colors.high;
    case 'critical': return Colors.critical;
    default: return Colors.primary;
  }
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.moderate;
  if (score >= 40) return Colors.high;
  return Colors.critical;
};
