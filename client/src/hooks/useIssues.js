import { useState, useCallback } from 'react';
import api from '../lib/axios';

export const useIssues = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/issues${params ? `?${params}` : ''}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyIssues = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues/my');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createIssue = async (issueData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/issues', issueData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/issues/${id}/status`, { status });
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return { loading, error, fetchIssues, fetchMyIssues, createIssue, updateIssueStatus };
};
