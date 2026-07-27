import React, { useEffect } from 'react';
import { Check, X, Trophy, Flame, ArrowLeft, Lightbulb } from 'lucide-react';
import { GameSession, Question, Player } from '../types';
import { soundEffects } from '../utils/audio';

interface QuestionResultViewProps {
  session: GameSession;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  onFinishGame: () => void;
}

export const QuestionResultView: React.FC<QuestionResultViewProps> = ({
  session,
  question,
  questionIndex,
  totalQuestions,
  onNextQuestion,
  onFinishGame,
}) => {
  const players: Player[] = Object.values(session.players);
  const totalAnswers = players.filter((p) => p.answers[questionIndex]).length;

  useEffect(() => {
    soundEffects.playCorrect();
  }, []);

  // Calculate answers count per option
  const optionCounts: Record<string, number> = {};
  question.options.forEach((opt) => {
    optionCounts[opt.id] = 0;
  });

  players.forEach((p) => {
    const ans = p.answers[questionIndex];
    if (ans && ans.optionId) {
      optionCounts[ans.optionId] = (optionCounts[ans.optionId] || 0) + 1;
    }
  });

  // Top players sorted by score
  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score).slice(0, 5);

  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  const bgGradient: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="min-h-[85vh] bg-indigo-600 text-white p-4 sm:p-8 flex flex-col justify-between font-sans" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div>
          <span className="bg-white/20 text-indigo-50 px-3 py-1 rounded-full text-xs font-bold mb-1 inline-block">
            إحصائيات الإجابات المباشرة
          </span>
          <h2 className="text-2xl font-black text-white">نتائج السؤال {questionIndex + 1} من {totalQuestions}</h2>
          <p className="text-xs text-indigo-100 font-semibold">{question.text}</p>
        </div>

        <button
          onClick={isLastQuestion ? onFinishGame : onNextQuestion}
          className="flex items-center space-x-2 space-x-reverse px-6 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 text-indigo-900 font-black rounded-2xl text-base transition shadow-xl border-b-4 border-indigo-200 cursor-pointer"
        >
          <span>{isLastQuestion ? 'الانتقال لغرفة التتويج 🏆' : 'السؤال التالي'}</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content: Bar Chart & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 max-w-6xl mx-auto w-full">
        {/* Left Column: Response Bar Chart (7 cols) - Vibrant White Card */}
        <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl border-b-8 border-indigo-200">
          <h3 className="font-black text-slate-800 mb-6 flex items-center justify-between text-base">
            <span>توزيع إجابات المتسابقين</span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
              إجمالي الإجابات: {totalAnswers}
            </span>
          </h3>

          <div className="grid grid-cols-4 gap-4 items-end h-56 pb-2">
            {question.options.map((opt) => {
              const count = optionCounts[opt.id] || 0;
              const heightPercent = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;

              return (
                <div key={opt.id} className="flex flex-col items-center h-full justify-end group">
                  <span className="font-mono font-black text-sm text-indigo-700 mb-2">{count}</span>
                  <div className="w-full bg-slate-100 rounded-t-2xl overflow-hidden h-full flex items-end shadow-inner p-1">
                    <div
                      className={`w-full ${bgGradient[opt.color] || 'bg-indigo-500'} transition-all duration-1000 rounded-t-xl flex items-center justify-center shadow-md`}
                      style={{ height: `${Math.max(12, heightPercent)}%` }}
                    >
                      {opt.isCorrect && <Check className="w-6 h-6 text-white stroke-[3.5]" />}
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg inline-block truncate max-w-[110px] ${
                        opt.isCorrect ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm' : 'text-slate-600 bg-slate-100'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation if available */}
          {question.explanation && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 space-x-reverse text-xs text-slate-800">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-amber-800 block mb-0.5">شرح الإجابة الصحيحة:</span>
                <span className="font-bold">{question.explanation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Leaderboard (5 cols) - Vibrant Aside Card */}
        <div className="lg:col-span-5 bg-white/95 rounded-3xl p-6 shadow-2xl border border-white text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-800 flex items-center space-x-2 space-x-reverse text-xl">
                <span>🏆</span>
                <span>قائمة المتصدرين</span>
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">أفضل 5 مراكز</span>
            </div>

            <div className="space-y-3">
              {sortedLeaderboard.map((player, idx) => {
                const rankStyles = [
                  'bg-amber-50 border-amber-100 text-slate-800',
                  'bg-slate-50 border-slate-100 text-slate-800',
                  'bg-orange-50 border-orange-100 text-slate-800',
                  'bg-slate-50/50 border-transparent text-slate-600',
                  'bg-slate-50/50 border-transparent text-slate-600',
                ];

                const badgeStyles = [
                  'bg-amber-400 text-white',
                  'bg-slate-300 text-white',
                  'bg-orange-300 text-white',
                  'bg-slate-200 text-slate-500',
                  'bg-slate-200 text-slate-500',
                ];

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${rankStyles[idx] || 'bg-slate-50 border-transparent'}`}
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${badgeStyles[idx] || 'bg-slate-200'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{player.nickname}</div>
                        {player.streak > 1 && (
                          <div className="flex items-center space-x-1 space-x-reverse text-[10px] text-amber-600 font-bold uppercase">
                            <span>أسرع استجابة 🔥 ({player.streak} متتالية)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left font-mono font-black text-base text-indigo-600">
                      {player.score.toLocaleString()} <span className="text-[10px] font-sans text-slate-400 font-bold">نقطة</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
