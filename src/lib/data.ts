import type { Company, GraphEdge, ProcurementLead, TrendRegion } from "./types";

export const EXPANDED_KEYWORDS = [
  "sewage pump",
  "dirty water pump",
  "drainage pump",
  "wastewater system",
  "dewatering pump",
  "borehole pump",
  "centrifugal pump",
  "industrial pump",
  "slurry pump",
  "irrigation pump",
];

export const LANG_SAMPLES: { lang: string; term: string }[] = [
  { lang: "中文", term: "潜水排污泵" },
  { lang: "English", term: "submersible sewage pump" },
  { lang: "Русский", term: "погружной канализационный насос" },
  { lang: "العربية", term: "مضخة غاطسة للصرف الصحي" },
  { lang: "Español", term: "bomba sumergible para aguas residuales" },
  { lang: "Deutsch", term: "Tauchmotorpumpe Abwasser" },
  { lang: "Türkçe", term: "dalgıç atık su pompası" },
  { lang: "日本語", term: "水中汚水ポンプ" },
  { lang: "한국어", term: "액수 중수도 펌프" },
  { lang: "Português", term: "bomba submersível de esgoto" },
];

export const COMPANIES: Company[] = [
  {
    id: "c1",
    name: "NordFlow Systems GmbH",
    country: "德国",
    city: "杜塞尔多夫",
    role: "进口商",
    website: "https://nordflow.example",
    description: "专注市政与工业水处理设备分销，覆盖中欧多个水务项目。",
    products: ["潜水排污泵", "干式安装泵", "控制系统"],
    exportMarkets: ["波兰", "荷兰", "奥地利"],
    chinaSourcingHint: "近三年从中国采购电机与铸件占比上升。",
    score: {
      activity: 9,
      procurement: 8,
      replyLikelihood: 7,
      marketSize: 8,
      dealProbability: 8,
    },
    contacts: [
      { label: "公开邮箱", value: "procurement@nordflow.example", verified: "public" },
      { label: "总机", value: "+49 211 555 0100", verified: "public" },
    ],
    signals: ["官网近期发布污水厂扩容标案线索", "LinkedIn 招聘采购经理"],
    founded: "1998",
    employees: "120–200",
  },
  {
    id: "c2",
    name: "Gulf Hydro Trading FZ-LLC",
    country: "阿联酋",
    city: "迪拜",
    role: "贸易商",
    website: "https://gulfhydro.example",
    description: "中东基建与矿业项目水泵集采，偏好欧标与美标混配方案。",
    products: ["矿用渣浆泵", "消防泵组", "变频恒压供水"],
    exportMarkets: ["沙特", "阿曼", "卡塔尔"],
    chinaSourcingHint: "在广交会与中国供应商有稳定展台合作记录（公开）。",
    score: {
      activity: 8,
      procurement: 9,
      replyLikelihood: 6,
      marketSize: 9,
      dealProbability: 7,
    },
    contacts: [
      { label: "销售邮箱", value: "sales@gulfhydro.example", verified: "public" },
      { label: "WhatsApp（官网）", value: "+971 50 000 0000", verified: "public" },
    ],
    signals: ["展会名录与 EPC 分包商共同出现频率高"],
    founded: "2012",
    employees: "45–80",
  },
  {
    id: "c3",
    name: "Andes Pump Manufacturing S.A.",
    country: "智利",
    city: "圣地亚哥",
    role: "制造商",
    website: "https://andes-pump.example",
    description: "南美本土离心泵与潜水泵制造商，出口秘鲁与阿根廷矿业走廊。",
    products: ["离心泵", "立式涡轮泵", "潜水泵"],
    exportMarkets: ["秘鲁", "阿根廷", "巴西"],
    score: {
      activity: 7,
      procurement: 6,
      replyLikelihood: 8,
      marketSize: 7,
      dealProbability: 7,
    },
    contacts: [
      { label: "采购", value: "compras@andes-pump.example", verified: "public" },
    ],
    signals: ["海关数据（演示）显示铸件进口额季度波动"],
    founded: "2005",
    employees: "200–350",
  },
  {
    id: "c4",
    name: "Caspian Water EPC",
    nameLocal: "Каспий Уотер ЕПС",
    country: "哈萨克斯坦",
    city: "阿拉木图",
    role: "EPC",
    website: "https://caspian-water-epc.example",
    description: "污水与再生水 EPC，近期多个市政标段进入设备采购阶段。",
    products: ["一体化泵站", "曝气系统", "排污泵组"],
    exportMarkets: ["乌兹别克斯坦", "格鲁吉亚"],
    chinaSourcingHint: "公开招标文件中出现中国供应商品牌（演示）。",
    score: {
      activity: 9,
      procurement: 9,
      replyLikelihood: 5,
      marketSize: 8,
      dealProbability: 9,
    },
    contacts: [
      { label: "项目邮箱", value: "tenders@caspian-water-epc.example", verified: "public" },
    ],
    signals: ["政府招标平台出现“排污泵”关键词（演示）", "新闻稿提及污水厂升级"],
    founded: "2010",
    employees: "300–500",
  },
  {
    id: "c5",
    name: "Baltic Pump Works OÜ",
    country: "爱沙尼亚",
    city: "塔林",
    role: "工程公司",
    website: "https://baltic-pump.example",
    description: "北欧小型水务与建筑排水工程承包商。",
    products: ["建筑排水", "小型潜水泵", "泵站改造"],
    exportMarkets: ["芬兰", "拉脱维亚"],
    score: {
      activity: 6,
      procurement: 5,
      replyLikelihood: 8,
      marketSize: 5,
      dealProbability: 6,
    },
    contacts: [
      { label: "工程部", value: "projects@baltic-pump.example", verified: "public" },
    ],
    signals: ["招聘页面新增流体机械工程师（演示）"],
    founded: "2016",
    employees: "30–60",
  },
  {
    id: "c6",
    name: "Monsoon Irrigation Pvt Ltd",
    country: "印度",
    city: "艾哈迈达巴德",
    role: "经销商",
    website: "https://monsoon-irrigation.example",
    description: "灌溉与农用水泵经销网络覆盖古吉拉特与拉贾斯坦。",
    products: ["灌溉泵", "深井泵", "太阳能泵组"],
    exportMarkets: ["印度国内"],
    score: {
      activity: 8,
      procurement: 7,
      replyLikelihood: 7,
      marketSize: 9,
      dealProbability: 8,
    },
    contacts: [
      { label: "经销商合作", value: "partner@monsoon-irrigation.example", verified: "public" },
    ],
    signals: ["IndiaMART 店铺活跃度较高（演示）"],
    founded: "2008",
    employees: "80–150",
  },
];

