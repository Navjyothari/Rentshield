import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import { IssueCard } from '@/components/issues/IssueCard';
import { Plus, Bell, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TenantDashboard = () => {
  const { user } = useAuth();
  const { fetchMyIssues, loading } = useIssues();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    const getIssues = async () => {
      const data = await fetchMyIssues();
      setIssues(data || []);
    };
    getIssues();
  }, [fetchMyIssues]);

  const activeIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Dismissed');
  
  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Welcome back, {user?.displayName}</h1>
          <p className="text-muted-foreground mt-1">Tenant Overview & Active Reports</p>
        </div>
        <Link to="/report">
          <Button className="gap-2 w-full md:w-auto">
            <Plus className="w-4 h-4" /> New Official Report
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content: Issues List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Your Active Reports ({activeIssues.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map(i => <Card key={i} className="h-32 bg-secondary/50" />)}
            </div>
          ) : activeIssues.length === 0 ? (
            <Card className="border-dashed bg-transparent">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground mb-4">You have no active reports.</p>
                <Link to="/report">
                  <Button variant="outline">File a Report</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} roleView="tenant" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" />
                Latest Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issues.slice(0, 3).map(issue => (
                <div key={issue.id} className="mb-4 last:mb-0 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{issue.category} Report Status</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changed to <span className="font-semibold text-foreground">{issue.status}</span>
                  </p>
                </div>
              ))}
              {issues.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No recent activity.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
