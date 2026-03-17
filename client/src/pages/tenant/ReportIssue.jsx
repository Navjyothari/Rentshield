import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueForm } from '@/components/issues/IssueForm';
import { Card, CardContent } from '@/components/ui/Card';
import { ShieldAlert, Info } from 'lucide-react';
import api from '@/lib/axios';

export const ReportIssue = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch properties for the dropdown
    const fetchProps = async () => {
      try {
        const { data } = await api.get('/properties');
        setProperties(data);
      } catch (e) {
        console.error('Failed to load properties', e);
      }
    };
    fetchProps();
  }, []);

  const handleIssueCreated = (issue) => {
    // Redirect to the tenant dashboard after short delay to let toast show
    setTimeout(() => {
      navigate('/dashboard/tenant');
    }, 1500);
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          File an Official Report
        </h1>
        <p className="text-muted-foreground">
          Submit details and evidence securely. Anonymity is guaranteed if selected.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="md:order-1">
          <Card>
            <CardContent className="pt-6">
              <IssueForm properties={properties} onIssueCreated={handleIssueCreated} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:order-2">
          {/* Info Sidecar */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                What Happens Next?
              </h3>
              <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                <li><strong className="text-foreground">AI Verification</strong>: Your evidence is instantly scanned for tampering and categorized.</li>
                <li><strong className="text-foreground">Public Logging</strong>: The issue joins the immutable public ledger (anonymized).</li>
                <li><strong className="text-foreground">Resolution Window</strong>: The landlord is notified and has time to resolve.</li>
                <li><strong className="text-foreground">DAO Escalation</strong>: Unresolved high-severity issues trigger tribunal voting.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
