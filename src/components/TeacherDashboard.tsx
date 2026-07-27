import React, { useState } from 'react';
import { PlusCircle, Sparkles, Play, Search, BookOpen, Clock, FileText, Trophy, Users, BarChart2 } from 'lucide-react';
import { Quiz, QuizReportData } from '../types';

interface TeacherDashboardProps {
  quizzes: Quiz[];
  onCreateLiveGame: (quizId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAIModal: () => void;
  onOpenReportModal: (reportData: QuizReportData) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  quizzes,
  onCreateLiveGame,
  onOpenCreateModal,
  onOpenAIModal,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('الكل');

  const subjects = ['الكل', ...Array.from(new Set(quizzes.map((q) => q.subject).filter(Boolean)))];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'الكل' || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-slate-800" dir="rtl">
      {/* Banner Card - Vibrant Indigo Hero */}
      <div className="bg-indigo-600 rounded-3xl p-6 sm:p-8 shadow-2xl border-b-8 border-indigo-200 mb-8 relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 space-x-reverse px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-indigo-50 text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>لوحة تحكم المعلم الذكية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">إدارة المسابقات والغرف التفاعلية</h1>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              قم بإنشاء غرف لعب جماعية، إطلاق المسابقات المباشرة مع الطلاب، متابعة الإجابات في الوقت الفعلي، وتصدير إحصائيات الأداء بصيغة PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAIModal}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-900 font-black rounded-2xl text-sm shadow-xl transition flex items-center space-x-2 space-x-reverse cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد بالذكاء الاصطناعي</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="px-5 py-3.5 bg-white hover:bg-indigo-50 text-indigo-700 font-black rounded-2xl text-sm shadow-xl transition flex items-center space-x-2 space-x-reverse cursor-pointer border-b-4 border-indigo-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إنشاء مسابقة مخصصة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مسابقة أو موضوع..."
            className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 outline-none shadow-sm font-semibold"
          />
        </div>

        <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid - Crisp White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-indigo-100 hover:border-indigo-300 flex flex-col justify-between transition transform hover:-translate-y-1 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{quiz.icon || '📝'}</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700">
                  {quiz.subject || 'عام'}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition">{quiz.title}</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed">{quiz.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-4">
                <span className="flex items-center space-x-1 space-x-reverse">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{quiz.questions.length} أسئلة</span>
                </span>
                <span className="flex items-center space-x-1 space-x-reverse">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>~{quiz.questions.length * 20} ثانية</span>
                </span>
              </div>

              <button
                onClick={() => onCreateLiveGame(quiz.id)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2 space-x-reverse cursor-pointer border-b-2 border-indigo-800"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>إنشاء غرفة مسابقة مباشرة</span>
              </button>
            </div>
          </div>
        ))}

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
            <BookOpen className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">لا توجد مسابقات مطابقة لحيّز البحث</p>
            <p className="text-xs text-slate-400 mt-1">جرب إنشاء مسابقة جديدة أو توليد واحدة بالذكاء الاصطناعي</p>
          </div>
        )}
      </div>
    </div>
  );
};
