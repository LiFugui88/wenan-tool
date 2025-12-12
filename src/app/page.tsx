'use client';

import { useState } from 'react';
import { PromptButton } from '@/components/PromptConfig';
import { IndustryCard } from '@/components/IndustryCard';
import { ApiConfigButton } from '@/components/ApiConfig';
import { ExecutionLog } from '@/components/ExecutionLog';
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
    addLog,
    updateLog,
    clearLogs,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const executeAll = async () => {
    if (!baseContent.trim()) {
      setError('请先输入基底文案');
      return;
    }

    if (!apiKey.trim()) {
      setError('请先配置 API Key');
      return;
    }

    setError(null);
    setIsExecuting(true);
    setClassificationResult(null);
    setAuditResult(null);
    setOverallQualityPass(null);
    clearLogs();

    // 重置所有行业状态
    industries.forEach(ind => {
      updateIndustry(ind.id, { result: '', qualityPass: null, isLoading: false });
    });

    try {
      // 1. 执行审核
      const auditLogId = addLog({
        type: 'audit',
        status: 'running',
        input: baseContent.slice(0, 200) + (baseContent.length > 200 ? '...' : ''),
      });

      try {
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
        updateLog(auditLogId, {
          status: 'success',
          output: auditResponse,
        });
      } catch (err) {
        updateLog(auditLogId, {
          status: 'error',
          error: err instanceof Error ? err.message : '审核失败',
        });
        throw err;
      }

      // 2. 执行分类
      const classLogId = addLog({
        type: 'classification',
        status: 'running',
        input: baseContent.slice(0, 200) + (baseContent.length > 200 ? '...' : ''),
      });

      try {
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
        updateLog(classLogId, {
          status: 'success',
          output: classResponse,
        });
      } catch (err) {
        updateLog(classLogId, {
          status: 'error',
          error: err instanceof Error ? err.message : '分类失败',
        });
        throw err;
      }

      // 3. 对每个配置了背景信息的行业执行仿写
      const industriesWithBackground = industries.filter(ind => ind.backgroundInfo.trim());

      for (const industry of industriesWithBackground) {
        updateIndustry(industry.id, { isLoading: true });

        // 仿写日志
        const rewriteLogId = addLog({
          type: 'rewrite',
          industry: industry.name,
          status: 'running',
          input: `背景: ${industry.backgroundInfo.slice(0, 100)}...`,
        });

        try {
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
          updateLog(rewriteLogId, {
            status: 'success',
            output: rewriteResponse.slice(0, 300) + (rewriteResponse.length > 300 ? '...' : ''),
          });

          // 质量判断日志
          const qualityLogId = addLog({
            type: 'quality',
            industry: industry.name,
            status: 'running',
            input: `仿写结果: ${rewriteResponse.slice(0, 100)}...`,
          });

          try {
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
            updateLog(qualityLogId, {
              status: 'success',
              output: qualityResponse,
            });
          } catch (err) {
            updateLog(qualityLogId, {
              status: 'error',
              error: err instanceof Error ? err.message : '质量判断失败',
            });
            updateIndustry(industry.id, { isLoading: false, qualityPass: false });
          }
        } catch (err) {
          updateLog(rewriteLogId, {
            status: 'error',
            error: err instanceof Error ? err.message : '仿写失败',
          });
          updateIndustry(industry.id, { isLoading: false, qualityPass: false });
        }
      }

      // 4. 计算整体仿写质量
      setTimeout(() => {
        const currentIndustries = useAppStore.getState().industries;
        const industriesWithResults = currentIndustries.filter(ind => ind.result);
        if (industriesWithResults.length > 0) {
          const allPass = industriesWithResults.every(ind => ind.qualityPass === true);
          setOverallQualityPass(allPass);
        }
      }, 100);

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
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
            文案仿写测试工具
          </h1>
          <p className="text-gray-500 mt-2 text-sm">测试文案是否可以作为门店短视频复刻基底</p>
        </header>

        {/* 提示词配置区 */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <PromptButton configKey="audit" label="文案可用标准审核提示词" />
          <PromptButton configKey="classification" label="文案分类系统提示词" />
          <PromptButton configKey="rewrite" label="文案仿写系统提示词" />
          <PromptButton configKey="quality" label="文案仿写质量判断系统提示词" />
          <ApiConfigButton />
        </div>

        {/* 主工作区 */}
        <div className="bg-[#111] border border-amber-500/20 rounded-2xl p-5 lg:p-6 shadow-xl">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-5 lg:gap-6 mb-6">
            {/* 基底文案区 */}
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">
                基底文案：
              </label>
              <textarea
                value={baseContent}
                onChange={(e) => setBaseContent(e.target.value)}
                placeholder="请输入文案"
                rows={8}
                className="w-full bg-[#0a0a0a] border border-amber-500/30 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none text-sm"
              />
            </div>

            {/* 执行按钮 */}
            <div className="flex lg:flex-col items-center justify-center">
              <button
                onClick={executeAll}
                disabled={isExecuting}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isExecuting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    执行中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={18} />
                    执行
                  </span>
                )}
              </button>
            </div>

            {/* 分类与诊断区 */}
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">
                分类与诊断：
              </label>
              <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-xl p-4 min-h-[180px]">
                {classificationResult ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-amber-400 shrink-0">创作目标：</span>
                      <span className="text-gray-300">{classificationResult.creationGoal}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400 shrink-0">选题方向：</span>
                      <span className="text-gray-300">{classificationResult.topicDirection}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400 shrink-0">文本主题：</span>
                      <span className="text-gray-300">{classificationResult.textTheme}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm italic">执行后显示分类结果</p>
                )}

                {/* 审核状态 */}
                <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-sm">文案是否可用：</span>
                    {auditResult ? (
                      auditResult.isAvailable ? (
                        <CheckCircle2 className="text-green-400" size={18} />
                      ) : (
                        <XCircle className="text-red-400" size={18} />
                      )
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-sm">仿写质量：</span>
                    {overallQualityPass !== null ? (
                      overallQualityPass ? (
                        <CheckCircle2 className="text-green-400" size={18} />
                      ) : (
                        <XCircle className="text-red-400" size={18} />
                      )
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 行业仿写区 - 上3下3布局 */}
          <div>
            <h3 className="text-base font-medium text-amber-300 mb-3">分行业仿写区</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map(industry => (
                <IndustryCard key={industry.id} industryId={industry.id as IndustryType} />
              ))}
            </div>
          </div>

          {/* 质量提示 */}
          {overallQualityPass === false && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
              任意 1 个行业的仿写质量不通过则不通过
            </div>
          )}

          {/* 执行日志 */}
          <ExecutionLog />
        </div>
      </div>
    </div>
  );
}
