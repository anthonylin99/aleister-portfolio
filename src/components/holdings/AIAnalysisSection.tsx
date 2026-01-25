'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { userThesisData } from '@/data/user-thesis';
import { cn } from '@/lib/utils';

interface AIAnalysisSectionProps {
  ticker: string;
  companyName: string;
}

export function AIAnalysisSection({ ticker, companyName }: AIAnalysisSectionProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingCache, setCheckingCache] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const thesisData = userThesisData[ticker.toUpperCase()];

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/ai/generate-thesis?ticker=${encodeURIComponent(ticker)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.analysis) setAnalysis(data.analysis);
          else setAnalysis(null);
        }
      } catch {
        if (!cancelled) setAnalysis(null);
      } finally {
        if (!cancelled) setCheckingCache(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticker]);

  const handleGenerate = async (forceRegenerate: boolean) => {
    if (!thesisData) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          companyName,
          userThesis: thesisData.thesis,
          priceTarget: thesisData.priceTarget,
          catalysts: thesisData.catalysts,
          risks: thesisData.risks,
          forceRegenerate,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setError(null);
      } else {
        const msg = data.error || (res.ok ? null : `Request failed (${res.status})`);
        setError(msg || 'Failed to generate analysis');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Analysis</h2>
          <p className="text-sm text-slate-400">Claude-generated perspective to complement your thesis</p>
        </div>
      </div>

      {checkingCache && !analysis && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-700 text-center text-slate-500">
          Checking for cached analysis...
        </div>
      )}

      {!checkingCache && !analysis && !loading && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-dashed border-slate-700">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800/50 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <p className="text-slate-500 text-center mb-4">
            No AI analysis yet. Generate one to get an independent analytical perspective.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => handleGenerate(false)}
              disabled={!thesisData}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                thesisData
                  ? "bg-violet-600 text-white hover:bg-violet-500"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Generate AI Analysis
            </button>
          </div>
          {!thesisData && (
            <p className="text-slate-600 text-sm text-center mt-2">Add thesis data for {ticker} to enable.</p>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating analysis...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800/50 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
          <div
            className={cn(
              "bg-slate-900/50 rounded-xl p-6 border border-slate-700/50",
              "prose prose-invert prose-sm max-w-none",
              "prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300",
              "prose-table:text-slate-300 prose-th:border-slate-600 prose-td:border-slate-700"
            )}
          >
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
