'use client';

import { memo } from 'react';
import { CheckCircle, Clock, Circle } from 'lucide-react';

/**
 * Super robust parser for JSON from Postgres TEXT columns
 */
function parseDescription(desc) {
  if (!desc) return { type: 'text', content: '' };
  
  if (typeof desc === 'object') return desc;

  if (typeof desc === 'string') {
    try {
      let parsed = JSON.parse(desc);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      try {
        const cleaned = desc.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        const parsedClean = JSON.parse(cleaned);
        if (parsedClean && typeof parsedClean === 'object') return parsedClean;
      } catch (e2) {
        try {
          // Last resort for badly escaped SQL JSON strings
          const evalParsed = new Function('return ' + desc)();
          if (evalParsed && typeof evalParsed === 'object') return evalParsed;
        } catch (e3) {
          return { type: 'text', content: desc };
        }
      }
    }
    return { type: 'text', content: desc };
  }
  
  return { type: 'text', content: String(desc) };
}

function SkillTreeNode({ skill, status, onClick, isLast, index }) {
  const desc = parseDescription(skill.description);
  const hasSubtopics = desc.type === 'subtopics' && desc.subtopics?.length > 0;

  const statusConfig = {
    completed: { bg: 'bg-lime', icon: <CheckCircle size={14} className="text-black" /> },
    'in-progress': { bg: 'bg-yellow', icon: <Clock size={14} className="text-black" /> },
    pending: { bg: 'bg-white', icon: <Circle size={14} className="text-muted" /> },
  };

  const s = statusConfig[status] || statusConfig.pending;
  
  // Alternate subtopics left and right
  const isRight = index % 2 === 0;

  return (
    <div className="relative w-full flex flex-col items-center group">
      
      {/* Central Vertical Connector */}
      {!isLast && (
        <div className="absolute top-[38px] bottom-[-24px] w-1 bg-black z-0" />
      )}

      {/* Node Container (Horizontal wrapper) */}
      <div className="relative flex justify-center w-full my-6 z-10">
        
        {/* Main Skill Box */}
        <div
          className={`
            relative w-[220px] px-3 py-2 border-3 border-black shadow-brutal-sm
            cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-brutal
            flex items-center justify-between z-20 ${s.bg}
          `}
          onClick={() => onClick(skill)}
        >
          <span className="font-black text-sm uppercase tracking-tight truncate z-10">
            {skill.name}
          </span>
          <div className="z-10">{s.icon}</div>
          
          {/* Subtle decorative dot for nodes */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-3 bg-purple border border-black" />
        </div>

        {/* Subtopics Branching */}
        {hasSubtopics && (
          <div 
            className={`absolute top-1/2 -translate-y-1/2 flex items-center ${
              isRight ? 'left-[calc(50%+110px)] flex-row' : 'right-[calc(50%+110px)] flex-row-reverse'
            }`}
          >
            {/* Primary Horizontal Branch */}
            <div className="w-12 border-t-2 border-dashed border-blue-500" />

            {/* Subtopics Vertical Group */}
            <div className="relative py-4 flex flex-col gap-2">
              
              {/* Vertical Branch Line */}
              <div 
                className={`absolute top-4 bottom-4 border-dashed border-blue-500 ${
                  isRight ? 'left-0 border-l-2' : 'right-0 border-r-2'
                }`}
              />

              {desc.subtopics.map((sub, i) => (
                <div 
                  key={i} 
                  className={`relative flex items-center ${isRight ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Small connector to subtopic */}
                  <div className={`w-6 border-t-2 border-dashed border-blue-500 ${
                    isRight ? '-ml-[2px]' : '-mr-[2px]'
                  }`} />
                  
                  {/* Subtopic Box */}
                  <div
                    className="
                      bg-[#fffae6] border-2 border-black px-3 py-1.5 cursor-pointer 
                      shadow-[2px_2px_0_0_#000] hover:bg-yellow hover:translate-x-0.5 transition-all
                      whitespace-nowrap flex items-center
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(skill, sub);
                    }}
                  >
                    <div className={`w-1 h-full absolute top-0 bottom-0 bg-purple ${
                      isRight ? 'left-0' : 'right-0'
                    }`} />
                    <span className="font-bold text-[10px] sm:text-xs uppercase tracking-tight z-10 px-1">
                      {sub.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SkillTreeNode);
