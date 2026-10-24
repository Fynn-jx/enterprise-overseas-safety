// Scenario inputs, not a live event feed or measured forecasts.
// The first five locations use station coordinates from the project's TAZARA GeoJSON.
// The last two sit off the drawn line; half-distance is set so the footprint still reaches it.
import { resolveImpactParameters, type ImpactScale } from '../utils/costDistanceImpact';

type Risk = "high" | "medium" | "low";
type Step = { step: number; stage: string; description: string; severity: Risk };
type Response = { category: string; priority: "immediate" | "short-term"; measures: string[] };

export interface TazaraRiskEvent {
  id: string;
  title: string;
  label: string;
  country: string;
  location: [number, number];
  locationLabel: string;
  type: string;
  severity: Risk;
  popularity: number;
  date: string;
  timestamp: number;
  scale: ImpactScale;
  halfDistanceKm: number;
  strength?: number;
  scaleWeight?: number;
  affectedPopulation: number;
  source: string;
  description: string;
  affectedSegment: string;
  serviceImpact: string;
  conclusion: string;
  impactPath: Step[];
  assets: { type: string; name: string; distance: number; risk: Risk }[];
  responseMeasures: Response[];
}

type EventInput = Omit<TazaraRiskEvent, "label" | "timestamp" | "source" | "scale" | "halfDistanceKm"> & Partial<Pick<TazaraRiskEvent, "scale" | "halfDistanceKm">>;
const defineEvent = (event: EventInput): TazaraRiskEvent => ({
  ...event, ...resolveImpactParameters(event), label: event.title, timestamp: Date.parse(`${event.date}T12:00:00Z`),
  source: "铁路风险情景库；事件、人口及资产参数为模拟输入",
});
const steps = (items: [string, string, Risk][]): Step[] => items.map(([stage, description, severity], index) => ({ step: index + 1, stage, description, severity }));

