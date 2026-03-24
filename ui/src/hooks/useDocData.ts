import { useState, useEffect } from 'react';
import type { PepsDocData } from '../types';
import { MOCK_DATA } from '../mock';

export function useDocData() {
  const [data, setData] = useState<PepsDocData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const basePath = window.location.pathname.replace(/\/$/, '') || '/docs';
        const res = await fetch(`${basePath}/api/data`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(MOCK_DATA);
        }
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading };
}
