'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ApiLog } from '@/types';
import { useDemoStore } from '@/store/demoStore';

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    POST: 'bg-green-500/20 text-green-400 border-green-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PATCH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border flex-shrink-0 ${colors[method] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: number }) {
  const color =
    status >= 200 && status < 300
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border flex-shrink-0 ${color}`}>
      {status}
    </span>
  );
}

function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`text-gray-400 hover:text-white transition-colors rounded bg-white/5 hover:bg-white/10 flex-shrink-0 ${small ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  );
}

function buildCurl(log: ApiLog): string {
  const lines = [`curl -X ${log.method} '${log.url}'`];
  Object.entries(log.requestHeaders).forEach(([k, v]) => {
    lines.push(`  -H '${k}: ${v}'`);
  });
  if (log.requestBody) {
    lines.push(`  -d '${JSON.stringify(log.requestBody, null, 2)}'`);
  }
  return lines.join(' \\\n');
}

function JsonBlock({ data, maxHeight = 280 }: { data: unknown; maxHeight?: number }) {
  return (
    <SyntaxHighlighter
      language="json"
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: '8px',
        borderRadius: '6px',
        fontSize: '11px',
        background: 'rgba(0,0,0,0.3)',
        maxHeight,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(data, null, 2)}
    </SyntaxHighlighter>
  );
}

function AnimatedJson({ data, isLatest }: { data: unknown; isLatest: boolean }) {
  const [visible, setVisible] = useState(!isLatest);
  useEffect(() => {
    if (isLatest) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
  }, [isLatest]);
  return (
    <motion.div
      initial={isLatest ? { opacity: 0 } : false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
    >
      <JsonBlock data={data} />
    </motion.div>
  );
}

interface LogEntryProps {
  log: ApiLog;
  isLatest: boolean;
}

function LogEntry({ log, isLatest }: LogEntryProps) {
  const [headersOpen, setHeadersOpen] = useState(false);
  const [showCurl, setShowCurl] = useState(false);

  const isWebhook = log.isWebhook;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border overflow-hidden ${
        isLatest
          ? isWebhook
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-indigo-500/40 bg-indigo-500/5'
          : 'border-white/5 bg-white/[0.02]'
      }`}
    >
      {/* Header row */}
      <div className="px-3 py-2.5 bg-white/5 flex items-center gap-2 flex-wrap">
        {isWebhook ? (
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold border bg-amber-500/20 text-amber-400 border-amber-500/30 flex-shrink-0">
            HOOK
          </span>
        ) : (
          <MethodBadge method={log.method} />
        )}
        <span className="font-mono text-xs text-gray-300 flex-1 min-w-0 truncate">{log.url}</span>
        {!isWebhook && <StatusBadge status={log.responseStatus} />}
        {log.duration > 0 && (
          <span className="text-xs text-gray-500 flex-shrink-0">{log.duration}ms</span>
        )}
        {!isWebhook && (
          <button
            onClick={() => setShowCurl(!showCurl)}
            className="text-xs text-gray-500 hover:text-indigo-400 transition-colors flex-shrink-0"
          >
            {showCurl ? 'hide' : 'cURL'}
          </button>
        )}
      </div>

      {/* Label */}
      <div className="px-3 py-1 border-b border-white/5">
        <span className="text-xs text-gray-500">{log.label}</span>
      </div>

      {/* cURL */}
      {showCurl && (
        <div className="px-3 py-2.5 bg-black/30 border-b border-white/5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">cURL</span>
            <CopyButton text={buildCurl(log)} small />
          </div>
          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '6px', borderRadius: '4px', fontSize: '10px', background: 'transparent' }}
          >
            {buildCurl(log)}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Request Headers — only show when there is also a request body */}
      {log.requestBody && (
        <div className="border-b border-white/5">
          <button
            onClick={() => setHeadersOpen(!headersOpen)}
            className="w-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span className={`text-xs transition-transform ${headersOpen ? 'rotate-90' : ''}`}>▶</span>
            Request Headers
          </button>
          {headersOpen && (
            <div className="px-3 pb-2">
              <JsonBlock data={log.requestHeaders} maxHeight={120} />
            </div>
          )}
        </div>
      )}

      {/* Request Body */}
      {log.requestBody && (
        <div className="border-b border-white/5 px-3 py-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {isWebhook ? 'Webhook Payload' : 'Request Body'}
            </span>
            <CopyButton text={JSON.stringify(log.requestBody, null, 2)} small />
          </div>
          <JsonBlock data={log.requestBody} />
        </div>
      )}

      {/* Response Body */}
      {!isWebhook && (
        <div className="px-3 py-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Response Body</span>
            <CopyButton text={JSON.stringify(log.responseBody, null, 2)} small />
          </div>
          <AnimatedJson data={log.responseBody} isLatest={isLatest} />
        </div>
      )}
    </motion.div>
  );
}

export default function ApiInspector() {
  const { apiLogs, currentStep } = useDemoStore();
  const stepLogs = apiLogs.filter((l) => l.step === currentStep);

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] text-white">
      {/* Traffic light header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-400 font-mono">API Inspector</span>
        {stepLogs.length > 0 && (
          <span className="ml-auto text-xs text-gray-600">
            {stepLogs.length} request{stepLogs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {stepLogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-16"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">No API calls yet</p>
              <p className="text-gray-700 text-xs mt-1">Complete the action on the left to see requests here</p>
            </motion.div>
          ) : (
            stepLogs.map((log, idx) => (
              <LogEntry key={log.id} log={log} isLatest={idx === stepLogs.length - 1} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