export const GRAPH_EDGES: GraphEdge[] = [
  {
    from: "c1",
    to: "c3",
    type: "长期采购",
    confidence: 0.72,
    note: "公开供应链案例研究中共同出现（演示）。",
  },
  {
    from: "c2",
    to: "c1",
    type: "展会合作",
    confidence: 0.58,
    note: "两届水展参展商目录相邻展位与联合新闻稿（演示）。",
  },
  {
    from: "c3",
    to: "c5",
    type: "竞争",
    confidence: 0.61,
    note: "同类市政小型泵招标中的重复投标方（演示）。",
  },
  {
    from: "c4",
    to: "c2",
    type: "供应链",
    confidence: 0.55,
    note: "分包清单与物流提单关键词共现（演示）。",
  },
  {
    from: "c4",
    to: "c3",
    type: "疑似换供",
    confidence: 0.42,
    note: "某 HS 编码进口额下降同时新供应商抬头增加（演示·低置信）。",
  },
  {
    from: "c6",
    to: "c3",
    type: "海关往来",
    confidence: 0.49,
    note: "零部件品类往来（演示）。",
  },
];

export const TREND_REGIONS: TrendRegion[] = [
  { country: "哈萨克斯坦", heat: 92, note: "污水基建标段集中释放" },
  { country: "沙特", heat: 88, note: "矿业干排与海水淡化配套泵需求" },
  { country: "越南", heat: 81, note: "工业园排水与防洪泵站" },
  { country: "波兰", heat: 76, note: "欧盟基金推动水务翻新" },
  { country: "智利", heat: 74, note: "铜矿带渣浆泵与耐磨件" },
];

export const PROCUREMENT_LEADS: ProcurementLead[] = [
  {
    id: "l1",
    title: "阿拉木图某污水厂升级 — 潜污泵组",
    region: "哈萨克斯坦",
    pumpType: "潜水排污泵",
    urgency: "高",
  },
  {
    id: "l2",
    title: "红海沿岸海水淡化取水泵站维护更换",
    region: "沙特",
    pumpType: "大型离心泵 / 取水泵",
    urgency: "中",
  },
  {
    id: "l3",
    title: "古吉拉特灌区太阳能泵站招标",
    region: "印度",
    pumpType: "太阳能深井泵",
    urgency: "中",
  },
];

export function getCompany(id: string): Company | undefined {
  return COMPANIES.find((c) => c.id === id);
}

export function searchCompanies(q: string): Company[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return COMPANIES;
  return COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(needle) ||
      c.country.includes(needle) ||
      c.products.some((p) => p.toLowerCase().includes(needle)) ||
      c.description.includes(needle)
  );
}
