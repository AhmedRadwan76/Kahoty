import { Quiz } from '../types';

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'تحدي المعرفة والعلوم العامة 🧠',
    description: 'اختبار ممتع وتفاعلي في الثقافة العامة والعلوم والتكنولوجيا.',
    subject: 'ثقافة عامة',
    icon: '💡',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1-1',
        text: 'ما هو أسرع كوكب يدور حول الشمس في المجموعة الشمسية؟',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        explanation: 'عطارد هو الأقرب للشمس ويدور حولها في 88 يوماً فقط!',
        options: [
          { id: 'opt-1', text: 'عطارد (Mercury)', isCorrect: true, color: 'red', shape: 'triangle' },
          { id: 'opt-2', text: 'الزهرة (Venus)', isCorrect: false, color: 'blue', shape: 'diamond' },
          { id: 'opt-3', text: 'المريخ (Mars)', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'opt-4', text: 'المشتري (Jupiter)', isCorrect: false, color: 'green', shape: 'square' },
        ],
      },
      {
        id: 'q1-2',
        text: 'الصوت ينتقل في الفراغ أسرع من انتقاله في الماء.',
        type: 'true_false',
        timeLimit: 15,
        pointsMultiplier: 1000,
        explanation: 'خطأ، الصوت يتطلب وسطاً مادياً للانتقال ولا ينتقل في الفراغ.',
        options: [
          { id: 'opt-tf-1', text: 'صح (True)', isCorrect: false, color: 'blue', shape: 'diamond' },
          { id: 'opt-tf-2', text: 'خطأ (False)', isCorrect: true, color: 'red', shape: 'triangle' },
        ],
      },
      {
        id: 'q1-3',
        text: 'ما هي عاصمة جمهورية مصر العربية؟',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        options: [
          { id: 'opt-3-1', text: 'الإسكندرية', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'opt-3-2', text: 'القاهرة', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'opt-3-3', text: 'الجيزة', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'opt-3-4', text: 'أسوان', isCorrect: false, color: 'green', shape: 'square' },
        ],
      },
      {
        id: 'q1-4',
        text: 'كم عدد أضلاع الشكل السداسي المنتظم؟',
        type: 'multiple_choice',
        timeLimit: 15,
        pointsMultiplier: 1000,
        options: [
          { id: 'opt-4-1', text: '5 أضلاع', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'opt-4-2', text: '6 أضلاع', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'opt-4-3', text: '7 أضلاع', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'opt-4-4', text: '8 أضلاع', isCorrect: false, color: 'green', shape: 'square' },
        ],
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'مسابقة لغتنا الخالدة - قواعد لغوية وإعراب 📚',
    description: 'اختبار رائع في القواعد والأساليب والجماليات في اللغة العربية.',
    subject: 'لغة عربية',
    icon: '📖',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q2-1',
        text: 'ما هو إعراب كلمة "الطالبُ" في جملة: "اجتهدَ الطالبُ في دراستهِ"؟',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        options: [
          { id: 'q2-1-a', text: 'مفعول به منصوب', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'q2-1-b', text: 'فاعل مرفوع وعلامة رفعه الضمة', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'q2-1-c', text: 'مبتدأ مؤخر مرفوع', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'q2-1-d', text: 'خبر المبتدأ', isCorrect: false, color: 'green', shape: 'square' },
        ],
      },
      {
        id: 'q2-2',
        text: 'الفعل "يكتبانِ" هو من الأفعال الخمسة وتكون علامة رفعه ثبوت النون.',
        type: 'true_false',
        timeLimit: 15,
        pointsMultiplier: 1000,
        options: [
          { id: 'q2-2-a', text: 'صح (True)', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'q2-2-b', text: 'خطأ (False)', isCorrect: false, color: 'red', shape: 'triangle' },
        ],
      },
      {
        id: 'q2-3',
        text: 'ما معنى كلمة "العَسْجَد" في لسان العرب؟',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        options: [
          { id: 'q2-3-a', text: 'الفضة', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'q2-3-b', text: 'الذهب', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'q2-3-c', text: 'الماس', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'q2-3-d', text: 'الزمرد', isCorrect: false, color: 'green', shape: 'square' },
        ],
      }
    ]
  },
  {
    id: 'quiz-3',
    title: 'تاريخ وتضاريس الوطن العربي 🗺️',
    description: 'اختبار جغرافي وتاريخي مميز حول معالم وأحداث الوطن العربي.',
    subject: 'جغرافيا وتاريخ',
    icon: '🌍',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q3-1',
        text: 'أطول نهر في الوطن العربي وفي العالم هو:',
        type: 'multiple_choice',
        timeLimit: 15,
        pointsMultiplier: 1000,
        options: [
          { id: 'q3-1-a', text: 'نهر دجلة', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'q3-1-b', text: 'نهر الفرات', isCorrect: false, color: 'blue', shape: 'diamond' },
          { id: 'q3-1-c', text: 'نهر النيل', isCorrect: true, color: 'yellow', shape: 'circle' },
          { id: 'q3-1-d', text: 'نهر الأردن', isCorrect: false, color: 'green', shape: 'square' },
        ],
      },
      {
        id: 'q3-2',
        text: 'تعتبر مدينة البتراء الأثرية إحدى عجائب الدنيا السبع وتقع في الدولة التالية:',
        type: 'multiple_choice',
        timeLimit: 20,
        pointsMultiplier: 1000,
        options: [
          { id: 'q3-2-a', text: 'السعودية', isCorrect: false, color: 'red', shape: 'triangle' },
          { id: 'q3-2-b', text: 'الأردن', isCorrect: true, color: 'blue', shape: 'diamond' },
          { id: 'q3-2-c', text: 'لبنان', isCorrect: false, color: 'yellow', shape: 'circle' },
          { id: 'q3-2-d', text: 'سلطنة عمان', isCorrect: false, color: 'green', shape: 'square' },
        ],
      }
    ]
  }
];
