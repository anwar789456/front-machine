'use client';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { MetricsResponse } from '@/lib/api';

const RF = '#2ecc71';
const XGB = '#3498db';

export function MetricsBarChart({ metrics }: { metrics: MetricsResponse }) {
  const m = metrics.dropout;
  const data = (['accuracy', 'precision', 'recall', 'f1', 'roc_auc'] as const).map((k) => ({
    metric: k.toUpperCase(),
    'Random Forest': +m.random_forest[k].toFixed(4),
    XGBoost: +m.xgboost[k].toFixed(4),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="metric" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Random Forest" fill={RF} />
        <Bar dataKey="XGBoost" fill={XGB} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ROCChart({ metrics }: { metrics: MetricsResponse }) {
  const { rf, xgb } = metrics.dropout.roc_curves;
  const data: { fpr: number; rf?: number; xgb?: number }[] = [];
  const len = Math.max(rf.fpr.length, xgb.fpr.length);
  for (let i = 0; i < len; i++) {
    data.push({
      fpr: rf.fpr[i] ?? xgb.fpr[i],
      rf: rf.tpr[i],
      xgb: xgb.tpr[i],
    });
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fpr" type="number" domain={[0, 1]} label={{ value: 'False positive rate', position: 'bottom', offset: -5 }} />
        <YAxis domain={[0, 1]} label={{ value: 'True positive rate', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="rf" stroke={RF} dot={false} name={`RF (AUC ${metrics.dropout.random_forest.roc_auc.toFixed(3)})`} />
        <Line type="monotone" dataKey="xgb" stroke={XGB} dot={false} name={`XGB (AUC ${metrics.dropout.xgboost.roc_auc.toFixed(3)})`} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ConfusionMatrix({ matrix, title, color }: { matrix: number[][]; title: string; color: string }) {
  const labels = ['Stayed', 'Dropped'];
  const max = Math.max(...matrix.flat());
  return (
    <div>
      <h3 style={{ color, textAlign: 'center' }}>{title}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th></th>
            {labels.map((l) => <th key={l} style={{ padding: '.5rem', fontSize: '.8rem' }}>Pred {l}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th style={{ padding: '.5rem', fontSize: '.8rem' }}>Act {labels[i]}</th>
              {row.map((v, j) => {
                const intensity = v / max;
                return (
                  <td key={j} style={{
                    padding: '1rem',
                    background: `rgba(${color === RF ? '46,204,113' : '52,152,219'}, ${0.15 + intensity * 0.6})`,
                    fontWeight: 600,
                    border: '1px solid white',
                  }}>{v}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FeatureImportanceChart({ metrics }: { metrics: MetricsResponse }) {
  const fi = metrics.dropout.feature_importances;
  const combined = fi.features.map((f, i) => ({
    feature: f, RF: fi.rf[i], XGB: fi.xgb[i],
  }));
  combined.sort((a, b) => (b.RF + b.XGB) - (a.RF + a.XGB));
  const top = combined.slice(0, 12).reverse();
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={top} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="feature" type="category" width={150} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="RF" fill={RF} />
        <Bar dataKey="XGB" fill={XGB} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TimingChart({ metrics }: { metrics: MetricsResponse }) {
  const data = [
    { phase: 'Train (s)', RF: metrics.dropout.random_forest.train_time_s, XGB: metrics.dropout.xgboost.train_time_s },
    { phase: 'Inference (ms)', RF: metrics.dropout.random_forest.inference_ms, XGB: metrics.dropout.xgboost.inference_ms },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="phase" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="RF" fill={RF} />
        <Bar dataKey="XGB" fill={XGB} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PredictionBars({
  rfProb, xgbProb, label,
}: { rfProb: number; xgbProb: number; label: string }) {
  const data = [
    { name: label, 'Random Forest': +(rfProb * 100).toFixed(1), XGBoost: +(xgbProb * 100).toFixed(1) },
  ];
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="name" type="category" hide />
        <Tooltip />
        <Legend />
        <Bar dataKey="Random Forest" fill={RF} />
        <Bar dataKey="XGBoost" fill={XGB} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryProbabilityChart({
  rfProbs, xgbProbs,
}: {
  rfProbs: Record<string, number>;
  xgbProbs: Record<string, number>;
}) {
  const categories = Object.keys(rfProbs);
  const merged = categories.map((cat) => ({
    course: cat,
    RF: +((rfProbs[cat] ?? 0) * 100).toFixed(1),
    XGB: +((xgbProbs[cat] ?? 0) * 100).toFixed(1),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={merged}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="course" />
        <YAxis domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="RF" fill={RF}>
          {merged.map((_, i) => <Cell key={i} />)}
        </Bar>
        <Bar dataKey="XGB" fill={XGB} />
      </BarChart>
    </ResponsiveContainer>
  );
}
