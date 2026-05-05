'use client';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { MetricsResponse } from '@/lib/api';

const RF = '#2ecc71';
const XGB = '#3498db';
const ANN = '#e67e22';

export function MetricsBarChart({ metrics }: { metrics: MetricsResponse }) {
  const m = metrics.dropout;
  const data = (['accuracy', 'precision', 'recall', 'f1', 'roc_auc'] as const).map((k) => ({
    metric: k.toUpperCase(),
    'Random Forest': +m.random_forest[k].toFixed(4),
    XGBoost: +m.xgboost[k].toFixed(4),
    ...(m.ann ? { ANN: +m.ann[k].toFixed(4) } : {}),
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
        {m.ann && <Bar dataKey="ANN" fill={ANN} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ROCChart({ metrics }: { metrics: MetricsResponse }) {
  const { rf, xgb, ann } = metrics.dropout.roc_curves;
  const len = Math.max(rf.fpr.length, xgb.fpr.length, ann?.fpr.length ?? 0);
  const data: { fpr: number; rf?: number; xgb?: number; ann?: number }[] = [];
  for (let i = 0; i < len; i++) {
    data.push({
      fpr: rf.fpr[i] ?? xgb.fpr[i] ?? ann?.fpr[i] ?? 0,
      rf: rf.tpr[i],
      xgb: xgb.tpr[i],
      ann: ann?.tpr[i],
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
        {metrics.dropout.ann && (
          <Line type="monotone" dataKey="ann" stroke={ANN} dot={false} name={`ANN (AUC ${metrics.dropout.ann.roc_auc.toFixed(3)})`} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

const COLOR_RGB: Record<string, string> = {
  [RF]: '46,204,113',
  [XGB]: '52,152,219',
  [ANN]: '230,126,34',
};

export function ConfusionMatrix({ matrix, title, color }: { matrix: number[][]; title: string; color: string }) {
  const labels = ['Stayed', 'Dropped'];
  const max = Math.max(...matrix.flat());
  const rgb = COLOR_RGB[color] ?? '52,152,219';
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
                    background: `rgba(${rgb}, ${0.15 + intensity * 0.6})`,
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
  const m = metrics.dropout;
  const data = [
    {
      phase: 'Train (s)',
      RF: m.random_forest.train_time_s,
      XGB: m.xgboost.train_time_s,
      ...(m.ann ? { ANN: m.ann.train_time_s } : {}),
    },
    {
      phase: 'Inference (ms)',
      RF: m.random_forest.inference_ms,
      XGB: m.xgboost.inference_ms,
      ...(m.ann ? { ANN: m.ann.inference_ms } : {}),
    },
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
        {m.ann && <Bar dataKey="ANN" fill={ANN} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PredictionBars({
  rfProb, xgbProb, annProb, label,
}: { rfProb: number; xgbProb: number; annProb?: number; label: string }) {
  const row: Record<string, number | string> = {
    name: label,
    'Random Forest': +(rfProb * 100).toFixed(1),
    XGBoost: +(xgbProb * 100).toFixed(1),
  };
  if (annProb !== undefined) row['ANN'] = +(annProb * 100).toFixed(1);
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={[row]} layout="vertical">
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="name" type="category" hide />
        <Tooltip />
        <Legend />
        <Bar dataKey="Random Forest" fill={RF} />
        <Bar dataKey="XGBoost" fill={XGB} />
        {annProb !== undefined && <Bar dataKey="ANN" fill={ANN} />}
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

export function AnnTrainingCurves({ metrics }: { metrics: MetricsResponse }) {
  const ann = metrics.dropout.ann;
  if (!ann) return null;
  const epochs = ann.training_history.loss.length;
  const data = Array.from({ length: epochs }, (_, i) => ({
    epoch: i + 1,
    'Train loss': +ann.training_history.loss[i].toFixed(4),
    'Val loss': +ann.training_history.val_loss[i].toFixed(4),
    'Train acc': +ann.training_history.accuracy[i].toFixed(4),
    'Val acc': +ann.training_history.val_accuracy[i].toFixed(4),
  }));
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '.95rem', marginBottom: '.4rem' }}>Loss (binary cross-entropy)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'bottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Train loss" stroke="#e74c3c" dot={false} />
            <Line type="monotone" dataKey="Val loss" stroke={ANN} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 style={{ fontSize: '.95rem', marginBottom: '.4rem' }}>Accuracy</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'bottom', offset: -5 }} />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Train acc" stroke="#e74c3c" dot={false} />
            <Line type="monotone" dataKey="Val acc" stroke={ANN} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
