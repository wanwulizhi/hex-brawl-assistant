/**
 * 英雄套路（玩法流派）数据
 *
 * 每条套路描述一个「怎么玩」的流派，而不是单纯的最强海克斯列表。
 * 数据性质：社区经验整理，非统计数据，因此与 builds.json 严格分离。
 *
 * 字段说明：
 *   id              唯一标识
 *   name            套路名（玩家俗称）
 *   type            'playstyle' 角色定位型 | 'mechanic' 机制利用型 | 'build' 出装型
 *   summary         一句话说明
 *   coreAugments    核心海克斯（缺了就成不了型）
 *   optionalAugments 加分海克斯
 *   coreItems       核心装备（物品 ID，留空表示不限定）
 *   whenToUse       什么时候该用
 *   whenNotToUse    什么时候别用
 *   difficulty      上手难度 1-5
 */

export const PLAYSTYLES = [
  {
    championAlias: 'Ashe',
    combos: [
      {
        id: 'ashe-ult-bot',
        name: '大招工具人',
        type: 'playstyle',
        summary: '放弃输出，堆冷却，用大招频繁开团控场。',
        coreAugments: ['终极刷新', '终极唤醒'],
        optionalAugments: ['终极不可阻挡', '回响施放'],
        coreItems: [],
        whenToUse: '队伍缺开团或控场，且己方已有稳定输出',
        whenNotToUse: '你是队里唯一输出点时，这样打会全队没伤害',
        difficulty: 2,
      },
      {
        id: 'ashe-poke',
        name: '消耗流',
        type: 'build',
        summary: '靠 Q 和普攻叠减速，远距离持续消耗。',
        coreAugments: ['双发快射', '迷人蝴蝶'],
        optionalAugments: ['小蜜蜂！！！', '属性叠属性！'],
        coreItems: [],
        whenToUse: '对面近战多、缺乏突进时',
        whenNotToUse: '对面有强开团或高爆发刺客',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'MissFortune',
    combos: [
      {
        id: 'mf-ult-crit',
        name: '暴击大招流',
        type: 'playstyle',
        summary: '堆暴击与攻击力，靠大招一轮扫射清场。',
        coreAugments: ['大腕', '珠光护手'],
        optionalAugments: ['亮出你的剑', '关键暴击'],
        coreItems: [],
        whenToUse: '队友能提供控制、帮你开团时',
        whenNotToUse: '对面位移多、大招容易被躲开',
        difficulty: 2,
      },
      {
        id: 'mf-attack-speed',
        name: '攻速平A流',
        type: 'build',
        summary: '走攻速与攻击特效，靠平 A 持续输出。',
        coreAugments: ['双发快射', '虚幻武器'],
        optionalAugments: ['小蜜蜂！！！', '迷人蝴蝶'],
        coreItems: [],
        whenToUse: '对面坦克多、需要持续输出时',
        whenNotToUse: '对面刺客多，站不住',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'Teemo',
    combos: [
      {
        id: 'teemo-ap-dot',
        name: 'AP 毒伤流',
        type: 'build',
        summary: '堆法术强度，靠蘑菇和毒持续消耗。',
        coreAugments: ['科学狂人', '沃格勒特的巫师帽'],
        optionalAugments: ['炼狱导管', '死亡之环'],
        coreItems: [],
        whenToUse: '对面缺乏清蘑菇手段时',
        whenNotToUse: '对面有大量真视或快速推塔',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'Kaisa',
    combos: [
      {
        id: 'kaisa-onhit',
        name: '攻击特效流',
        type: 'mechanic',
        summary: '靠攻击特效快速叠被动，触发等离子爆发。',
        coreAugments: ['虚幻武器', '小蜜蜂！！！'],
        optionalAugments: ['双发快射', '迷人蝴蝶'],
        coreItems: [],
        whenToUse: '对面脆皮多、需要快速击杀时',
        whenNotToUse: '对面全是高护甲坦克',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Lucian',
    combos: [
      {
        id: 'lucian-onhit',
        name: '攻击特效流',
        type: 'mechanic',
        summary: '被动双发配合攻击特效，短时间打出高额爆发。',
        coreAugments: ['虚幻武器', '双发快射'],
        optionalAugments: ['小蜜蜂！！！', '秘术冲拳'],
        coreItems: [],
        whenToUse: '对面血量中等、能被一套带走时',
        whenNotToUse: '对面控制多、难以近身',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Caitlyn',
    combos: [
      {
        id: 'cait-crit',
        name: '暴击狙击流',
        type: 'build',
        summary: '堆暴击与攻击力，靠超远射程和爆头输出。',
        coreAugments: ['大腕', '珠光护手'],
        optionalAugments: ['亮出你的剑', '关键暴击'],
        coreItems: [],
        whenToUse: '对面缺乏突进、能保持距离时',
        whenNotToUse: '对面有强开团',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'TahmKench',
    combos: [
      {
        id: 'tahm-tank',
        name: '肉盾续航流',
        type: 'playstyle',
        summary: '堆生命值与抗性，靠被动和吞噬保护队友。',
        coreAugments: ['歌利亚巨人', '钢化你心'],
        optionalAugments: ['装甲冲击', '泰坦的坚决'],
        coreItems: [],
        whenToUse: '队伍需要前排吸收伤害时',
        whenNotToUse: '队友输出不足，需要你补伤害',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'Brand',
    combos: [
      {
        id: 'brand-burn',
        name: '灼烧消耗流',
        type: 'build',
        summary: '堆法术强度与穿透，靠被动灼烧打持续伤害。',
        coreAugments: ['科学狂人', '死亡之环'],
        optionalAugments: ['炼狱导管', '沃格勒特的巫师帽'],
        coreItems: [],
        whenToUse: '对面坦克或高血量英雄多时',
        whenNotToUse: '对面全是高魔抗',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'Smolder',
    combos: [
      {
        id: 'smolder-stack',
        name: '叠层发育流',
        type: 'mechanic',
        summary: '靠 Q 叠层提升伤害，中后期接管比赛。',
        coreAugments: ['属性叠属性！', '叠角龙'],
        optionalAugments: ['亮出你的剑', '大腕'],
        coreItems: [],
        whenToUse: '对局能拖到中后期时',
        whenNotToUse: '对面速推、节奏很快',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Ryze',
    combos: [
      {
        id: 'ryze-ap-burst',
        name: '法坦爆发流',
        type: 'build',
        summary: '堆法术强度与法力，靠连招打出高额爆发。',
        coreAugments: ['科学狂人', '沃格勒特的巫师帽'],
        optionalAugments: ['尤里卡', '炼狱导管'],
        coreItems: [],
        whenToUse: '对面脆皮多时',
        whenNotToUse: '对面高魔抗且控制多',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Jhin',
    combos: [
      {
        id: 'jhin-crit',
        name: '暴击四发流',
        type: 'build',
        summary: '堆暴击与攻击力，靠第四发子弹打出爆发。',
        coreAugments: ['大腕', '珠光护手'],
        optionalAugments: ['亮出你的剑', '关键暴击'],
        coreItems: [],
        whenToUse: '对面脆皮多、能保持距离时',
        whenNotToUse: '对面强开团或高机动刺客',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Ezreal',
    combos: [
      {
        id: 'ez-poke',
        name: 'Q 消耗流',
        type: 'mechanic',
        summary: '靠 Q 远程消耗，命中减 CD 持续输出。',
        coreAugments: ['秘术冲拳', '双发快射'],
        optionalAugments: ['虚幻武器', '急速之追求'],
        coreItems: [],
        whenToUse: '对面近战多、需要远程消耗时',
        whenNotToUse: '对面有强突进',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'Yasuo',
    combos: [
      {
        id: 'yasuo-crit',
        name: '暴击流',
        type: 'build',
        summary: '堆暴击与攻击力，靠 Q 叠风与 E 位移打出爆发。',
        coreAugments: ['大腕', '装甲冲击'],
        optionalAugments: ['亮出你的剑', '秘术冲拳'],
        coreItems: [],
        whenToUse: '对面脆皮多、有击飞配合时',
        whenNotToUse: '对面控制链长、难以进场',
        difficulty: 4,
      },
      {
        id: 'yasuo-q-spam',
        name: '无限 Q 流',
        type: 'mechanic',
        summary: '靠秘术冲拳减少 Q 的 CD，实现高频位移与击飞。',
        coreAugments: ['秘术冲拳', '全凭身法'],
        optionalAugments: ['虚幻武器', '双发快射'],
        coreItems: [],
        whenToUse: '拿到秘术冲拳后，可打出高频机动',
        whenNotToUse: '没拿到核心海克斯时不要硬走',
        difficulty: 4,
      },
    ],
  },
  {
    championAlias: 'Graves',
    combos: [
      {
        id: 'graves-crit',
        name: '暴击霰弹流',
        type: 'build',
        summary: '堆暴击与攻击力，近距离霰弹爆发。',
        coreAugments: ['大腕', '珠光护手'],
        optionalAugments: ['亮出你的剑', '关键暴击'],
        coreItems: [],
        whenToUse: '对面脆皮多、能近身时',
        whenNotToUse: '对面远程消耗强、难以接近',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Karthus',
    combos: [
      {
        id: 'karthus-ult',
        name: '大招收割流',
        type: 'playstyle',
        summary: '堆法术强度，靠大招全场收割残血。',
        coreAugments: ['终极刷新', '终极唤醒'],
        optionalAugments: ['科学狂人', '沃格勒特的巫师帽'],
        coreItems: [],
        whenToUse: '队友能打残对面时',
        whenNotToUse: '对面回复能力强',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Malphite',
    combos: [
      {
        id: 'malphite-tank',
        name: '坦克开团流',
        type: 'playstyle',
        summary: '堆护甲与生命，靠大招开团。',
        coreAugments: ['装甲冲击', '歌利亚巨人'],
        optionalAugments: ['钢化你心', '泰坦的坚决'],
        coreItems: [],
        whenToUse: '队伍需要开团时',
        whenNotToUse: '对面全是远程消耗',
        difficulty: 2,
      },
    ],
  },
  {
    championAlias: 'AurelionSol',
    combos: [
      {
        id: 'asol-stack',
        name: '叠层爆发流',
        type: 'mechanic',
        summary: '靠技能叠层提升伤害，中后期团战爆发。',
        coreAugments: ['科学狂人', '属性叠属性！'],
        optionalAugments: ['沃格勒特的巫师帽', '炼狱导管'],
        coreItems: [],
        whenToUse: '对局能拖到中后期',
        whenNotToUse: '对面速推',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'TwistedFate',
    combos: [
      {
        id: 'tf-ap',
        name: 'AP 黄牌流',
        type: 'build',
        summary: '堆法术强度，靠黄牌控制与 Q 输出。',
        coreAugments: ['科学狂人', '沃格勒特的巫师帽'],
        optionalAugments: ['尤里卡', '死亡之环'],
        coreItems: [],
        whenToUse: '对面脆皮多时',
        whenNotToUse: '对面高魔抗',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Hecarim',
    combos: [
      {
        id: 'hecarim-q-spam',
        name: '无限 Q 流',
        type: 'mechanic',
        summary: '靠秘术冲拳减少 Q 的 CD，实现无限 Q 连击。',
        coreAugments: ['秘术冲拳', '鼓声暴起 低音轰鸣'],
        optionalAugments: ['全凭身法', '虚幻武器'],
        coreItems: [],
        whenToUse: '拿到秘术冲拳后，Q 可以无缝衔接',
        whenNotToUse: '没拿到核心海克斯时，回归常规战士流',
        difficulty: 4,
      },
      {
        id: 'hecarim-bruiser',
        name: '战士冲阵流',
        type: 'build',
        summary: '堆攻击力与生命，靠 E 突进冲散阵型。',
        coreAugments: ['鼓声暴起 低音轰鸣', '装甲冲击'],
        optionalAugments: ['歌利亚巨人', '亮出你的剑'],
        coreItems: [],
        whenToUse: '对面后排脆皮多时',
        whenNotToUse: '对面控制链长',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'MasterYi',
    combos: [
      {
        id: 'yi-attack-speed',
        name: '攻速收割流',
        type: 'build',
        summary: '堆攻速与攻击力，靠 Q 躲避与收割。',
        coreAugments: ['双发快射', '迷人蝴蝶'],
        optionalAugments: ['小蜜蜂！！！', '虚幻武器'],
        coreItems: [],
        whenToUse: '对面控制少时',
        whenNotToUse: '对面硬控多',
        difficulty: 3,
      },
    ],
  },
  {
    championAlias: 'Morgana',
    combos: [
      {
        id: 'morgana-ap',
        name: 'AP 控制流',
        type: 'build',
        summary: '堆法术强度，靠 Q 禁锢与 W 持续消耗。',
        coreAugments: ['科学狂人', '死亡之环'],
        optionalAugments: ['沃格勒特的巫师帽', '炼狱导管'],
        coreItems: [],
        whenToUse: '对面突进多时',
        whenNotToUse: '对面高魔抗',
        difficulty: 2,
      },
    ],
  },
]
