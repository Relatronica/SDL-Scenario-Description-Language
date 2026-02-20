/**
 * Academy — Type definitions for courses, lessons, and quizzes.
 */

export type LessonBlock =
  | string
  | { type: 'heading'; text: string }
  | { type: 'highlight'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'list'; items: string[] };

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  duration: string;
  blocks: LessonBlock[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  track: number;
  trackLabel: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}
