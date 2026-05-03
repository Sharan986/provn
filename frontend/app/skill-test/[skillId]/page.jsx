'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Zap, Loader2,
  Trophy, ArrowRight, AlertTriangle, RotateCcw
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { getSkillTest, submitSkillTest } from '@/lib/actions/skillTests';

const TIME_PER_QUESTION = 30; // 30 seconds per question

export default function SkillTestPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  // Loading & data
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  // Test state
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  // Results
  const [testFinished, setTestFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {score, totalQuestions, percentage, answers}

  // Load questions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSkillTest(params.skillId);
        if (res?.data && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          toast.error('No test questions available for this skill yet.');
          setTimeout(() => router.back(), 1500);
        }
      } catch (err) {
        toast.error('Failed to load test');
        setTimeout(() => router.back(), 1500);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.skillId]);

  // Timer — counts down per question
  useEffect(() => {
    if (!started || testFinished) return;

    if (timeLeft <= 0) {
      // Auto-advance when time runs out
      advanceQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      setTotalTimeTaken(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, testFinished, timeLeft]);

  const advanceQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      handleFinish();
    }
  }, [currentIndex, questions.length]);

  const handleSelectOption = (optionIndex) => {
    if (testFinished) return;
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: optionIndex
    }));
  };

  const handleNext = () => {
    advanceQuestion();
  };

  const handleFinish = async () => {
    setTestFinished(true);
    setSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = questions.map(q => ({
        questionId: q.id,
        selected: answers[q.id] !== undefined ? answers[q.id] : -1, // -1 = unanswered
      }));

      const res = await submitSkillTest(params.skillId, formattedAnswers, totalTimeTaken);

      if (res?.data) {
        setResult(res.data);
        toast.success(`Test completed! Score: ${res.data.percentage}%`);
      } else if (res?.error) {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4 text-purple" />
          <p className="font-mono text-muted">Loading test questions...</p>
        </div>
      </div>
    );
  }

  // ─── Results Screen ────────────────────────────────────────────────────────
  if (testFinished) {
    return (
      <div className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full p-8 text-center">
          {submitting ? (
            <div className="py-12">
              <Loader2 size={40} className="animate-spin mx-auto text-purple mb-4" />
              <p className="font-mono text-muted">Calculating your score...</p>
            </div>
          ) : result ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 border-3 border-black flex items-center justify-center bg-lime">
                <Trophy size={40} className="text-black" />
              </div>
              <h2 className="heading-brutal text-3xl mb-2">Test Complete!</h2>

              <div className="my-6 p-6 bg-bg border-3 border-black">
                <div className="text-6xl font-black text-purple mb-2">{result.percentage}%</div>
                <p className="font-mono text-sm text-muted">
                  {result.score} / {result.totalQuestions} correct
                </p>
              </div>

              {/* Unlock indicators */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { threshold: 33, label: 'Project 1' },
                  { threshold: 66, label: 'Project 2' },
                  { threshold: 85, label: 'Project 3' },
                ].map(({ threshold, label }) => (
                  <div
                    key={threshold}
                    className={`p-3 border-2 text-center ${
                      result.percentage >= threshold
                        ? 'border-lime bg-lime/20'
                        : 'border-black/20 bg-bg-dark opacity-50'
                    }`}
                  >
                    {result.percentage >= threshold ? (
                      <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                    ) : (
                      <XCircle size={20} className="mx-auto text-muted mb-1" />
                    )}
                    <span className="font-mono text-xs font-bold block">{label}</span>
                    <span className="font-mono text-[10px] text-muted">≥{threshold}%</span>
                  </div>
                ))}
              </div>

              {/* Review answers */}
              {result.answers && (
                <div className="text-left mb-6 max-h-64 overflow-y-auto">
                  <h4 className="font-black text-sm uppercase mb-3">Answer Review</h4>
                  {result.answers.map((a, idx) => {
                    const q = questions.find(q => q.id === a.questionId);
                    return (
                      <div
                        key={a.questionId}
                        className={`p-3 border-2 mb-2 flex items-start gap-3 ${
                          a.isCorrect ? 'border-lime bg-lime/10' : 'border-red-300 bg-red-50'
                        }`}
                      >
                        {a.isCorrect ? (
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-xs font-bold">Q{idx + 1}.</span>
                          <span className="font-mono text-xs ml-1">{q?.question?.substring(0, 80)}{q?.question?.length > 80 ? '...' : ''}</span>
                          {!a.isCorrect && a.selected >= 0 && q?.options && (
                            <div className="font-mono text-[10px] text-muted mt-1">
                              Your answer: {q.options[a.selected]} | Correct: {q.options[a.correct]}
                            </div>
                          )}
                          {a.selected < 0 && (
                            <div className="font-mono text-[10px] text-muted mt-1">Unanswered</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" icon={RotateCcw} onClick={() => window.location.reload()}>
                  Retake
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => {
                  // Navigate back; the page will detect visibilitychange and refresh scores
                  router.back();
                }}>
                  Back to Roadmap
                </Button>
              </div>
            </>
          ) : (
            <div className="py-12">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="font-mono text-muted">Something went wrong.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ─── Start Screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-purple/10 border-3 border-purple flex items-center justify-center">
              <Zap size={40} className="text-purple" />
            </div>
            <h2 className="heading-brutal text-2xl mb-2">Skill Assessment</h2>
            <p className="font-mono text-sm text-muted">
              Test your knowledge to unlock gated projects.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-bg border-2 border-black">
              <div className="heading-brutal text-lg">{questions.length}</div>
              <div className="font-mono text-xs text-muted mt-1">Questions</div>
            </div>
            <div className="text-center p-4 bg-bg border-2 border-black">
              <div className="heading-brutal text-lg">{TIME_PER_QUESTION}s</div>
              <div className="font-mono text-xs text-muted mt-1">Per Question</div>
            </div>
            <div className="text-center p-4 bg-bg border-2 border-black">
              <div className="heading-brutal text-lg">∞</div>
              <div className="font-mono text-xs text-muted mt-1">Retakes</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm mb-1">Before you start</h4>
                <ul className="font-mono text-xs text-muted space-y-1">
                  <li>• You have <strong>30 seconds</strong> per question</li>
                  <li>• Questions auto-advance when time runs out</li>
                  <li>• You can retake the test to improve your score</li>
                  <li>• Your <strong>best score</strong> determines project unlocks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Unlock thresholds */}
          <div className="mb-6 p-4 bg-bg border-2 border-black">
            <h4 className="font-bold text-xs uppercase mb-3">Project Unlock Thresholds</h4>
            <div className="space-y-2">
              {[
                { threshold: 33, color: 'bg-lime', label: 'Project 1 — Beginner' },
                { threshold: 66, color: 'bg-yellow', label: 'Project 2 — Intermediate' },
                { threshold: 85, color: 'bg-purple', label: 'Project 3 — Advanced' },
              ].map(({ threshold, color, label }) => (
                <div key={threshold} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${color} border-2 border-black flex items-center justify-center`}>
                    <span className="font-mono text-xs font-bold">{threshold}%</span>
                  </div>
                  <span className="font-mono text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            className="py-4"
            icon={Zap}
            onClick={() => setStarted(true)}
          >
            Start Test
          </Button>
        </Card>
      </div>
    );
  }

  // ─── Question Interface ────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const selectedOption = answers[currentQ?.id];
  const options = Array.isArray(currentQ?.options)
    ? (typeof currentQ.options[0] === 'string' ? currentQ.options : currentQ.options.map(o => o.text || o))
    : [];

  return (
    <div className="min-h-screen bg-bg pb-12">
      {/* Header */}
      <div className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Exit the test? Your progress will be lost.')) {
                  router.back();
                }
              }}
              className="p-2 bg-bg border-2 border-black hover:shadow-brutal transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="heading-brutal text-lg">Skill Assessment</h1>
              <span className="font-mono text-xs text-muted">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          <div className={`
            px-4 py-2 border-3 border-black flex items-center gap-2 font-mono font-bold text-lg
            ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' :
              timeLeft <= 10 ? 'bg-yellow border-black' : 'bg-lime'}
          `}>
            <Clock size={18} />
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {/* Progress Bar */}
        <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold text-muted">
          <span>Progress</span>
          <span>{Math.round((currentIndex / questions.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-white border-3 border-black mb-8 w-full overflow-hidden">
          <div
            className="h-full bg-purple transition-all duration-500 ease-out"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="purple" size="sm">Q{currentIndex + 1}</Badge>
            <span className="font-mono text-[10px] text-muted uppercase">
              {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <h2 className="heading-brutal text-xl md:text-2xl mb-8 leading-tight">
            {currentQ?.question}
          </h2>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 border-3 transition-all flex items-center gap-4 ${
                  selectedOption === idx
                    ? 'border-purple bg-purple/10 shadow-brutal-sm -translate-y-0.5'
                    : 'border-black/20 bg-white hover:border-black hover:shadow-brutal-sm'
                }`}
              >
                <div className={`
                  w-10 h-10 flex-shrink-0 flex items-center justify-center border-2 font-mono font-bold text-sm
                  ${selectedOption === idx
                    ? 'border-purple bg-purple text-white'
                    : 'border-black bg-bg text-black'
                  }
                `}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-mono text-sm md:text-base flex-1">{opt}</span>
                {selectedOption === idx && <CheckCircle size={20} className="text-purple flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              icon={currentIndex === questions.length - 1 ? Zap : ArrowRight}
              iconPosition="right"
              onClick={handleNext}
            >
              {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
