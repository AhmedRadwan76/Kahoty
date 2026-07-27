import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, FileText, Home, Sparkles, Award } from 'lucide-react';
import { GameSession, QuizReportData, Player } from '../types';
import { soundEffects } from '../utils/audio';

interface PodiumViewProps {
  session: GameSession;
  onOpenReport: (reportData: QuizReportData) => void;
  onExit: () => void;
}

export const PodiumView: React.FC<PodiumViewProps> = ({ session, onOpenReport, onExit }) => {
  const [reportData, setReportData] = useState<QuizReportData | null>(null);

  const sortedPlayers: Player[] = (Object.values(session.players) as Player[]).sort((a, b) => b.score - a.score);
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  useEffect(() => {
    soundEffects.playFanfare();

    // Trigger confetti cannon
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    // Fetch PDF Report Data from server API
    fetch(`/api/game/${session.pin}/report`)
      .then((res) => res.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error('Failed to load report:', err));
  }, []);

  return (
    <div className="min-h-[85vh] bg-indigo-600 text-white p-4 sm:p-8 flex flex-col justify-between items-center font-sans relative overflow-hidden" dir="rtl">
      {/* Top Banner */}
      <div className="text-center space-y-2 mt-4">
        <div className="inline-flex items-center space-x-2 space-x-reverse px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-sm font-bold backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>تتويج الأبطال - نهاية المسابقة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{session.quizTitle}</h1>
      </div>

      {/* Podium Stage */}
      <div className="w-full max-w-3xl my-auto py-8 flex items-end justify-center gap-3 sm:gap-6 px-2">
        {/* 2nd Place Podium */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[180px]">
            <div className="text-3xl sm:text-4xl mb-2 animate-bounce">{second.avatar}</div>
            <div className="font-black text-sm sm:text-base text-white text-center truncate w-full">
              {second.nickname}
            </div>
            <div className="text-xs text-indigo-100 font-mono font-bold mb-2">{second.score.toLocaleString()} نقطة</div>
            <div className="w-full bg-white text-slate-800 border-t-8 border-slate-300 h-36 sm:h-48 rounded-t-3xl flex flex-col items-center justify-center p-2 shadow-2xl">
              <span className="text-3xl sm:text-4xl">🥈</span>
              <span className="text-xs font-black text-slate-700 mt-1">المركز الثاني</span>
            </div>
          </div>
        )}

        {/* 1st Place Champion Podium */}
        {first && (
          <div className="flex flex-col items-center flex-1 max-w-[220px] -mt-8">
            <div className="text-4xl sm:text-6xl mb-2 animate-bounce">👑 {first.avatar}</div>
            <div className="font-black text-base sm:text-xl text-amber-300 text-center truncate w-full">
              {first.nickname}
            </div>
            <div className="text-sm text-amber-200 font-mono font-black mb-2">{first.score.toLocaleString()} نقطة</div>
            <div className="w-full bg-white text-slate-800 border-t-8 border-amber-400 h-48 sm:h-64 rounded-t-3xl flex flex-col items-center justify-center p-2 shadow-2xl">
              <span className="text-4xl sm:text-5xl">🥇</span>
              <span className="text-sm font-black text-indigo-700 mt-1">البطل الأول</span>
            </div>
          </div>
        )}

        {/* 3rd Place Podium */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[180px]">
            <div className="text-3xl sm:text-4xl mb-2">{third.avatar}</div>
            <div className="font-black text-sm sm:text-base text-white text-center truncate w-full">
              {third.nickname}
            </div>
            <div className="text-xs text-amber-200 font-mono font-bold mb-2">{third.score.toLocaleString()} نقطة</div>
            <div className="w-full bg-white text-slate-800 border-t-8 border-amber-600 h-28 sm:h-36 rounded-t-3xl flex flex-col items-center justify-center p-2 shadow-2xl">
              <span className="text-3xl sm:text-4xl">🥉</span>
              <span className="text-xs font-black text-slate-700 mt-1">المركز الثالث</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-4">
        {reportData && (
          <button
            onClick={() => onOpenReport(reportData)}
            className="w-full sm:w-auto flex-1 py-4 px-6 bg-white text-indigo-700 hover:bg-indigo-50 font-black text-sm rounded-2xl shadow-2xl transition border-b-4 border-indigo-200 flex items-center justify-center space-x-2 space-x-reverse cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span>تصدير تقرير PDF مفصل</span>
          </button>
        )}

        <button
          onClick={onExit}
          className="w-full sm:w-auto py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition backdrop-blur-sm flex items-center justify-center space-x-2 space-x-reverse cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>لوحة المعلم الرئيسية</span>
        </button>
      </div>
    </div>
  );
};
