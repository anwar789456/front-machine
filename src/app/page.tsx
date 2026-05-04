'use client';
import { useEffect, useState } from 'react';
import ProfileForm from '@/components/ProfileForm';
import {
  MetricsBarChart, ROCChart, ConfusionMatrix, FeatureImportanceChart,
  TimingChart, PredictionBars, CategoryProbabilityChart,
} from '@/components/Comparison';
import CourseCards from '@/components/CourseCards';
import {
  ChildProfile, DEFAULT_PROFILE, DropoutResponse, RecommendResponse, MetricsResponse,
  predictDropout, recommend, fetchMetrics,
} from '@/lib/api';

type Tab = 'live' | 'metrics';

export default function Home() {
  const [tab, setTab] = useState<Tab>('live');
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [dropout, setDropout] = useState<DropoutResponse | null>(null);
  const [recco, setRecco] = useState<RecommendResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch((e) => setError(String(e)));
  }, []);

  const onPredict = async () => {
    setLoading(true); setError(null);
    try {
      const [d, r] = await Promise.all([predictDropout(profile), recommend(profile)]);
      setDropout(d); setRecco(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1>MinoLingo ML — Dropout & Course Recommendation</h1>
        <p>
          Random Forest vs XGBoost · Live comparison ·
          Business goal: <em>reduce course dropout</em> · Data goal: <em>recommend better-fit courses</em>
        </p>
      </header>

      <div className="tabs">
        <button className={`tab ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
          Live prediction
        </button>
        <button className={`tab ${tab === 'metrics' ? 'active' : ''}`} onClick={() => setTab('metrics')}>
          Model comparison
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {tab === 'live' && (
        <div className="grid grid-2">
          <div className="card">
            <h2>Child profile</h2>
            <ProfileForm profile={profile} onChange={setProfile} />
            <button onClick={onPredict} disabled={loading}>
              {loading ? 'Predicting…' : 'Predict with both models'}
            </button>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2>Dropout prediction</h2>
              {!dropout ? (
                <div className="loading">Submit the form to get a live prediction.</div>
              ) : (
                <>
                  <div className="result-row">
                    <div className="result-box rf">
                      <div className="label">Random Forest</div>
                      <div className="value">
                        {(dropout.random_forest.dropout_probability * 100).toFixed(1)}%
                        <span className={`risk-badge risk-${dropout.random_forest.risk_level}`}>
                          {dropout.random_forest.risk_level}
                        </span>
                      </div>
                      <div className="sub">{dropout.random_forest.prediction.replace('_', ' ')}</div>
                    </div>
                    <div className="result-box xgb">
                      <div className="label">XGBoost</div>
                      <div className="value">
                        {(dropout.xgboost.dropout_probability * 100).toFixed(1)}%
                        <span className={`risk-badge risk-${dropout.xgboost.risk_level}`}>
                          {dropout.xgboost.risk_level}
                        </span>
                      </div>
                      <div className="sub">{dropout.xgboost.prediction.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <PredictionBars
                    rfProb={dropout.random_forest.dropout_probability}
                    xgbProb={dropout.xgboost.dropout_probability}
                    label="Dropout %"
                  />
                  <div style={{ marginTop: '.5rem', fontSize: '.85rem', color: '#718096' }}>
                    Models {dropout.agreement ? '✓ agree' : '✗ disagree'}.
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <h2>Recommended courses</h2>
              {!recco ? (
                <div className="loading">Submit the form to get a recommendation.</div>
              ) : (
                <>
                  <div className="result-row">
                    <div className="result-box rf">
                      <div className="label">Random Forest top category</div>
                      <div className="value">{recco.random_forest.top_category}</div>
                    </div>
                    <div className="result-box xgb">
                      <div className="label">XGBoost top category</div>
                      <div className="value">{recco.xgboost.top_category}</div>
                    </div>
                  </div>

                  <h3 style={{ marginTop: '.75rem', marginBottom: '.5rem', fontSize: '.95rem' }}>
                    Category confidence
                  </h3>
                  <CategoryProbabilityChart
                    rfProbs={recco.random_forest.category_probabilities}
                    xgbProbs={recco.xgboost.category_probabilities}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <CourseCards
                      modelName="Random Forest"
                      accent="#2ecc71"
                      courses={recco.random_forest.courses}
                    />
                    <CourseCards
                      modelName="XGBoost"
                      accent="#3498db"
                      courses={recco.xgboost.courses}
                    />
                  </div>

                  <div style={{ marginTop: '.75rem', fontSize: '.85rem', color: '#718096' }}>
                    Category: {recco.agreement_on_category ? '✓ agree' : '✗ disagree'} ·
                    Top course: {recco.agreement_on_top_course ? '✓ agree' : '✗ disagree'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div>
          {!metrics ? (
            <div className="loading">Loading metrics…</div>
          ) : (
            <>
              <div className="grid grid-2">
                <div className="card">
                  <h2>Performance metrics — RF vs XGB</h2>
                  <MetricsBarChart metrics={metrics} />
                </div>
                <div className="card">
                  <h2>ROC curves</h2>
                  <ROCChart metrics={metrics} />
                </div>
              </div>

              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2>Confusion matrices</h2>
                <div className="grid grid-2">
                  <ConfusionMatrix matrix={metrics.dropout.confusion_matrices.rf} title="Random Forest" color="#2ecc71" />
                  <ConfusionMatrix matrix={metrics.dropout.confusion_matrices.xgb} title="XGBoost" color="#3498db" />
                </div>
              </div>

              <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                <div className="card">
                  <h2>Feature importances (top 12)</h2>
                  <FeatureImportanceChart metrics={metrics} />
                </div>
                <div className="card">
                  <h2>Training & inference time</h2>
                  <TimingChart metrics={metrics} />
                  <div style={{ marginTop: '1rem', fontSize: '.85rem' }}>
                    <strong>RF best params:</strong>
                    <pre style={{ background: '#f7fafc', padding: '.5rem', borderRadius: '6px', marginTop: '.25rem', fontSize: '.75rem', overflow: 'auto' }}>
                      {JSON.stringify(metrics.dropout.random_forest.best_params, null, 2)}
                    </pre>
                    <strong>XGB best params:</strong>
                    <pre style={{ background: '#f7fafc', padding: '.5rem', borderRadius: '6px', marginTop: '.25rem', fontSize: '.75rem', overflow: 'auto' }}>
                      {JSON.stringify(metrics.dropout.xgboost.best_params, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
