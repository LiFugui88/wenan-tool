import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, IndustryType, PromptConfig } from '@/types';

const defaultPromptConfigs = {
  audit: {
    id: 'audit',
    name: '文案可用标准审核提示词',
    system: `你是一个专业的文案审核专家，负责判断基底文案是否可以用于门店短视频复刻。

审核标准：
1. 文案结构清晰，有明确的开头、中间、结尾
2. 文案内容具有普适性，可以适配不同行业
3. 文案语言生动，能吸引观众注意力
4. 文案长度适中，适合短视频形式

请根据以上标准判断文案是否可用。`,
    user: `请审核以下基底文案是否可用于门店短视频复刻：

{{content}}

请以 JSON 格式返回结果：
{
  "isAvailable": true/false,
  "reason": "判断理由"
}`,
    functions: [
      { name: 'content', key: 'content', description: '基底文案' }
    ]
  },
  classification: {
    id: 'classification',
    name: '文案分类系统提示词',
    system: `你是一个专业的文案分析师，负责为文案添加分类标签。

你需要分析文案并提供以下三个维度的标签：
1. 创作目标：文案想要达成的效果（如：让客户知道我、让客户信任我、促进客户下单等）
2. 选题方向：文案的主题切入角度（如：塑造诚信经营人设、展示专业能力、分享行业知识等）
3. 文本主题：文案的核心内容主题`,
    user: `请分析以下文案并提供分类标签：

{{content}}

请以 JSON 格式返回结果：
{
  "creationGoal": "创作目标",
  "topicDirection": "选题方向",
  "textTheme": "文本主题"
}`,
    functions: [
      { name: 'content', key: 'content', description: '基底文案' }
    ]
  },
  rewrite: {
    id: 'rewrite',
    name: '文案仿写系统提示词',
    system: `你是一个专业的文案仿写专家，擅长根据基底文案和门店背景信息进行文案仿写。

仿写要求：
1. 保持原文案的结构和风格
2. 根据门店背景信息替换相关内容
3. 确保文案自然流畅，不生硬
4. 保持文案的吸引力和感染力`,
    user: `基底文案：
{{content}}

门店背景信息：
{{background}}

请根据以上信息进行文案仿写，直接输出仿写后的文案，不需要其他说明。`,
    functions: [
      { name: 'content', key: 'content', description: '基底文案' },
      { name: 'background', key: 'background', description: '门店背景信息' }
    ]
  },
  quality: {
    id: 'quality',
    name: '仿写质量判断系统提示词',
    system: `你是一个专业的文案质量评审专家，负责判断仿写文案是否符合基底文案的结构。

评审标准：
1. 结构一致性：仿写文案是否保持了基底文案的结构
2. 内容合理性：替换的内容是否与门店背景匹配
3. 语言流畅度：仿写文案是否自然流畅
4. 风格统一性：仿写文案是否保持了原有风格`,
    user: `基底文案：
{{content}}

仿写文案：
{{fangxie}}

请判断仿写文案的质量是否通过，以 JSON 格式返回结果：
{
  "pass": true/false,
  "reason": "判断理由"
}`,
    functions: [
      { name: 'content', key: 'content', description: '基底文案' },
      { name: 'fangxie', key: 'fangxie', description: '仿写后的文案' }
    ]
  }
};

const defaultIndustries = [
  { id: 'catering' as IndustryType, name: '餐饮', icon: '🍜', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
  { id: 'beauty' as IndustryType, name: '美业', icon: '💄', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
  { id: 'auto' as IndustryType, name: '汽修', icon: '🔧', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
  { id: 'education' as IndustryType, name: '教培', icon: '📚', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
  { id: 'factory' as IndustryType, name: '工厂', icon: '🏭', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
  { id: 'health' as IndustryType, name: '养生', icon: '🌿', backgroundInfo: '', result: '', qualityPass: null, isLoading: false },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      baseContent: '',
      setBaseContent: (content) => set({ baseContent: content }),

      promptConfigs: defaultPromptConfigs,
      updatePromptConfig: (key, config) =>
        set((state) => ({
          promptConfigs: {
            ...state.promptConfigs,
            [key]: { ...state.promptConfigs[key], ...config }
          }
        })),

      classificationResult: null,
      setClassificationResult: (result) => set({ classificationResult: result }),

      auditResult: null,
      setAuditResult: (result) => set({ auditResult: result }),

      industries: defaultIndustries,
      updateIndustry: (id, updates) =>
        set((state) => ({
          industries: state.industries.map((ind) =>
            ind.id === id ? { ...ind, ...updates } : ind
          )
        })),

      apiKey: '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',
      setApiKey: (key) => set({ apiKey: key }),
      defaultModel: 'google/gemini-2.5-pro',
      setDefaultModel: (model) => set({ defaultModel: model }),

      isExecuting: false,
      setIsExecuting: (loading) => set({ isExecuting: loading }),

      overallQualityPass: null,
      setOverallQualityPass: (pass) => set({ overallQualityPass: pass }),
    }),
    {
      name: 'wenan-tool-storage',
      partialize: (state) => ({
        promptConfigs: state.promptConfigs,
        industries: state.industries,
        apiKey: state.apiKey,
        defaultModel: state.defaultModel,
      }),
    }
  )
);
