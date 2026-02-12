import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  VideoModule,
  QuizQuestion,
  QuizResponse,
} from "@/types/database";

interface QuizPerformanceProps {
  videoModules: VideoModule[];
  quizQuestions: QuizQuestion[];
  quizResponses: QuizResponse[];
}

// Hardcoded demo quiz data for when no real data exists
interface DemoQuizModule {
  id: string;
  title: string;
  correct: number;
  total: number;
  attempts: number;
}

const DEMO_QUIZ_MODULES: DemoQuizModule[] = [
  { id: "dq1", title: "Welcome & Overview", correct: 3, total: 3, attempts: 1 },
  { id: "dq2", title: "Understanding Your Medications", correct: 2, total: 3, attempts: 1 },
  { id: "dq3", title: "Medication Safety", correct: 1, total: 2, attempts: 2 },
];

export function QuizPerformance({
  videoModules,
  quizQuestions,
  quizResponses,
}: QuizPerformanceProps) {
  const useDemo = quizResponses.length === 0;

  if (useDemo) {
    const demoTotal = DEMO_QUIZ_MODULES.reduce((sum, m) => sum + m.total, 0);
    const demoCorrect = DEMO_QUIZ_MODULES.reduce((sum, m) => sum + m.correct, 0);
    const demoPct = Math.round((demoCorrect / demoTotal) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{demoPct}%</span>
            <span className="text-sm text-muted-foreground">
              overall ({demoCorrect}/{demoTotal} correct)
            </span>
          </div>
          <div className="space-y-3">
            {DEMO_QUIZ_MODULES.map((mod) => {
              const pct = Math.round((mod.correct / mod.total) * 100);
              return (
                <div key={mod.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{mod.title}</span>
                    <span className="text-muted-foreground">
                      {pct}% ({mod.correct}/{mod.total})
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct < 60 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {mod.attempts > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {mod.attempts} attempts
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group questions by module
  const questionsByModule = new Map<string, QuizQuestion[]>();
  for (const q of quizQuestions) {
    const existing = questionsByModule.get(q.video_module_id) ?? [];
    existing.push(q);
    questionsByModule.set(q.video_module_id, existing);
  }

  // Group responses by question
  const responsesByQuestion = new Map<string, QuizResponse[]>();
  for (const r of quizResponses) {
    const existing = responsesByQuestion.get(r.question_id) ?? [];
    existing.push(r);
    responsesByQuestion.set(r.question_id, existing);
  }

  // Overall stats
  const totalResponses = quizResponses.length;
  const correctResponses = quizResponses.filter((r) => r.is_correct).length;
  const overallPct =
    totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{overallPct}%</span>
          <span className="text-sm text-muted-foreground">
            overall ({correctResponses}/{totalResponses} correct)
          </span>
        </div>

        <div className="space-y-3">
          {videoModules.map((mod) => {
            const questions = questionsByModule.get(mod.id) ?? [];
            if (questions.length === 0) return null;

            let modCorrect = 0;
            let modTotal = 0;
            let attempts = 0;

            for (const q of questions) {
              const responses = responsesByQuestion.get(q.id) ?? [];
              modTotal += responses.length;
              modCorrect += responses.filter((r) => r.is_correct).length;
              attempts = Math.max(
                attempts,
                ...responses.map((r) => r.attempt_number)
              );
            }

            if (modTotal === 0) return null;

            const pct = Math.round((modCorrect / modTotal) * 100);

            return (
              <div key={mod.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{mod.title}</span>
                  <span className="text-muted-foreground">
                    {pct}% ({modCorrect}/{modTotal})
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {attempts > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {attempts} attempts
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
