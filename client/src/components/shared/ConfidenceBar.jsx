import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from './Progress';

export const ConfidenceBar = ({ score, className }) => {
  const percentage = Math.round(score * 100);
  
  let colorClass = 'bg-noir-accent_danger'; // Low confidence (< 60%)
  if (percentage >= 80) colorClass = 'bg-noir-accent_success';
  else if (percentage >= 60) colorClass = 'bg-noir-accent_warning';

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <Progress value={percentage} indicatorColor={colorClass} className="h-2" />
      </div>
      <span className={cn("text-xs font-mono font-medium", colorClass.replace('bg-', 'text-'))}>
        {percentage}%
      </span>
    </div>
  );
};
