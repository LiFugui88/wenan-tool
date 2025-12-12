'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useAppStore } from '@/store';

export function ApiConfigModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { apiKey, setApiKey, defaultModel, setDefaultModel } = useAppStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(defaultModel);

  const handleSave = () => {
    setApiKey(localApiKey);
    setDefaultModel(localModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20">
          <h2 className="text-xl font-bold text-amber-400 tracking-wide">API 配置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              获取 API Key: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">openrouter.ai/keys</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              默认模型
            </label>
            <input
              type="text"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              placeholder="google/gemini-2.5-pro-preview"
              className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-amber-500/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-400 hover:text-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApiConfigButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 transition-all text-sm font-medium"
      >
        <Settings size={16} />
        API 配置
      </button>
      <ApiConfigModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
