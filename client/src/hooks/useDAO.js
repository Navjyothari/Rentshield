import { useState, useCallback } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useDAO = () => {
  const [loading, setLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dao/cases');
      return data;
    } catch (err) {
      toast.error('Failed to load DAO cases');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const castVote = async (caseId, vote, reason) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/dao/cases/${caseId}/vote`, { vote, reason });
      toast.success('Vote recorded successfully');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit vote');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchCases, castVote };
};
