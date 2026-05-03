'use client';

import { memo, useState } from 'react';
import { CheckCircle, Clock, Circle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

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
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const statusConfig = {
    completed: { bg: 'bg-lime', icon: <CheckCircle size={14} className="text-black" /> },
    'in-progress': { bg: 'bg-yellow', icon: <Clock size={14} className="text-black" /> },
    pending: { bg: 'bg-white', icon: <Circle size={14} className="text-muted" /> },
  };

  const s = statusConfig[status] || statusConfig.pending;
  
  // Alternate subtopics left and right (desktop only)
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
          <div className="flex items-center gap-1.5 z-10">
            {hasSubtopics && (
              <button
                className="md:hidden p-0.5 rounded hover:bg-black/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileExpanded(prev => !prev);
                }}
                aria-label="Toggle subtopics"
              >
                <ChevronDown
                  size={12}
                  className={`transition-transform text-muted ${mobileExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
            <div>{s.icon}</div>
          </div>
          
          {/* Subtle decorative dot for nodes */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-3 bg-purple border border-black" />
        </div>

        {/* Subtopics — Desktop: Branching layout (left/right alternating) */}
        {hasSubtopics && (
          <div 
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 items-center ${
              isRight ? 'left-[calc(50%+110px)] flex-row' : 'right-[calc(50%+110px)] flex-row-reverse'
            }`}
          >
            {/* Primary Horizontal Branch */}
            <div className="w-12 border-t-2 border-dashed border-purple/40" />

            {/* Subtopics Vertical Group */}
            <div className="relative py-3 flex flex-col gap-1.5">
              
              {/* Vertical Branch Line */}
              <div 
                className={`absolute top-3 bottom-3 border-dashed border-purple/40 ${
                  isRight ? 'left-0 border-l-2' : 'right-0 border-r-2'
                }`}
              />

              {desc.subtopics.map((sub, i) => {
                const hasSection = sub.has_section === true;
                return (
                  <div 
                    key={i} 
                    className={`relative flex items-center ${isRight ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    {/* Small connector to subtopic */}
                    <div className={`w-5 border-t-2 border-dashed border-purple/40 ${
                      isRight ? '-ml-[2px]' : '-mr-[2px]'
                    }`} />
                    
                    {/* Subtopic Box — visual distinction for has_section */}
                    <div
                      className={`
                        relative border-2 border-black px-3 py-1.5 cursor-pointer 
                        transition-all whitespace-nowrap flex items-center gap-1.5
                        ${hasSection 
                          ? 'bg-white shadow-[3px_3px_0_0_#7c3aed] hover:shadow-[4px_4px_0_0_#7c3aed] hover:-translate-y-0.5 hover:-translate-x-0.5' 
                          : 'bg-[#f5f5f5] shadow-[2px_2px_0_0_#000] hover:bg-[#eee] hover:translate-x-0.5'
                        }
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasSection) {
                          onClick(skill, sub);
                        } else {
                          onClick(skill);
                        }
                      }}
                    >
                      {/* Left accent bar */}
                      <div className={`w-1 h-full absolute top-0 bottom-0 ${
                        hasSection ? 'bg-purple' : 'bg-gray-400'
                      } ${isRight ? 'left-0' : 'right-0'}`} />
                      
                      <span className={`font-bold text-xs uppercase tracking-tight z-10 ${
                        isRight ? 'pl-1.5' : 'pr-1.5'
                      }`}>
                        {sub.title}
                      </span>

                      {/* Section indicator icon */}
                      {hasSection && (
                        <ChevronRight size={10} className="text-purple flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subtopics — Mobile: Collapsible vertical list below the skill node */}
      {hasSubtopics && mobileExpanded && (
        <div className="md:hidden w-full max-w-[320px] flex flex-col gap-1.5 -mt-4 mb-2 pl-8 relative">
          {/* Left border line for visual grouping */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple/40" />
          {desc.subtopics.map((sub, i) => {
            const hasSection = sub.has_section === true;
            return (
              <div
                key={i}
                className={`
                  relative border-2 border-black px-3 py-2.5 cursor-pointer 
                  transition-all flex items-center justify-between
                  ${hasSection 
                    ? 'bg-white shadow-[3px_3px_0_0_#7c3aed] active:-translate-y-0.5' 
                    : 'bg-[#f5f5f5] shadow-[2px_2px_0_0_#000] active:translate-x-0.5'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasSection) {
                    onClick(skill, sub);
                  } else {
                    onClick(skill);
                  }
                }}
              >
                {/* Left connector line */}
                <div className="absolute -left-4 top-1/2 w-4 border-t-2 border-dashed border-purple/40" />
                {/* Left accent bar */}
                <div className={`w-1 absolute left-0 top-0 bottom-0 ${hasSection ? 'bg-purple' : 'bg-gray-400'}`} />
                <span className="font-bold text-[11px] uppercase tracking-tight pl-2 flex-1">
                  {sub.title}
                </span>
                {hasSection && (
                  <ChevronRight size={12} className="text-purple flex-shrink-0 ml-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(SkillTreeNode);