export const tazaraRiskEvents: TazaraRiskEvent[] = [
  defineEvent({
    id: "review-tazara-community-001", title: "坦赞铁路沿线社区抗议与货运受阻",
    country: "赞比亚", location: [31.2067054, -10.2434633], locationLabel: "Kasama 站周边",
    type: "社会ESG舆情", severity: "high", popularity: 95, date: "2026-02-22", affectedPopulation: 12500,
    description: "若 Kasama 站周边社区抗议阻碍货运通行，装卸、矿产品转运及项目营地补给可能受到连带影响。",
    affectedSegment: "Kasama 站及周边接驳线", serviceImpact: "站点出入受限，装卸与发运延后",
    conclusion: "局部节点受扰可能传导至物流履约，需优先核实现场、协调社区并比较替代转运方案。",
    impactPath: steps([
      ["社区抗议", "站点周边聚集抗议人群，货运出入口通行受限。", "high"],
      ["铁路货运受阻", "关键货运节点受扰，列车装卸与发运计划需要调整。", "high"],
      ["矿产品转运延迟", "转运仓库存积压，矿产品交付和营地补给面临延后。", "medium"],
      ["社区与物流协调", "核实通行条件，开展社区沟通并比较临时公路转运方案。", "medium"],
    ]),
    assets: [
      { type: "铁路", name: "Kasama 铁路货运节点", distance: 0, risk: "high" },
      { type: "仓储", name: "矿产品转运仓", distance: 4.2, risk: "high" },
      { type: "营地", name: "沿线项目营地", distance: 8.6, risk: "medium" },
    ],
    responseMeasures: [
      { category: "现场核实与人员安排", priority: "immediate", measures: ["向站点负责人核实通行状态及更新时间。", "调整员工通勤与物资补给，避开聚集区域。"] },
      { category: "物流与社区协调", priority: "short-term", measures: ["比较临时公路转运的成本与时效。", "与地方代表沟通诉求并持续跟踪通行条件。"] },
    ],
  }),
  defineEvent({
    id: "tazara-flood-002", title: "姆林巴区间强降雨与路基损毁",
    country: "坦桑尼亚", location: [35.8021373, -8.7827487], locationLabel: "Mlimba 站周边",
    type: "绿色壁垒", severity: "high", popularity: 93, date: "2026-02-20", affectedPopulation: 18600,
    description: "若持续降雨冲刷 Mlimba 周边路基并影响桥涵排水，相关区间可能限速或封锁，进港货列需调整运行计划。",
    affectedSegment: "Mlimba 周边山地区间", serviceImpact: "区间限速或封锁，干线运力下降",
    conclusion: "线路基础设施损毁直接影响通行能力，需完成巡检与抢修评估后再安排货列放行。",
    impactPath: steps([
      ["强降雨冲刷", "集中降雨使边坡、路基与桥涵排水承压。", "high"],
      ["区间限速封锁", "受损区间需进行线路检查，货列限速或在邻站待避。", "high"],
      ["干线货列积压", "运行窗口缩减，向达累斯萨拉姆方向的货运接续计划延后。", "high"],
      ["抢修与分流", "按巡检结果组织抢修，调整装车节奏并核验公路分流条件。", "medium"],
    ]),
    assets: [
      { type: "铁路", name: "Mlimba 站及邻近区间", distance: 0, risk: "high" },
      { type: "桥涵", name: "沿线桥涵与排水设施", distance: 7.8, risk: "high" },
      { type: "仓储", name: "待运货物集结场", distance: 16.5, risk: "medium" },
    ],
    responseMeasures: [
      { category: "线路巡检与运行控制", priority: "immediate", measures: ["组织路基、边坡及桥涵巡检，核实封锁范围。", "依调度指令调整运行窗口，避免进入未确认区间。"] },
      { category: "抢修与货流分配", priority: "short-term", measures: ["优先安排排水、路基加固与抢修物资。", "协调邻站待避与货物分流，更新客户交付计划。"] },
    ],
  }),
  defineEvent({
    id: "tazara-customs-003", title: "坦赞边境货运查验趋严与通关积压",
    country: "坦桑尼亚", location: [32.7677559, -9.3183324], locationLabel: "Tunduma—Nakonde 口岸",
    type: "贸易保护", severity: "medium", popularity: 87, date: "2026-02-18", affectedPopulation: 6800,
    description: "若边境查验要求提高或单证复核增加，跨境货列可能延长待检时间，并占用站场与保税仓容量。",
    affectedSegment: "Tunduma—Nakonde 跨境接续段", serviceImpact: "跨境货列待检，站场周转放缓",
    conclusion: "通关延迟主要影响跨境周转，需优先核验单证与查验安排，区分待检积压与线路物理中断。",
    impactPath: steps([
      ["口岸查验增加", "货物分类、原产地与运输单证进入补充审核。", "medium"],
      ["跨境货列待检", "编组货列在边境站场等待，跨境接续时间增加。", "high"],
      ["仓储周转承压", "待检货物占用保税仓与股道，库存和车辆使用成本上升。", "medium"],
      ["单证与调度协同", "提前补齐材料，与报关及调度人员协调分批放行。", "low"],
    ]),
    assets: [
      { type: "口岸", name: "Tunduma 货运查验节点", distance: 0, risk: "high" },
      { type: "铁路", name: "Nakonde 接续站场", distance: 1.5, risk: "medium" },
      { type: "仓储", name: "边境货物周转仓", distance: 5.4, risk: "medium" },
    ],
    responseMeasures: [
      { category: "单证核验与通关协调", priority: "immediate", measures: ["逐票核验运输单证、货物分类与申报材料。", "确认查验窗口并与两侧站场同步放行安排。"] },
      { category: "库存与车辆调配", priority: "short-term", measures: ["按交付优先级组织分批装运。", "调整保税仓预约与空车回送，减少站场占用。"] },
    ],
  }),
  defineEvent({
    id: "tazara-fuel-004", title: "姆贝亚机车燃料供应延迟",
    country: "坦桑尼亚", location: [33.4118653, -8.9321091], locationLabel: "Mbeya 站及补给节点",
    type: "能源价格", severity: "medium", popularity: 84, date: "2026-02-16", affectedPopulation: 9200,
    description: "若 Mbeya 机车燃料到货延迟且储备不足，补给周转将拖慢牵引安排，造成班次压缩与运输成本上升。",
    affectedSegment: "Mbeya 站及相邻牵引区间", serviceImpact: "可用牵引能力下降，发车间隔扩大",
    conclusion: "线路仍可通行，但燃料缺口限制可用机车，应优先确认库存与到货并统筹牵引安排。",
    impactPath: steps([
      ["燃料到货延迟", "燃料补给未按计划到达，机务库存缓冲缩小。", "medium"],
      ["机车周转受限", "部分机车等待补给，货列牵引与换挂机会减少。", "high"],
      ["班次压缩与成本上升", "发车间隔扩大，重点物资和矿产品运单需要重新排期。", "medium"],
      ["补给与牵引统筹", "确认备用供应与机车调配，优先保障关键货物运输。", "low"],
    ]),
    assets: [
      { type: "铁路", name: "Mbeya 机务补给节点", distance: 0, risk: "high" },
      { type: "能源", name: "燃料储备与配送点", distance: 3.6, risk: "high" },
      { type: "仓储", name: "铁路待运货场", distance: 11.2, risk: "medium" },
    ],
    responseMeasures: [
      { category: "库存核验与补给", priority: "immediate", measures: ["核实可用燃料库存、每日消耗和预计到货时间。", "协调备用供应点与安全运输条件。"] },
      { category: "机车与班次调配", priority: "short-term", measures: ["按货运优先级安排机车和补给次序。", "合并低负载班次并更新运单交付时间。"] },
    ],
  }),
  defineEvent({
    id: "tazara-loading-005", title: "卡皮里姆波希矿产品装运劳资纠纷",
    country: "赞比亚", location: [28.6811822, -13.9549148], locationLabel: "New Kapiri Mposhi 货运站",
    type: "供应链矿产", severity: "high", popularity: 91, date: "2026-02-14", affectedPopulation: 7400,
    description: "若矿产品集运与装卸人员因劳资纠纷停工，始发货列装载不足，矿区库存与出口履约压力可能同步上升。",
    affectedSegment: "New Kapiri Mposhi 始发与集运段", serviceImpact: "装车效率下降，出口货列始发延后",
    conclusion: "扰动发生在货源集运与装卸环节，需协调劳资诉求和堆场容量，干线畅通并不等同于装运正常。",
    impactPath: steps([
      ["装卸人员停工", "集运场和装车作业人员减少，装卸班次无法按计划完成。", "high"],
      ["始发装车延后", "车皮等待配货与装载，出口货列始发计划推迟。", "high"],
      ["矿产品库存积压", "矿区至铁路的集运衔接放慢，堆场容量与出口交付承压。", "medium"],
      ["劳资协商与排期", "组织劳资沟通并滚动调整集运、装卸和出口订舱计划。", "medium"],
    ]),
    assets: [
      { type: "铁路", name: "New Kapiri Mposhi 装运节点", distance: 0, risk: "high" },
      { type: "堆场", name: "矿产品集运堆场", distance: 6.3, risk: "high" },
      { type: "仓储", name: "出口货物周转仓", distance: 14.8, risk: "medium" },
    ],
    responseMeasures: [
      { category: "劳资沟通与作业核实", priority: "immediate", measures: ["核实停工范围、人员诉求及可用装卸能力。", "协调现场沟通并保障人员与堆场安全。"] },
      { category: "集运与出口排期", priority: "short-term", measures: ["按堆场容量调整矿区来货和车皮配置。", "同步更新铁路发运及港口接续计划。"] },
    ],
  }),
  // Kitwe is about 137 km north of the drawn line. halfDistanceKm 100 keeps New Kapiri Mposhi inside the 0.25 contour.
  defineEvent({
    id: "tazara-copperbelt-006", title: "铜带基特韦矿石公路集运中断",
    country: "赞比亚", location: [28.2132, -12.8024], locationLabel: "基特韦矿区（铁路北侧）",
    type: "供应链矿产", severity: "high", popularity: 90, date: "2026-02-12", affectedPopulation: 10800,
    scale: "corridor", halfDistanceKm: 100,
    description: "若基特韦、谦比希一带矿石短驳与南下公路中断，事件发生在坦赞铁路外侧。影响可通过空间扩散和供应链接驳，波及 New Kapiri Mposhi 装运及关联资产。",
    affectedSegment: "New Kapiri Mposhi 始发装运段（北侧公路衔接）", serviceImpact: "铁路外侧矿石来货减少，始发装车与东向交班延后",
    conclusion: "事件发生在铁路外侧，影响通过空间扩散和供应链接驳波及坦赞铁路及关联资产。足迹只表示情景暴露，矿区公路与车站装运需要分别核实。",
    impactPath: steps([
      ["矿区公路中断", "事件发生在铁路外侧的基特韦、谦比希矿区，矿石短驳和南下公路受阻。", "high"],
      ["空间扩散至走廊", "影响沿陆路成本向外扩展，足迹覆盖 New Kapiri Mposhi 及邻近区间。", "high"],
      ["装运接驳受波及", "车站来货下降，车皮、堆场和东向交班需要调整。", "medium"],
      ["关联资产联动", "转运仓和补给节点随供应链接驳进入同一情景范围，需分别核实。", "medium"],
    ]),
    assets: [
      { type: "公路", name: "基特韦矿石短驳场", distance: 3.2, risk: "high" },
      { type: "矿山", name: "谦比希方向矿产品来源", distance: 26, risk: "high" },
      { type: "铁路", name: "New Kapiri Mposhi 装运节点", distance: 138, risk: "high" },
    ],
    responseMeasures: [
      { category: "公路与来货核实", priority: "immediate", measures: ["核实基特韦至卡皮里姆波希方向的通行条件和待运矿石。", "按实际来货通知 New Kapiri Mposhi 调整装车窗口。"] },
      { category: "接驳与交班安排", priority: "short-term", measures: ["比较备用集运路线和堆场容量。", "同步更新东向交班及港口接续计划。"] },
    ],
  }),
  // Chalinze is about 52 km north of the eastern approach. halfDistanceKm 65 reaches Dar es Salaam above 0.25.
  defineEvent({
    id: "tazara-darport-007", title: "查林泽疏港公路与接驳供电受扰",
    country: "坦桑尼亚", location: [38.354, -6.638], locationLabel: "查林泽公路枢纽（铁路北侧）",
    type: "能源价格", severity: "high", popularity: 86, date: "2026-02-11", affectedPopulation: 13600,
    scale: "corridor", halfDistanceKm: 65,
    description: "若查林泽公路枢纽通行受阻，并叠加港口装卸与港铁接驳电源收紧，事件发生在坦赞铁路外侧。影响可通过空间扩散和供应链接驳，波及东部进线、达累斯萨拉姆港铁交接及相关资产。",
    affectedSegment: "达累斯萨拉姆港铁交接及东部进线", serviceImpact: "疏港与交接延后，东部进线接续窗口收紧",
    conclusion: "事件发生在铁路外侧，影响通过空间扩散和供应链接驳波及坦赞铁路及关联资产。港铁交接延迟需与区间是否损毁分开核实。",
    impactPath: steps([
      ["疏港公路受阻", "事件发生在铁路外侧的查林泽枢纽，港口疏港货车通行受阻。", "high"],
      ["接驳供电收紧", "装卸和港铁交接的电源窗口收紧，交接能力下降。", "high"],
      ["足迹触及铁路", "影响经空间扩散覆盖东部进线，并到达达累斯萨拉姆终点站。", "high"],
      ["关联资产暴露", "港口堆场、交接场和沿线补给点随供应链接驳进入同一情景范围。", "medium"],
    ]),
    assets: [
      { type: "公路", name: "查林泽疏港公路枢纽", distance: 1.6, risk: "high" },
      { type: "能源", name: "港铁交接与装卸电源", distance: 8.4, risk: "high" },
      { type: "铁路", name: "达累斯萨拉姆港铁交接", distance: 101, risk: "high" },
    ],
    responseMeasures: [
      { category: "公路与电源核实", priority: "immediate", measures: ["核实查林泽枢纽的通行状态和预计恢复时间。", "确认港口装卸与港铁交接电源的可用窗口。"] },
      { category: "交接与进线安排", priority: "short-term", measures: ["按交接能力调整达累斯萨拉姆到发和堆场预约。", "滚动更新东部进线的接续计划，并区分公路延误与线路限速。"] },
    ],
  }),
];

export function getTazaraRiskEvent(id?: string | null) {
  return tazaraRiskEvents.find(event => event.id === id);
}
