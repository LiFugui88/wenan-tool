'use client';

import { useState } from 'react';
import { PromptButton } from '@/components/PromptConfig';
import { IndustryCard } from '@/components/IndustryCard';
import { ApiConfigButton } from '@/components/ApiConfig';
import { useAppStore } from '@/store';
import { callOpenRouter, parseJsonFromResponse } from '@/lib/api';
import { IndustryType, ClassificationResult, AuditResult, QualityResult } from '@/types';
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const {
    baseContent,
    setBaseContent,
    promptConfigs,
    classificationResult,
    setClassificationResult,
    auditResult,
    setAuditResult,
    industries,
    updateIndustry,
    apiKey,
    defaultModel,
    isExecuting,
    setIsExecuting,
    overallQualityPass,
    setOverallQualityPass,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const executeAll = async () => {
    if (!baseContent.trim()) {
      setError('请先输入基底文案');
      return;
    }

    setError(null);
    setIsExecuting(true);
    setClassificationResult(null);
    setAuditResult(null);
    setOverallQualityPass(null);

    // 重置所有行业状态
    industries.forEach(ind => {
      updateIndustry(ind.id, { result: '', qualityPass: null, isLoading: false });
    });

    try {
      // 1. 执行审核
      const auditResponse = await callOpenRouter({
        prompt: promptConfigs.audit,
        variables: { content: baseContent },
        apiKey,
        model: defaultModel
      });
      const auditData = parseJsonFromResponse(auditResponse) as AuditResult | null;
      if (auditData) {
        setAuditResult(auditData);
      }

      // 2. 执行分类
      const classResponse = await callOpenRouter({
        prompt: promptConfigs.classification,
        variables: { content: baseContent },
        apiKey,
        model: defaultModel
      });
      const classData = parseJsonFromResponse(classResponse) as ClassificationResult | null;
      if (classData) {
        setClassificationResult(classData);
      }

      // 3. 对每个配置了背景信息的行业执行仿写
      const industriesWithBackground = industries.filter(ind => ind.backgroundInfo.trim());

      for (const industry of industriesWithBackground) {
        updateIndustry(industry.id, { isLoading: true });

        try {
          // 执行仿写
          const rewriteResponse = await callOpenRouter({
            prompt: promptConfigs.rewrite,
            variables: {
              content: baseContent,
              background: industry.backgroundInfo
            },
            apiKey,
            model: defaultModel
          });

          updateIndustry(industry.id, { result: rewriteResponse });

          // 执行质量判断
          const qualityResponse = await callOpenRouter({
            prompt: promptConfigs.quality,
            variables: {
              content: baseContent,
              fangxie: rewriteResponse
            },
            apiKey,
            model: defaultModel
          });
          const qualityData = parseJsonFromResponse(qualityResponse) as QualityResult | null;
          updateIndustry(industry.id, {
            qualityPass: qualityData?.pass ?? null,
            isLoading: false
          });
        } catch (err) {
          updateIndustry(industry.id, { isLoading: false, qualityPass: false });
          console.error(`仿写 ${industry.name} 失败:`, err);
        }
      }

      // 4. 计算整体仿写质量
      const industriesWithResults = industries.filter(ind => ind.result);
      if (industriesWithResults.length > 0) {
        const allPass = industriesWithResults.every(ind => ind.qualityPass === true);
        setOverallQualityPass(allPass);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '执行失败');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 lg:p-8">
        {/* 标题 */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
            文案仿写测试工具
          </h1>
          <p className="text-gray-500 mt-2">测试文案是否可以作为门店短视频复刻基底</p>
        </header>

        {/* 提示词配置区 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <PromptButton configKey="audit" label="文案可用标准审核提示词" />
          <PromptButton configKey="classification" label="文案分类系统提示词" />
          <PromptButton configKey="rewrite" label="文案仿写系统提示词" />
          <PromptButton configKey="quality" label="文案仿写质量判断系统提示词" />
          <ApiConfigButton />
        </div>

        {/* 主工作区 */}
        <div className="bg-[#111] border border-amber-500/20 rounded-2xl p-6 lg:p-8 shadow-xl">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 mb-8">
            {/* 基底文案区 */}
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-3">
                基底文案：
              </label>
              <textarea
                value={baseContent}
                onChange={(e) => setBaseContent(e.target.value)}
                placeholder="请输入文案"
                rows={10}
                className="w-full bg-[#0a0a0a] border border-amber-500/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
              />
            </div>

            {/* 执行按钮 */}
            <div className="flex lg:flex-col items-center justify-center">
              <button
                onClick={executeAll}
                disabled={isExecuting}
                className="group relative px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    执行中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={20} />
                    执行
                  </span>
                )}
              </button>
            </div>

            {/* 分类与诊断区 */}
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-3">
                分类与诊断：
              </label>
              <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-xl p-4 min-h-[200px]">
                {classificationResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-amber-400">创作目标：</span>
                      <span className="text-gray-300">{classificationResult.creationGoal}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400">选题方向：</span>
                      <span className="text-gray-300">{classificationResult.topicDirection}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400">文本主题：</span>
                      <span className="text-gray-300">{classificationResult.textTheme}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm italic">执行后显示分类结果</p>
                )}

                {/* 审核状态 */}
                <div className="mt-6 pt-4 border-t border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-sm">文案是否可用：</span>
                    {auditResult ? (
                      auditResult.isAvailable ? (
                        <CheckCircle2 className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-sm">仿写质量：</span>
                    {overallQualityPass !== null ? (
                      overallQualityPass ? (
                        <CheckCircle2 className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 行业仿写区 */}
          <div>
            <h3 className="text-lg font-medium text-amber-300 mb-4">分行业仿写区</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {industries.map(industry => (
                <IndustryCard key={industry.id} industryId={industry.id as IndustryType} />
              ))}
            </div>
          </div>

          {/* 质量提示 */}
          {overallQualityPass === false && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
              任意 1 个行业的仿写质量不通过则不通过
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
