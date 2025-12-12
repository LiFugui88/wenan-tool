'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { IndustryType } from '@/types';

interface IndustryConfigModalProps {
  industryId: IndustryType;
  isOpen: boolean;
  onClose: () => void;
}

export function IndustryConfigModal({ industryId, isOpen, onClose }: IndustryConfigModalProps) {
  const { industries, updateIndustry } = useAppStore();
  const industry = industries.find(i => i.id === industryId);

  const [backgroundInfo, setBackgroundInfo] = useState(industry?.backgroundInfo || '');

  const handleSave = () => {
    updateIndustry(industryId, { backgroundInfo });
    onClose();
  };

  if (!isOpen || !industry) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20">
          <h2 className="text-xl font-bold text-amber-400 tracking-wide">
            <span className="mr-2">{industry.icon}</span>
            {industry.name} - 背景信息配置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-amber-300 mb-3">
            门店背景信息模板
          </label>
          <textarea
            value={backgroundInfo}
            onChange={(e) => setBackgroundInfo(e.target.value)}
            rows={12}
            placeholder={`请输入${industry.name}行业的门店背景信息，例如：

门店名称：XXX
经营项目：XXX
特色服务：XXX
目标客群：XXX
门店优势：XXX`}
            className="w-full bg-[#0d0d0d] border border-amber-500/30 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none"
          />
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

interface IndustryCardProps {
  industryId: IndustryType;
}

export function IndustryCard({ industryId }: IndustryCardProps) {
  const { industries } = useAppStore();
  const industry = industries.find(i => i.id === industryId);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (!industry) return null;

  const getStatusIcon = () => {
    if (industry.isLoading) {
      return (
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      );
    }
    if (industry.qualityPass === true) {
      return <span className="text-green-400 text-lg">✓</span>;
    }
    if (industry.qualityPass === false) {
      return <span className="text-red-400 text-lg">✗</span>;
    }
    return null;
  };

  return (
    <>
      <div className="bg-[#1a1a1a] border border-amber-500/20 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all group">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">{industry.icon}</span>
            <span className="font-medium text-amber-300">{industry.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-amber-500/60 hover:text-amber-400 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 min-h-[180px]">
          {industry.isLoading ? (
            <div className="flex items-center justify-center h-full text-amber-400/60">
              <span className="animate-pulse">正在仿写中...</span>
            </div>
          ) : industry.result ? (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {industry.result}
            </p>
          ) : (
            <p className="text-gray-500 text-sm italic">
              {industry.backgroundInfo ? '等待执行仿写...' : '请先配置背景信息'}
            </p>
          )}
        </div>
      </div>
      <IndustryConfigModal
        industryId={industryId}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
}
