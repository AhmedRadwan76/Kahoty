import React, { useState } from 'react';
import { X, FileText, Download, Trophy, Users, CheckCircle2, Clock, Award, BarChart3, HelpCircle } from 'lucide-react';
import { QuizReportData } from '../types';
import { exportReportToPDF } from '../utils/pdfGenerator';

interface PDFReportModalProps {
  reportData: QuizReportData;
  onClose: () => void;
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({ reportData, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await exportReportToPDF('pdf-report-content', `تقرير_مسابقة_${reportData.pin}`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-b-8 border-indigo-200 overflow-hidden my-auto font-sans">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">تقرير نتائج الطلاب والمسابقة</h2>
              <p className="text-xs text-slate-500 font-semibold">إحصائيات تفصيلية جاهزة للتصدير والحفظ بصيغة PDF</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center space-x-2 space-x-reverse px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm transition shadow-lg shadow-indigo-200 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جاري تصدير PDF...' : 'تصدير بصيغة PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Printable Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-950 text-slate-900 font-sans" id="pdf-report-content">
          {/* Document Printable Header */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl border border-purple-700/50 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div>
                <div className="flex items-center space-x-2 space-x-reverse text-purple-300 text-sm font-semibold mb-1">
                  <span>كاهوت العرب - منصة المسابقات التفاعلية</span>
                  <span>•</span>
                  <span>رمز الغرفة: {reportData.pin}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{reportData.quizTitle}</h1>
                <p className="text-xs text-slate-300 mt-1">تاريخ إقامة المسابقة: {reportData.date}</p>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-xs text-purple-200">المركز الأول</div>
                  <div className="font-bold text-lg text-white">
                    {reportData.players[0] ? `${reportData.players[0].avatar} ${reportData.players[0].nickname}` : 'لا يوجد'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">عدد الطلاب المشاركين</div>
                <div className="text-xl font-bold text-slate-800">{reportData.totalPlayers} طالب</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">متوسط دقة الإجابات</div>
                <div className="text-xl font-bold text-slate-800">{reportData.averageAccuracy}%</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">متوسط نقاط الطالب</div>
                <div className="text-xl font-bold text-slate-800">{reportData.averageScore} نقطة</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">إجمالي الأسئلة</div>
                <div className="text-xl font-bold text-slate-800">{reportData.totalQuestions} سؤال</div>
              </div>
            </div>
          </div>

          {/* Table 1: Students Leaderboard and Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>لوحة أداء الطلاب التفصيلية</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">{reportData.players.length} متسابق</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3 text-center">النقاط الإجمالية</th>
                    <th className="p-3 text-center">الإجابات الصحيحة</th>
                    <th className="p-3 text-center">نسبة الدقة</th>
                    <th className="p-3 text-center">متوسط السرعة (ثانية)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.players.map((p) => (
                    <tr key={p.rank} className={p.rank <= 3 ? 'bg-purple-50/50' : 'hover:bg-slate-50'}>
                      <td className="p-3 text-center font-bold">
                        {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <span className="ml-2">{p.avatar}</span>
                        <span>{p.nickname}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-700">{p.score}</td>
                      <td className="p-3 text-center text-slate-700 font-medium">
                        {p.correctCount} / {reportData.totalQuestions}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.accuracy >= 75
                              ? 'bg-emerald-100 text-emerald-700'
                              : p.accuracy >= 50
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {p.accuracy}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-mono">{p.avgResponseTime}ث</td>
                    </tr>
                  ))}
                  {reportData.players.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        لم يشارك طلاب في هذه المسابقة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Questions Difficulty & Performance Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>تحليل أسئلة المسابقة ومستوى الصعوبة</span>
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {reportData.questionsStats.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800">{q.questionText}</span>
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse shrink-0 self-end sm:self-center">
                    <div className="text-left">
                      <div className="text-xs text-slate-500">نسبة النجاح بالسؤال</div>
                      <div className="font-bold text-indigo-600 text-sm">{q.correctPercentage}%</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-slate-500">أسرع إجابة</div>
                      <div className="font-bold text-emerald-600 text-sm">{q.fastestAnswerSec}ث</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
