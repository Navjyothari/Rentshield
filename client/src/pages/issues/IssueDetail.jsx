import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/shared/StatusPill';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { VotingPanel } from '@/components/dao/VotingPanel';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, MapPin, User, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const IssueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const { data } = await window.apiInstance.get(`/issues/${id}`); // Assumes api.get but uses global window for simplicity if api not bound
        setIssue(data);
      } catch (err) {
        try {
            // Fallback for actual import api from '@/lib/axios'
            const { data } = await api.get(`/issues/${id}`);
            setIssue(data);
        } catch (e) {
            toast.error('Failed to load issue details');
            navigate('/dashboard/tenant');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center animate-pulse">Decrypting ledger...</div>;
  if (!issue) return null;

  // Render logic...
  const canVote = user?.role === 'dao_member' && issue.status === 'Under_Review' && issue.daoCase;
  const existingVote = issue.daoCase?.votes?.find(v => v.voterId === user?.id);

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Top Meta Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-noir-accent_warning" />
              {issue.category} Issue
            </h1>
            <StatusPill status={issue.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {issue.property.address}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4"/> {issue.isAnonymous ? 'Anonymous Tenant' : 'Public Ledger'}</span>
            <span>Reported {formatDate(issue.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons for Landlords */}
        {user?.role === 'landlord' && issue.status === 'Reported' && (
          <div className="flex gap-2">
            <Button onClick={async () => {
              await api.patch(`/issues/${issue.id}/status`, { status: 'Resolved' });
              window.location.reload();
            }} className="bg-noir-accent_success hover:bg-noir-accent_success/90 text-white">
              Mark Resolved
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Left Content */}
        <div className="md:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-border/40 pb-2">Description</h2>
            <div className="bg-secondary/20 p-6 rounded-xl border border-border/50 prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{issue.description}</p>
            </div>
          </section>

          {/* Evidence Grid */}
          {issue.evidence && issue.evidence.length > 0 && (
            <section className="space-y-4">
               <h2 className="text-xl font-semibold border-b border-border/40 pb-2">Attached Evidence</h2>
               <div className="grid sm:grid-cols-2 gap-4">
                 {issue.evidence.map(ev => (
                   <Card key={ev.id} className="overflow-hidden bg-black/40 border-border/50">
                     <div className="aspect-video relative group flex items-center justify-center">
                       {/* If image show it, else generic file icon */}
                       {ev.fileUrl.match(/\.(jpeg|jpg|png|webp)$/i) ? (
                         <img src={ev.fileUrl} alt="Evidence" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                       ) : (
                         <FileText className="w-12 h-12 text-muted-foreground" />
                       )}
                       
                       <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                         <Download className="w-4 h-4" />
                       </a>
                     </div>
                     <CardContent className="p-3 text-xs flex justify-between items-center bg-secondary/50">
                        <span className="truncate max-w-[150px]">{ev.fileUrl.split('/').pop()}</span>
                        {ev.tamperScore !== null && (
                          <span className={`font-mono ${ev.tamperScore > 0.5 ? 'text-noir-accent_danger' : 'text-noir-accent_success'}`}>
                            EXIF Tamper: {(ev.tamperScore * 100).toFixed(0)}%
                          </span>
                        )}
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </section>
          )}

          {/* DAO Voting Panel (Only visible to Jurors when case is open) */}
          {canVote && (
            <section className="mt-8">
              <VotingPanel 
                caseId={issue.daoCase.id} 
                existingVote={existingVote}
                onVoteComplete={() => window.location.reload()}
              />
            </section>
          )}
        </div>

        {/* Right Sidebar: AI Analysis & Timeline */}
        <div className="space-y-6">
          
          {issue.aiVerdict ? (
            <Card className="border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI Verification Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Confidence Score</span>
                  <ConfidenceBar score={issue.aiVerdict.confidenceScore} />
                </div>
                <div className="space-y-1 p-3 bg-background rounded-md border border-border/50">
                   <span className="text-xs text-muted-foreground block mb-1">Generated Analysis</span>
                   <p className="text-sm leading-relaxed text-foreground/90">{issue.aiVerdict.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card className="border-dashed bg-transparent text-center py-6">
               <CardContent className="opacity-50 text-sm">
                 AI Analysis Pending or Unavailable
               </CardContent>
             </Card>
          )}

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Event Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <IssueTimeline issue={issue} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
