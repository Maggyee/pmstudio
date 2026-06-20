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

export type ProductPackGeneratedPrototypeFile = {
  path: string;
  name?: string;
  mimeType: string;
  purpose: string;
  editable?: boolean;
  body: string;
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
    generatedArtifact?: {
      schemaVersion: "pmstudio.generated-prototype-files.v1";
      entryFile: "index.html";
      files: ProductPackGeneratedPrototypeFile[];
    };
    stylesOverride?: Record<string, Record<string, string>>;
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

const artifactIndexTemplate: ProductPackArtifactIndexItem[] = [
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
];

function cloneArtifactIndex() {
  return artifactIndexTemplate.map((artifact) => ({
    ...artifact,
    exportFormats: [...artifact.exportFormats],
  }));
}

function slugify(value: string) {
  const ascii = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return `idea-${hash.toString(36)}`;
}

function isFinSightLikeIdea(input: string) {
  return /finsight|财富|投研|理财|资产配置|金融/i.test(input);
}

function inferGenericTitle(input: string) {
  const normalized = input
    .replace(/^我想(做|开发|创建|打造)?一个?/, "")
    .replace(/^帮我(做|开发|创建|打造)?一个?/, "")
    .replace(/[。.!！?？].*$/, "")
    .trim();
  const namedMatch = normalized.match(/(?:叫|名为|名字是)\s*([A-Za-z0-9\u4e00-\u9fa5 -]{2,24})/);

  if (namedMatch?.[1]) {
    return namedMatch[1].trim();
  }

  const audienceMatch = normalized.match(/(?:面向|给|为)([^，,。.!！?？]{2,24})(?:的|做)/);
  const productMatch = normalized.match(/AI\s*([^，,。.!！?？]{2,24})(?:，|,|帮助|用于|解决|$)/);

  if (audienceMatch?.[1]) {
    const audience = audienceMatch[1].trim();
    const productName = productMatch?.[1]?.replace(/^AI\s*/i, "").trim();

    if (productName && !productName.includes(audience)) {
      return `${audience} AI ${productName}`;
    }

    return `${audience} AI 工作台`;
  }

  if (normalized.length <= 18) return `${normalized || "新产品"} 产品方案`;

  return `${normalized.slice(0, 18)} 产品方案`;
}

function inferOutcome(input: string) {
  const match =
    input.match(/帮助([^。.!！?？]{2,40})/) ??
    input.match(/用于([^。.!！?？]{2,40})/) ??
    input.match(/解决([^。.!！?？]{2,40})/);

  return match?.[1]?.trim() || "提高关键业务流程效率并降低人工协作成本";
}

function inferTargetSegment(input: string, title: string) {
  const match = input.match(/(?:面向|给|为)([^，,。.!！?？]{2,24})(?:的|做)/);

  if (match?.[1]) return match[1].trim();

  return title.replace(/产品方案$/, "").replace(/ AI .+$/, "").replace(/ AI 工作台$/, "").trim();
}

type GenericDomainProfile = {
  label: string;
  earlySegment: string;
  channels: string;
  existingSystems: string;
  managerRole: string;
  operatorRole: string;
  criticalData: string;
  businessMetric: string;
};

function inferDomainProfile(input: string, targetSegment: string): GenericDomainProfile {
  const target = targetSegment || "核心用户";

  if (/餐饮|门店|库存|排班|外卖|店长|老板|零售/.test(input)) {
    return {
      label: "门店经营与餐饮零售运营",
      earlySegment: "1-5 家门店、仍依赖表格和聊天群管理排班/库存的小型经营者",
      channels: "本地生活服务商、餐饮老板社群、门店 SaaS 生态和案例模板传播",
      existingSystems: "收银/进销存/外卖平台后台",
      managerRole: "门店老板",
      operatorRole: "店长/排班负责人",
      criticalData: "销售预测、库存余量、员工班次、损耗记录和外卖订单",
      businessMetric: "缺货率、人力浪费、排班耗时和库存周转",
    };
  }

  if (/教育|学校|培训|课程|老师|学生|教务/.test(input)) {
    return {
      label: "教育培训运营",
      earlySegment: "需要提升招生、排课、学员跟进或教学服务效率的中小教育团队",
      channels: "校长社群、教培服务商、SaaS 模板市场和公开案例复用",
      existingSystems: "教务系统、CRM、排课表和班级群",
      managerRole: "校区负责人",
      operatorRole: "教务/班主任",
      criticalData: "学员阶段、课程安排、转化记录、续费状态和教师容量",
      businessMetric: "转化率、续费率、排课冲突率和服务响应时间",
    };
  }

  if (/招聘|人力|HR|员工|绩效|候选人|组织/.test(input)) {
    return {
      label: "人力资源与组织运营",
      earlySegment: "招聘、绩效或员工服务流程仍高度依赖人工整理的成长型团队",
      channels: "HR 社群、创业公司运营社群、招聘服务商和模板分发",
      existingSystems: "ATS、HRIS、表格和企业 IM",
      managerRole: "HR 负责人",
      operatorRole: "HRBP/招聘专员",
      criticalData: "候选人状态、岗位需求、面试反馈、员工画像和绩效记录",
      businessMetric: "招聘周期、候选人转化率、员工响应时效和管理成本",
    };
  }

  if (/电商|直播|商品|店铺|订单|私域|客服/.test(input)) {
    return {
      label: "电商与私域运营",
      earlySegment: "需要提升选品、订单、客服或私域转化效率的中小电商团队",
      channels: "电商卖家社群、服务商生态、直播运营社区和案例模板传播",
      existingSystems: "电商后台、客服系统、CRM 和选品表",
      managerRole: "电商运营负责人",
      operatorRole: "运营/客服主管",
      criticalData: "商品动销、订单、库存、客户咨询、活动节奏和转化漏斗",
      businessMetric: "转化率、客诉率、库存周转、复购率和运营人效",
    };
  }

  if (/销售|CRM|客户|线索|商机|合同|回款/.test(input)) {
    return {
      label: "销售与客户增长",
      earlySegment: "线索跟进、商机判断和客户复盘仍缺少自动化支持的销售团队",
      channels: "销售管理社群、CRM 服务商生态、B2B 增长案例和行业模板传播",
      existingSystems: "CRM、表格、企业 IM 和会议纪要",
      managerRole: "销售负责人",
      operatorRole: "客户经理/销售代表",
      criticalData: "线索来源、客户阶段、沟通记录、报价方案和回款风险",
      businessMetric: "线索转化率、赢单率、跟进时效和回款周期",
    };
  }

  if (/物流|仓储|供应链|采购|配送|工厂|生产/.test(input)) {
    return {
      label: "供应链与履约运营",
      earlySegment: "计划、采购、仓储或配送协同仍依赖人工排程的运营团队",
      channels: "行业服务商、供应链社群、ERP 生态和标杆案例传播",
      existingSystems: "ERP、WMS、TMS、采购表和供应商群",
      managerRole: "供应链负责人",
      operatorRole: "计划/仓储/采购专员",
      criticalData: "订单预测、库存水位、供应商交期、仓储容量和配送状态",
      businessMetric: "履约时效、缺货率、库存周转和异常处理时间",
    };
  }

  if (/医疗|诊所|医生|患者|药品|健康/.test(input)) {
    return {
      label: "医疗健康服务运营",
      earlySegment: "需要提升患者管理、预约、随访或内部运营效率的小型医疗服务机构",
      channels: "诊所经营社群、医疗信息化服务商、行业会议和案例模板传播",
      existingSystems: "HIS/EMR、预约系统、随访表和患者群",
      managerRole: "诊所/科室负责人",
      operatorRole: "医生助理/运营人员",
      criticalData: "预约、病例摘要、随访计划、药品库存和服务反馈",
      businessMetric: "预约转化、随访完成率、服务等待时间和运营成本",
    };
  }

  return {
    label: `${target}所在业务场景`,
    earlySegment: `已经有明确高频任务，但仍依赖人工整理、判断和协作的${target}`,
    channels: "行业社群、垂直服务商、真实案例模板和团队内部口碑传播",
    existingSystems: "表格、企业 IM、垂直 SaaS 和内部流程系统",
    managerRole: "业务负责人",
    operatorRole: "一线执行人员",
    criticalData: "业务输入、约束条件、历史记录、执行状态和结果指标",
    businessMetric: "处理时长、采纳率、异常率和人效提升",
  };
}

export function buildProductPackFromIdea(input = defaultFinSightIdea): ProductPack {
  const idea = input.trim() || defaultFinSightIdea;

  if (isFinSightLikeIdea(idea)) {
    return buildFinSightProductPack(idea);
  }

  const title = inferGenericTitle(idea);
  const slug = slugify(title);
  const targetSegment = inferTargetSegment(idea, title);
  const targetLabel = targetSegment || "目标用户";
  const outcome = inferOutcome(idea);
  const productConcept = title.replace(/产品方案$/, "");
  const domain = inferDomainProfile(idea, targetLabel);

  return {
    schemaVersion: "pm-product-pack.v1",
    id: `${slug}-product-pack`,
    sourceIdea: idea,
    generatedAt: new Date().toISOString(),
    project: {
      title,
      oneLiner: `面向${targetSegment || "目标用户"}的 AI 工作台，帮助${outcome}。`,
      positioning:
        `${title} 聚焦“${idea}”这一场景，把数据录入、AI 分析、行动建议、执行跟进和复盘导出组织成一个可落地的工作流。`,
      targetUsers: [targetSegment || "核心业务用户", "一线执行人员", "业务负责人", "运营管理人员"],
      painPoints: [
        `当前${targetSegment || "目标用户"}需要在多个工具之间切换，信息录入、判断和执行割裂。`,
        `关键决策依赖经验和手工整理，难以及时实现“${outcome}”。`,
        "执行结果缺少持续追踪和复盘，团队很难判断建议是否真正有效。",
      ],
      valueProposition:
        `用 AI 把${productConcept}场景中的数据、判断、建议和跟进动作串起来，让用户更快完成高频决策。`,
    },
    prd: {
      objective: `让${targetSegment || "目标用户"}在 5 分钟内完成关键数据录入、获得 AI 建议，并形成可执行的下一步计划。`,
      sections: [
        {
          label: "目标用户",
          value: `${targetSegment || "目标用户"}，以及需要围绕该场景进行运营、协作和管理的团队。`,
        },
        {
          label: "核心价值",
          value: `把分散信息转成 AI 分析和行动建议，帮助用户${outcome}。`,
        },
        {
          label: "MVP 范围",
          value: "业务数据录入、AI 分析建议、任务计划、异常提醒、执行看板和复盘导出。",
        },
      ],
      coreFeatures: [
        `${targetSegment || "目标用户"}关键数据录入与画像`,
        `围绕“${outcome}”的 AI 分析和优先级判断`,
        "行动建议、计划排程和替代方案生成",
        "异常提醒、风险提示和执行状态追踪",
        "关键指标看板和效果复盘",
        "团队协作、记录归档和材料导出",
      ],
      userStories: [
        `作为${targetSegment || "核心用户"}，我想快速录入关键业务信息，以便系统给出可执行建议。`,
        "作为运营负责人，我想看到异常、优先级和任务计划，以便及时调整资源。",
        "作为管理者，我想查看执行结果和复盘摘要，以便判断方案是否带来实际收益。",
      ],
      assumptions: [
        "用户愿意把关键业务数据录入到一个统一工作台。",
        "AI 建议需要可解释、可编辑，并保留人工确认环节。",
        "只要能减少重复判断和手工协调，用户就愿意在高频场景中持续使用。",
      ],
      successMetrics: [
        "关键计划生成时间 < 5 分钟",
        "AI 建议被采纳或二次编辑率 > 40%",
        `与“${outcome}”相关的核心效率指标提升 30%`,
      ],
      mvpScope: [
        "业务数据录入",
        "AI 建议生成",
        "计划与任务看板",
        "异常提醒",
        "效果复盘",
        "材料导出",
      ],
    },
    prototype: {
      userFlow:
        "录入业务信息 -> 选择优化目标 -> 生成 AI 建议 -> 查看计划和风险 -> 分配执行任务 -> 复盘并导出材料",
      screens: [
        {
          name: "工作台首页",
          goal: `汇总${targetSegment || "用户"}的关键指标、待处理事项和 AI 建议入口。`,
          primaryAction: "生成 AI 建议",
          components: ["关键指标", "待办队列", "AI 建议入口", "最近复盘"],
        },
        {
          name: "数据录入页",
          goal: "录入当前业务状态、约束条件和需要优化的目标。",
          primaryAction: "分析当前状态",
          components: ["数据表单", "约束条件", "历史记录", "校验提示"],
        },
        {
          name: "AI 分析页",
          goal: `围绕“${outcome}”给出原因分析、优先级和风险提示。`,
          primaryAction: "生成优化建议",
          components: ["问题诊断", "优先级排序", "风险提示", "依据说明"],
        },
        {
          name: "计划建议页",
          goal: "把 AI 分析转成可执行计划、资源分配和替代方案。",
          primaryAction: "确认计划",
          components: ["建议卡片", "资源安排", "替代方案", "确认按钮"],
        },
        {
          name: "执行看板页",
          goal: "追踪任务状态、异常变化和执行效果。",
          primaryAction: "处理异常",
          components: ["任务看板", "异常提醒", "负责人", "进度状态"],
        },
        {
          name: "复盘导出页",
          goal: "导出执行记录、效果复盘和下一轮优化建议。",
          primaryAction: "导出复盘材料",
          components: ["效果指标", "复盘摘要", "导出选项", "下一步建议"],
        },
      ],
      prdLinks: [
        {
          requirement: "录入关键业务状态并选择优化目标",
          screen: "工作台首页 + 数据录入页",
          rationale: "先把业务上下文结构化，AI 建议才有可解释依据。",
        },
        {
          requirement: `围绕“${outcome}”生成行动建议`,
          screen: "AI 分析页 + 计划建议页",
          rationale: "把分析结果转成可执行计划，减少用户自己判断和排程的成本。",
        },
        {
          requirement: "追踪执行结果并形成复盘材料",
          screen: "执行看板页 + 复盘导出页",
          rationale: "让建议进入真实工作流，并用结果数据闭环验证价值。",
        },
      ],
      openDesignPrompt:
        `参考 OpenDesign 的 Studio Shell、Artifact Canvas 和 iframe-style preview，把“${idea}”生成可编辑页面原型和导出结构。`,
      liveArtifact: {
        schemaVersion: "open-design-live-artifact.v1",
        id: `${slug}-prototype-preview`,
        title: `${title} Prototype Preview`,
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
          value: `${domain.label} AI 化`,
          detail:
            `${domain.label}正在从“人工经验 + 分散系统”转向“数据驱动 + AI 辅助决策”，适合先从能直接影响${domain.businessMetric}的高频场景切入。`,
        },
        {
          label: "早期切入",
          value: "高频任务与小团队",
          detail:
            `优先面向${domain.earlySegment}，用一个清晰工作流证明“${outcome}”的效率价值。`,
        },
        {
          label: "增长渠道",
          value: "行业案例 + 模板分发",
          detail: `通过${domain.channels}获取早期用户，并把成功案例沉淀为可复用模板。`,
        },
      ],
      insights: [
        `如果能直接帮助${targetLabel}${outcome}，产品价值会比单纯记录工具更清晰。`,
        "高频业务场景适合先从一个明确决策点切入，再逐步扩展协作和数据能力。",
        `可解释建议、人工确认和复盘导出是进入${domain.label}真实工作流的关键。`,
      ],
    },
    competitors: [
      {
        competitor: domain.existingSystems,
        positioning: `${domain.label}里的现有业务系统`,
        strength: "已经承载部分业务数据，用户迁移成本较低",
        weakness: "更偏记录和流程管理，缺少跨数据的 AI 判断、建议生成和复盘闭环",
        opportunity: "以 AI 分析层和行动建议层切入，不必一开始替换存量系统",
      },
      {
        competitor: "ChatGPT / Claude 等通用 AI 助手",
        positioning: "通用 AI 助手",
        strength: "推理和文本生成能力强",
        weakness: "缺少固定业务字段、执行状态、团队协作和持续复盘结构",
        opportunity: `把通用 AI 能力封装成${domain.label}可直接使用的工作流`,
      },
      {
        competitor: "Excel / 飞书表格 / 微信群",
        positioning: "低成本手工协作方式",
        strength: "上手快、灵活、几乎没有采购门槛",
        weakness: "依赖人工更新和经验判断，异常提醒、责任追踪和效果复盘薄弱",
        opportunity: "用自动化录入、结构化建议和一键导出降低替换阻力",
      },
      {
        competitor: "垂直 SaaS 新模块",
        positioning: "现有厂商可能推出的 AI 扩展功能",
        strength: "已有客户、渠道和数据入口",
        weakness: "通常围绕原系统能力增量开发，跨工具整合和用户体验可能受限",
        opportunity: "先做轻量、可配置、跨系统的 AI 决策助手，验证垂直价值",
      },
    ],
    personas: [
      {
        name: "核心使用者",
        role: targetLabel,
        goal: `快速获得围绕“${outcome}”的可执行建议`,
        pain: `需要在${domain.existingSystems}和人工经验之间来回切换，判断和跟进成本高`,
      },
      {
        name: "业务负责人",
        role: domain.managerRole,
        goal: `看到${domain.businessMetric}的变化，并判断方案是否值得继续投入`,
        pain: "缺少统一视图，难以知道问题来自数据、流程、人员还是执行偏差",
      },
      {
        name: "协作执行者",
        role: domain.operatorRole,
        goal: "按系统建议完成任务、处理异常，并把结果沉淀下来",
        pain: "任务分配和反馈分散，临时变化多，复盘时很难还原过程",
      },
    ],
    roadmap: [
      {
        horizon: "MVP / 0-2 周",
        items: [
          `${domain.criticalData}录入`,
          `围绕“${outcome}”生成 AI 建议`,
          "计划确认与任务分配",
          "Markdown/HTML 导出",
        ],
      },
      {
        horizon: "Pilot / 2-6 周",
        items: ["多项目历史", "异常提醒", "效果复盘看板", "团队协作和权限"],
      },
      {
        horizon: "Scale / 2-3 月",
        items: ["接入现有业务系统", "自定义字段和流程", "多智能体编排", "PPTX/PDF 二进制导出"],
      },
    ],
    summary: {
      headline: `${title} 把一个产品想法转成可评审、可编辑、可导出的完整产品方案包。`,
      bullets: [
        `核心价值是帮助${targetSegment || "目标用户"}${outcome}。`,
        "MVP 聚焦数据录入、AI 建议、计划执行、异常提醒和复盘导出。",
        "产品需要优先证明在高频业务场景中的效率提升，再扩展团队协作和系统集成。",
      ],
      nextActions: [
        "补充更具体的业务数据字段和约束条件，验证 AI 建议是否足够可执行。",
        "用低保真原型测试核心用户路径，确认用户是否愿意按建议行动。",
        "定义 2-3 个能量化体现提效的指标，作为 MVP 成功判断标准。",
      ],
    },
    artifactIndex: cloneArtifactIndex(),
  };
}

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
        "用真实顾问会议素材验证 PRD、原型、PDF 和 PPTX 导出是否足够可评审。",
        "把 Prototype tab 的 live artifact 进一步接入安全 iframe 预览和组件级编辑。",
        "解析 Codex / Claude Code 输出为 Product Pack delta，让本地 agent 能更新现有方案包。",
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
