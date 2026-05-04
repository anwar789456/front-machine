'use client';
import { ChildProfile } from '@/lib/api';

type Props = {
  profile: ChildProfile;
  onChange: (next: ChildProfile) => void;
};

export default function ProfileForm({ profile, onChange }: Props) {
  const set = <K extends keyof ChildProfile>(k: K, v: ChildProfile[K]) =>
    onChange({ ...profile, [k]: v });

  const num = (k: keyof ChildProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) as never);

  return (
    <div className="form-grid">
      <div className="field">
        <label>Age</label>
        <input type="number" min={4} max={14} value={profile.age} onChange={num('age')} />
      </div>
      <div className="field">
        <label>English level</label>
        <select value={profile.english_level} onChange={(e) => set('english_level', e.target.value as ChildProfile['english_level'])}>
          {['A1', 'A2', 'B1', 'B2'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Daily minutes</label>
        <input type="number" min={0} max={240} value={profile.daily_minutes} onChange={num('daily_minutes')} />
      </div>
      <div className="field">
        <label>Sessions / week</label>
        <input type="number" min={0} max={14} step={0.5} value={profile.sessions_per_week} onChange={num('sessions_per_week')} />
      </div>
      <div className="field">
        <label>Avg session duration (min)</label>
        <input type="number" min={0} max={120} value={profile.avg_session_duration} onChange={num('avg_session_duration')} />
      </div>
      <div className="field">
        <label>Streak (days)</label>
        <input type="number" min={0} max={365} value={profile.streak_days} onChange={num('streak_days')} />
      </div>
      <div className="field">
        <label>Days since last login</label>
        <input type="number" min={0} max={365} value={profile.time_since_last_login} onChange={num('time_since_last_login')} />
      </div>
      <div className="field">
        <label>Quiz attempts</label>
        <input type="number" min={0} max={500} value={profile.quiz_attempts} onChange={num('quiz_attempts')} />
      </div>
      <div className="field">
        <label>Quiz avg score (0-100)</label>
        <input type="number" min={0} max={100} value={profile.quiz_avg_score} onChange={num('quiz_avg_score')} />
      </div>
      <div className="field">
        <label>Videos watched %</label>
        <input type="number" min={0} max={100} value={profile.videos_watched_pct} onChange={num('videos_watched_pct')} />
      </div>
      <div className="field">
        <label>Practice items completed</label>
        <input type="number" min={0} max={500} value={profile.practice_items_completed} onChange={num('practice_items_completed')} />
      </div>
      <div className="field">
        <label>Writing submissions</label>
        <input type="number" min={0} max={200} value={profile.writing_submissions} onChange={num('writing_submissions')} />
      </div>
      <div className="field">
        <label>Story quiz attempts</label>
        <input type="number" min={0} max={200} value={profile.story_quiz_attempts} onChange={num('story_quiz_attempts')} />
      </div>
      <div className="field">
        <label>Certification earned</label>
        <select value={profile.certification_earned} onChange={(e) => set('certification_earned', Number(e.target.value) as 0 | 1)}>
          <option value={0}>No</option>
          <option value={1}>Yes</option>
        </select>
      </div>
      <div className="field">
        <label>Course category</label>
        <select value={profile.course_category} onChange={(e) => set('course_category', e.target.value as ChildProfile['course_category'])}>
          {['Reading', 'Listening', 'Speaking', 'Writing', 'Grammar'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Course difficulty (1-5)</label>
        <input type="number" min={1} max={5} value={profile.course_difficulty} onChange={num('course_difficulty')} />
      </div>
      <div className="field">
        <label>Instructor rating (1-5)</label>
        <input type="number" min={1} max={5} step={0.1} value={profile.instructor_rating} onChange={num('instructor_rating')} />
      </div>
      <div className="field">
        <label>Device</label>
        <select value={profile.device_type} onChange={(e) => set('device_type', e.target.value as ChildProfile['device_type'])}>
          {['mobile', 'tablet', 'desktop'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Subscription</label>
        <select value={profile.subscription_type} onChange={(e) => set('subscription_type', e.target.value as ChildProfile['subscription_type'])}>
          {['free', 'premium', 'family'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Parent involvement (0-10)</label>
        <input type="number" min={0} max={10} value={profile.parent_involvement_score} onChange={num('parent_involvement_score')} />
      </div>
    </div>
  );
}
