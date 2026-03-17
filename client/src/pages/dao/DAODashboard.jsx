import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Gavel, Clock, CheckCircle, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { RoleBadge } from '@/components/shared/RoleBadge';

export const DAODashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data } = await api.get('/dao/cases');
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const openCases = cases.filter(c => c.status === 'Open');
  const pastCases = cases.filter(c => c.status === 'Closed');

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold">Juror Portal</h1>
            <RoleBadge role="dao_member" />
          </div>
          <p className="text-muted-foreground">Community Dispute Resolution</p>
        </div>

        <Card className="bg-secondary/50 border-border/50">
          <CardContent className="p-4 flex flex-row items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Tokens</span>
              <span className="text-3xl font-mono font-bold text-noir-accent_secondary flex items-center gap-2">
                150
                <span className="text-sm font-sans font-normal text-muted-foreground">RNT</span>
              </span>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Yield</span>
              <span className="text-xl font-mono font-bold text-noir-accent_success">+4.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Active Cases */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Scale className="w-5 h-5 text-noir-accent_secondary" />
              Active Tribunals ({openCases.length})
            </h2>
          </div>

          {loading ? (
             <div className="space-y-4 animate-pulse">
               {[1, 2].map(i => <Card key={i} className="h-32 bg-secondary/50" />)}
             </div>
          ) : openCases.length === 0 ? (
            <Card className="border-dashed bg-transparent border-noir-accent_secondary/50">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="w-12 h-12 text-noir-accent_secondary mb-4 opacity-50" />
                <p className="text-foreground font-medium">No open cases.</p>
                <p className="text-muted-foreground text-sm">You have fulfilled your juror duties for now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {openCases.map(c => (
                <Card key={c.id} className="hover:border-noir-accent_secondary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          Case #{c.id.substring(0,8).toUpperCase()}
                        </CardTitle>
                        <CardDescription>Escalated {formatDate(c.openedAt)}</CardDescription>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-noir-accent_secondary/10 text-noir-accent_secondary border border-noir-accent_secondary/20">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Verdicts
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                     {/* Simplified issue preview for juror */}
                    <div className="bg-background rounded p-3 mb-4 text-sm border border-border">
                      <p className="font-medium mb-1">Issue Overview:</p>
                      <p className="text-muted-foreground line-clamp-2">{c.issue.description}</p>
                    </div>
                    <Link to={`/issues/${c.issueId}`}>
                      <Button variant="outline" className="w-full">Review Evidence & Vote</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Resolutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastCases.slice(0, 5).map(c => (
                <div key={c.id} className="flex flex-col p-3 rounded-lg border border-border/50 bg-secondary/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">#{c.id.substring(0,6).toUpperCase()}</span>
                    <span className={`text-xs font-bold ${c.resolution === 'Sustained' ? 'text-noir-accent_success' : 'text-noir-accent_danger'}`}>
                      {c.resolution}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Closed {formatDate(c.closedAt)}</span>
                </div>
              ))}
              {pastCases.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No case history.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
