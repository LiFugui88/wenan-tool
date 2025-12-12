'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { LogEntry } from '@/types';

const typeLabels: Record<LogEntry['type'], string> = {
  audit: '文案审核',
  classification: '文案分类',
  rewrite: '文案仿写',
  quality: '质量判断',
};

const statusIcons: Record<LogEntry['status'], React.ReactNode> = {
  pending: <Clock size={14} className="text-gray-500" />,
  running: <Loader2 size={14} className="text-amber-400 animate-spin" />,
  success: <CheckCircle2 size={14} className="text-green-400" />,
  error: <XCircle size={14} className="text-red-400" />,
};

function LogItem({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="border border-amber-500/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2 bg-[#0d0d0d] hover:bg-[#151515] transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-amber-500/60" />
        ) : (
          <ChevronRight size={14} className="text-amber-500/60" />
        )}
        {statusIcons[log.status]}
        <span className="text-amber-400 text-xs font-medium min-w-[60px]">
          {typeLabels[log.type]}
        </span>
        {log.industry && (
          <span className="text-gray-500 text-xs">
            [{log.industry}]
          </span>
        )}
        <span className="text-gray-600 text-xs ml-auto">
          {formatTime(log.timestamp)}
        </span>
      </button>

      {expanded && (
        <div className="px-3 py-3 space-y-3 bg-[#080808] text-xs">
          {log.input && (
            <div>
              <div className="text-amber-400/80 mb-1 font-medium">输入:</div>
              <pre className="text-gray-400 whitespace-pre-wrap break-all bg-[#0a0a0a] p-2 rounded max-h-40 overflow-auto">
                {log.input.length > 500 ? log.input.slice(0, 500) + '...' : log.input}
              </pre>
            </div>
          )}
          {log.output && (
            <div>
              <div className="text-green-400/80 mb-1 font-medium">输出:</div>
              <pre className="text-gray-400 whitespace-pre-wrap break-all bg-[#0a0a0a] p-2 rounded max-h-40 overflow-auto">
                {log.output.length > 500 ? log.output.slice(0, 500) + '...' : log.output}
              </pre>
            </div>
          )}
          {log.error && (
            <div>
              <div className="text-red-400/80 mb-1 font-medium">错误:</div>
              <pre className="text-red-400/80 whitespace-pre-wrap break-all bg-[#0a0a0a] p-2 rounded">
                {log.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExecutionLog() {
  const { logs, clearLogs } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-[#111] border border-amber-500/20 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-amber-500/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-amber-300 font-medium text-sm hover:text-amber-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          执行日志 ({logs.length})
        </button>
        <button
          onClick={clearLogs}
          className="text-gray-500 hover:text-red-400 transition-colors p-1"
          title="清空日志"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
