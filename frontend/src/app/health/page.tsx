'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ServerIcon, GlobeAltIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface HealthData {
  success: boolean;
  latencyMs?: number;
  pingedUrl?: string;
  error?: string;
  backendResponse?: {
    success: boolean;
    message: string;
    timestamp: string;
  } | null;
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/keep-alive', { cache: 'no-store' });
      const json = await res.json();
      setData(json);
    } catch (err) {
      setData({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const overallStatus = data?.success ? 'operational' : data?.error ? 'outage' : 'checking';

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#e8e4f0] bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5c5470] flex items-center justify-center text-white font-bold text-sm shadow-md">
              E
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]">EliosWholesale</h1>
              <p className="text-xs text-[#888888]">Service Status Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => checkHealth(true)}
            disabled={loading || refreshing}
            className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2 border border-[#e8e4f0] rounded-full hover:bg-[#f5f4f7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10">
        {/* Overall Banner */}
        <div className={`mb-8 p-6 rounded-2xl border transition-all duration-300 ${
          overallStatus === 'operational'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : overallStatus === 'outage'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-start gap-4">
            {overallStatus === 'operational' ? (
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            ) : overallStatus === 'outage' ? (
              <XCircleIcon className="w-8 h-8 text-rose-600 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
            )}

            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">
                {overallStatus === 'operational' && 'All Systems Operational'}
                {overallStatus === 'outage' && 'Service Outage / Issue Detected'}
                {overallStatus === 'checking' && 'Checking System Status...'}
              </h2>
              <p className="text-sm opacity-90">
                {overallStatus === 'operational' && 'Both EliosWholesale Frontend and Backend Services are fully responsive and operational.'}
                {overallStatus === 'outage' && `Backend API is currently unresponsive: ${data?.error || 'Unknown network error.'}`}
                {overallStatus === 'checking' && 'Pinging active services to fetch latency and database connectivity metrics.'}
              </p>
            </div>

            {lastChecked && (
              <div className="text-right text-xs opacity-75 hidden sm:block">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Frontend Service Card */}
          <div className="bg-white border border-[#e8e4f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-50 text-[#5c5470]">
                    <GlobeAltIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Frontend App</h3>
                    <p className="text-xs text-[#888888]">Next.js Store Client</p>
                  </div>
                </div>
                <span className="badge bg-emerald-100 text-emerald-800 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="space-y-3 py-3 border-y border-[#f5f4f7] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Environment:</span>
                  <span className="font-semibold">{process.env.NODE_ENV || 'production'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Framework:</span>
                  <span className="font-semibold">Next.js 16 (React 19)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Client Port:</span>
                  <span className="font-semibold">3000</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-xs text-[#888888] flex items-center justify-between">
              <span>Client-side application</span>
              <span className="font-semibold text-[#1a1a1a]">Stable</span>
            </div>
          </div>

          {/* Backend Service Card */}
          <div className="bg-white border border-[#e8e4f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-[#5c5470]">
                    <ServerIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Backend API</h3>
                    <p className="text-xs text-[#888888]">Express Server</p>
                  </div>
                </div>
                {loading ? (
                  <span className="badge bg-amber-100 text-amber-800 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                    Checking...
                  </span>
                ) : data?.success ? (
                  <span className="badge bg-emerald-100 text-emerald-800 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="badge bg-rose-100 text-rose-800 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    Offline
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-4 py-4 animate-pulse">
                  <div className="h-3 bg-[#f5f4f7] rounded w-3/4"></div>
                  <div className="h-3 bg-[#f5f4f7] rounded w-5/6"></div>
                  <div className="h-3 bg-[#f5f4f7] rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-3 py-3 border-y border-[#f5f4f7] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#888888]">Endpoint:</span>
                    <span className="font-semibold font-tabular text-[10px] break-all max-w-[200px] text-right" title={data?.pingedUrl}>
                      {data?.pingedUrl || 'http://82.180.145.145:4000/health'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Latency:</span>
                    <span className={`font-semibold font-tabular ${
                      (data?.latencyMs ?? 0) > 1000 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {data?.latencyMs != null ? `${data.latencyMs} ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Database:</span>
                    <span className={`font-semibold ${data?.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {data?.success ? 'Connected' : 'Unreachable'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 text-xs text-[#888888] flex items-center justify-between">
              <span>{data?.backendResponse?.message || 'Elios API Server'}</span>
              <span className="font-semibold text-[#1a1a1a]">
                {data?.latencyMs != null && data.latencyMs < 300 ? 'Fast' : data?.latencyMs != null ? 'Fair' : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Logs (when error occurs) */}
        {data?.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-sm text-red-800 mb-2 flex items-center gap-1.5">
              <AlertTriangleIcon className="w-4 h-4" /> Connection Diagnosis
            </h3>
            <p className="text-xs text-red-700 leading-relaxed">
              The frontend is trying to query the Express backend at <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-[10px]">{data?.pingedUrl}</code>, but the request timed out or was rejected. 
              Please verify that the backend PM2 process is running (`pm2 status`) and the server port `4000` is open.
            </p>
          </div>
        )}

        {/* Action Button Links */}
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c5470] hover:text-[#4A3B52] transition-colors"
          >
            Go to Login
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e4f0] bg-white py-6 px-6 text-center text-xs text-[#888888]">
        <p>© {new Date().getFullYear()} EliosWholesale. All systems monitored.</p>
      </footer>
    </div>
  );
}

function AlertTriangleIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
