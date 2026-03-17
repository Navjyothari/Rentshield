import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Activity, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
  Reported: {
    label: 'Reported',
    color: 'bg-noir-text_muted/20 text-noir-text_secondary border-noir-text_muted/50',
    icon: Clock,
  },
  Under_Review: {
    label: 'Under Review',
    color: 'bg-noir-accent_warning/20 text-noir-accent_warning border-noir-accent_warning/50',
    icon: Activity,
    animate: true
  },
  Resolved: {
    label: 'Resolved',
    color: 'bg-noir-accent_success/20 text-noir-accent_success border-noir-accent_success/50',
    icon: CheckCircle,
  },
  Dismissed: {
    label: 'Dismissed',
    color: 'bg-noir-accent_danger/20 text-noir-accent_danger border-noir-accent_danger/50',
    icon: XCircle,
  },
};

export const StatusPill = ({ status, className }) => {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm transition-colors",
        config.color,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.animate && "animate-pulse")} />
      {config.label}
    </span>
  );
};
