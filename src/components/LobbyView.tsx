import React, { useState, useEffect, useRef } from 'react';
import { Users, Play, Copy, Check, Sparkles, QrCode, X, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GameSession, Player } from '../types';
import { soundEffects } from '../utils/audio';

interface LobbyViewProps {
  session: GameSession;
  onStartGame: () => void;
  onOpenStudentView?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ session, onStartGame, onOpenStudentView }) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customHost, setCustomHost] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);

  const players: Player[] = Object.values(session.players);
  const prevCountRef = useRef<number>(players.length);

  // Play sound effect when new player joins
  useEffect(() => {
    if (players.length > prevCountRef.current) {
      soundEffects.playJoin();
    }
    prevCountRef.current = players.length;
  }, [players.length]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  // Use customHost if set, otherwise current origin
  const baseUrl = customHost.trim() || currentOrigin;
  const joinUrl = `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : '/'}?pin=${session.pin}`;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(session.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[85vh] bg-indigo-600 text-white p-4 sm:p-8 flex flex-col items-center justify-between font-sans relative overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info & PIN Banner */}
      <div className="w-full max-w-4xl text-center space-y-6 relative z-10 mt-2">
        <div className="inline-flex items-center space-x-2 space-x-reverse px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-indigo-50 text-sm font-bold backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>غرفة اللعب الجماعي المباشرة جاهزة للانضمام</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">{session.quizTitle}</h1>

        {/* PIN & QR Code Container */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border-b-8 border-indigo-200 max-w-3xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* PIN Column */}
            <div className="md:col-span-2 text-right md:text-right">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black mb-3 inline-block">
                كود دخول الفصل المباشر
              </span>

              <p className="text-xs sm:text-sm text-slate-600 font-bold mb-3">
                افتح صفحة الطالب أو أمْسَح رمز الـ QR للانضمام فوراً:
              </p>

              <div className="flex items-center space-x-3 space-x-reverse my-2">
                <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-6 sm:px-8 py-3 rounded-2xl font-black text-4xl sm:text-6xl shadow-inner tracking-widest font-mono flex-1 text-center">
                  {session.pin}
                </div>
                <button
                  onClick={handleCopyPin}
                  className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-300 transition shadow-md cursor-pointer shrink-0"
                  title="نسخ رمز الدخول"
                >
                  {copiedPin ? <Check className="w-6 h-6 text-emerald-600" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition border border-slate-200 flex items-center space-x-1.5 space-x-reverse cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-slate-500" />}
                  <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط الدخول المباشر'}</span>
                </button>

                {onOpenStudentView && (
                  <button
                    onClick={onOpenStudentView}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center space-x-1.5 space-x-reverse cursor-pointer"
                  >
                    <span>فتح شاشة الطالب تجريبياً 📱</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live QR Code Box */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl relative group cursor-pointer" onClick={() => setShowQRModal(true)}>
              <div className="bg-white p-2.5 rounded-xl shadow-md border border-slate-100">
                <QRCodeSVG
                  value={joinUrl}
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="text-[11px] font-bold text-indigo-700 mt-2 flex items-center space-x-1 space-x-reverse">
                <QrCode className="w-3.5 h-3.5" />
                <span>انقر لتكبير الـ QR</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Enlarged Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-md overflow-y-auto" dir="rtl">
          <div className="bg-white text-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-b-8 border-indigo-200 relative text-center my-8">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-1">رمز الـ QR المباشر للمسابقة</h3>
            <p className="text-xs text-slate-500 font-bold mb-4">كود غرفة اللعبة: #{session.pin}</p>

            <div className="bg-slate-50 p-5 rounded-3xl border-2 border-indigo-100 inline-block shadow-inner mb-4">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-3 text-right">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 leading-relaxed font-semibold">
                <p className="font-bold mb-1 text-amber-950 flex items-center gap-1">
                  <span>💡 تنبيه بسيط لتجربة الاختبار:</span>
                </p>
                <p>
                  روابط بيئة التطوير المحلية محميّة بـ Google AI Studio، لذلك يُفضّل اختيار أحد الخيارات التالية للانضمام:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-[11px] font-bold text-amber-800">
                  <li>الضغط على زر <b>"شاشة الطالب 📱"</b> بأعلى الشاشة للانضمام فوراً بنفس المتصفح.</li>
                  <li>مشاركة التطبيق عبر زر <b>Share</b> في أعلى AI Studio للحصول على رابط عام مفتوح للجميع.</li>
                </ul>
              </div>

              {/* Optional Custom Public Host Input */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  رابط الـ QR الحالي (يمكنك تعديل الدومين إذا قمت بنشره):
                </label>
                <input
                  type="text"
                  value={customHost}
                  onChange={(e) => setCustomHost(e.target.value)}
                  placeholder={currentOrigin || 'https://your-app-domain.com'}
                  dir="ltr"
                  className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1 space-x-reverse cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <ExternalLink className="w-4 h-4" />}
                  <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ رابط الدخول'}</span>
                </button>
                {onOpenStudentView && (
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      onOpenStudentView();
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
                  >
                    شاشة الطالب 📱
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Players Grid */}
      <div className="w-full max-w-5xl my-6 relative z-10 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center space-x-2 space-x-reverse text-white font-black text-xl">
            <Users className="w-6 h-6 text-amber-300" />
            <span>المشاركون النشطون ({players.length})</span>
          </div>

          <div className="text-xs text-indigo-100 font-bold">
            {players.length === 0 ? 'في انتظار دخول أول متسابق...' : 'الطلاب يظهرون فورياً على الشاشة! ⚡'}
          </div>
        </div>

        {players.length === 0 ? (
          <div className="bg-white/10 border-2 border-dashed border-white/30 rounded-3xl p-10 text-center text-white backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-3xl animate-bounce">
              🎮
            </div>
            <p className="font-black text-white text-xl">في انتظار انضمام الطلاب...</p>
            <p className="text-sm text-indigo-100 mt-1 font-medium">
              أدخل الكود <span className="font-mono font-black text-amber-300">{session.pin}</span> من أي جهاز للانضمام فوراً
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-2">
            {players.map((p) => (
              <div
                key={p.id}
                className="bg-white/95 border border-indigo-100 p-3.5 rounded-2xl flex items-center space-x-3 space-x-reverse shadow-lg transition transform hover:-translate-y-0.5 text-slate-800 animate-scale-in"
              >
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-extrabold text-sm text-slate-800 truncate">{p.nickname}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Game Action */}
      <div className="w-full max-w-md text-center relative z-10 mb-4">
        <button
          onClick={onStartGame}
          disabled={players.length === 0}
          className="w-full py-4 px-8 bg-white text-indigo-700 disabled:bg-indigo-300 disabled:text-indigo-500 font-black text-xl rounded-2xl shadow-2xl shadow-indigo-950/40 border-b-4 border-indigo-200 hover:bg-indigo-50 transition transform active:scale-95 flex items-center justify-center space-x-3 space-x-reverse cursor-pointer disabled:cursor-not-allowed"
        >
          <Play className="w-7 h-7 fill-indigo-700" />
          <span>ابدأ المسابقة الآن ({players.length} طالب)</span>
        </button>
      </div>
    </div>
  );
};
