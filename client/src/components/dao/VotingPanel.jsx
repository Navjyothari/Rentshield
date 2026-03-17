import React, { useState } from 'react';
import { useDAO } from '@/hooks/useDAO';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Shield, AlertCircle } from 'lucide-react';

export const VotingPanel = ({ caseId, existingVote, onVoteComplete }) => {
  const { castVote, loading } = useDAO();
  const [vote, setVote] = useState(null); // true=sustain, false=dismiss
  const [reason, setReason] = useState('');

  const submitVote = async () => {
    if (vote === null || !reason.trim()) return;
    try {
      const result = await castVote(caseId, vote, reason);
      if (onVoteComplete) onVoteComplete(result);
    } catch (err) {
      console.error(err);
    }
  };

  if (existingVote) {
    return (
      <Card className="border-noir-accent_secondary/50 bg-noir-accent_secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2 text-noir-accent_secondary font-semibold">
            <Shield className="w-5 h-5" />
            Vote Recorded: {existingVote.vote ? 'Sustain' : 'Dismiss'}
          </div>
          <p className="text-sm text-muted-foreground italic">
            "{existingVote.reason}"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="w-5 h-5 text-primary" />
          Submit Juror Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant={vote === true ? 'default' : 'outline'}
            onClick={() => setVote(true)}
            className={vote === true ? "bg-noir-accent_success hover:bg-noir-accent_success/90 ring-2 ring-noir-accent_success ring-offset-2 ring-offset-background" : "hover:border-noir-accent_success"}
          >
            Sustain Issue (Tenant)
          </Button>
          <Button 
            variant={vote === false ? 'destructive' : 'outline'}
            onClick={() => setVote(false)}
            className={vote === false ? "ring-2 ring-destructive ring-offset-2 ring-offset-background" : "hover:border-destructive"}
          >
            Dismiss Issue (Landlord)
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reasoning (Required)</label>
          <Textarea 
            placeholder="Explain the basis for your vote..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          disabled={vote === null || !reason.trim() || loading} 
          onClick={submitVote}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Cast Official Vote'}
        </Button>
      </CardContent>
    </Card>
  );
};
