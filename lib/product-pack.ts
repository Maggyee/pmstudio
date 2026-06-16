export const defaultFinSightIdea =
  "我想做一个面向财富顾问的 AI 投研工作台，帮助快速生成市场简报、配置建议和客户跟进任务。";

export type ProductPackSurface =
  | "product-pack"
  | "prd"
  | "prototype"
  | "research"
  | "competitors"
  | "personas"
  | "roadmap"
  | "summary";

export type ProductPackArtifactIndexItem = {
  id: string;
  title: string;
  surface: ProductPackSurface;
  status: "ready" | "draft" | "planned";
  exportFormats: Array<"markdown" | "html" | "pdf" | "pptx" | "json">;
};

export type ProductPack = {
  schemaVersion: "pm-product-pack.v1";
  id: string;
  sourceIdea: string;
  generatedAt: string;
  project: {
    title: string;
    oneLiner: string;
    positioning: string;
    targetUsers: string[];
    painPoints: string[];
    valueProposition: string;
  };
  prd: {
    objective: string;
    sections: Array<{ label: string; value: string }>;
    coreFeatures: string[];
    userStories: string[];
    assumptions: string[];
    successMetrics: string[];
    mvpScope: string[];
  };
  prototype: {
    userFlow: string;
    screens: Array<{
      name: string;
      goal: string;
      primaryAction: string;
      components: string[];
    }>;
    prdLinks: Array<{
      requirement: string;
      screen: string;
      rationale: string;
    }>;
    openDesignPrompt: string;
    liveArtifact: {
      schemaVersion: "open-design-live-artifact.v1";
      id: string;
      title: string;
      preview: {
        type: "html";
        entry: "index.html";
      };
      files: Array<{
        path: string;
        mimeType: string;
        purpose: string;
      }>;
    };
  };
  research: {
    marketOpportunity: Array<{ label: string; value: string; detail: string }>;
    insights: string[];
  };
  competitors: Array<{
    competitor: string;
    positioning: string;
    strength: string;
    weakness: string;
    opportunity: string;
  }>;
  personas: Array<{
    name: string;
    role: string;
    goal: string;
    pain: string;
  }>;
  roadmap: Array<{
    horizon: string;
    items: string[];
  }>;
  summary: {
    headline: string;
    bullets: string[];
    nextActions: string[];
  };
  artifactIndex: ProductPackArtifactIndexItem[];
};

