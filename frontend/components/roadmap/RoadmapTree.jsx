'use client';

import SkillTreeNode from './SkillTreeNode';

export default function RoadmapTree({ skills, progress, onSkillClick }) {
  const completedSkills = progress?.completedSkills || [];
  const inProgressSkills = progress?.inProgressSkills || [];

  const getStatus = (skill) => {
    if (completedSkills.includes(skill.id)) return 'completed';
    if (inProgressSkills.includes(skill.id)) return 'in-progress';
    return 'pending';
  };

  if (!skills.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-bg-dark border-3 border-black flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <p className="font-mono text-sm text-muted">No skills defined yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10 min-h-full overflow-hidden px-4 md:px-0">
      
      {/* Start marker */}
      <div className="relative flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-lime border-3 border-black z-10" />
        <span className="font-mono text-[10px] text-muted font-bold tracking-widest mt-2 mb-2">START</span>
        <div className="w-1 h-6 bg-black z-0" />
      </div>

      {/* Skill nodes */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        {skills.map((skill, index) => (
          <SkillTreeNode
            key={skill.id}
            skill={skill}
            status={getStatus(skill)}
            onClick={onSkillClick}
            isLast={index === skills.length - 1}
            index={index}
          />
        ))}
      </div>

      {/* End marker */}
      {skills.length > 0 && (
        <div className="relative flex flex-col items-center mt-[-24px]">
          <div className="w-1 h-12 bg-black z-0" />
          <div className="w-4 h-4 rounded-full bg-purple border-3 border-black z-10 mb-2" />
          <span className="font-mono text-[10px] text-muted font-bold tracking-widest">MASTERY</span>
        </div>
      )}
    </div>
  );
}
