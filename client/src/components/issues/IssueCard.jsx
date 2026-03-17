import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill } from '../shared/StatusPill';
import { MapPin, AlertTriangle, Calendar } from 'lucide-react';
import { truncate, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const IssueCard = ({ issue, roleView = 'tenant' }) => {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-noir-accent_warning" />
            {issue.category} 
            <span className="text-xs text-muted-foreground font-mono">
              (Sev: {issue.severity})
            </span>
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <MapPin className="w-3 h-3" />
            {issue.property?.address || 'Unknown Location'}
          </div>
        </div>
        <StatusPill status={issue.status} />
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(issue.createdAt)}
          </div>
          {issue.isAnonymous ? (
            <span className="italic">Anonymous Report</span>
          ) : (
            <span>Public Report</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Link to={`/issues/${issue.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
