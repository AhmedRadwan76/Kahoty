import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { LobbyView } from './components/LobbyView';
import { QuestionHostView } from './components/QuestionHostView';
import { QuestionResultView } from './components/QuestionResultView';
import { PodiumView } from './components/PodiumView';
import { StudentMobileView } from './components/StudentMobileView';
import { AIQuizModal } from './components/AIQuizModal';
import { CreateQuizModal } from './components/CreateQuizModal';
import { PDFReportModal } from './components/PDFReportModal';

import { Quiz, GameSession, QuizReportData } from './types';
import { SAMPLE_QUIZZES } from './data/sampleQuizzes';

export default function App() {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student' | 'mobile_preview'>('teacher');
  const [quizzes, setQuizzes] = useState<Quiz[]>(SAMPLE_QUIZZES);

  // Active Live Game Session managed by WebSocket
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);

  // Modals state
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<QuizReportData | null>(null);

  // WebSocket Instance
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch Quizzes from Express backend on mount
  useEffect(() => {
    fetch('/api/quizzes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuizzes(data);
        }
      })
      .catch((err) => console.error('Error fetching quizzes:', err));
  }, []);

  // Connect to WebSocket Server on Port 3000
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('⚡ Connected to Kahoot Arab WebSocket Server');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'ROOM_CREATED') {
          setActiveSession(message.session);
        } else if (message.type === 'ROOM_STATE_UPDATE') {
          setActiveSession(message.session);
        }
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    socket.onclose = () => {
      console.log('WS Disconnected, retrying in 3s...');
      setTimeout(() => {
        // Retry connection
      }, 3000);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Check for PIN in URL query parameters (e.g. from scanning QR code)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('pin')) {
        setActiveTab('student');
      }
    }
  }, []);

  // Handlers for Live Game Session
  const handleCreateLiveGame = (quizId: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert('جاري الاتصال بخادم اللعبة، يرجى المحاولة بعد لحظات...');
      return;
    }

    ws.send(
      JSON.stringify({
        action: 'CREATE_ROOM',
        payload: { quizId },
      })
    );
  };

  const handleStartGame = () => {
    if (!activeSession || !ws) return;
    ws.send(
      JSON.stringify({
        action: 'HOST_CONTROL_GAME',
        payload: {
          pin: activeSession.pin,
          nextStage: 'QUESTION_ACTIVE',
          questionIndex: 0,
        },
      })
    );
  };

  const handleTimeUp = () => {
    if (!activeSession || !ws) return;
    ws.send(
      JSON.stringify({
        action: 'HOST_CONTROL_GAME',
        payload: {
          pin: activeSession.pin,
          nextStage: 'QUESTION_RESULT',
        },
      })
    );
  };

  const handleNextQuestion = () => {
    if (!activeSession || !ws) return;
    const nextIdx = activeSession.currentQuestionIndex + 1;
    ws.send(
      JSON.stringify({
        action: 'HOST_CONTROL_GAME',
        payload: {
          pin: activeSession.pin,
          nextStage: 'QUESTION_ACTIVE',
          questionIndex: nextIdx,
        },
      })
    );
  };

  const handleFinishGame = () => {
    if (!activeSession || !ws) return;
    ws.send(
      JSON.stringify({
        action: 'HOST_CONTROL_GAME',
        payload: {
          pin: activeSession.pin,
          nextStage: 'PODIUM',
        },
      })
    );
  };

  const handleExitGame = () => {
    setActiveSession(null);
  };

  // Render Host Screen according to Session Stage
  const renderTeacherLiveView = () => {
    if (!activeSession) {
      return (
        <TeacherDashboard
          quizzes={quizzes}
          onCreateLiveGame={handleCreateLiveGame}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenAIModal={() => setShowAIModal(true)}
          onOpenReportModal={(report) => setSelectedReport(report)}
        />
      );
    }

    const currentQuestion = activeSession.questions[activeSession.currentQuestionIndex];

    switch (activeSession.stage) {
      case 'LOBBY':
        return (
          <LobbyView
            session={activeSession}
            onStartGame={handleStartGame}
            onOpenStudentView={() => setActiveTab('student')}
          />
        );

      case 'QUESTION_ACTIVE':
        return (
          <QuestionHostView
            session={activeSession}
            question={currentQuestion}
            questionIndex={activeSession.currentQuestionIndex}
            totalQuestions={activeSession.questions.length}
            onTimeUp={handleTimeUp}
            onSkipQuestion={handleTimeUp}
          />
        );

      case 'QUESTION_RESULT':
        return (
          <QuestionResultView
            session={activeSession}
            question={currentQuestion}
            questionIndex={activeSession.currentQuestionIndex}
            totalQuestions={activeSession.questions.length}
            onNextQuestion={handleNextQuestion}
            onFinishGame={handleFinishGame}
          />
        );

      case 'PODIUM':
        return (
          <PodiumView
            session={activeSession}
            onOpenReport={(report) => setSelectedReport(report)}
            onExit={handleExitGame}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" dir="rtl">
      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePin={activeSession?.pin}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenAIModal={() => setShowAIModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'teacher' && renderTeacherLiveView()}

        {activeTab === 'student' && (
          <div className="max-w-md mx-auto w-full my-auto p-4 min-h-[80vh] flex flex-col">
            <StudentMobileView ws={ws} defaultPin={activeSession?.pin || ''} isStandaloneMobileFrame={false} />
          </div>
        )}

        {activeTab === 'mobile_preview' && (
          <div className="py-8 bg-slate-100 flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <h2 className="text-xl font-black text-slate-800">شاشة تطبيق جوال الطالب المخصصة</h2>
              <p className="text-xs text-slate-500 font-semibold">معاينة تفاعلية لكيفية مشاركة وإجابة الطالب عبر هاتف الجوال</p>
            </div>
            <StudentMobileView ws={ws} defaultPin={activeSession?.pin || ''} isStandaloneMobileFrame={true} />
          </div>
        )}
      </main>

      {/* Modals */}
      {showAIModal && (
        <AIQuizModal
          onClose={() => setShowAIModal(false)}
          onQuizGenerated={(newQuiz) => {
            setQuizzes([newQuiz, ...quizzes]);
          }}
        />
      )}

      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onQuizCreated={(newQuiz) => {
            setQuizzes([newQuiz, ...quizzes]);
          }}
        />
      )}

      {selectedReport && (
        <PDFReportModal reportData={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}
