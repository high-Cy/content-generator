// ─── Rednote 违禁词 ────────────────────────────────────────────────────────────
// Each category has a `foodRelevant` flag. Only food-relevant categories are
// injected into the prompt — irrelevant ones (medical, cosmetics, superstition)
// are excluded to save tokens.
//
// `suggestions` are inspiration only — the AI should adapt to context freely,
// not substitute mechanically.
//

interface BannedCategory {
  label: string;
  foodRelevant: boolean;
  words: Record<string, string[]>; // banned word → suggestion hints
}

export const BANNED_CATEGORIES: BannedCategory[] = [
  {
    label: "极限用语 (Superlatives / Absolute Terms)",
    foodRelevant: true,
    words: {
      "国家级": ["高规格", "重磅", "大牌水准"],
      "世界级": ["国际范", "天花板级别"],
      "最高级": ["高阶", "进阶版", "顶配"],
      "第一": ["TOP", "名列前茅", "首选", "心头好"],
      "唯一": ["独一份", "特色", "少见"],
      "首个": ["抢先", "新晋", "早鸟"],
      "首选": ["闭眼入", "推荐尝试"],
      "顶级": ["天花板", "绝美", "高配"],
      "独家": ["私藏", "特色", "别具一格"],
      "最新": ["新鲜出炉", "前沿", "当季"],
      "王牌": ["镇店之宝", "招牌", "看家本领"],
      "极致": ["质感拉满", "绝佳", "超乎想象"],
      "独一无二": ["别具一格", "难得一见"],
      "绝无仅有": ["难得一见", "罕见宝藏"],
      "史无前例": ["空前", "超大惊喜"],
      "最": ["超", "巨", "敲", "贼", "hin"],
      "最好": ["极佳", "绝绝子", "封神"],
      "最佳": ["优选", "心选", "理想之选"],
      "最受欢迎": ["人气爆表", "风很大", "圈粉无数"],
      "绝对": ["基本可以", "大概率", "闭眼冲"],
      "著名": ["出圈", "大热", "耳熟能详"],
      "100%": ["满满", "诚意十足", "绝不踩雷"],
    },
  },
  {
    label: "权威性词语 (Authoritative / Official Claims)",
    foodRelevant: true,
    words: {
      "特供": ["限定", "专属"],
      "专供": ["特属", "定制款"],
      "老字号": ["多年老店", "时间沉淀", "童年回忆"],
    },
  },
  {
    label: "点击诱导词语 (Clickbait / Engagement Bait)",
    foodRelevant: true,
    words: {
      "转发": ["分享给姐妹", "艾特闺蜜"],
      "一键三连": ["留下足迹", "支持一下", "给个小红心"],
      "点击获取": ["指路", "传送门", "了解更多"],
    },
  },
  {
    label: "刺激消费词语 (Hard-sell / Urgency)",
    foodRelevant: true,
    words: {
      "秒杀": ["拼手速", "福利价", "超值好价"],
      "抢爆": ["人气火爆", "手慢无"],
      "万人疯抢": ["风很大", "大家都在入"],
      "抢疯了": ["火出圈", "爆单"],
    },
  },
  {
    label: "疑似医疗用语 (Medical Claims)",
    foodRelevant: false,
    words: {
      "调节内分泌": ["内调理", "找回好状态"],
      "增强免疫力": ["提升自护力", "强健体魄"],
      "助眠": ["晚安好物", "睡个好觉"],
      "减肥": ["减脂", "掉秤", "塑形", "体重管理"],
      "治疗": ["改善", "缓解", "修护"],
      "排毒": ["通畅", "内调顺畅", "促消化"],
      "消化不良": ["吃太撑", "肚子胀", "肠胃有负担"],
      "便秘": ["不通畅", "嗯嗯困难", "肠胃大扫除"],
    },
  },
  {
    label: "迷信用语 (Superstition)",
    foodRelevant: false,
    words: {
      "招财进宝": ["搞钱必备", "寓意暴富"],
      "提升运气": ["接好运", "好运加持"],
      "旺财": ["吸金体质", "搞米好物"],
    },
  },
  {
    label: "化妆品虚假宣传用语 (Cosmetics False Claims)",
    foodRelevant: false,
    words: {
      "特效": ["惊艳", "高效力", "惊喜效果"],
      "瘦身": ["塑形", "曲线管理", "体态轻盈"],
      "燃烧脂肪": ["制造热量缺口", "暴汗好物"],
    },
  },
];

export const buildBannedWordsPrompt = (): string => {
  const relevant = BANNED_CATEGORIES.filter((c) => c.foodRelevant);
  if (relevant.length === 0) return "";

  const sections = relevant.map((category) => {
    const entries = Object.entries(category.words)
      .map(([banned, hints]) => `  "${banned}" (e.g. ${hints.join(" / ")})`)
      .join("\n");
    return `${category.label}:\n${entries}`;
  });

  return `

REDNOTE CONTENT POLICY — BANNED WORDS:
The following words violate Rednote's content policy and must not appear in the output.
The suggestions in brackets are starting points only — adapt the sentence naturally, don't substitute mechanically.

${sections.join("\n\n")}`;
};
