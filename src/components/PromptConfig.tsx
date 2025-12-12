'use client';

import { useState } from 'react';
import { Settings, X, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { PromptConfig } from '@/types';

interface PromptConfigModalProps {
  configKey: keyof ReturnType<typeof useAppStore.getState>['promptConfigs'];
  isOpen: boolean;
  onClose: () => void;
}

export function PromptConfigModal({ configKey, isOpen, onClose }: PromptConfigModalProps) {
  const { promptConfigs, updatePromptConfig } = useAppStore();
  const config = promptConfigs[configKey];

  const [localConfig, setLocalConfig] = useState<PromptConfig>(config);

  const handleSave = () => {
    updatePromptConfig(configKey, localConfig);
    onClose();
  };

  const addFunction = () => {
    setLocalConfig({
      ...localConfig,
      functions: [...localConfig.functions, { name: '', key: '', description: '' }]
    });
  };

  const removeFunction = (index: number) => {
    setLocalConfig({
      ...localConfig,
      functions: localConfig.functions.filter((_, i) => i !== index)
    });
  };

  const updateFunction = (index: number, field: string, value: string) => {
    setLocalConfig({
      ...localConfig,
      functions: localConfig.functions.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      )
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20">
          <h2 className="text-xl font-bold text-amber-400 tracking-wide">{config.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* 模型配置 */}
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              自定义模型（留空使用默认）
            </label>
            <input
              type="text"
              value={localConfig.model || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder="例如: google/gemini-2.5-pro-preview"
              className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
            />
          </div>

          {/* System 提示词 */}
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              System 提示词
            </label>
            <textarea
              value={localConfig.system}
              onChange={(e) => setLocalConfig({ ...localConfig, system: e.target.value })}
              rows={6}
              className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none font-mono text-sm"
            />
          </div>

          {/* User 提示词 */}
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              User 提示词
            </label>
            <textarea
              value={localConfig.user}
              onChange={(e) => setLocalConfig({ ...localConfig, user: e.target.value })}
              rows={6}
              className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none font-mono text-sm"
            />
          </div>

          {/* 函数引用 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-amber-300">
                函数引用
              </label>
              <button
                onClick={addFunction}
                className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Plus size={16} /> 添加函数
              </button>
            </div>
            <div className="space-y-3">
              {localConfig.functions.map((func, index) => (
                <div key={index} className="flex gap-3 items-start bg-[#0d0d0d] p-4 rounded-lg border border-amber-500/20">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={func.name}
                      onChange={(e) => updateFunction(index, 'name', e.target.value)}
                      placeholder="函数名"
                      className="bg-[#1a1a1a] border border-amber-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                    <input
                      type="text"
                      value={func.key}
                      onChange={(e) => updateFunction(index, 'key', e.target.value)}
                      placeholder="变量 key"
                      className="bg-[#1a1a1a] border border-amber-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                    <input
                      type="text"
                      value={func.description}
                      onChange={(e) => updateFunction(index, 'description', e.target.value)}
                      placeholder="描述"
                      className="bg-[#1a1a1a] border border-amber-500/30 rounded px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                    />
                  </div>
                  <button
                    onClick={() => removeFunction(index)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
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
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

interface PromptButtonProps {
  configKey: keyof ReturnType<typeof useAppStore.getState>['promptConfigs'];
  label: string;
}

export function PromptButton({ configKey, label }: PromptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 transition-all text-sm font-medium"
      >
        <span>{label}</span>
        <Settings size={16} className="text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
      </button>
      <PromptConfigModal
        configKey={configKey}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
