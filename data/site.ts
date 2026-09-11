export type Program = {
  id: string;
  title: string;
  ageRange: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: string;
  featured?: boolean;
};

export type Review = {
  id: string;
  author: string;
  source: string;
  sourceUrl?: string;
  text: string;
  childInfo?: string;
};

export type NewsItem = {
  vk_post_id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  source_url: string;
  published_at: string;
};

export type Teacher = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  span?: "tall" | "wide" | "normal";
  pos?: string;
};

export type EventItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  pos?: string;
};

export type ParentOption = {
  id: string;
  label: string;
  targetProgramId: string;
};

export const siteConfig = {
  name: "Сфера",
  fullName: "Учебно-развивающая студия «Сфера»",
  tagline: "Лучшее время — сейчас, лучшее место — здесь!",
  secondaryTagline: "Стройте образование на твёрдом основании!",
  city: "Горячий Ключ",
  address: "Спортивный переулок, 13",
  addressDetails: "2 этаж",
  addressFull: "Горячий Ключ, Спортивный переулок, 13 (2 этаж)",
  phone: "+7 (928) 434-91-08",
  phoneHref: "tel:+79284349108",
  vkUrl: "https://vk.ru/sferaznanei",
  vkDisplay: "vk.ru/sferaznanei",
  ageRange: "от 5 до 15 лет",
  // Подтверждено из источников: Zoon, GdeProf, Skidkom
  workingHours: "Пн–Пт: 09:30–18:30 (по предварительной записи)",
  workingHoursShort: "Пн–Пт 09:30–18:30",
  yearsExperience: "более 15 лет",
  mapQuery: "Горячий Ключ, Спортивный переулок 13",
  // Показывать секцию преподавателей — переключите в true, когда появятся реальные данные
  showTeachers: false,
  // Показывать секцию событий — переключите в true, когда появятся реальные данные
  showEvents: false,
  // Показывать секцию отзывов — переключите в true, когда появятся реальные отзывы
  showReviews: true,
};

export const heroContent = {
  badge: "Учебно-развивающая студия · Горячий Ключ",
  title: "Место, где интересно учиться и хочется развиваться",
  highlight: "интересно",
  tagline: "Лучшее время — сейчас, лучшее место — здесь!",
  description:
    "Занятия для дошкольников и школьников: подготовка к школе, помощь в учёбе, английский язык, творчество, театр и другие развивающие направления.",
  primaryCta: "Записаться в «Сферу»",
  secondaryCta: "Посмотреть направления",
  image: "/images/PF6A7622_resized.jpg",
  imageAlt: "Дети занимаются в учебной студии «Сфера»",
};

export const aboutContent = {
  title: "Не просто дополнительные занятия",
  subtitle: "О «Сфере»",
  yearsLabel: "более 15 лет",
  intro:
    "Уже более 15 лет «Сфера» помогает детям в Горячем Ключе раскрывать свои способности, уверенно осваивать школьную программу и получать устойчивый интерес к знаниям. Мы работаем с ребятами от 5 до 15 лет, подбирая комфортный формат занятий с учётом возраста, уровня подготовки и целей семьи.",
  principles: [
    {
      icon: "BookOpen",
      title: "Учимся понимать",
      text: "Не просто выполняем задания, а разбираемся в материале и учимся думать самостоятельно.",
    },
    {
      icon: "Sparkles",
      title: "Развиваем самостоятельность",
      text: "Помогаем ребёнку становиться увереннее в собственных силах и решениях.",
    },
    {
      icon: "Users",
      title: "Общаемся и дружим",
      text: "Учим взаимодействовать с другими детьми и взрослыми — в группе и в жизни.",
    },
    {
      icon: "HeartHandshake",
      title: "Раскрываем способности",
      text: "Даём возможность попробовать себя в разных направлениях — от учёбы до театра.",
    },
  ],
};

