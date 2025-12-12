// 提示词配置类型
export interface PromptConfig {
  id: string;
  name: string;
  system: string;
  user: string;
  functions: FunctionRef[];
  model?: string;
}

// 函数引用类型
export interface FunctionRef {
  name: string;
  key: string;
  description: string;
}

// 行业类型
export type IndustryType = 'catering' | 'beauty' | 'auto' | 'education' | 'factory' | 'health';

// 行业配置
export interface IndustryConfig {
  id: IndustryType;
  name: string;
  icon: string;
  backgroundInfo: string;
  result: string;
  qualityPass: boolean | null;
  isLoading: boolean;
}

// 分类结果
export interface ClassificationResult {
  creationGoal: string;
  topicDirection: string;
  textTheme: string;
}

// 审核结果
export interface AuditResult {
  isAvailable: boolean;
  reason: string;
}

// 仿写质量判断结果
export interface QualityResult {
  pass: boolean;
  reason: string;
}

// 执行日志条目
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'audit' | 'classification' | 'rewrite' | 'quality';
  industry?: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: string;
  output?: string;
  error?: string;
}

// 应用状态
export interface AppState {
  // 基底文案
  baseContent: string;
  setBaseContent: (content: string) => void;

  // 提示词配置
  promptConfigs: {
    audit: PromptConfig;
    classification: PromptConfig;
    rewrite: PromptConfig;
    quality: PromptConfig;
  };
  updatePromptConfig: (key: keyof AppState['promptConfigs'], config: Partial<PromptConfig>) => void;

  // 分类结果
  classificationResult: ClassificationResult | null;
  setClassificationResult: (result: ClassificationResult | null) => void;

  // 审核结果
  auditResult: AuditResult | null;
  setAuditResult: (result: AuditResult | null) => void;

  // 行业配置
  industries: IndustryConfig[];
  updateIndustry: (id: IndustryType, updates: Partial<IndustryConfig>) => void;

  // API 配置
  apiKey: string;
  setApiKey: (key: string) => void;
  defaultModel: string;
  setDefaultModel: (model: string) => void;

  // 加载状态
  isExecuting: boolean;
  setIsExecuting: (loading: boolean) => void;

  // 整体仿写质量
  overallQualityPass: boolean | null;
  setOverallQualityPass: (pass: boolean | null) => void;

  // 执行日志
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => string;
  updateLog: (id: string, updates: Partial<LogEntry>) => void;
  clearLogs: () => void;
}
