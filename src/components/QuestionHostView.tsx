import React, { useEffect, useState } from 'react';
import { Clock, Users, ArrowRight, SkipForward } from 'lucide-react';
import { GameSession, Question, Player } from '../types';
import { soundEffects } from '../utils/audio';

interface QuestionHostViewProps {
  session: GameSession;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onTimeUp: () => void;
  onSkipQuestion: () => void;
}

export const QuestionHostView: React.FC<QuestionHostViewProps> = ({
  session,
  question,
  questionIndex,
  totalQuestions,
  onTimeUp,
  onSkipQuestion,
}) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 20);

  const players: Player[] = Object.values(session.players);
  const totalPlayers = players.length;
  const answeredCount = players.filter((p) => p.answers[questionIndex]).length;

  useEffect(() => {
    setTimeLeft(question.timeLimit || 20);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        if (prev <= 5) {
          soundEffects.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questionIndex]);

  // If all players have submitted answers, move to results immediately
  useEffect(() => {
    if (totalPlayers > 0 && answeredCount >= totalPlayers) {
      onTimeUp();
    }
  }, [answeredCount, totalPlayers]);

  const shapeIcons: Record<string, string> = {
    triangle: '▲',
    diamond: '◆',
    circle: '●',
    square: '■',
  };

  const bgGradient: Record<string, string> = {
    red: 'bg-red-500 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-red-200/50 border-2 border-red-400',
    blue: 'bg-blue-500 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-200/50 border-2 border-blue-400',
    yellow: 'bg-yellow-500 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-yellow-200/50 border-2 border-yellow-300',
    green: 'bg-green-500 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-green-200/50 border-2 border-green-400',
  };

  return (
    <div className="min-h-[85vh] bg-indigo-600 text-white p-4 sm:p-8 flex flex-col justify-between font-sans relative" dir="rtl">
      {/* Top Bar Info */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="px-4 py-1.5 bg-white text-indigo-700 font-black rounded-2xl text-sm shadow-md">
            السؤال {questionIndex + 1} من {totalQuestions}
          </span>
          <span className="text-indigo-100 text-sm font-bold hidden sm:inline">{session.quizTitle}</span>
        </div>

        <button
          onClick={onSkipQuestion}
          className="flex items-center space-x-1.5 space-x-reverse px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold border border-white/20 transition backdrop-blur-sm"
        >
          <SkipForward className="w-4 h-4" />
          <span>إنهاء الوقت وعرض النتيجة</span>
        </button>
      </div>

      {/* Main Center Stage: Timer, Question & Answers Counter */}
      <div className="my-auto py-6 space-y-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Circular Animated Timer */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0 bg-white/10 rounded-full p-2 border border-white/20 shadow-xl backdrop-blur-sm">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" className="stroke-white/20 fill-none stroke-[8]" />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className={`fill-none stroke-[8] transition-all duration-1000 ${
                  timeLeft <= 5 ? 'stroke-red-400' : 'stroke-amber-300'
                }`}
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * timeLeft) / (question.timeLimit || 20)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl sm:text-4xl font-black font-mono ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                {timeLeft}
              </span>
              <span className="text-[10px] text-indigo-200 font-bold">ثانية</span>
            </div>
          </div>

          {/* Question Text Card - High Contrast Crisp White Card */}
          <div className="flex-1 bg-white text-slate-800 rounded-3xl p-8 shadow-xl border-b-8 border-indigo-200 text-center relative">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-xs sm:text-sm font-black mb-4 inline-block">
              سؤال المسابقة المباشر
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 leading-tight">
              {question.text}
            </h2>
          </div>

          {/* Submissions Counter */}
          <div className="bg-white/10 border border-white/20 p-5 rounded-3xl flex flex-col items-center justify-center shrink-0 min-w-32 text-center shadow-xl backdrop-blur-sm">
            <Users className="w-6 h-6 text-amber-300 mb-1" />
            <span className="text-3xl sm:text-4xl font-black font-mono text-white">
              {answeredCount}
            </span>
            <span className="text-xs text-indigo-100 font-bold">من أصل {totalPlayers} أجابوا</span>
          </div>
        </div>

        {/* 4 Colored Answer Options Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className={`p-6 rounded-2xl flex items-center space-x-4 space-x-reverse transition ${
                bgGradient[opt.color] || 'bg-white/10 border border-white/20 text-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-2xl font-black shrink-0 text-white">
                {shapeIcons[opt.shape]}
              </div>
              <span className="font-black text-xl text-white flex-1">{opt.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-indigo-200 border-t border-white/20 pt-3 font-semibold">
        يُعرض كود الإجابات الملونة على شاشة الجوال لدى المتسابقين للمشاركة الفورية.
      </div>
    </div>
  );
};
