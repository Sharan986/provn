'use client';

import { useState, useEffect } from 'react';
import {
  Zap, Play, Send, Lock, Crown, Terminal,
  FileText, ChevronRight, Check, AlertTriangle
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';

const mockChallenges = [
  {
    id: 1,
    title: 'FizzBuzz API',
    client: 'TechCorp',
    problem: 'Build a REST API endpoint that returns FizzBuzz results for a given range of numbers. The API should accept start and end parameters and return a JSON array.',
    requirements: [
      'Accept GET /fizzbuzz?start=1&end=100',
      'Return JSON array of results',
      'Handle edge cases (negative numbers, invalid input)',
      'Include proper error responses',
    ],
    exampleInput: 'GET /fizzbuzz?start=1&end=15',
    starterCode: `// FizzBuzz API
function fizzbuzz(start, end) {
  const results = [];
  
  // Your code here
  
  return results;
}

// Test
console.log(fizzbuzz(1, 15));`,
    premium: false,
  },
  {
    id: 2,
    title: 'Data Transformer',
    client: 'DataFlow Inc.',
    problem: 'Create a function that transforms raw CSV-like data into a structured format. Handle missing values, type conversion, and data validation.',
    requirements: [
      'Parse comma-separated string input',
      'Convert numeric strings to numbers',
      'Handle missing/null values with defaults',
      'Return array of objects with proper types',
    ],
    exampleInput: '"name,age,score\\nAlice,25,95\\nBob,,88\\nCharlie,30,"',
    starterCode: `// Data Transformer
function transform(csvString) {
  const lines = csvString.split('\\n');
  
  // Your code here
  
  return [];
}

// Test
const data = "name,age,score\\nAlice,25,95\\nBob,,88";
console.log(transform(data));`,
    premium: false,
  },
  {
    id: 3,
    title: 'Rate Limiter',
    client: 'SecureAPI Ltd.',
    problem: 'Implement a rate limiter that restricts API calls to a maximum number of requests per time window. Use the sliding window algorithm.',
    requirements: [
      'Track requests per client ID',
      'Configurable max requests and window size',
      'Return true/false for allowed/blocked',
      'Clean up expired entries',
    ],
    exampleInput: 'rateLimiter.isAllowed("client1") // true (first request)',
    starterCode: `// Rate Limiter
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    // Your code here
  }
  
  isAllowed(clientId) {
    // Your code here
    return true;
  }
}

// Test
const limiter = new RateLimiter(3, 60000);
console.log(limiter.isAllowed("user1")); // true`,
    premium: true,
  },
  {
    id: 4,
    title: 'Cache System',
    client: 'SpeedTech',
    problem: 'Build an LRU (Least Recently Used) cache with TTL (Time To Live) support. The cache should automatically evict the least recently used items when capacity is reached.',
    requirements: [
      'Set capacity limit',
      'get(key) returns value or null',
      'put(key, value, ttl) inserts with expiry',
      'Auto-evict LRU when full',
    ],
    exampleInput: 'cache.put("key1", "value1", 5000)',
    starterCode: `// LRU Cache with TTL
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    // Your code here
  }
  
  get(key) {
    // Your code here
  }
  
  put(key, value, ttlMs) {
    // Your code here
  }
}

// Test
const cache = new LRUCache(2);
cache.put("a", 1, 5000);
cache.put("b", 2, 5000);
console.log(cache.get("a")); // 1`,
    premium: true,
  },
];

// Simulate 0 tasks completed = probation
const hasCompletedTask = true; // Set to false to see probation gate

export default function SimulatorPage() {
  const toast = useToast();
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [code, setCode] = useState(mockChallenges[0].starterCode);
  const [output, setOutput] = useState('');
  const [showBrief, setShowBrief] = useState(true); // mobile toggle
  const [isPro] = useState(false);

  // Probation Gate
  if (!hasCompletedTask) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center p-4">
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 bg-yellow border-brutal mx-auto flex items-center justify-center mb-4">
            <Lock size={32} />
          </div>
          <h2 className="heading-brutal text-2xl mb-3">SIMULATOR LOCKED</h2>
          <p className="font-mono text-sm text-muted mb-6">
            Complete at least <span className="font-bold text-black">1 task</span> from the
            Task Marketplace to unlock the Industry Simulator.
          </p>
          <Link href="/tasks">
            <Button variant="primary" icon={Zap}>Go to Tasks</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const challenge = mockChallenges[activeChallenge];

  const switchChallenge = (index) => {
    const ch = mockChallenges[index];
    if (ch.premium && !isPro) {
      toast.info('This challenge requires PRO. Upgrade to unlock!');
      return;
    }
    setActiveChallenge(index);
    setCode(ch.starterCode);
    setOutput('');
  };

  const runCode = () => {
    try {
      // Capture console.log output
      let logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.map(a => JSON.stringify(a)).join(' '));

      // eslint-disable-next-line no-eval
      eval(code);

      console.log = originalLog;
      setOutput(logs.join('\n') || 'No output');
      toast.success('Code executed!');
    } catch (err) {
      setOutput(`Error: ${err.message}`);
      toast.error('Runtime error');
    }
  };

  const submitCode = () => {
    toast.success(`Challenge "${challenge.title}" submitted for review!`);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-black text-white">
      {/* Challenge Tabs */}
      <div className="flex items-center gap-0 border-b-2 border-white/20 bg-black overflow-x-auto">
        {mockChallenges.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => switchChallenge(i)}
            className={`
              flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase
              border-r border-white/10 whitespace-nowrap transition-colors cursor-pointer
              ${activeChallenge === i ? 'bg-lime text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}
            `}
          >
            {ch.premium && !isPro ? <Lock size={12} /> : <span>{String(i + 1).padStart(2, '0')}</span>}
            {ch.title}
            {ch.premium && <Badge variant="purple" size="sm">PRO</Badge>}
          </button>
        ))}
      </div>

      {/* Mobile Toggle */}
      <div className="flex md:hidden border-b border-white/10">
        <button
          onClick={() => setShowBrief(true)}
          className={`flex-1 py-2 font-mono text-xs font-bold uppercase text-center cursor-pointer ${showBrief ? 'bg-lime text-black' : 'text-white/60'}`}
        >
          <FileText size={14} className="inline mr-1" /> Brief
        </button>
        <button
          onClick={() => setShowBrief(false)}
          className={`flex-1 py-2 font-mono text-xs font-bold uppercase text-center cursor-pointer ${!showBrief ? 'bg-lime text-black' : 'text-white/60'}`}
        >
          <Terminal size={14} className="inline mr-1" /> Code
        </button>
      </div>

      {/* Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Brief */}
        <div className={`${showBrief ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2 border-r border-white/10 overflow-y-auto`}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="lime" size="sm">CHALLENGE {String(activeChallenge + 1).padStart(2, '0')}</Badge>
              <Badge variant="default" size="sm">{challenge.client}</Badge>
            </div>
            <h2 className="heading-brutal text-2xl text-white mb-4">{challenge.title}</h2>

            <div className="mb-6">
              <h3 className="label-brutal text-white/60 mb-2">PROBLEM STATEMENT</h3>
              <p className="font-mono text-sm text-white/80 leading-relaxed">{challenge.problem}</p>
            </div>

            <div className="mb-6">
              <h3 className="label-brutal text-white/60 mb-2">REQUIREMENTS</h3>
              <ul className="flex flex-col gap-2">
                {challenge.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 font-mono text-sm text-white/80">
                    <ChevronRight size={14} className="text-lime mt-0.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="label-brutal text-white/60 mb-2">EXAMPLE</h3>
              <div className="bg-white/5 border border-white/10 p-3 font-mono text-xs text-lime">
                {challenge.exampleInput}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Editor + Terminal */}
        <div className={`${!showBrief ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-1/2`}>
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="font-mono text-xs text-white/40">solution.js</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={Play} onClick={runCode}
                  className="!bg-transparent !text-lime !border-lime/30 !shadow-none hover:!bg-lime/10">
                  Run
                </Button>
                <Button variant="primary" size="sm" icon={Send} onClick={submitCode}>
                  Submit
                </Button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-[#1a1a2e] text-lime font-mono text-sm resize-none focus:outline-none leading-relaxed"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Terminal Output */}
          <div className="h-40 border-t border-white/10 bg-[#0d0d1a] flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
              <Terminal size={12} className="text-white/40" />
              <span className="font-mono text-xs text-white/40">OUTPUT</span>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-white/70 overflow-y-auto whitespace-pre-wrap">
              {output || 'Run your code to see output here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
