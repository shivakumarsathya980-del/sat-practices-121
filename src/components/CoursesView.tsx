import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Maximize2,
  Tv,
  HelpCircle,
  Video,
} from 'lucide-react';
import { Course, CourseLesson, UserProgressData } from '../types';
import { initialCourses } from '../data/mockCourses';
import { VideoPlayerModal } from './VideoPlayerModal';

interface CoursesViewProps {
  progressData: UserProgressData;
  onUpdateCourseProgress: (courseId: string, lessonId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  progressData,
  onUpdateCourseProgress,
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    const firstLesson = course.modules[0]?.lessons[0] || null;
    setActiveLesson(firstLesson);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleDirectWatchVideo = (course: Course, lesson?: CourseLesson) => {
    setSelectedCourse(course);
    const targetLesson = lesson || course.modules[0]?.lessons[0] || null;
    setActiveLesson(targetLesson);
    setIsVideoModalOpen(true);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleSelectLesson = (lesson: CourseLesson) => {
    setActiveLesson(lesson);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleCompleteActiveLesson = () => {
    if (!selectedCourse || !activeLesson) return;
    onUpdateCourseProgress(selectedCourse.id, activeLesson.id);

    // Update local lesson status
    const updatedModules = selectedCourse.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) =>
        l.id === activeLesson.id ? { ...l, completed: true } : l
      ),
    }));

    const updatedCourse = { ...selectedCourse, modules: updatedModules };
    setSelectedCourse(updatedCourse);
    setCourses(courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));

    // Find next lesson
    let allLessons: CourseLesson[] = [];
    selectedCourse.modules.forEach((mod) => {
      allLessons = [...allLessons, ...mod.lessons];
    });
    const currentIdx = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx !== -1 && currentIdx + 1 < allLessons.length) {
      setActiveLesson(allLessons[currentIdx + 1]);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    }
  };

  return (
    <div id="courses-view-container" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Digital SAT Video Masterclasses • 1080p HD</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">All SAT Video Courses & Masterclasses</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Watch interactive high-yield video lectures, inspect live Desmos demonstrations, and take synchronized notes.
          </p>
        </div>

        <button
          onClick={() => handleDirectWatchVideo(courses[0])}
          className="py-3 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-purple-950/20 shrink-0 cursor-pointer"
        >
          <Tv className="w-4 h-4 fill-white" />
          <span>Open Featured Video Lesson</span>
        </button>
      </div>

      {/* Courses Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedLessons = course.modules.reduce(
            (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
            0
          );
          const courseProgress = Math.round((completedLessons / Math.max(1, totalLessons)) * 100);
          const firstLesson = course.modules[0]?.lessons[0];

          return (
            <div
              key={course.id}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Thumbnail Preview with Play Overlay */}
                <div
                  onClick={() => handleDirectWatchVideo(course)}
                  className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden cursor-pointer group/thumb border border-slate-200"
                >
                  <img
                    src={
                      firstLesson?.videoThumbnail ||
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/90 group-hover/thumb:bg-purple-500 text-white flex items-center justify-center shadow-lg transform group-hover/thumb:scale-110 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                    <span className="font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                      {course.category}
                    </span>
                    <span className="font-mono bg-purple-600/90 text-white font-bold px-1.5 py-0.5 rounded">
                      {course.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {course.level}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({(course.enrollments || course.enrolledCount || 1500).toLocaleString()})
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.tagline || course.description}
                </p>
              </div>

              {/* Progress & Launch Button */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progress: {courseProgress}%</span>
                  <span>{completedLessons}/{totalLessons} completed</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id={`open-course-btn-${course.id}`}
                    onClick={() => handleOpenCourse(course)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Syllabus</span>
                  </button>

                  <button
                    id={`watch-video-btn-${course.id}`}
                    onClick={() => handleDirectWatchVideo(course)}
                    className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Standard Course Syllabus Modal */}
      {selectedCourse && activeLesson && !isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {selectedCourse.title}
                  </h2>
                  <div className="text-[11px] text-slate-500 font-medium">{selectedCourse.level}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open Full Video Player</span>
                </button>

                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Left Modules Sidebar, Right Lesson Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Syllabus Sidebar */}
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/70 overflow-y-auto p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Syllabus</div>

                <div className="space-y-4">
                  {selectedCourse.modules.map((mod, mIdx) => (
                    <div key={mod.id} className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-800">
                        Module {mIdx + 1}: {mod.title}
                      </div>

                      <div className="space-y-1 pl-1">
                        {mod.lessons.map((les) => {
                          const isAct = activeLesson.id === les.id;
                          return (
                            <button
                              key={les.id}
                              onClick={() => handleSelectLesson(les)}
                              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                isAct
                                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                                  : 'hover:bg-slate-200/70 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                {les.completed ? (
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${isAct ? 'text-white' : 'text-emerald-600'}`} />
                                ) : (
                                  <Play className={`w-3 h-3 ${isAct ? 'text-white' : 'text-slate-400'}`} />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>
                              <span className={`text-[10px] shrink-0 font-mono ${isAct ? 'text-purple-200' : 'text-slate-400'}`}>
                                {les.duration}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson Content Viewer */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                      Current Lesson
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activeLesson.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{activeLesson.title}</h3>
                </div>

                {/* Video Banner with Instant Click-to-Play Video */}
                <div
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group/player relative bg-slate-950 text-white rounded-2xl overflow-hidden shadow-md cursor-pointer border border-slate-800"
                >
                  <div className="aspect-video relative">
                    <img
                      src={
                        activeLesson.videoThumbnail ||
                        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={activeLesson.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-70 group-hover/player:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-2xl transform group-hover/player:scale-115 transition-all">
                        <Play className="w-7 h-7 fill-white ml-1" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-white">Click to Open Full Video Lecture</div>
                        <div className="text-xs text-purple-300">
                          Includes Desmos breakdown, interactive chapters, & time-stamped notes
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-purple-600 text-white text-[11px] font-bold px-2 py-1 rounded-lg">
                        1080p Full HD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Takeaways & Formulas</h4>
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-slate-800 space-y-2">
                    {(activeLesson.keyTakeaways || activeLesson.keyPoints || []).map((point, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkpoint Quiz */}
                {activeLesson.checkpointQuiz && (
                  <div className="space-y-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lesson Checkpoint Quiz</span>
                      <span className="text-[11px] text-purple-600 font-semibold">Test Your Understanding</span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      {activeLesson.checkpointQuiz.question}
                    </p>

                    <div className="space-y-2">
                      {activeLesson.checkpointQuiz.options.map((opt, idx) => {
                        const isChosen = selectedQuizOption === opt;
                        const isCorrect = opt === activeLesson.checkpointQuiz?.answer;
                        return (
                          <div
                            key={idx}
                            onClick={() => !quizSubmitted && setSelectedQuizOption(opt)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                  : isChosen
                                  ? 'bg-red-50 border-red-300 text-red-900'
                                  : 'border-slate-200 text-slate-600'
                                : isChosen
                                ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={!selectedQuizOption}
                        className="py-2 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200 leading-relaxed">
                        <span className="font-bold text-purple-900">Explanation: </span>
                        {activeLesson.checkpointQuiz.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Mark Completed Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="py-2.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-purple-800" />
                    <span>Watch Full Lecture Video</span>
                  </button>

                  <button
                    onClick={handleCompleteActiveLesson}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Lesson Complete & Continue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Video Masterclass Player Modal */}
      {selectedCourse && activeLesson && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          course={selectedCourse}
          lesson={activeLesson}
          onSelectLesson={handleSelectLesson}
          onCompleteLesson={handleCompleteActiveLesson}
        />
      )}
    </div>
  );
};
