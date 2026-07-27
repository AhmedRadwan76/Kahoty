import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_QUIZZES } from './src/data/sampleQuizzes';
import { GameSession, Player, Quiz, QuizReportData } from './src/types';

const PORT = 3000;
const app = express();
app.use(express.json());

// In-memory quiz storage
const customQuizzes: Quiz[] = [];

// Active Game Sessions by PIN
const activeSessions: Map<string, GameSession> = new Map();

// Active WS connections mapped by PIN
interface WSClient {
  ws: WebSocket;
  pin: string;
  isHost: boolean;
  playerId?: string;
}
const roomClients: Map<string, Set<WSClient>> = new Map();

function generatePin(): string {
  let pin = '';
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (activeSessions.has(pin));
  return pin;
}

function broadcastRoomState(pin: string) {
  const session = activeSessions.get(pin);
  if (!session) return;

  const clients = roomClients.get(pin);
  if (!clients) return;

  const payload = JSON.stringify({
    type: 'ROOM_STATE_UPDATE',
    session,
  });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

function calculateScore(timeLimitSec: number, responseTimeSec: number, basePoints: number = 1000): number {
  if (responseTimeSec <= 0.5) return basePoints;
  const clampedRatio = Math.min(1, Math.max(0, responseTimeSec / timeLimitSec));
  // Response speed factor ranges from 1.0 (instant) down to 0.5 (at time limit expiry)
  const timeFactor = 1 - (clampedRatio / 2);
  return Math.round(basePoints * timeFactor);
}

// REST Endpoints
app.get('/api/quizzes', (req, res) => {
  res.json([...SAMPLE_QUIZZES, ...customQuizzes]);
});

app.post('/api/quizzes', (req, res) => {
  const newQuiz: Quiz = {
    ...req.body,
    id: `quiz-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  customQuizzes.unshift(newQuiz);
  res.json(newQuiz);
});

app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { topic, questionCount = 4 } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'من فضل تقديم عنوان أو موضوع الاختبار' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY غير متوفر في بيئة التشغيل.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت معلم خبير في إنشاء المسابقات التفاعلية باللغة العربية بأسلوب كاهوت (Kahoot).
أنشئ مسابقة مكونة من ${questionCount} أسئلة عن الموضوع التالي: "${topic}".
يجب أن تكون الأسئلة واضحة، تفاعلية، ومشوقة مع خيارات متعددة (4 خيارات لكل سؤال).
حدد لكل سؤال الخيار الصحيح وشرحاً مبسطاً.

قم بالرد بكتلة JSON بالصيغة التالية تماماً:
{
  "title": "عنوان المسابقة المشوق",
  "description": "وصف قصير للمسابقة",
  "subject": "المادة أو المجال",
  "questions": [
    {
      "text": "نص السؤال باللغة العربية",
      "type": "multiple_choice",
      "timeLimit": 20,
      "explanation": "شرح الإجابة الصحيحة",
      "options": [
        { "text": "الخيار الأول", "isCorrect": true },
        { "text": "الخيار الثاني", "isCorrect": false },
        { "text": "الخيار الثالث", "isCorrect": false },
        { "text": "الخيار الرابع", "isCorrect": false }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const generatedData = JSON.parse(rawText);

    // Format options with Kahoot colors and shapes
    const colors: ('red' | 'blue' | 'yellow' | 'green')[] = ['red', 'blue', 'yellow', 'green'];
    const shapes: ('triangle' | 'diamond' | 'circle' | 'square')[] = ['triangle', 'diamond', 'circle', 'square'];

    const formattedQuiz: Quiz = {
      id: `ai-quiz-${Date.now()}`,
      title: generatedData.title || `مسابقة: ${topic}`,
      description: generatedData.description || 'مسابقة تم إنشاؤها بوساطة الذكاء الاصطناعي',
      subject: generatedData.subject || topic,
      icon: '✨',
      createdAt: new Date().toISOString(),
      questions: (generatedData.questions || []).map((q: any, qIdx: number) => ({
        id: `q-ai-${qIdx}-${Date.now()}`,
        text: q.text,
        type: q.type || 'multiple_choice',
        timeLimit: q.timeLimit || 20,
        pointsMultiplier: 1000,
        explanation: q.explanation || '',
        options: (q.options || []).map((opt: any, optIdx: number) => ({
          id: `opt-${qIdx}-${optIdx}`,
          text: opt.text,
          isCorrect: Boolean(opt.isCorrect),
          color: colors[optIdx % 4],
          shape: shapes[optIdx % 4],
        })),
      })),
    };

    customQuizzes.unshift(formattedQuiz);
    res.json(formattedQuiz);
  } catch (error: any) {
    console.error('AI Quiz generation error:', error);
    res.status(500).json({ error: error?.message || 'فشل توليد المسابقة بالذكاء الاصطناعي' });
  }
});

app.get('/api/game/:pin/report', (req, res) => {
  const pin = req.params.pin;
  const session = activeSessions.get(pin);
  if (!session) {
    return res.status(404).json({ error: 'غرفة اللعبة غير موجودة' });
  }

  const playerList = Object.values(session.players);
  const sortedPlayers = [...playerList].sort((a, b) => b.score - a.score);

  const totalPlayers = playerList.length;
  const totalQuestions = session.questions.length;

  let totalCorrect = 0;
  let totalAnswersCount = 0;

  sortedPlayers.forEach((p) => {
    Object.values(p.answers).forEach((ans) => {
      totalAnswersCount++;
      if (ans.isCorrect) totalCorrect++;
    });
  });

  const averageAccuracy = totalAnswersCount > 0 ? Math.round((totalCorrect / totalAnswersCount) * 100) : 0;
  const averageScore = totalPlayers > 0 ? Math.round(sortedPlayers.reduce((acc, p) => acc + p.score, 0) / totalPlayers) : 0;

  const questionsStats = session.questions.map((q, idx) => {
    let qAnswers = 0;
    let qCorrect = 0;
    let fastestSec = 999;

    playerList.forEach((p) => {
      const pAns = p.answers[idx];
      if (pAns) {
        qAnswers++;
        if (pAns.isCorrect) qCorrect++;
        if (pAns.responseTimeSec < fastestSec) {
          fastestSec = pAns.responseTimeSec;
        }
      }
    });

    return {
      questionText: q.text,
      correctPercentage: qAnswers > 0 ? Math.round((qCorrect / qAnswers) * 100) : 0,
      fastestAnswerSec: fastestSec === 999 ? 0 : Number(fastestSec.toFixed(1)),
    };
  });

  const reportData: QuizReportData = {
    pin: session.pin,
    quizTitle: session.quizTitle,
    date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
    totalPlayers,
    totalQuestions,
    averageScore,
    averageAccuracy,
    players: sortedPlayers.map((p, index) => {
      const pAnswersList = Object.values(p.answers);
      const correctCount = pAnswersList.filter((a) => a.isCorrect).length;
      const accuracy = pAnswersList.length > 0 ? Math.round((correctCount / pAnswersList.length) * 100) : 0;
      const avgResponseTime =
        pAnswersList.length > 0
          ? Number((pAnswersList.reduce((acc, a) => acc + a.responseTimeSec, 0) / pAnswersList.length).toFixed(1))
          : 0;

      return {
        rank: index + 1,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
        correctCount,
        accuracy,
        avgResponseTime,
      };
    }),
    questionsStats,
  };

  res.json(reportData);
});

async function startServer() {
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    let currentClient: WSClient | null = null;

    ws.on('message', (messageRaw) => {
      try {
        const message = JSON.parse(messageRaw.toString());
        const { action, payload } = message;

        if (action === 'CREATE_ROOM') {
          const { quizId } = payload;
          const allQuizzes = [...SAMPLE_QUIZZES, ...customQuizzes];
          const quiz = allQuizzes.find((q) => q.id === quizId) || SAMPLE_QUIZZES[0];

          const pin = generatePin();
          const newSession: GameSession = {
            pin,
            quizId: quiz.id,
            quizTitle: quiz.title,
            stage: 'LOBBY',
            currentQuestionIndex: 0,
            questions: quiz.questions,
            players: {},
            createdAt: Date.now(),
          };

          activeSessions.set(pin, newSession);

          if (!roomClients.has(pin)) {
            roomClients.set(pin, new Set());
          }

          currentClient = { ws, pin, isHost: true };
          roomClients.get(pin)!.add(currentClient);

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              pin,
              session: newSession,
            })
          );
        } else if (action === 'JOIN_ROOM') {
          const { pin, nickname, avatar } = payload;
          const session = activeSessions.get(pin);

          if (!session) {
            return ws.send(JSON.stringify({ type: 'ERROR', message: 'رمز الدخول غير صحيح!' }));
          }

          const playerId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const newPlayer: Player = {
            id: playerId,
            nickname: nickname || 'متسابق',
            avatar: avatar || '🦁',
            score: 0,
            streak: 0,
            answers: {},
            isConnected: true,
          };

          session.players[playerId] = newPlayer;

          if (!roomClients.has(pin)) {
            roomClients.set(pin, new Set());
          }

          currentClient = { ws, pin, isHost: false, playerId };
          roomClients.get(pin)!.add(currentClient);

          // Reply to student
          ws.send(
            JSON.stringify({
              type: 'JOIN_SUCCESS',
              playerId,
              session,
            })
          );

          // Broadcast updated room state
          broadcastRoomState(pin);
        } else if (action === 'HOST_CONTROL_GAME') {
          const { pin, nextStage, questionIndex } = payload;
          const session = activeSessions.get(pin);
          if (!session) return;

          if (typeof questionIndex === 'number') {
            session.currentQuestionIndex = questionIndex;
          }

          if (nextStage) {
            session.stage = nextStage;
            if (nextStage === 'QUESTION_ACTIVE') {
              session.questionStartTime = Date.now();
            }
          }

          broadcastRoomState(pin);
        } else if (action === 'SUBMIT_ANSWER') {
          const { pin, playerId, optionId, responseTimeSec } = payload;
          const session = activeSessions.get(pin);
          if (!session || session.stage !== 'QUESTION_ACTIVE') return;

          const player = session.players[playerId];
          if (!player) return;

          const currentQ = session.questions[session.currentQuestionIndex];
          if (!currentQ) return;

          // Check if already answered this question
          if (player.answers[session.currentQuestionIndex]) return;

          const selectedOpt = currentQ.options.find((o) => o.id === optionId);
          const isCorrect = selectedOpt ? selectedOpt.isCorrect : false;

          let pointsEarned = 0;
          if (isCorrect) {
            pointsEarned = calculateScore(
              currentQ.timeLimit,
              responseTimeSec,
              currentQ.pointsMultiplier || 1000
            );
            player.score += pointsEarned;
            player.streak += 1;
          } else {
            player.streak = 0;
          }

          player.answers[session.currentQuestionIndex] = {
            questionIndex: session.currentQuestionIndex,
            optionId,
            isCorrect,
            pointsEarned,
            responseTimeSec,
          };

          player.lastAnsweredIndex = session.currentQuestionIndex;

          // Calculate student's current rank
          const playerArray = Object.values(session.players).sort((a, b) => b.score - a.score);
          const rank = playerArray.findIndex((p) => p.id === playerId) + 1;

          ws.send(
            JSON.stringify({
              type: 'ANSWER_ACK',
              isCorrect,
              pointsEarned,
              score: player.score,
              streak: player.streak,
              rank,
            })
          );

          broadcastRoomState(pin);
        }
      } catch (err) {
        console.error('WebSocket Error:', err);
      }
    });

    ws.on('close', () => {
      if (currentClient) {
        const { pin, isHost, playerId } = currentClient;
        const roomSet = roomClients.get(pin);
        if (roomSet) {
          roomSet.delete(currentClient);
        }

        if (!isHost && playerId) {
          const session = activeSessions.get(pin);
          if (session && session.players[playerId]) {
            session.players[playerId].isConnected = false;
            broadcastRoomState(pin);
          }
        }
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kahoot Arab Express & WS Server running on http://localhost:${PORT}`);
  });
}

startServer();
