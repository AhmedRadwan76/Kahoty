import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, XCircle, Flame, Trophy, Send, Users, Sparkles, RefreshCw } from 'lucide-react';
import { GameSession, Player } from '../types';
import { soundEffects } from '../utils/audio';

interface StudentMobileViewProps {
  ws: WebSocket | null;
  defaultPin?: string;
  isStandaloneMobileFrame?: boolean;
}

const AVATARS = ['🦁', '🚀', '🦊', '👑', '🦉', '🐯', '🐼', '⚡', '🌟', '🦄', '🏆', '🎯'];

export const StudentMobileView: React.FC<StudentMobileViewProps> = ({
  ws,
  defaultPin = '',
  isStandaloneMobileFrame = false,
}) => {
  const [pin, setPin] = useState(defaultPin);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const [session, setSession] = useState<GameSession | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [answerAck, setAnswerAck] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    score: number;
    streak: number;
    rank: number;
  } | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [fromQR, setFromQR] = useState<boolean>(false);

  useEffect(() => {
    if (defaultPin) {
      setPin(defaultPin);
    } else if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPin = urlParams.get('pin');
      if (urlPin) {
        setPin(urlPin);
        setFromQR(true);
      }
    }
  }, [defaultPin]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'JOIN_SUCCESS') {
          setPlayerId(message.playerId);
          setSession(message.session);
          setErrorMsg(null);
        } else if (message.type === 'ROOM_STATE_UPDATE') {
          const updatedSession: GameSession = message.session;
          setSession(updatedSession);

          // Reset submission state if stage changed to QUESTION_ACTIVE
          if (updatedSession.stage === 'QUESTION_ACTIVE' && updatedSession.questionStartTime) {
            setQuestionStartTime(updatedSession.questionStartTime);
          }
        } else if (message.type === 'ANSWER_ACK') {
          setAnswerAck({
            isCorrect: message.isCorrect,
            pointsEarned: message.pointsEarned,
            score: message.score,
            streak: message.streak,
            rank: message.rank,
          });

          if (message.isCorrect) {
            soundEffects.playCorrect();
          } else {
            soundEffects.playWrong();
          }
        } else if (message.type === 'ERROR') {
          setErrorMsg(message.message);
        }
      } catch (err) {
        console.error('Student WS Error:', err);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  // Reset answer states on new question
  useEffect(() => {
    if (session?.stage === 'QUESTION_ACTIVE') {
      setHasSubmitted(false);
      setAnswerAck(null);
      setQuestionStartTime(Date.now());
    }
  }, [session?.currentQuestionIndex, session?.stage]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) {
      setErrorMsg('من فضل أدخل رمز اللعبة واسمك المشارك');
      return;
    }

    setIsJoining(true);
    setErrorMsg(null);

    const trySendJoin = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            action: 'JOIN_ROOM',
            payload: {
              pin: pin.trim(),
              nickname: nickname.trim(),
              avatar,
            },
          })
        );
        setIsJoining(false);
      } else {
        // If connecting, wait a bit and retry
        setTimeout(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                action: 'JOIN_ROOM',
                payload: {
                  pin: pin.trim(),
                  nickname: nickname.trim(),
                  avatar,
                },
              })
            );
            setIsJoining(false);
          } else {
            setIsJoining(false);
            setErrorMsg('تعذر الاتصال بخادم اللعبة المباشر، تأكد من كود الدخول أو جرب مرة أخرى.');
          }
        }, 1500);
      }
    };

    trySendJoin();
  };

  const handleSubmitAnswer = (optionId: string) => {
    if (hasSubmitted || !session || !playerId || !ws) return;

    const responseTimeSec = Math.max(0.1, (Date.now() - questionStartTime) / 1000);
    setHasSubmitted(true);

    ws.send(
      JSON.stringify({
        action: 'SUBMIT_ANSWER',
        payload: {
          pin: session.pin,
          playerId,
          optionId,
          responseTimeSec,
        },
      })
    );
  };

  // Render Inner Content
  const renderStudentScreen = () => {
    // 1. Join Form State
    if (!playerId || !session) {
      return (
        <div className="flex-1 flex flex-col justify-center p-6 bg-indigo-600 text-white font-sans" dir="rtl">
          <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl border-b-8 border-indigo-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl mx-auto mb-2 shadow-lg shadow-indigo-200">
                ك
              </div>
              <h2 className="text-2xl font-black text-slate-800">انضم للمسابقة</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">أدخل كود الفصل واختبر معلوماتك فورياً</p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              {fromQR && pin && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-800 text-xs text-center font-extrabold flex items-center justify-center space-x-1.5 space-x-reverse">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>تم مسح رمز الـ QR بنجاح! أدخل اسمك للبدء</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رمز اللعبة (Game PIN):</label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="مثال: 482910"
                  maxLength={6}
                  className="w-full text-center text-2xl font-black font-mono tracking-widest bg-indigo-50 border-2 border-indigo-200 focus:border-indigo-500 rounded-2xl p-3 text-indigo-700 placeholder-indigo-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسمك أو لقبك:</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="أدخل اسمك هنا"
                  maxLength={15}
                  autoFocus={Boolean(pin)}
                  className="w-full text-center text-base font-bold bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl p-3 text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">اختر الأيقونة الرمزية:</label>
                <div className="grid grid-cols-6 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  {AVATARS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-xl transition ${
                        avatar === emoji ? 'bg-indigo-600 text-white scale-110 shadow-md' : 'hover:bg-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center space-x-2 space-x-reverse border-b-4 border-indigo-800 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>دخول الغرفة</span>
              </button>
            </form>
          </div>
        </div>
      );
    }

    const currentPlayer: Player | undefined = session.players[playerId];

    // 2. Lobby / Waiting State
    if (session.stage === 'LOBBY' || session.stage === 'QUESTION_INTRO') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-indigo-600 text-white text-center font-sans" dir="rtl">
          <div className="text-6xl mb-4 animate-bounce">{currentPlayer?.avatar || '🦁'}</div>
          <h2 className="text-3xl font-black text-white">أهلاً بك، {currentPlayer?.nickname}!</h2>
          <p className="text-sm text-indigo-100 font-bold mt-1">أنت الآن متصل بالغرفة #{session.pin}</p>

          <div className="my-8 p-6 bg-white text-slate-800 rounded-3xl w-full max-w-sm shadow-2xl border-b-8 border-indigo-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="font-black text-slate-800 text-lg">شاهد شاشة المعلم واستعد!</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">ستظهر خيارات الإجابات الملونة على جهازك فور بدء السؤال.</p>
          </div>
        </div>
      );
    }

    // 3. Question Active State - Big Touch Choice Buttons
    if (session.stage === 'QUESTION_ACTIVE') {
      const currentQ = session.questions[session.currentQuestionIndex];

      if (hasSubmitted) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-indigo-600 text-white text-center font-sans" dir="rtl">
            {answerAck ? (
              <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-2xl border-b-8 border-indigo-200 w-full max-w-sm space-y-4 animate-fade-in">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg ${
                  answerAck.isCorrect ? 'bg-green-100 text-green-600 border-4 border-green-400' : 'bg-red-100 text-red-600 border-4 border-red-400'
                }`}>
                  {answerAck.isCorrect ? <CheckCircle className="w-14 h-14" /> : <XCircle className="w-14 h-14" />}
                </div>

                <h2 className={`text-2xl font-black ${answerAck.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {answerAck.isCorrect ? 'إجابة صحيحة! 🎉' : 'إجابة خاطئة! ❌'}
                </h2>

                {answerAck.isCorrect && (
                  <div className="text-2xl font-mono font-black text-indigo-700">
                    +{answerAck.pointsEarned} نقطة
                  </div>
                )}

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-around text-xs font-bold text-slate-700">
                  <div>
                    <span className="text-slate-500 block">المجموع:</span>
                    <span className="font-black text-base text-indigo-700 font-mono">{answerAck.score}</span>
                  </div>
                  {answerAck.streak > 1 && (
                    <div>
                      <span className="text-slate-500 block">السلسلة:</span>
                      <span className="font-black text-base text-amber-600 font-mono">{answerAck.streak} 🔥</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block">ترتيبك:</span>
                    <span className="font-black text-base text-indigo-700 font-mono">#{answerAck.rank}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-2xl border-b-8 border-indigo-200 space-y-4 max-w-sm w-full">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-xl font-black text-slate-800">تم تسليم إجابتك!</h3>
                <p className="text-xs text-slate-500 font-bold">في انتظار انتهاء الوقت ومتابعة النتيجة...</p>
              </div>
            )}
          </div>
        );
      }

      return (
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-indigo-600 text-white font-sans" dir="rtl">
          <div className="text-center py-2">
            <span className="px-4 py-1.5 bg-white text-indigo-700 rounded-full text-xs font-black shadow-md">
              السؤال {session.currentQuestionIndex + 1} - اختر إجابتك الملونة بسرعة!
            </span>
          </div>

          {/* Big High-Contrast Touch Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto">
            {currentQ?.options.map((opt) => {
              const colors: Record<string, string> = {
                red: 'bg-red-500 hover:bg-red-600 active:scale-95 text-white border-2 border-red-400 shadow-lg shadow-red-200/50',
                blue: 'bg-blue-500 hover:bg-blue-600 active:scale-95 text-white border-2 border-blue-400 shadow-lg shadow-blue-200/50',
                yellow: 'bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-white border-2 border-yellow-300 shadow-lg shadow-yellow-200/50',
                green: 'bg-green-500 hover:bg-green-600 active:scale-95 text-white border-2 border-green-400 shadow-lg shadow-green-200/50',
              };

              const shapes: Record<string, string> = {
                triangle: '▲',
                diamond: '◆',
                circle: '●',
                square: '■',
              };

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSubmitAnswer(opt.id)}
                  className={`p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center transition transform cursor-pointer min-h-[140px] sm:min-h-[180px] ${
                    colors[opt.color] || 'bg-white text-slate-800'
                  }`}
                >
                  <span className="text-4xl sm:text-5xl font-black mb-2">{shapes[opt.shape]}</span>
                  <span className="text-sm sm:text-base font-black tracking-tight">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-indigo-100 font-bold py-2">
            انقر على اللون أو الشكل المقابل للإجابة الصحيحة بسرعة!
          </div>
        </div>
      );
    }

    // 4. Question Result or Podium State
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-indigo-600 text-white text-center font-sans" dir="rtl">
        <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-2xl border-b-8 border-indigo-200 max-w-xs w-full">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-2xl font-black text-slate-800">
            {session.stage === 'PODIUM' ? 'انتهت المسابقة! 🏆' : 'انتهى وقت السؤال'}
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">شاهد الترتيب والنتائج التفصيلية على شاشة المعلم</p>

          {currentPlayer && (
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl w-full font-mono">
              <div className="text-xs text-slate-500 font-sans font-bold">مجموع نقاطك الكلي:</div>
              <div className="text-3xl font-black text-indigo-700 my-1">{currentPlayer.score.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isStandaloneMobileFrame) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-[380px] h-[720px] bg-slate-900 border-4 border-slate-700 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative ring-8 ring-slate-800/50">
          {/* Mobile Speaker Notch */}
          <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto z-20 shrink-0" />
          {renderStudentScreen()}
        </div>
      </div>
    );
  }

  return renderStudentScreen();
};
