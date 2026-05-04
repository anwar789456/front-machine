export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type ChildProfile = {
  age: number;
  english_level: 'A1' | 'A2' | 'B1' | 'B2';
  daily_minutes: number;
  sessions_per_week: number;
  avg_session_duration: number;
  streak_days: number;
  time_since_last_login: number;
  quiz_attempts: number;
  quiz_avg_score: number;
  videos_watched_pct: number;
  practice_items_completed: number;
  writing_submissions: number;
  story_quiz_attempts: number;
  certification_earned: 0 | 1;
  course_category: 'Reading' | 'Listening' | 'Speaking' | 'Writing' | 'Grammar';
  course_difficulty: number;
  instructor_rating: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  subscription_type: 'free' | 'premium' | 'family';
  parent_involvement_score: number;
};

export const DEFAULT_PROFILE: ChildProfile = {
  age: 9,
  english_level: 'A2',
  daily_minutes: 18,
  sessions_per_week: 4,
  avg_session_duration: 25,
  streak_days: 6,
  time_since_last_login: 2,
  quiz_attempts: 12,
  quiz_avg_score: 65,
  videos_watched_pct: 55,
  practice_items_completed: 18,
  writing_submissions: 4,
  story_quiz_attempts: 6,
  certification_earned: 0,
  course_category: 'Reading',
  course_difficulty: 3,
  instructor_rating: 4.2,
  device_type: 'tablet',
  subscription_type: 'premium',
  parent_involvement_score: 6,
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const predictDropout = (p: ChildProfile) => post<DropoutResponse>('/predict-dropout', p);
export const recommend = (p: ChildProfile) => post<RecommendResponse>('/recommend', p);

export async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${API_URL}/metrics`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export type DropoutResponse = {
  random_forest: { dropout_probability: number; prediction: string; risk_level: 'low' | 'medium' | 'high' };
  xgboost: { dropout_probability: number; prediction: string; risk_level: 'low' | 'medium' | 'high' };
  agreement: boolean;
};

export type CourseCard = {
  id: string;
  title: string;
  category: 'Reading' | 'Listening' | 'Speaking' | 'Writing' | 'Grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  difficulty: number;
  duration_minutes: number;
  lessons: number;
  description: string;
  tags: string[];
  instructor_rating: number;
  thumbnail_emoji: string;
  category_probability: number;
  fit_score: number;
};

export type ModelRecommendation = {
  top_category: string;
  category_probabilities: Record<string, number>;
  courses: CourseCard[];
};

export type RecommendResponse = {
  random_forest: ModelRecommendation;
  xgboost: ModelRecommendation;
  agreement_on_category: boolean;
  agreement_on_top_course: boolean;
};

export type MetricsResponse = {
  dropout: {
    random_forest: ModelMetrics;
    xgboost: ModelMetrics;
    roc_curves: { rf: { fpr: number[]; tpr: number[] }; xgb: { fpr: number[]; tpr: number[] } };
    confusion_matrices: { rf: number[][]; xgb: number[][] };
    feature_importances: { features: string[]; rf: number[]; xgb: number[] };
  };
};

export type ModelMetrics = {
  best_params: Record<string, unknown>;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  train_time_s: number;
  inference_ms: number;
};
