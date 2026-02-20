/**
 * AcademyView — Course list, lesson reader, quiz system.
 */

import { useState, useCallback, useMemo, Fragment } from 'react';
import { SdlIcon } from '../lib/icons';
import { ACADEMY_COURSES } from './courses';
import type { Course, Lesson, LessonBlock, QuizQuestion } from './types';
import {
  getProgress, markLessonComplete, saveQuizScore,
  isLessonComplete, getCourseProgress,
  type AcademyProgress,
} from './progress';

// ─── Accent color ───

const TEAL = '#14b8a6';

// ─── Main view ───

type AcademyRoute =
  | { view: 'list' }
  | { view: 'course'; courseId: string }
  | { view: 'lesson'; courseId: string; lessonId: string }
  | { view: 'quiz'; courseId: string };

export default function AcademyView() {
  const [route, setRoute] = useState<AcademyRoute>({ view: 'list' });
  const [progress, setProgress] = useState<AcademyProgress>(getProgress);

  const openCourse = useCallback((id: string) => setRoute({ view: 'course', courseId: id }), []);
  const openLesson = useCallback((courseId: string, lessonId: string) => setRoute({ view: 'lesson', courseId, lessonId }), []);
  const openQuiz = useCallback((courseId: string) => setRoute({ view: 'quiz', courseId }), []);
  const goBack = useCallback(() => {
    if (route.view === 'lesson' || route.view === 'quiz') setRoute({ view: 'course', courseId: route.courseId });
    else setRoute({ view: 'list' });
  }, [route]);

  const handleLessonComplete = useCallback((lessonId: string) => {
    setProgress(markLessonComplete(lessonId));
  }, []);

  const handleQuizFinish = useCallback((courseId: string, score: number) => {
    setProgress(saveQuizScore(courseId, score));
  }, []);

  const course = 'courseId' in route ? ACADEMY_COURSES.find(c => c.id === route.courseId) : undefined;

  return (
    <div className="min-h-full bg-zinc-950">
      {route.view === 'list' && (
        <CourseList progress={progress} onSelect={openCourse} />
      )}
      {route.view === 'course' && course && (
        <CourseDetail
          course={course} progress={progress}
          onBack={goBack} onLesson={openLesson} onQuiz={openQuiz}
        />
      )}
      {route.view === 'lesson' && course && (
        <LessonReader
          course={course}
          lessonId={route.lessonId}
          progress={progress}
          onBack={goBack}
          onComplete={handleLessonComplete}
          onNavigate={(lid) => setRoute({ view: 'lesson', courseId: course.id, lessonId: lid })}
        />
      )}
      {route.view === 'quiz' && course && (
        <QuizRunner
          course={course} progress={progress}
          onBack={goBack} onFinish={handleQuizFinish}
        />
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Course List
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CourseList({ progress, onSelect }: { progress: AcademyProgress; onSelect: (id: string) => void }) {
  const tracks = useMemo(() => {
    const map = new Map<number, { label: string; color: string; courses: typeof ACADEMY_COURSES }>();
    for (const c of ACADEMY_COURSES) {
      if (!map.has(c.track)) map.set(c.track, { label: c.trackLabel, color: c.color, courses: [] });
      map.get(c.track)!.courses.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-medium mb-6">
          <SdlIcon name="lightbulb" size={14} />
          Academy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Impara il foresight</h1>
        <p className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Corsi interattivi per imparare a pensare il futuro in modo strutturato.
          Nessun prerequisito richiesto.
        </p>
      </div>

      {tracks.map(([trackNum, { label, color, courses }]) => (
        <Fragment key={trackNum}>
          {/* Track label */}
          <div className="flex items-center gap-2 mb-6 mt-2">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Track {trackNum} — {label}
            </span>
            <span className="text-[10px] text-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">{courses.length}</span>
          </div>

          {/* Course cards */}
          <div className="space-y-4 mb-10">
            {courses.map(c => {
              const pct = getCourseProgress(progress, c.id, c.lessons.map(l => l.id));
              const quizScore = progress.quizScores[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="w-full text-left bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 hover:border-teal-500/30 hover:bg-zinc-900/70 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:brightness-125 transition-all" style={{ backgroundColor: `${color}15`, color }}>
                      <SdlIcon name={c.icon} size={22} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{c.title}</p>
                      <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">{c.subtitle}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-[11px] text-zinc-600">{c.lessons.length} lezioni</span>
                        <span className="text-[11px] text-zinc-600">1 quiz</span>
                        {pct > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-zinc-800">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TEAL }} />
                            </div>
                            <span className="text-[11px] font-medium" style={{ color: TEAL }}>{pct}%</span>
                          </div>
                        )}
                        {quizScore != null && (
                          <span className="text-[11px] font-medium text-teal-400">
                            Quiz: {quizScore}/{c.quiz.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-700 group-hover:text-teal-400 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Course Detail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CourseDetail({ course, progress, onBack, onLesson, onQuiz }: {
  course: Course; progress: AcademyProgress;
  onBack: () => void; onLesson: (courseId: string, lessonId: string) => void; onQuiz: (courseId: string) => void;
}) {
  const pct = getCourseProgress(progress, course.id, course.lessons.map(l => l.id));
  const quizScore = progress.quizScores[course.id];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      <BackButton onClick={onBack} label="Tutti i corsi" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-8 mt-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-400 shrink-0">
          <SdlIcon name={course.icon} size={28} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400/70 mb-1">{course.trackLabel}</p>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{course.subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      {pct > 0 && (
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="flex-1 h-2 rounded-full bg-zinc-800">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TEAL }} />
          </div>
          <span className="text-xs font-medium" style={{ color: TEAL }}>{pct}%</span>
        </div>
      )}

      {/* Lesson list */}
      <div className="space-y-2 mb-8">
        {course.lessons.map((lesson, i) => {
          const done = isLessonComplete(progress, lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => onLesson(course.id, lesson.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all ${
                done
                  ? 'bg-teal-500/5 border border-teal-500/15 hover:border-teal-500/30'
                  : 'bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/60 hover:bg-zinc-900/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-teal-500/15 text-teal-400' : 'bg-zinc-800/60 text-zinc-500'}`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? 'text-teal-300' : 'text-zinc-200'}`}>{lesson.title}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{lesson.duration}</p>
              </div>
              <SdlIcon name={lesson.icon} size={16} className="text-zinc-600 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Quiz button */}
      <div className="border-t border-zinc-800/60 pt-6">
        <button
          onClick={() => onQuiz(course.id)}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left bg-zinc-900/40 border border-zinc-800/60 hover:border-teal-500/30 hover:bg-zinc-900/60 transition-all group"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${quizScore != null ? 'bg-teal-500/15 text-teal-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-200 group-hover:text-teal-300 transition-colors">
              Quiz di verifica
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              {course.quiz.length} domande — {quizScore != null ? `Miglior punteggio: ${quizScore}/${course.quiz.length}` : 'Non ancora completato'}
            </p>
          </div>
          <svg className="w-5 h-5 text-zinc-700 group-hover:text-teal-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lesson Reader
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LessonReader({ course, lessonId, progress, onBack, onComplete, onNavigate }: {
  course: Course; lessonId: string; progress: AcademyProgress;
  onBack: () => void; onComplete: (id: string) => void; onNavigate: (id: string) => void;
}) {
  const lessonIdx = course.lessons.findIndex(l => l.id === lessonId);
  const lesson = course.lessons[lessonIdx];
  if (!lesson) return null;

  const done = isLessonComplete(progress, lesson.id);
  const prev = lessonIdx > 0 ? course.lessons[lessonIdx - 1] : null;
  const next = lessonIdx < course.lessons.length - 1 ? course.lessons[lessonIdx + 1] : null;

  const handleComplete = () => {
    onComplete(lesson.id);
    if (next) onNavigate(next.id);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      <BackButton onClick={onBack} label={course.title} />

      {/* Lesson header */}
      <div className="mt-6 mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400/70 mb-2">
          Lezione {lessonIdx + 1} di {course.lessons.length}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{lesson.title}</h1>
        <p className="text-[12px] text-zinc-600 mt-2">{lesson.duration} di lettura</p>
      </div>

      {/* Content */}
      <div className="space-y-5 mb-12">
        {lesson.blocks.map((block, i) => (
          <LessonBlockRenderer key={i} block={block} />
        ))}
      </div>

      {/* Footer actions */}
      <div className="border-t border-zinc-800/60 pt-6 space-y-4">
        {!done && (
          <button
            onClick={handleComplete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: TEAL }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {next ? 'Completata — vai alla prossima' : 'Completata'}
          </button>
        )}
        {done && next && (
          <button
            onClick={() => onNavigate(next.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Prossima lezione
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <div className="flex items-center justify-between">
          {prev ? (
            <button onClick={() => onNavigate(prev.id)} className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {prev.title}
            </button>
          ) : <div />}
          {done && (
            <span className="text-[11px] text-teal-400/70 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Completata
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Quiz Runner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function QuizRunner({ course, progress, onBack, onFinish }: {
  course: Course; progress: AcademyProgress;
  onBack: () => void; onFinish: (courseId: string, score: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = course.quiz[currentIdx];
  const total = course.quiz.length;

  const handleVerify = () => setRevealed(true);

  const handleNext = () => {
    const correct = selectedOption === q.correctIndex;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    setSelectedOption(null);
    setRevealed(false);

    if (currentIdx + 1 < total) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const score = newAnswers.filter(Boolean).length;
      onFinish(course.id, score);
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  };

  if (finished) {
    const score = answers.filter(Boolean).length;
    const pct = Math.round((score / total) * 100);
    const great = pct >= 80;
    return (
      <div className="max-w-xl mx-auto px-6 py-16 animate-fade-in text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${great ? 'bg-teal-500/15 text-teal-400' : 'bg-amber-500/15 text-amber-400'}`}>
          {great ? (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {great ? 'Ottimo lavoro!' : 'Quasi!'}
        </h2>
        <p className="text-3xl font-extrabold mb-2" style={{ color: great ? TEAL : '#f59e0b' }}>
          {score}/{total}
        </p>
        <p className="text-sm text-zinc-400 mb-8 max-w-sm mx-auto">
          {great
            ? 'Hai una solida comprensione dei concetti di questo corso.'
            : 'Rivedi le lezioni e riprova. Ogni tentativo e\' un passo avanti.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Riprova
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: TEAL }}
          >
            Torna al corso
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === q.correctIndex;

  return (
    <div className="max-w-xl mx-auto px-6 py-12 animate-fade-in">
      <BackButton onClick={onBack} label={course.title} />

      {/* Progress */}
      <div className="mt-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400/70">
            Quiz di verifica
          </p>
          <p className="text-[12px] text-zinc-500">
            {currentIdx + 1} / {total}
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%`, backgroundColor: TEAL }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold text-white mb-6 leading-relaxed">{q.question}</h2>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {q.options.map((opt, i) => {
          let borderColor = 'border-zinc-800/60';
          let bg = 'bg-zinc-900/40';
          let textColor = 'text-zinc-300';

          if (revealed) {
            if (i === q.correctIndex) {
              borderColor = 'border-teal-500/40';
              bg = 'bg-teal-500/10';
              textColor = 'text-teal-300';
            } else if (i === selectedOption && !isCorrect) {
              borderColor = 'border-rose-500/40';
              bg = 'bg-rose-500/10';
              textColor = 'text-rose-300';
            }
          } else if (i === selectedOption) {
            borderColor = 'border-teal-500/30';
            bg = 'bg-teal-500/5';
            textColor = 'text-teal-200';
          }

          return (
            <button
              key={i}
              onClick={() => !revealed && setSelectedOption(i)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${borderColor} ${bg} ${revealed ? 'cursor-default' : 'hover:border-zinc-700/60 cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border ${
                  i === selectedOption && !revealed ? 'border-teal-500/50 text-teal-400' :
                  revealed && i === q.correctIndex ? 'border-teal-500/50 text-teal-400 bg-teal-500/15' :
                  revealed && i === selectedOption && !isCorrect ? 'border-rose-500/50 text-rose-400 bg-rose-500/15' :
                  'border-zinc-700 text-zinc-500'
                }`}>
                  {revealed && i === q.correctIndex ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : revealed && i === selectedOption && !isCorrect ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className={`text-sm leading-relaxed ${textColor}`}>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className={`rounded-xl border px-4 py-4 mb-6 animate-slide-down ${
          isCorrect ? 'bg-teal-500/5 border-teal-500/20' : 'bg-rose-500/5 border-rose-500/20'
        }`}>
          <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 ${isCorrect ? 'text-teal-400' : 'text-rose-400'}`}>
            {isCorrect ? 'Corretto' : 'Non corretto'}
          </p>
          <p className="text-[13px] text-zinc-400 leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Action */}
      {!revealed ? (
        <button
          onClick={handleVerify}
          disabled={selectedOption === null}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
          style={{ backgroundColor: TEAL }}
        >
          Verifica
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: TEAL }}
        >
          {currentIdx + 1 < total ? 'Prossima domanda' : 'Vedi risultato'}
        </button>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared sub-components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

function LessonBlockRenderer({ block }: { block: LessonBlock }) {
  if (typeof block === 'string') {
    return <p className="text-[15px] text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInlineMarkup(block) }} />;
  }
  switch (block.type) {
    case 'heading':
      return <h3 className="text-base font-semibold text-zinc-200 mt-3">{block.text}</h3>;
    case 'highlight':
      return (
        <div className="bg-teal-500/5 border-l-2 border-teal-500/40 px-4 py-3 rounded-r-lg">
          <p className="text-[14px] text-teal-200/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInlineMarkup(block.text) }} />
        </div>
      );
    case 'tip':
      return (
        <div className="bg-amber-500/5 border-l-2 border-amber-500/40 px-4 py-3 rounded-r-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/70 mb-1">Nota</p>
          <p className="text-[13px] text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInlineMarkup(block.text) }} />
        </div>
      );
    case 'list':
      return (
        <ul className="space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-zinc-400 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 mt-2" />
              <span dangerouslySetInnerHTML={{ __html: renderInlineMarkup(item) }} />
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function renderInlineMarkup(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-200 font-semibold">$1</strong>')
             .replace(/`(.+?)`/g, '<code class="text-teal-400/80 text-[13px] bg-teal-500/8 px-1.5 py-0.5 rounded">$1</code>');
}
