'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Clock, Circle } from 'lucide-react';

function SkillNode({ data, selected }) {
  const { label, status, onClick, orderIndex } = data;

  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-lime',
          border: 'border-black',
          shadow: 'shadow-brutal-lime',
          icon: <CheckCircle size={16} className="text-black" />
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow',
          border: 'border-black',
          shadow: 'shadow-brutal',
          icon: <Clock size={16} className="text-black" />
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-black',
          shadow: 'shadow-brutal',
          icon: <Circle size={16} className="text-muted" />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 min-w-[180px] cursor-pointer
        border-3 ${styles.border} ${styles.bg}
        ${selected ? 'shadow-brutal-lg ring-2 ring-purple' : styles.shadow}
        hover:shadow-brutal-lg transition-shadow
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-black !border-2 !border-white"
      />
      
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[10px] text-muted font-bold">
          #{orderIndex + 1}
        </span>
        {styles.icon}
      </div>
      
      <div className="font-black text-sm uppercase tracking-tight">
        {label}
      </div>
      
      {status === 'completed' && (
        <div className="mt-2 font-mono text-[10px] text-black/70 font-bold">
          ✓ COMPLETED
        </div>
      )}
      {status === 'in-progress' && (
        <div className="mt-2 font-mono text-[10px] text-black/70 font-bold">
          ⏳ IN PROGRESS
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-black !border-2 !border-white"
      />
    </div>
  );
}

export default memo(SkillNode);