export const programs: Program[] = [
  {
    id: "school-prep",
    title: "Подготовка к школе",
    ageRange: "5–7 лет · 1 или 2 года",
    description:
      "Для будущих первоклассников. Помогаем ребёнку уверенно подойти к школьному порогу: чтение, письмо, счёт, развитие внимания и усидчивости. Программа рассчитана на 1 или 2 года.",
    image: "/images/PF6A7648_resized.jpg",
    imageAlt: "Подготовка к школе в студии «Сфера»",
    icon: "Backpack",
    featured: true,
  },
  {
    id: "elementary",
    title: "Начальная ступень (1–4 классы)",
    ageRange: "7–10 лет",
    description:
      "Поддержка по ключевым предметам для учеников начальной школы. Помогаем разобраться в материале, восполнить пробелы и наладить отношения с учёбой.",
    image: "/images/PF6A7681_resized.jpg",
    imageAlt: "Занятия в начальной школе в «Сфере»",
    icon: "Pencil",
  },
  {
    id: "middle",
    title: "Средняя ступень (5–9 классы)",
    ageRange: "11–15 лет",
    description:
      "Занятия для учеников средней школы: укрепление знаний, устранение пробелов и рост успеваемости по ключевым предметам.",
    image: "/images/PF6A7844_resized.jpg",
    imageAlt: "Занятия для средней школы в «Сфере»",
    icon: "GraduationCap",
  },
  {
    id: "english",
    title: "Английский язык",
    ageRange: "1–9 классы",
    description:
      "Изучение языка в понятной и интересной форме. Игры, диалоги, живая практика — без скучной зубрёжки.",
    image: "/images/PF6A8076_resized.jpg",
    imageAlt: "Изучение английского языка в «Сфере»",
    icon: "Languages",
  },
  {
    id: "handwriting",
    title: "Чистописание",
    ageRange: "5–10 лет",
    description:
      "Коррекция почерка. Работа над красивым, уверенным и аккуратным письмом. Развиваем мелкую моторику и привычку к аккуратности.",
    image: "/images/PF6A7999_resized.jpg",
    imageAlt: "Чистописание и развитие мелкой моторики",
    icon: "PenLine",
  },
  {
    id: "theater",
    title: "Театр",
    ageRange: "6–15 лет",
    description:
      "Освоение сценического мастерства, создание спектаклей. Сцена, творчество, речь, взаимодействие и уверенность.",
    image: "/images/PF6A8152_resized.jpg",
    imageAlt: "Театральные занятия в студии «Сфера»",
    icon: "Drama",
  },
  {
    id: "writers-club",
    title: "Писательский клуб",
    ageRange: "8–15 лет",
    description:
      "Журналистика и риторика. Развиваем умение формулировать мысли, рассказывать истории и выступать перед аудиторией.",
    image: "/images/PF6A8218_resized.jpg",
    imageAlt: "Писательский клуб в «Сфере»",
    icon: "PenTool",
  },
  {
    id: "neuro-correction",
    title: "Нейропсихологическая коррекция",
    ageRange: "по запросу",
    description:
      "Консультация и рекомендации по нейропсихологической коррекции обучения. Уточняйте детали по телефону.",
    image: "/images/PF6A8162_resized.jpg",
    imageAlt: "Нейропсихологическая коррекция в «Сфере»",
    icon: "BrainCircuit",
  },
];

export const learningExperience = {
  title: "Как проходят занятия",
  subtitle: "Атмосфера «Сферы»",
  intro:
    "Мы создаём пространство, где ребёнку комфортно учиться, пробовать и не бояться ошибаться.",
  items: [
    { icon: "Users", title: "Небольшие группы", text: "Педагог видит каждого ребёнка и может уделить внимание лично." },
    { icon: "Lightbulb", title: "Понятное объяснение", text: "Сложные вещи говорим простым языком — без давления и спешки." },
    { icon: "GamepadIcon", title: "Практика и игровые форматы", text: "Учимся через действие: делаем, обсуждаем, проигрываем." },
    { icon: "MessagesSquare", title: "Живое общение", text: "Ребёнок учится задавать вопросы и не стесняться не знать." },
    { icon: "Palette", title: "Творческие проекты", text: "Соединяем знания с творчеством — от рисования до театра." },
    { icon: "HeartHandshake", title: "Внимание к ребёнку", text: "Стараемся понять, что интересно и что получается лучше всего." },
  ],
  image: "/images/PF6A7622_resized.jpg",
  imageAlt: "Атмосфера занятий в студии «Сфера»",
};

export const gallery: GalleryItem[] = [
  {
    src: "/images/PF6A7622_resized.jpg",
    alt: "Дети занимаются в учебной студии «Сфера»",
    span: "tall",
  },
  {
    src: "/images/PF6A7648_resized.jpg",
    alt: "Занятия с педагогом в «Сфере»",
    span: "wide",
  },
  {
    src: "/images/PF6A7681_resized.jpg",
    alt: "Дети внимательно слушают на уроке",
    span: "normal",
  },
  {
    src: "/images/PF6A7844_resized.jpg",
    alt: "Групповые занятия в студии",
    span: "normal",
  },
  {
    src: "/images/PF6A7999_resized.jpg",
    alt: "Творческие занятия в «Сфере»",
    span: "wide",
    pos: "50% 20%",
  },
  {
    src: "/images/PF6A8076_resized.jpg",
    alt: "Дети работают за партами",
    span: "normal",
  },
  {
    src: "/images/PF6A8152_resized.jpg",
    alt: "Театральные постановки в студии",
    span: "normal",
  },
  {
    src: "/images/PF6A8162_resized.jpg",
    alt: "Уютная атмосфера учебного класса",
    span: "normal",
  },
];

