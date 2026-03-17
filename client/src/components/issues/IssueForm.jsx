import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Label } from '../ui/Label';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const issueSchema = z.object({
  propertyId: z.string().min(1, 'Property selection is required'),
  category: z.enum(['Safety', 'Maintenance', 'Harassment', 'Discrimination']),
  severity: z.string().regex(/^[1-5]$/, 'Severity must be 1-5'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  isAnonymous: z.boolean().default(true),
});

export const IssueForm = ({ properties, onIssueCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      category: 'Maintenance',
      severity: '3',
      isAnonymous: true
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    let issueId = null;
    try {
      // 1. Create Issue
      const issueRes = await api.post('/issues', {
        ...data,
        severity: parseInt(data.severity)
      });
      issueId = issueRes.data.id;

      // 2. Upload Evidence if any
      if (files.length > 0) {
        toast.loading('Uploading evidence and running AI analysis...', { id: 'upload' });
        
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          await api.post(`/evidence/upload/${issueId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        toast.dismiss('upload');
      }

      toast.success('Issue reported successfully!');
      if (onIssueCreated) onIssueCreated(issueRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const valid = selected.every(f => f.size <= 10 * 1024 * 1024); // 10MB
      if (!valid) {
        toast.error('Files must be under 10MB');
        return;
      }
      setFiles(selected);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Property Context</Label>
        <Select onValueChange={(val) => setValue('propertyId', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Search or select a property..." />
          </SelectTrigger>
          <SelectContent>
            {properties?.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.address} ({p.area})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.propertyId && <p className="text-xs text-destructive">{errors.propertyId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select defaultValue="Maintenance" onValueChange={(val) => setValue('category', val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Harassment">Harassment</SelectItem>
              <SelectItem value="Discrimination">Discrimination</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Severity (1 = Low, 5 = Critical)</Label>
          <Input type="number" min="1" max="5" {...register('severity')} />
          {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Detailed Description</Label>
        <Textarea 
          placeholder="Provide specific details about the issue..."
          className="min-h-[150px]"
          {...register('description')} 
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Evidence Upload</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
          <Input 
            type="file" 
            multiple 
            onChange={handleFileChange}
            className="hidden" 
            id="file-upload"
            accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
          />
          <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-primary">Click to select files</span>
            <span className="text-xs text-muted-foreground">JPG, PNG, PDF, MP4 up to 10MB</span>
          </Label>
          {files.length > 0 && (
            <div className="mt-4 text-xs text-left">
              <p className="font-semibold mb-1">Selected Files:</p>
              <ul className="list-disc pl-4">
                {files.map((f, i) => <li key={i}>{f.name} ({(f.size/1024/1024).toFixed(1)}MB)</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isAnonymous" 
          checked={watch('isAnonymous')}
          onCheckedChange={(c) => setValue('isAnonymous', c)}
        />
        <Label htmlFor="isAnonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Submit Report Anonymously
        </Label>
      </div>
      <p className="text-xs text-muted-foreground ml-6">
        When checked, your identity is never exposed to landlords, jurors, or the public platform.
      </p>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Processing...' : 'Submit Official Report'}
      </Button>
    </form>
  );
};
