import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, HelpCircle } from 'lucide-react';
import { Quiz } from '../types';

interface AIQuizModalProps {
  onClose: () => void;
  onQuizGenerated: (quiz: Quiz) => void;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({ onClose, onQuizGenerated }) => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('من فضل أدخل موضوع المسابقة أولاً');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), questionCount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد المسابقة بالذكاء الاصطناعي');
      }

      onQuizGenerated(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-white text-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-b-8 border-indigo-200 relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">توليد مسابقة بالذكاء الاصطناعي</h2>
            <p className="text-xs text-slate-500 font-semibold">أدخل أي موضوع أو درس وسيقوم Gemini بإنشاء الأسئلة فورياً</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موضوع المسابقة أو نص الدرس:</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: أساسيات الطاقة الشمسية والكهرباء للصف الثاني الإعدادي..."
              rows={4}
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none resize-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأسئلة المطلوب توليدها:</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2.5 rounded-2xl text-xs font-black border-2 transition cursor-pointer ${
                    questionCount === count
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {count} أسئلة
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-105 text-slate-900 font-black text-sm rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 space-x-reverse cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                <span>جاري إنشاء وتنسيق الأسئلة بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ولد المسابقة الآن ✨</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