export function buildFinSightProductPack(input = defaultFinSightIdea): ProductPack {
  return {
    schemaVersion: "pm-product-pack.v1",
    id: "finsight-product-pack",
    sourceIdea: input,
    generatedAt: "2026-06-16T00:00:00+08:00",
    project: {
      title: "FinSight 智能投研工作台",
      oneLiner: "面向理财顾问和财富管理团队的 AI 投研、配置建议与客户沟通工作台。",
      positioning:
        "FinSight 是面向财富顾问的 AI 投研工作台，帮助在会前快速生成市场简报、配置建议、客户解释话术和会后跟进材料。",
      targetUsers: ["一线财富顾问", "投研支持团队", "合规审阅人员", "客户经理主管"],
      painPoints: [
        "市场信息、客户持仓和产品材料分散，顾问会前准备耗时长。",
        "配置建议难以快速转成客户能理解的解释话术。",
        "合规审阅和客户跟进记录割裂，复盘成本高。",
      ],
      valueProposition:
        "把投研摘要、客户画像、组合建议、合规检查和材料导出串成一个可审阅的顾问工作流。",
    },
    prd: {
      objective: "在 5 分钟内生成客户适配的市场简报、资产配置草案、风险提示和跟进任务。",
      sections: [
        {
          label: "目标用户",
          value: "银行理财经理、券商财富顾问、家族办公室投研助理和私募客户经理。",
        },
        {
          label: "核心价值",
          value: "把分散市场信号转成可解释、可审阅、可落地的客户配置建议。",
        },
        {
          label: "MVP 范围",
          value: "客户风险画像、市场摘要、组合建议、产品匹配、合规提示和任务跟进。",
        },
      ],
      coreFeatures: [
        "客户风险偏好和资产现状录入",
        "宏观市场与行业主题摘要",
        "资产配置草案和再平衡建议",
        "基金、债券、结构化产品匹配",
        "合规风险提示和话术生成",
        "客户跟进任务和周报导出",
      ],
      userStories: [
        "作为财富顾问，我想快速生成客户会前简报，以便减少准备时间。",
        "作为投研支持，我想把市场变化转成配置建议，以便顾问能快速复用。",
        "作为合规人员，我想查看建议依据和审阅记录，以便降低沟通风险。",
      ],
      assumptions: [
        "顾问愿意在客户会议前导入持仓和风险偏好。",
        "机构能够提供可用的产品库和合规规则。",
        "AI 生成内容需要人审后才能对客发送。",
      ],
      successMetrics: [
        "投研简报生成时间 < 5 分钟",
        "顾问二次编辑率 > 45%",
        "客户跟进任务完成率 > 30%",
      ],
      mvpScope: [
        "每日市场简报生成",
        "客户组合概览",
        "资产配置建议",
        "合规提示",
        "客户材料导出",
      ],
    },
    prototype: {
      userFlow:
        "选择客户 -> 生成市场简报 -> 匹配配置建议 -> 预览客户解释页 -> 合规审阅 -> 导出跟进材料",
      screens: [
        {
          name: "工作台首页",
          goal: "汇总今日市场信号、待服务客户和待审阅建议。",
          primaryAction: "开始客户会前准备",
          components: ["市场摘要卡", "客户队列", "Agent 运行状态", "导出入口"],
        },
        {
          name: "市场雷达页",
          goal: "把宏观、行业和产品池变化转成可引用投研观点。",
          primaryAction: "生成市场简报",
          components: ["主题热度", "风险信号", "产品池变化", "引用来源"],
        },
        {
          name: "客户组合页",
          goal: "展示客户资产现状、风险偏好和可调整空间。",
          primaryAction: "分析组合缺口",
          components: ["资产分布", "风险偏好", "持仓偏离", "历史沟通"],
        },
        {
          name: "配置建议页",
          goal: "生成可解释的再平衡建议和客户沟通话术。",
          primaryAction: "生成客户解释",
          components: ["建议卡片", "调整理由", "风险提示", "替代方案"],
        },
        {
          name: "合规审阅页",
          goal: "检查建议依据、敏感表述和审阅记录。",
          primaryAction: "提交审阅",
          components: ["规则命中", "话术检查", "审阅意见", "版本记录"],
        },
        {
          name: "客户材料导出页",
          goal: "导出会议材料、客户摘要和跟进任务。",
          primaryAction: "导出项目材料",
          components: ["PDF 摘要", "PPTX 简报", "CRM 任务", "跟进计划"],
        },
      ],
      prdLinks: [
        {
          requirement: "快速生成客户会前市场简报",
          screen: "市场雷达页",
          rationale: "把市场信号直接转成顾问可引用的客户沟通材料。",
        },
        {
          requirement: "基于客户风险偏好生成配置建议",
          screen: "客户组合页 + 配置建议页",
          rationale: "先解释客户当前组合，再给出调整建议和替代方案。",
        },
        {
          requirement: "合规审阅和客户跟进闭环",
          screen: "合规审阅页 + 客户材料导出页",
          rationale: "让建议生成、审阅、导出、跟进记录保持同一条证据链。",
        },
      ],
      openDesignPrompt:
        "参考 OpenDesign 的 Studio Shell、Artifact Canvas 和 iframe-style preview，把 FinSight PRD 中的核心任务流生成可编辑页面原型。",
      liveArtifact: {
        schemaVersion: "open-design-live-artifact.v1",
        id: "finsight-prototype-preview",
        title: "FinSight Prototype Preview",
        preview: {
          type: "html",
          entry: "index.html",
        },
        files: [
          {
            path: "artifact.json",
            mimeType: "application/json",
            purpose: "artifact manifest",
          },
          {
            path: "data.json",
            mimeType: "application/json",
            purpose: "structured product pack data",
          },
          {
            path: "index.html",
            mimeType: "text/html",
            purpose: "previewable prototype shell",
          },
        ],
      },
    },
    research: {
      marketOpportunity: [
        {
          label: "市场窗口",
          value: "财富管理 AI 工作台",
          detail: "财富管理正从产品销售转向顾问式服务，AI 可显著降低投研解释和客户沟通成本。",
        },
        {
          label: "早期切入",
          value: "中小财富团队",
          detail: "从每日简报、客户复盘和跟进建议切入，优先证明顾问效率提升。",
        },
        {
          label: "增长渠道",
          value: "培训机构 + 金融 SaaS",
          detail: "与投顾培训机构、金融 SaaS 服务商和财富管理社群合作，以模板和案例驱动转化。",
        },
      ],
      insights: [
        "机构顾问需要可解释、可审阅、可归档的 AI 输出，而不是一次性聊天结果。",
        "投研观点到客户话术的转换是高频痛点，适合用模板化 workflow 提效。",
        "合规审阅是金融场景进入企业版的关键门槛，应在 MVP 后快速补强。",
      ],
    },
    competitors: [
      {
        competitor: "Bloomberg Terminal",
        positioning: "专业金融数据终端",
        strength: "数据覆盖深，机构认可度高",
        weakness: "客户沟通和轻量化配置建议门槛高",
        opportunity: "用轻量顾问工作流补足前线服务场景",
      },
      {
        competitor: "Wind 金融终端",
        positioning: "国内机构投研数据平台",
        strength: "本土市场数据完整，研究场景成熟",
        weakness: "对前线顾问的客户化表达支持不足",
        opportunity: "把投研结论转成客户可理解建议",
      },
      {
        competitor: "同花顺 iFinD",
        positioning: "金融数据与量化分析",
        strength: "A 股和宏观数据入口强",
        weakness: "投研结论到客户行动的闭环较弱",
        opportunity: "围绕会议准备、合规和跟进做闭环",
      },
      {
        competitor: "Betterment",
        positioning: "自动化财富管理",
        strength: "目标导向配置体验清晰",
        weakness: "不适合机构顾问的复杂客户关系管理",
        opportunity: "服务机构顾问而非直接替代顾问",
      },
    ],
    personas: [
      {
        name: "周岚",
        role: "银行理财经理",
        goal: "在客户会前快速准备市场观点和配置建议",
        pain: "市场信息太碎，合规话术和产品匹配需要反复确认",
      },
      {
        name: "Eric",
        role: "券商财富顾问",
        goal: "把宏观观点转成客户能理解的组合调整方案",
        pain: "高净值客户问题细，手工整理报告耗时",
      },
      {
        name: "沈予",
        role: "投研助理",
        goal: "为顾问团队维护主题组合、产品池和每周简报",
        pain: "数据、观点、风险提示散落在不同系统",
      },
    ],
    roadmap: [
      {
        horizon: "MVP / 0-4 周",
        items: ["会前市场简报", "客户组合概览", "AI 配置建议", "PDF 摘要导出"],
      },
      {
        horizon: "Next / 1-2 月",
        items: ["合规审阅流", "产品池规则", "客户话术版本", "CRM 跟进任务"],
      },
      {
        horizon: "Later / 3-6 月",
        items: ["机构知识库", "投研协作空间", "多顾问团队看板", "审计追踪"],
      },
    ],
    summary: {
      headline: "FinSight 用 AI 把投研、配置建议、合规审阅和客户跟进串成财富顾问工作流。",
      bullets: [
        "MVP 聚焦会前准备和配置建议，能清晰展示 AI 提效比赛价值。",
        "PRD 与原型已经能通过统一任务流关联，适合继续扩展可编辑原型。",
        "双参考 harness 让 OpenDesign 风格体验和 pm-skills 方法论各司其职。",
      ],
      nextActions: [
        "把 UI 各 tab 逐步改为读取 Product Pack 数据。",
        "把 Prototype tab 增加 OpenDesign prompt placeholder 和 live artifact manifest。",
        "补 Codex / Claude Code adapter detection，让 mock provider 可替换。",
      ],
    },
    artifactIndex: [
      {
        id: "product-pack",
        title: "完整产品方案包",
        surface: "product-pack",
        status: "ready",
        exportFormats: ["markdown", "json", "pdf"],
      },
      {
        id: "prd",
        title: "PRD 初稿",
        surface: "prd",
        status: "ready",
        exportFormats: ["markdown", "pdf"],
      },
      {
        id: "prototype",
        title: "原型页面结构",
        surface: "prototype",
        status: "ready",
        exportFormats: ["html", "json"],
      },
      {
        id: "research",
        title: "市场机会分析",
        surface: "research",
        status: "ready",
        exportFormats: ["markdown", "pdf"],
      },
      {
        id: "competitors",
        title: "竞品分析方向",
        surface: "competitors",
        status: "ready",
        exportFormats: ["markdown", "pdf"],
      },
      {
        id: "personas",
        title: "目标用户画像",
        surface: "personas",
        status: "ready",
        exportFormats: ["markdown"],
      },
      {
        id: "roadmap",
        title: "MVP 与路线图",
        surface: "roadmap",
        status: "ready",
        exportFormats: ["markdown", "pptx"],
      },
      {
        id: "executive-summary",
        title: "项目汇报摘要",
        surface: "summary",
        status: "ready",
        exportFormats: ["markdown", "pptx"],
      },
    ],
  };
}
