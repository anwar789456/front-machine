'use client';
import { CourseCard } from '@/lib/api';

const LEVEL_COLORS: Record<string, string> = {
  A1: '#48bb78',
  A2: '#38b2ac',
  B1: '#4299e1',
  B2: '#9f7aea',
};

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span style={{ letterSpacing: '1px', color: '#f6ad55' }}>
      {'★'.repeat(Math.round(value))}
      <span style={{ color: '#cbd5e0' }}>{'★'.repeat(max - Math.round(value))}</span>
    </span>
  );
}

function Card({ course, accent }: { course: CourseCard; accent: string }) {
  const fitPct = Math.round(course.fit_score * 100);
  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${accent}33`,
      background: 'white',
      padding: '0.85rem',
      display: 'flex',
      gap: '0.75rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        fontSize: '2rem',
        background: `${accent}15`,
        borderRadius: 8,
        width: 56, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {course.thumbnail_emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem' }}>
          <strong style={{ fontSize: '.95rem', color: '#2d3748' }}>{course.title}</strong>
          <span style={{
            background: accent,
            color: 'white',
            padding: '.1rem .5rem',
            borderRadius: 999,
            fontSize: '.7rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {fitPct}% fit
          </span>
        </div>
        <div style={{ display: 'flex', gap: '.4rem', margin: '.3rem 0', flexWrap: 'wrap' }}>
          <span style={{
            background: LEVEL_COLORS[course.level],
            color: 'white',
            padding: '.05rem .45rem',
            borderRadius: 4,
            fontSize: '.7rem',
            fontWeight: 600,
          }}>{course.level}</span>
          <span style={{ fontSize: '.75rem', color: '#718096' }}>
            {course.category} · {course.duration_minutes}min · {course.lessons} lessons
          </span>
        </div>
        <p style={{ fontSize: '.8rem', color: '#4a5568', margin: '.25rem 0', lineHeight: 1.4 }}>
          {course.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.4rem', fontSize: '.75rem' }}>
          <span><Stars value={course.instructor_rating} /> <span style={{ color: '#718096' }}>{course.instructor_rating}</span></span>
          <span style={{ color: '#718096' }}>Difficulty: {'●'.repeat(course.difficulty)}{'○'.repeat(5 - course.difficulty)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CourseCards({
  courses, accent, modelName,
}: { courses: CourseCard[]; accent: string; modelName: string }) {
  return (
    <div>
      <h3 style={{ color: accent, marginBottom: '.6rem' }}>{modelName} — Top 3 picks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        {courses.map((c) => <Card key={c.id} course={c} accent={accent} />)}
      </div>
    </div>
  );
}
