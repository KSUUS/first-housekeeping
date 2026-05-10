// All site copy lives here. Add a new key in BOTH `en` and `zh`.
// To update copy without touching components, just edit values below.

export type Lang = 'en' | 'zh';

export const translations = {
  en: {
    brand: {
      name: 'First Housekeeping',
      tagline: 'Air Duct, Dryer Vent & Carpet Cleaning',
      phone: '(770) 555-0123', // TODO: replace with real number
      email: 'info@firsthousekeeping.com',
      address: 'Serving Atlanta & surrounding areas, GA',
    },
    nav: {
      home: 'Home',
      services: 'Services',
      airDuct: 'Air Duct Cleaning',
      dryerVent: 'Dryer Vent Cleaning',
      carpet: 'Carpet Cleaning',
      serviceArea: 'Service Area',
      quote: 'Get a Quote',
      contact: 'Contact',
      callNow: 'Call Now',
    },
    home: {
      heroEyebrow: 'Locally trusted in Metro Atlanta',
      heroTitle: 'Breathe cleaner air. Live in a healthier home.',
      heroSubtitle:
        'Professional air duct, dryer vent, and carpet cleaning for homes and businesses across Atlanta and surrounding areas.',
      ctaQuote: 'Get a Free Quote',
      ctaCall: 'Call (770) 555-0123',
      trustBar: {
        licensed: 'Licensed & Insured',
        local: 'Local, Family-Operated',
        bilingual: 'English & Chinese Service / 中英文服务',
        sameWeek: 'Same-Week Appointments',
      },
      servicesTitle: 'Our Services',
      servicesSubtitle:
        'Three specialties — done right, every time.',
      whyTitle: 'Why Atlanta Homeowners Choose Us',
      why: [
        {
          title: 'Real, Trained Technicians',
          body: 'No subcontractors. The same trusted team handles every job — start to finish.',
        },
        {
          title: 'Upfront, Honest Pricing',
          body: 'You get a clear quote before we start work. No bait-and-switch, no surprise add-ons.',
        },
        {
          title: 'Bilingual Support',
          body: 'We speak English and Chinese — making it easy to ask questions and get the service you need. 中英文服务，沟通无障碍。',
        },
        {
          title: 'Local to Metro Atlanta',
          body: 'Based out of Duluth, serving the entire metro area. We know our neighborhoods.',
        },
      ],
      ctaBlockTitle: 'Ready for a cleaner, healthier home?',
      ctaBlockBody:
        'Get a free quote in minutes. We respond within one business day.',
    },
    services: {
      airDuct: {
        title: 'Air Duct Cleaning',
        short:
          'Remove built-up dust, allergens, and mold from your HVAC system — improving air quality and system efficiency.',
        benefits: [
          'Reduces dust, pollen, and pet dander throughout your home',
          'Helps allergy and asthma sufferers breathe easier',
          'Improves HVAC efficiency — lower energy bills',
          'Removes musty odors at the source',
          'Recommended every 3–5 years (sooner if pets, smokers, or recent renovation)',
        ],
        process: [
          'Inspection — we walk through your system and identify problem areas',
          'Source removal — high-powered vacuum + agitation tools clean every supply, return, and main trunk',
          'Sanitization (optional) — EPA-registered antimicrobial treatment',
          'Final walkthrough — before/after photos so you can see the difference',
        ],
        priceFrom: 'Starting at $299 (single system, up to 10 vents)',
      },
      dryerVent: {
        title: 'Dryer Vent Cleaning',
        short:
          'A clogged dryer vent is the #1 cause of house fires from appliances. Annual cleaning protects your home and saves energy.',
        benefits: [
          'Prevents lint buildup — the leading cause of dryer fires (US Fire Administration)',
          'Cuts drying time in half when severely clogged',
          'Lowers energy bills (clogged vents force the dryer to overwork)',
          'Extends the life of your dryer',
          'Recommended once every 12 months',
        ],
        process: [
          'Disconnect the dryer and inspect the full vent line',
          'Brush + vacuum the entire duct from inside and outside the home',
          'Clear the exterior vent hood and check the damper',
          'Reconnect and test airflow',
        ],
        priceFrom: 'Starting at $129 (standard residential dryer vent)',
      },
      carpet: {
        title: 'Carpet Cleaning',
        short:
          'Deep hot-water extraction that lifts dirt, allergens, and stains — restoring carpets to like-new condition.',
        benefits: [
          'Removes deep-down dirt vacuums leave behind',
          'Eliminates allergens, dust mites, and pet dander',
          'Treats stains, pet accidents, and high-traffic wear',
          'Eco-friendly, child- and pet-safe cleaning solutions',
          'Carpets typically dry in 4–6 hours',
        ],
        process: [
          'Pre-inspection and stain assessment',
          'Pre-treatment of high-traffic areas and stains',
          'Hot-water extraction with truck-mount or portable equipment',
          'Spot treatment + grooming for an even finish',
        ],
        priceFrom: 'Starting at $99 per room (3 rooms minimum)',
      },
      benefitsLabel: 'Benefits',
      processLabel: 'Our Process',
      pricingLabel: 'Pricing',
      ctaQuote: 'Get a Free Quote for This Service',
    },
    serviceArea: {
      title: 'Service Area',
      subtitle:
        'We serve Atlanta and surrounding areas. Use the calculator below to check coverage and see any travel fee.',
      pricingNote:
        'Service is free of travel fees within 20 miles of our Duluth base (Great Wall Supermarket, Pleasant Hill Rd). Beyond 20 miles, a $2-per-mile travel fee applies.',
      calcTitle: 'Distance & Travel Fee Calculator',
      zipLabel: 'Enter your ZIP code',
      zipPlaceholder: 'e.g. 30097',
      checkBtn: 'Check Coverage',
      result: {
        within: 'You\'re within our free service zone — no travel fee.',
        beyond:
          'You\'re outside our free zone. Estimated travel fee:',
        notFound:
          'We don\'t have this ZIP code on file yet. Please call or message us — we likely still cover you.',
        approxDistance: 'Approximate distance from our Duluth base:',
        miles: 'miles',
        extraMiles: 'extra miles',
        feeFormula: '({extra} extra miles × $2/mile)',
      },
      areasTitle: 'Cities We Regularly Serve',
      areas: [
        'Duluth', 'Johns Creek', 'Suwanee', 'Alpharetta', 'Roswell',
        'Norcross', 'Lawrenceville', 'Buford', 'Cumming', 'Sugar Hill',
        'Tucker', 'Doraville', 'Chamblee', 'Brookhaven', 'Sandy Springs',
        'Dunwoody', 'Marietta', 'Decatur', 'Stone Mountain', 'Snellville',
      ],
    },
    quote: {
      title: 'Request a Free Quote',
      subtitle:
        'Tell us about your home and what you need. We\'ll respond within one business day.',
      form: {
        name: 'Your Name',
        phone: 'Phone Number',
        email: 'Email',
        zip: 'ZIP Code',
        service: 'Service Needed',
        servicePlaceholder: 'Select a service',
        services: {
          airDuct: 'Air Duct Cleaning',
          dryerVent: 'Dryer Vent Cleaning',
          carpet: 'Carpet Cleaning',
          multiple: 'Multiple services',
        },
        homeSize: 'Approx. Home Size (sq ft)',
        homeSizePlaceholder: 'e.g. 2,500',
        details: 'Anything else we should know?',
        detailsPlaceholder: 'Number of vents, rooms, pets, recent renovation, etc.',
        submit: 'Send Request',
        submitting: 'Sending...',
        successTitle: 'Thanks — we got it!',
        successBody:
          'We\'ll review your request and get back to you within one business day. For urgent help, please call (770) 555-0123.',
        errorBody: 'Something went wrong. Please call us directly at (770) 555-0123.',
      },
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Questions? We\'re here to help.',
      hours: 'Hours',
      hoursValue: 'Mon–Sat 8am–7pm, Sun by appointment',
      callTitle: 'Call or Text',
      emailTitle: 'Email',
      areaTitle: 'Service Area',
    },
    footer: {
      tagline: 'Air duct, dryer vent, and carpet cleaning for Atlanta homes and businesses.',
      services: 'Services',
      company: 'Company',
      legal: '© {year} First Housekeeping. All rights reserved.',
      builtWith: 'Locally owned, operated, and proud to serve our neighbors.',
    },
  },

  zh: {
    brand: {
      name: '第一家政',
      tagline: '空调管道 · 烘干机管道 · 地毯清洗',
      phone: '(770) 555-0123', // 待替换
      email: 'info@firsthousekeeping.com',
      address: '服务大亚特兰大地区',
    },
    nav: {
      home: '首页',
      services: '服务项目',
      airDuct: '空调管道清洁',
      dryerVent: '烘干机管道清洁',
      carpet: '地毯清洗',
      serviceArea: '服务范围',
      quote: '免费报价',
      contact: '联系我们',
      callNow: '立即致电',
    },
    home: {
      heroEyebrow: '亚特兰大本地华人信赖之选',
      heroTitle: '清新空气，健康家居',
      heroSubtitle:
        '专业空调管道、烘干机管道和地毯清洁服务，覆盖亚特兰大及周边地区，住宅和商业均可。',
      ctaQuote: '免费获取报价',
      ctaCall: '电话 (770) 555-0123',
      trustBar: {
        licensed: '持证经营 · 全额保险',
        local: '本地家族经营',
        bilingual: '中英文服务',
        sameWeek: '本周可上门',
      },
      servicesTitle: '我们的服务',
      servicesSubtitle: '三大专业项目，每一次都做到位。',
      whyTitle: '为什么亚特兰大客户选择我们',
      why: [
        {
          title: '专业自有技师',
          body: '不外包。同一支信赖团队从头到尾负责每一单，质量稳定。',
        },
        {
          title: '价格透明',
          body: '动手之前先给报价，绝不"低价钓鱼、当场加价"。',
        },
        {
          title: '中英文双语',
          body: '中英文沟通无障碍，问题随时问，服务听得懂、看得明白。',
        },
        {
          title: '扎根 Duluth',
          body: '总部位于 Duluth，覆盖整个大亚特兰大地区。熟悉每一个社区。',
        },
      ],
      ctaBlockTitle: '准备好让家里更清洁、更健康了吗？',
      ctaBlockBody: '几分钟填写需求，我们一个工作日内回复。',
    },
    services: {
      airDuct: {
        title: '空调管道清洁',
        short:
          '清除空调系统内积累的灰尘、过敏原和霉菌，改善室内空气质量并提高系统效率。',
        benefits: [
          '减少全屋灰尘、花粉和宠物毛屑',
          '帮助过敏和哮喘患者更轻松呼吸',
          '提高空调效率 — 降低电费',
          '从源头消除霉味、异味',
          '建议每 3–5 年清洁一次（养宠、吸烟或刚装修可缩短周期）',
        ],
        process: [
          '检查 — 现场检查系统，找出重点区域',
          '清洁 — 大功率真空 + 搅动工具，每一个出风口、回风口和主管道全部清理',
          '消毒（可选） — EPA 认证抗菌处理',
          '最终验收 — 提供清洁前后对比照片',
        ],
        priceFrom: '$299 起（单系统，最多 10 个出风口）',
      },
      dryerVent: {
        title: '烘干机管道清洁',
        short:
          '烘干机管道堵塞是家电火灾的头号原因。每年清洁一次，保障家庭安全，节省能源。',
        benefits: [
          '防止棉絮堆积 — 烘干机起火的首要原因（美国消防局数据）',
          '严重堵塞时，可缩短烘干时间一半',
          '降低电费（管道堵塞会让烘干机过度运转）',
          '延长烘干机使用寿命',
          '建议每 12 个月清洁一次',
        ],
        process: [
          '断开烘干机，检查整段排风管',
          '从室内外两端用刷子 + 真空清理整条管道',
          '清理外墙排风口和挡板',
          '重新连接并测试风量',
        ],
        priceFrom: '$129 起（标准住宅烘干机管道）',
      },
      carpet: {
        title: '地毯清洗',
        short:
          '深度热水萃取，清除污垢、过敏原和顽固污渍，让地毯焕然一新。',
        benefits: [
          '清除真空吸尘器无法触及的深层污垢',
          '消除过敏原、尘螨和宠物毛屑',
          '处理污渍、宠物意外和高频使用区域的磨损',
          '环保配方，儿童和宠物均可安心',
          '通常 4–6 小时干透',
        ],
        process: [
          '预检与污渍评估',
          '高频区和污渍预处理',
          '使用车载或便携设备进行热水萃取',
          '局部处理 + 整理梳理，确保均匀效果',
        ],
        priceFrom: '$99 起/房间（最少 3 间）',
      },
      benefitsLabel: '服务亮点',
      processLabel: '服务流程',
      pricingLabel: '价格',
      ctaQuote: '获取本项目免费报价',
    },
    serviceArea: {
      title: '服务范围',
      subtitle:
        '覆盖亚特兰大及周边地区。使用下方计算器查询您的位置和可能产生的路费。',
      pricingNote:
        '以 Duluth Great Wall Supermarket（Pleasant Hill Rd）为起点，20 英里以内免路费。超出 20 英里部分按每英里 $2 收取额外路费。',
      calcTitle: '距离与路费计算器',
      zipLabel: '输入您的 ZIP code（邮编）',
      zipPlaceholder: '例如 30097',
      checkBtn: '查询',
      result: {
        within: '您在我们的免路费服务区内 — 无需额外费用。',
        beyond: '您在免费区之外，预计路费：',
        notFound:
          '暂时没有该邮编的数据，请直接电话或留言联系，多数情况下我们仍可服务。',
        approxDistance: '距 Duluth 基地大约：',
        miles: '英里',
        extraMiles: '额外英里',
        feeFormula: '({extra} 额外英里 × $2/英里)',
      },
      areasTitle: '我们经常服务的城市',
      areas: [
        'Duluth', 'Johns Creek', 'Suwanee', 'Alpharetta', 'Roswell',
        'Norcross', 'Lawrenceville', 'Buford', 'Cumming', 'Sugar Hill',
        'Tucker', 'Doraville', 'Chamblee', 'Brookhaven', 'Sandy Springs',
        'Dunwoody', 'Marietta', 'Decatur', 'Stone Mountain', 'Snellville',
      ],
    },
    quote: {
      title: '申请免费报价',
      subtitle: '告诉我们您的家庭情况和需求，我们会在一个工作日内回复。',
      form: {
        name: '您的姓名',
        phone: '电话',
        email: '邮箱',
        zip: '邮编',
        service: '需要的服务',
        servicePlaceholder: '请选择服务',
        services: {
          airDuct: '空调管道清洁',
          dryerVent: '烘干机管道清洁',
          carpet: '地毯清洗',
          multiple: '多项服务',
        },
        homeSize: '房屋面积（平方英尺）',
        homeSizePlaceholder: '例如 2,500',
        details: '其他需要让我们知道的信息？',
        detailsPlaceholder: '例如：出风口数量、房间数、宠物、近期装修等',
        submit: '提交申请',
        submitting: '提交中...',
        successTitle: '谢谢！我们已收到您的申请。',
        successBody:
          '我们会在一个工作日内回复您。如紧急需求，请直接致电 (770) 555-0123。',
        errorBody: '提交出现问题，请直接致电 (770) 555-0123。',
      },
    },
    contact: {
      title: '联系我们',
      subtitle: '有任何问题随时联系我们。',
      hours: '营业时间',
      hoursValue: '周一至周六 8am–7pm，周日预约制',
      callTitle: '电话/短信',
      emailTitle: '邮箱',
      areaTitle: '服务范围',
    },
    footer: {
      tagline: '亚特兰大住宅与商业空调管道、烘干机管道、地毯清洁专家。',
      services: '服务项目',
      company: '关于我们',
      legal: '© {year} First Housekeeping 第一家政。版权所有。',
      builtWith: '本地经营，服务邻里。',
    },
  },
} as const;

export type Translations = typeof translations[Lang];
