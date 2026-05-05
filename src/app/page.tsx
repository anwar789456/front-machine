'use client';
import { useEffect, useState } from 'react';
import ProfileForm from '@/components/ProfileForm';
import {
  MetricsBarChart, ROCChart, ConfusionMatrix, FeatureImportanceChart,
  TimingChart, PredictionBars, CategoryProbabilityChart, AnnTrainingCurves,
} from '@/components/Comparison';
import CourseCards from '@/components/CourseCards';
import { ModelExplanationCard } from '@/components/Explanation';
import {
  ChildProfile, DEFAULT_PROFILE, DropoutResponse, RecommendResponse, MetricsResponse, ExplainResponse,
  predictDropout, recommend, explain, fetchMetrics,
} from '@/lib/api';

type Tab = 'live' | 'metrics' | 'interpretation';

export default function Home() {
  const [tab, setTab] = useState<Tab>('live');
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_PROFILE);
  const [dropout, setDropout] = useState<DropoutResponse | null>(null);
  const [recco, setRecco] = useState<RecommendResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics).catch((e) => setError(String(e)));
  }, []);

  const onPredict = async () => {
    setLoading(true); setError(null);
    try {
      const [d, r, ex] = await Promise.all([
        predictDropout(profile),
        recommend(profile),
        explain(profile).catch(() => null),  // explain may 503 if SHAP isn't loaded
      ]);
      setDropout(d); setRecco(r); setExplanation(ex);
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
          Random Forest vs XGBoost vs ANN (Keras Deep Learning) · Live comparison ·
          Business goal: <em>reduce course dropout</em> · Data goal: <em>recommend better-fit courses</em>
        </p>
      </header>

      <div className="tabs">
        <button className={`tab ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
          Live prediction
        </button>
        <button className={`tab ${tab === 'interpretation' ? 'active' : ''}`} onClick={() => setTab('interpretation')}>
          Interpretation (SHAP)
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
              {loading ? 'Predicting…' : 'Predict with all models'}
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
                    {dropout.ann && (
                      <div className="result-box ann">
                        <div className="label">ANN (Keras)</div>
                        <div className="value">
                          {(dropout.ann.dropout_probability * 100).toFixed(1)}%
                          <span className={`risk-badge risk-${dropout.ann.risk_level}`}>
                            {dropout.ann.risk_level}
                          </span>
                        </div>
                        <div className="sub">{dropout.ann.prediction.replace('_', ' ')}</div>
                      </div>
                    )}
                  </div>
                  <PredictionBars
                    rfProb={dropout.random_forest.dropout_probability}
                    xgbProb={dropout.xgboost.dropout_probability}
                    annProb={dropout.ann?.dropout_probability}
                    label="Dropout %"
                  />
                  <div style={{ marginTop: '.5rem', fontSize: '.85rem', color: '#718096' }}>
                    {dropout.ann ? 'All three models' : 'Both models'} {dropout.agreement ? '✓ agree' : '✗ disagree'}.
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

      {tab === 'interpretation' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2>Why did the models make this prediction?</h2>
            <p style={{ fontSize: '.9rem', color: '#4a5568', marginBottom: '.5rem' }}>
              We use <strong>SHAP (SHapley Additive exPlanations)</strong> to break down each prediction
              into per-feature contributions. Red bars push the prediction toward dropout, green bars
              protect against it. Submit a profile on the <em>Live prediction</em> tab — the explanation will appear here.
            </p>
            <p style={{ fontSize: '.85rem', color: '#718096' }}>
              <strong>Class balance note:</strong> the dataset is moderately imbalanced
              (38% dropouts vs 62% who stayed), so we use <strong>F1-score</strong> instead of accuracy as
              our primary metric — accuracy alone would be misleading on imbalanced data.
            </p>
          </div>

          {!explanation ? (
            <div className="card">
              <div className="loading">
                Submit a child profile on the <em>Live prediction</em> tab first.
                The SHAP feature contributions will appear here automatically.
              </div>
            </div>
          ) : (
            <div className="grid grid-2">
              <ModelExplanationCard
                exp={explanation.random_forest}
                modelName="Random Forest"
                accent="#2ecc71"
              />
              <ModelExplanationCard
                exp={explanation.xgboost}
                modelName="XGBoost"
                accent="#3498db"
              />
            </div>
          )}

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h2>Business recommendations</h2>
            <ol style={{ fontSize: '.9rem', color: '#2d3748', lineHeight: 1.6, paddingLeft: '1.2rem' }}>
              <li><strong>Real-time dropout flagging</strong> — run XGBoost nightly on every active student. Surface kids with P(dropout) &gt; 60% to the customer success team.</li>
              <li><strong>Smart re-engagement</strong> — trigger push notifications when <code>time_since_last_login</code> &gt; 5 days AND model predicts dropout. Pair with a course-category swap from the recommender.</li>
              <li><strong>Streak gamification</strong> — invest in streak rewards at 3, 7, 14 days. Streak loss is a top dropout signal.</li>
              <li><strong>Parent dashboards</strong> — <code>parent_involvement_score</code> is in the top 5 predictors. Weekly parent emails would mechanically lift this score.</li>
              <li><strong>Course-level audit</strong> — break down dropout by category × difficulty; smooth out difficulty-5 courses with the highest abandonment.</li>
            </ol>
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
                  <h2>Performance metrics — RF vs XGB{metrics.dropout.ann ? ' vs ANN' : ''}</h2>
                  <MetricsBarChart metrics={metrics} />
                </div>
                <div className="card">
                  <h2>ROC curves</h2>
                  <ROCChart metrics={metrics} />
                </div>
              </div>

              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2>Confusion matrices</h2>
                <div className={metrics.dropout.confusion_matrices.ann ? 'grid grid-3' : 'grid grid-2'}>
                  <ConfusionMatrix matrix={metrics.dropout.confusion_matrices.rf} title="Random Forest" color="#2ecc71" />
                  <ConfusionMatrix matrix={metrics.dropout.confusion_matrices.xgb} title="XGBoost" color="#3498db" />
                  {metrics.dropout.confusion_matrices.ann && (
                    <ConfusionMatrix matrix={metrics.dropout.confusion_matrices.ann} title="ANN (Keras)" color="#e67e22" />
                  )}
                </div>
              </div>

              {metrics.dropout.ann && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                  <h2>ANN training curves (gradient descent in action)</h2>
                  <p style={{ fontSize: '.85rem', color: '#718096', marginBottom: '.75rem' }}>
                    Trained for {metrics.dropout.ann.epochs_run} epochs · Adam optimizer · Binary cross-entropy loss · ReLU + Sigmoid activations
                  </p>
                  <AnnTrainingCurves metrics={metrics} />
                </div>
              )}

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
                    {metrics.dropout.ann && (
                      <>
                        <strong>ANN best config:</strong>
                        <pre style={{ background: '#f7fafc', padding: '.5rem', borderRadius: '6px', marginTop: '.25rem', fontSize: '.75rem', overflow: 'auto' }}>
                          {JSON.stringify(metrics.dropout.ann.best_params, null, 2)}
                        </pre>
                      </>
                    )}
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
