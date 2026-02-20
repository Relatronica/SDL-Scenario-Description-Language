/**
 * Academy — Progress tracking via localStorage.
 */

const STORAGE_KEY = 'rebica-academy-progress';

export interface AcademyProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
}

function load(): AcademyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AcademyProgress;
  } catch { /* ignore */ }
  return { completedLessons: [], quizScores: {} };
}

function save(progress: AcademyProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

export function getProgress(): AcademyProgress {
  return load();
}

export function markLessonComplete(lessonId: string): AcademyProgress {
  const p = load();
  if (!p.completedLessons.includes(lessonId)) {
    p.completedLessons.push(lessonId);
  }
  save(p);
  return p;
}

export function saveQuizScore(courseId: string, score: number): AcademyProgress {
  const p = load();
  const prev = p.quizScores[courseId] ?? 0;
  if (score > prev) p.quizScores[courseId] = score;
  save(p);
  return p;
}

export function isLessonComplete(progress: AcademyProgress, lessonId: string): boolean {
  return progress.completedLessons.includes(lessonId);
}

export function getCourseProgress(progress: AcademyProgress, courseId: string, lessonIds: string[]): number {
  const done = lessonIds.filter(id => progress.completedLessons.includes(id)).length;
  return lessonIds.length > 0 ? Math.round((done / lessonIds.length) * 100) : 0;
}
