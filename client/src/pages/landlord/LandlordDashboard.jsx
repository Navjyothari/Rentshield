import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { IssueCard } from '@/components/issues/IssueCard';
import { Shield, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { RoleBadge } from '@/components/shared/RoleBadge';

export const LandlordDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ properties: [], activeIssues: [], stats: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandlordData = async () => {
      try {
        setLoading(true);
        // We'll fetch properties owned by the landlord.
        // In a real app we'd have a specific endpoint, reusing /properties for now assuming backend filters
        const [propsRes, issuesRes, profileRes] = await Promise.all([
          api.get('/properties'), 
          api.get('/issues'), // Backend handles scoping to landlord's properties via requireRole
          api.get(`/landlords/${user.id}`) // Assuming user ID matches landlord ID structure for now
        ]);
        
        setData({
          properties: propsRes.data,
          activeIssues: issuesRes.data.filter(i => i.status !== 'Resolved' && i.status !== 'Dismissed'),
          stats: profileRes.data || { reputationScore: 85, totalResolved: 12 }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandlordData();
  }, [user]);

  if (loading) {
    return <div className="p-8 animate-pulse text-center">Loading Property Data...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">{user?.displayName}</h1>
            <RoleBadge role="landlord" />
            {(data.stats?.reputationScore > 80) && <RoleBadge role="verified" />}
          </div>
          <p className="text-muted-foreground mr-2">Property Management Portal</p>
        </div>

        <Card className="bg-secondary/50 border-border/50">
          <CardContent className="p-4 flex flex-row items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reputation Score</span>
              <span className="text-3xl font-mono font-bold text-primary flex items-center gap-2">
                {data.stats?.reputationScore || 0}
                <TrendingUp className="w-5 h-5 text-noir-accent_success" />
              </span>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resolved</span>
              <span className="text-xl font-mono font-bold">{data.stats?.totalResolved || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Alerts */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-noir-accent_warning" />
              Action Required ({data.activeIssues.length})
            </h2>
          </div>

          {data.activeIssues.length === 0 ? (
            <Card className="border-dashed bg-transparent border-noir-accent_success/50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Shield className="w-12 h-12 text-noir-accent_success mb-4 opacity-50" />
                <p className="text-foreground font-medium">All clear.</p>
                <p className="text-muted-foreground text-sm">No active maintenance or compliance issues across your portfolio.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {data.activeIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} roleView="landlord" />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Properties */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Your Properties
              </CardTitle>
              <CardDescription>Managed portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.properties.map(p => (
                <div key={p.id} className="flex flex-col p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <span className="font-medium text-sm">{p.address}</span>
                  <span className="text-xs text-muted-foreground">{p.area}</span>
                </div>
              ))}
              {data.properties.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No properties listed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
