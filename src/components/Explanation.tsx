'use client';
import { ModelExplanation } from '@/lib/api';

const PUSH_DROP = '#e74c3c';
const PROTECT = '#2ecc71';

function ContributionBar({ c, maxAbs }: { c: ModelExplanation['contributions'][0]; maxAbs: number }) {
  const pct = (Math.abs(c.shap) / maxAbs) * 100;
  const positive = c.shap > 0;
  return (
    <div style={{ marginBottom: '.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginBottom: 2 }}>
        <span style={{ color: '#2d3748' }}>{c.label}</span>
        <span style={{
          color: positive ? PUSH_DROP : PROTECT,
          fontWeight: 600,
        }}>
          {positive ? '+' : ''}{(c.shap * 100).toFixed(1)}%
        </span>
      </div>
      <div style={{
        position: 'relative',
        height: 14,
        background: '#edf2f7',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: '50%', top: 0, bottom: 0,
          width: 1, background: '#a0aec0',
        }} />
        <div style={{
          position: 'absolute',
          height: '100%',
          background: positive ? PUSH_DROP : PROTECT,
          left: positive ? '50%' : `${50 - pct / 2}%`,
          width: `${pct / 2}%`,
          borderRadius: positive ? '0 4px 4px 0' : '4px 0 0 4px',
        }} />
      </div>
    </div>
  );
}

export function ModelExplanationCard({
  exp, modelName, accent,
}: { exp: ModelExplanation; modelName: string; accent: string }) {
  const maxAbs = Math.max(...exp.contributions.map((c) => Math.abs(c.shap)), 0.001);
  return (
    <div className="card">
      <h3 style={{ color: accent, marginBottom: '.5rem' }}>
        {modelName} — Why this prediction?
      </h3>
      <p style={{
        fontSize: '.85rem', color: '#4a5568', marginBottom: '1rem',
        background: '#f7fafc', padding: '.6rem .8rem', borderRadius: 6,
        borderLeft: `3px solid ${accent}`,
      }}>
        {exp.summary}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: '#718096', marginBottom: '.4rem' }}>
        <span>← protective (less dropout)</span>
        <span>pushing toward dropout →</span>
      </div>

      {exp.contributions.map((c) => (
        <ContributionBar key={c.feature} c={c} maxAbs={maxAbs} />
      ))}
    </div>
  );
}
