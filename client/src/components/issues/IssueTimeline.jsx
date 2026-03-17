import React from 'react';
import { StatusPill } from '../shared/StatusPill';
import { formatDate } from '@/lib/utils';
import { Circle, AlertCircle, FileCheck, Gavel, User } from 'lucide-react';

export const IssueTimeline = ({ issue }) => {
  // Construct timeline events dynamically based on issue state
  const events = [];

  // Required: Creation event
  events.push({
    id: 'created',
    date: issue.createdAt,
    title: 'Issue Reported',
    description: issue.isAnonymous ? 'Reported anonymously by tenant' : 'Reported by tenant',
    icon: User,
    color: 'text-noir-text_secondary'
  });

  // Optional: AI Analysis (if attached)
  if (issue.aiVerdict) {
    events.push({
      id: 'ai',
      date: issue.aiVerdict.generatedAt,
      title: 'AI Verification Complete',
      description: `Confidence Score: ${Math.round(issue.aiVerdict.confidenceScore * 100)}% for ${issue.aiVerdict.autoCategory}`,
      icon: FileCheck,
      color: 'text-noir-accent_primary'
    });
  }

  // Optional: DAO Escalation
  if (issue.daoCase) {
    events.push({
      id: 'dao_opened',
      date: issue.daoCase.openedAt,
      title: 'Escalated to DAO Tribunal',
      description: 'Case opened for neutral juror review',
      icon: Gavel,
      color: 'text-noir-accent_warning'
    });

    if (issue.daoCase.status === 'Closed') {
      events.push({
        id: 'dao_closed',
        date: issue.daoCase.closedAt,
        title: `Resolution: ${issue.daoCase.resolution}`,
        description: 'Binding verdict reached by majority vote',
        icon: AlertCircle,
        color: issue.daoCase.resolution === 'Sustained' ? 'text-noir-accent_success' : 'text-noir-accent_danger'
      });
    }
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="relative border-l border-border ml-3 space-y-8 py-2">
      {events.map((event, idx) => {
        const Icon = event.icon || Circle;
        const isLast = idx === events.length - 1;
        
        return (
          <div key={event.id} className="relative pl-6">
            <span className="absolute -left-3 top-1 bg-background p-1 border border-border rounded-full ring-2 ring-background">
              <Icon className={`w-3.5 h-3.5 ${event.color}`} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{event.title}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{event.description}</span>
              <span className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                {formatDate(event.date)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
