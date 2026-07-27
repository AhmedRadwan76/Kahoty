import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';
import { Quiz, Question, Option, OptionColor, OptionShape } from '../types';

interface CreateQuizModalProps {
  onClose: () => void;
  onQuizCreated: (quiz: Quiz) => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ onClose, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('عام');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}`,
      text: '',
      type: 'multiple_choice',
      timeLimit: 20,
      pointsMultiplier: 1000,
      options: [
        { id: 'opt-1', text: '', isCorrect: true, color: 'red', shape: 'triangle' },
        { id: 'opt-2', text: '', isCorrect: false, color: 'blue', shape: 'diamond' },
        { id: 'opt-3', text: '', isCorrect: false, color: 'yellow', shape: 'circle' },
        { id: 'opt-4', text: '', isCorrect: false, color: 'green', shape: 'square' },
      ],
    },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const colors: OptionColor[] = ['red', 'blue', 'yellow', 'green'];
  const shapes: OptionShape[] = ['triangle', 'diamond', 'circle', 'square'];

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}-${questions.length}`,
        text: '',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        options: [
          { id: `opt-${questions.length}-1`, text: '', isCorrect: true, color: 'red', shape: 'triangle' },
          { id: `opt-${questions.length}-2`, text: '', isCorrect: false, color: 'blue', shape: 'diamond' },
          { id: `opt-${questions.length}-3`, text: '', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: `opt-${questions.length}-4`, text: '', isCorrect: false, color: 'green', shape: 'square' },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].text = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optIndex;
    });
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('من فضل أدخل عنوان المسابقة');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setErrorMsg(`السؤال رقم ${i + 1} يفتقد إلى نص السؤال`);
        return;
      }
      const hasEmptyOpt = questions[i].options.some((o) => !o.text.trim());
      if (hasEmptyOpt) {
        setErrorMsg(`السؤال رقم ${i + 1} يحتوي على خيارات إجابة فارغة`);
        return;
      }
    }

    const newQuiz: Quiz = {
      id: `quiz-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'مسابقة مخصصة جديدة',
      subject: subject.trim(),
      icon: '📝',
      createdAt: new Date().toISOString(),
      questions,
    };

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });
      const data = await res.json();
      onQuizCreated(data);
      onClose();
    } catch (err) {
      setErrorMsg('فشل حفظ المسابقة على الخادم');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-b-8 border-indigo-200 relative my-auto max-h-[90vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
          <h2 className="text-xl font-black text-slate-800 flex items-center space-x-2 space-x-reverse">
            <Plus className="w-5 h-5 text-indigo-600" />
            <span>إنشاء مسابقة تفاعلية جديدة</span>
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-6 pr-1 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المسابقة:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مسابقة الجغرافيا للوطن العربي"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة / التصنيف:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: علوم، جغرافيا"
                className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف قصير:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مبسط للمسابقة..."
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
            />
          </div>

          {/* Questions Builder Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <h3 className="font-black text-indigo-700 text-sm">أسئلة المسابقة ({questions.length})</h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال جديد</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-indigo-600">سؤال #{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="نص السؤال باللغة العربية..."
                    className="w-full p-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-sm text-slate-800 font-bold placeholder-slate-400 outline-none"
                  />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border-2 flex items-center space-x-2 space-x-reverse ${
                        opt.isCorrect ? 'bg-green-50 border-green-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition cursor-pointer ${
                          opt.isCorrect ? 'bg-green-600 border-green-600 text-white font-bold' : 'border-slate-300'
                        }`}
                        title="تحديد كإجابة صحيحة"
                      >
                        {opt.isCorrect && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                        placeholder={`الخيار ${optIdx + 1}...`}
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl transition cursor-pointer border-b-4 border-indigo-800"
          >
            حفظ المسابقة والرجوع للوحة التحكم
          </button>
        </form>
      </div>
    </div>
  );
};
