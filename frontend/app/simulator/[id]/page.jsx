'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Play, Clock, CheckCircle, XCircle, Loader2,
  Code, Send, RotateCcw, ChevronRight, Lightbulb, Eye,
  EyeOff, Trophy, Zap, AlertTriangle, Terminal
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import { getChallenge, startSimulatorAttempt, submitSimulatorAttempt } from '@/lib/actions/simulator';

export default function SimulatorChallengePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const editorRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [started, setStarted] = useState(false);
  
  // Load challenge
  useEffect(() => {
    async function loadChallenge() {
      try {
        const result = await getChallenge(params.id);
        if (result?.data) {
          setChallenge(result.data);
          setCode(result.data.starter_code || '// Write your solution here\n');
          setTimeRemaining((result.data.time_limit_minutes || 30) * 60);
        } else {
          toast.error('Challenge not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading challenge:', error);
        toast.error('Failed to load challenge');
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [params.id]);
  
  // Timer
  useEffect(() => {
    if (!started || timeRemaining === null || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [started, timeRemaining]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStart = async () => {
    try {
      const result = await startSimulatorAttempt(params.id, challenge?.roadmap_id);
      if (result?.data?.attemptId) {
        setAttemptId(result.data.attemptId);
        setStarted(true);
        toast.success('Challenge started! Good luck!');
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error starting attempt:', error);
      toast.error('Failed to start challenge');
    }
  };
  
  const runTests = async () => {
    setRunning(true);
    setTestResults([]);
    
    try {
      // Simulate running tests (in real app, this would be a sandbox evaluation)
      const visibleTests = challenge.visible_test_cases || [];
      const results = [];
      
      for (const test of visibleTests) {
        // Simulate test execution with delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simple simulation - in real app, use isolated JS sandbox
        const passed = Math.random() > 0.3; // Demo: 70% pass rate
        results.push({
          name: test.name || `Test ${results.length + 1}`,
          input: test.input,
          expectedOutput: test.expected_output,
          passed,
          output: passed ? test.expected_output : 'Incorrect output'
        });
      }
      
      setTestResults(results);
      
      const passedCount = results.filter(r => r.passed).length;
      if (passedCount === results.length) {
        toast.success('All visible tests passed! 🎉');
      } else {
        toast.info(`${passedCount}/${results.length} tests passed`);
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast.error('Failed to run tests');
    } finally {
      setRunning(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!attemptId) {
      toast.error('Please start the challenge first');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Run all tests for final submission
      const allTestResults = testResults.length > 0 
        ? testResults 
        : (challenge.visible_test_cases || []).map(t => ({ 
            ...t, 
            passed: false, 
            output: 'Not tested' 
          }));
      
      const result = await submitSimulatorAttempt(attemptId, code, allTestResults);
      
      if (result?.success) {
        toast.success(`Submitted! Score: ${result.data.score}/${challenge.points}`);
        // Navigate to roadmap with timestamp to force data refresh
        const roadmapId = challenge.roadmap_id || result.data.roadmapId;
        setTimeout(() => {
          if (roadmapId) {
            router.push(`/roadmap/${roadmapId}?t=${Date.now()}`);
          } else {
            router.back();
          }
        }, 1500);
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetCode = () => {
    if (confirm('Reset to starter code? Your changes will be lost.')) {
      setCode(challenge?.starter_code || '// Write your solution here\n');
      setTestResults([]);
    }
  };
  
  const diffColor = (diff) => {
    const colors = { beginner: 'lime', intermediate: 'orange', advanced: 'red' };
    return colors[diff] || 'default';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4 text-purple" />
          <p className="font-mono text-muted">Loading challenge...</p>
        </div>
      </div>
    );
  }
  
  if (!challenge) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="heading-brutal text-xl mb-2">Challenge Not Found</h2>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-bg border-2 border-black shadow-brutal-xs hover:shadow-brutal transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="purple" size="sm">
                    <Code size={10} className="mr-1" />
                    SIMULATOR
                  </Badge>
                  <Badge variant={diffColor(challenge.difficulty)} size="sm">
                    {challenge.difficulty}
                  </Badge>
                </div>
                <h1 className="heading-brutal text-xl">{challenge.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer */}
              {started && (
                <div className={`
                  px-4 py-2 border-3 border-black flex items-center gap-2 font-mono font-bold
                  ${timeRemaining < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 
                    timeRemaining < 300 ? 'bg-yellow-100' : 'bg-bg'}
                `}>
                  <Clock size={18} />
                  {formatTime(timeRemaining)}
                </div>
              )}
              
              {/* Points */}
              <div className="px-4 py-2 bg-lime border-3 border-black flex items-center gap-2">
                <Zap size={18} />
                <span className="font-mono font-bold">{challenge.points} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Start Screen */}
      {!started && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple/10 border-3 border-purple flex items-center justify-center">
                <Code size={40} className="text-purple" />
              </div>
              <h2 className="heading-brutal text-2xl mb-2">{challenge.title}</h2>
              <p className="font-mono text-muted">{challenge.description}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-bg border-2 border-black">
                <Badge variant={diffColor(challenge.difficulty)} size="sm">
                  {challenge.difficulty}
                </Badge>
                <div className="font-mono text-xs text-muted mt-2">Difficulty</div>
              </div>
              <div className="text-center p-4 bg-bg border-2 border-black">
                <div className="heading-brutal text-lg">{challenge.time_limit_minutes || 30}</div>
                <div className="font-mono text-xs text-muted mt-1">Minutes</div>
              </div>
              <div className="text-center p-4 bg-bg border-2 border-black">
                <div className="heading-brutal text-lg">{challenge.points}</div>
                <div className="font-mono text-xs text-muted mt-1">Points</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">Before you start</h4>
                  <ul className="font-mono text-xs text-muted space-y-1">
                    <li>• You have {challenge.time_limit_minutes || 30} minutes to complete this challenge</li>
                    <li>• Your code will be auto-submitted when time runs out</li>
                    <li>• Run tests as often as you need</li>
                    <li>• Hidden test cases will be evaluated on submission</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              className="w-full py-4" 
              icon={Play}
              onClick={handleStart}
            >
              Start Challenge
            </Button>
          </Card>
        </div>
      )}
      
      {/* Challenge Interface */}
      {started && (
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left: Problem Statement */}
          <div className="w-1/2 border-r-4 border-black overflow-auto">
            <div className="p-6">
              <h3 className="heading-brutal text-lg mb-4">Problem Statement</h3>
              <div className="prose prose-sm max-w-none">
                <div className="font-mono text-sm whitespace-pre-wrap bg-bg p-4 border-2 border-black">
                  {challenge.problem_statement || challenge.description}
                </div>
              </div>
              
              {/* Visible Test Cases */}
              {challenge.visible_test_cases?.length > 0 && (
                <div className="mt-6">
                  <h4 className="heading-brutal text-base mb-3">Example Test Cases</h4>
                  <div className="space-y-3">
                    {challenge.visible_test_cases.map((test, idx) => (
                      <div key={idx} className="p-3 bg-bg border-2 border-black">
                        <div className="font-mono text-xs mb-2">
                          <span className="text-muted">Input:</span>
                          <pre className="mt-1 p-2 bg-white border border-black/20">{test.input}</pre>
                        </div>
                        <div className="font-mono text-xs">
                          <span className="text-muted">Expected Output:</span>
                          <pre className="mt-1 p-2 bg-white border border-black/20">{test.expected_output}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Hints */}
              {challenge.hints?.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 font-mono text-sm text-purple hover:underline"
                  >
                    {showHints ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showHints ? 'Hide Hints' : `Show Hints (${challenge.hints.length})`}
                  </button>
                  {showHints && (
                    <div className="mt-3 space-y-2">
                      {challenge.hints.map((hint, idx) => (
                        <div key={idx} className="p-3 bg-purple/10 border-2 border-purple/30 flex items-start gap-2">
                          <Lightbulb size={16} className="text-purple flex-shrink-0 mt-0.5" />
                          <span className="font-mono text-xs">{hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Code Editor & Results */}
          <div className="w-1/2 flex flex-col">
            {/* Editor Toolbar */}
            <div className="px-4 py-2 bg-white border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="dark" size="xs">JavaScript</Badge>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetCode}
                  className="p-2 hover:bg-bg rounded transition-colors"
                  title="Reset to starter code"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="flex-1 bg-[#1e1e1e] overflow-hidden">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
                placeholder="// Write your code here..."
              />
            </div>
            
            {/* Test Results */}
            <div className="h-48 border-t-4 border-black bg-white overflow-auto">
              <div className="p-3 border-b-2 border-black bg-bg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={16} />
                  <span className="font-mono text-sm font-bold">Test Results</span>
                </div>
                {testResults.length > 0 && (
                  <span className="font-mono text-xs text-muted">
                    {testResults.filter(r => r.passed).length}/{testResults.length} passed
                  </span>
                )}
              </div>
              
              {testResults.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="font-mono text-sm text-muted">
                    Run tests to see results
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {testResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 border-2 flex items-start gap-2 ${
                        result.passed 
                          ? 'bg-lime/10 border-lime' 
                          : 'bg-red-50 border-red-300'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle size={16} className="text-lime-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs font-bold">{result.name}</div>
                        {!result.passed && (
                          <div className="font-mono text-[10px] text-muted mt-1">
                            Expected: {result.expectedOutput} | Got: {result.output}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 bg-white border-t-2 border-black flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                icon={running ? Loader2 : Play}
                onClick={runTests}
                disabled={running || submitting}
              >
                {running ? 'Running...' : 'Run Tests'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon={submitting ? Loader2 : Send}
                onClick={handleSubmit}
                disabled={running || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