export const teachers: Teacher[] = [
  // TODO: Замените placeholder-данные на реальную информацию о преподавателях.
  // Когда данные будут готовы — установите siteConfig.showTeachers = true.
  {
    id: "placeholder-1",
    name: "Имя преподавателя",
    role: "Направление",
    bio: "Короткое описание опыта и подхода педагога.",
  },
  {
    id: "placeholder-2",
    name: "Имя преподавателя",
    role: "Направление",
    bio: "Короткое описание опыта и подхода педагога.",
  },
  {
    id: "placeholder-3",
    name: "Имя преподавателя",
    role: "Направление",
    bio: "Короткое описание опыта и подхода педагога.",
  },
];

// Отзывы из публичных источников: jsprav.ru, skidkom.ru
// TODO: дополните отзывами из VK (vk.ru/sferaznanei) и Zoon при появлении.
export const reviews: Review[] = [
  {
    id: "review-1",
    author: "Родитель ученика",
    source: "jsprav.ru",
    sourceUrl: "https://goryachij-klyuch.jsprav.ru/tsentryi-dopolnitelnogo-obrazovaniya-detej/sfera",
    text: "Педагоги — настоящие профессионалы своего дела! Дети с радостью посещают занятия! Особенно ребёнку понравились занятия в «Клубе писателей» и театральном кружке.",
  },
  {
    id: "review-2",
    author: "Посетитель студии",
    source: "skidkom.ru",
    sourceUrl: "https://goryachiy-klyuch.skidkom.ru/partner/sfera-uchebno-razvivayuschaya-studiya/",
    text: "Преподаватели относятся к детям с теплом и вниманием. Класс оформлен очень уютно. Я хожу сюда с радостью, и это главное!",
  },
  // TODO: добавьте больше реальных отзывов из VK и Zoon
];

export const events: EventItem[] = [
  // TODO: Замените placeholder-данные на реальные события.
  // Когда данные будут готовы — установите siteConfig.showEvents = true.
  {
    id: "event-1",
    date: "2025-12-15",
    title: "Название события",
    description: "Короткое описание события — спектакль, праздник, мастер-класс или набор группы.",
    image: "/images/PF6A8152_resized.jpg",
    imageAlt: "Театральная постановка",
  },
  {
    id: "event-2",
    date: "2025-12-20",
    title: "Название события",
    description: "Короткое описание события.",
    image: "/images/PF6A7999_resized.jpg",
    imageAlt: "Творческое занятие",
    pos: "50% 20%",
  },
  {
    id: "event-3",
    date: "2026-01-10",
    title: "Название события",
    description: "Короткое описание события.",
    image: "/images/PF6A7681_resized.jpg",
    imageAlt: "Занятие в студии",
  },
];

export const parentOptions: ParentOption[] = [
  { id: "preschool", label: "Будущий первоклассник", targetProgramId: "school-prep" },
  { id: "elementary", label: "Ученик начальной школы", targetProgramId: "elementary" },
  { id: "middle", label: "Ученик средней школы", targetProgramId: "middle" },
  { id: "english", label: "Интересует английский", targetProgramId: "english" },
  { id: "creativity", label: "Хочется больше творчества", targetProgramId: "theater" },
  { id: "writing", label: "Интересует писательский клуб", targetProgramId: "writers-club" },
];

export const navItems = [
  { label: "О студии", href: "#about" },
  { label: "Направления", href: "#programs" },
  { label: "Отзывы", href: "#reviews", show: () => siteConfig.showReviews },
  { label: "Новости", href: "/news" },
  { label: "Контакты", href: "#contacts" },
];

export const footerLinks = {
  navigation: [
    { label: "О студии", href: "#about" },
    { label: "Направления", href: "#programs" },
    { label: "Отзывы", href: "#reviews" },
    { label: "Новости", href: "/news" },
    { label: "Контакты", href: "#contacts" },
  ],
  legal: [
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Согласие на обработку персональных данных", href: "/consent" },
  ],
};

export const enrollmentInterests = [
  "Подготовка к школе",
  "Начальная ступень (1–4 классы)",
  "Средняя ступень (5–9 классы)",
  "Английский язык",
  "Чистописание",
  "Театр",
  "Писательский клуб",
  "Нейропсихологическая коррекция",
  "Пока не знаю — нужна консультация",
];

export const news: NewsItem[] = [];
