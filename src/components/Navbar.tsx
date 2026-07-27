import React from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, BookOpen, Users, PlusCircle, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface NavbarProps {
  activeTab: 'teacher' | 'student' | 'mobile_preview';
  setActiveTab: (tab: 'teacher' | 'student' | 'mobile_preview') => void;
  activePin?: string;
  onOpenCreateModal?: () => void;
  onOpenAIModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activePin,
  onOpenCreateModal,
  onOpenAIModal,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundEffects.enabled);

  const toggleSound = () => {
    soundEffects.enabled = !soundEffects.enabled;
    setSoundEnabled(soundEffects.enabled);
  };

  return (
    <header className="bg-indigo-900/90 backdrop-blur-md border-b border-indigo-700/50 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setActiveTab('teacher')}>
          <div className="w-10 h-10 rounded-2xl bg-white text-indigo-700 flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-950/30">
            ك
          </div>
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="font-black text-xl tracking-tight text-white">
                كويز-إت | كاهوت العرب
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-white/20 text-indigo-100 rounded-full border border-white/30 backdrop-blur-sm">
                تفاعلي
              </span>
            </div>
            <p className="text-xs text-indigo-200 hidden sm:block">منصة المسابقات المباشرة والغرف الجماعية</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 space-x-reverse bg-indigo-950/60 p-1.5 rounded-2xl border border-indigo-700/50">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center space-x-1.5 space-x-reverse px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-950/40'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">لوحة المعلم</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center space-x-1.5 space-x-reverse px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'student'
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-950/40'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>دخول طالب</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile_preview')}
            className={`flex items-center space-x-1.5 space-x-reverse px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'mobile_preview'
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-950/40'
                : 'text-indigo-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">تطبيق الجوال</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
          {activeTab === 'teacher' && onOpenAIModal && (
            <button
              onClick={onOpenAIModal}
              className="hidden lg:flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-xl text-xs font-black shadow-md hover:brightness-110 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد بالذكاء الاصطناعي</span>
            </button>
          )}

          {activeTab === 'teacher' && onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="hidden sm:flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black transition shadow-md border border-indigo-400/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إنشاء مسابقة</span>
            </button>
          )}

          {activePin && (
            <div className="hidden xl:flex items-center space-x-2 space-x-reverse px-4 py-1.5 bg-white text-indigo-700 rounded-2xl font-black shadow-lg shadow-indigo-950/20 border border-indigo-200">
              <span className="text-xs text-indigo-900 font-bold">كود الغرفة:</span>
              <span className="font-mono text-base tracking-widest font-black">{activePin}</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-indigo-800/80 text-indigo-200 hover:text-white hover:bg-indigo-700 border border-indigo-600/50 transition"
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
