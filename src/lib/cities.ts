// Cities we explicitly target for local SEO. Each gets its own page at
// /locations/:slug. Add/remove entries here and the route + sitemap +
// service-area chips will pick them up automatically.

export interface City {
  slug: string;
  name: string;
  /** Approximate driving miles from Duluth base */
  miles: number;
  zips: string[];
  /** Tone/positioning blurb shown on the city page */
  blurb: { en: string; zh: string };
  /** Neighborhoods or landmarks worth name-dropping for local SEO */
  neighborhoods?: string[];
}

export const CITIES: City[] = [
  {
    slug: 'duluth',
    name: 'Duluth',
    miles: 1,
    zips: ['30096', '30097'],
    neighborhoods: ['Pleasant Hill', 'Sugarloaf', 'Berkeley Lake'],
    blurb: {
      en:
        'We\'re based right here in Duluth — every job is local for us. Same-week appointments are the norm, and we know the neighborhoods (Pleasant Hill, Sugarloaf, Berkeley Lake) inside and out.',
      zh:
        '我们的基地就在 Duluth — 这里的每一单对我们都是本地服务。当周上门是常态，对 Pleasant Hill、Sugarloaf、Berkeley Lake 这些社区了如指掌。',
    },
  },
  {
    slug: 'johns-creek',
    name: 'Johns Creek',
    miles: 9,
    zips: ['30022', '30097'],
    neighborhoods: ['Medlock Bridge', 'St. Ives', 'Country Club of the South'],
    blurb: {
      en:
        'Johns Creek homes — many with large square footage and multi-zone HVAC systems — benefit a lot from proper air duct cleaning. We serve all Johns Creek ZIPs with no travel fee.',
      zh:
        'Johns Creek 的大户型房子和多区空调系统特别需要定期的管道清洁。整个 Johns Creek 区都在我们的免路费范围内。',
    },
  },
  {
    slug: 'suwanee',
    name: 'Suwanee',
    miles: 7,
    zips: ['30024'],
    neighborhoods: ['Suwanee Town Center', 'The River Club', 'Bears Best'],
    blurb: {
      en:
        'Suwanee\'s growing neighborhoods and family homes — many with pets and high-traffic carpeted areas — keep us busy here. Free service area within our standard 20-mile radius.',
      zh:
        'Suwanee 不断扩展的社区和家庭住宅（很多带宠物、高频使用的地毯）让这边的活儿一直不断。在我们标准 20 英里免路费范围内。',
    },
  },
  {
    slug: 'alpharetta',
    name: 'Alpharetta',
    miles: 12,
    zips: ['30022', '30005', '30004', '30009'],
    neighborhoods: ['Avalon', 'Downtown Alpharetta', 'Windward'],
    blurb: {
      en:
        'Alpharetta homes — especially those near Avalon, Downtown, and Windward — often have older HVAC systems where duct cleaning produces a noticeable air-quality difference. We respond fast across all Alpharetta ZIPs.',
      zh:
        'Alpharetta 的住宅 — 尤其是 Avalon、Downtown 和 Windward 附近 — 很多是带年限的空调系统，清洁后空气质量改善非常明显。整个 Alpharetta 我们都能快速响应。',
    },
  },
  {
    slug: 'roswell',
    name: 'Roswell',
    miles: 17,
    zips: ['30075', '30076'],
    neighborhoods: ['Historic Roswell', 'Martin\'s Landing', 'Willow Springs'],
    blurb: {
      en:
        'Older homes in Historic Roswell and tree-heavy neighborhoods often build up more debris in their dryer vents. We\'ve cleaned hundreds across Roswell.',
      zh:
        'Historic Roswell 的老房子和树木茂密的社区，烘干机管道里容易积棉絮。Roswell 区我们已经服务过几百户。',
    },
  },
  {
    slug: 'norcross',
    name: 'Norcross',
    miles: 7,
    zips: ['30071', '30092', '30093'],
    neighborhoods: ['Peachtree Corners', 'Historic Norcross', 'Berkeley Lake'],
    blurb: {
      en:
        'Norcross and Peachtree Corners are right next door to our Duluth base. We get there within 30 minutes for emergency dryer-vent issues — perfect when your clothes are taking forever to dry.',
      zh:
        'Norcross 和 Peachtree Corners 就在我们 Duluth 基地隔壁。烘干机急事 30 分钟内上门 — 衣服烘不干别拖。',
    },
  },
  {
    slug: 'lawrenceville',
    name: 'Lawrenceville',
    miles: 10,
    zips: ['30043', '30044', '30045', '30046'],
    neighborhoods: ['Downtown Lawrenceville', 'Sugarloaf Greens', 'Hamilton Mill'],
    blurb: {
      en:
        'Lawrenceville covers a lot of ground — we serve all four ZIPs with no travel fee. Big homes, growing families, lots of carpet wear — we\'ve seen it all here.',
      zh:
        'Lawrenceville 区域大 — 四个邮编全部免路费。大房子、有娃的家庭、地毯磨损严重的情况都常见，我们都处理过。',
    },
  },
  {
    slug: 'marietta',
    name: 'Marietta',
    miles: 25,
    zips: ['30062', '30068', '30067', '30066'],
    neighborhoods: ['East Cobb', 'Downtown Marietta', 'Sandy Plains'],
    blurb: {
      en:
        'Marietta and East Cobb are outside our standard free-service zone, but we regularly travel there — small travel fee covers the distance and we still beat most local competitors on price and quality.',
      zh:
        'Marietta 和 East Cobb 在我们标准免费区外，但经常去 — 少量路费覆盖距离，价格和质量仍然比当地大多数同行更有优势。',
    },
  },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
