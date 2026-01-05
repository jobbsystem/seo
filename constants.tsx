import { TeamMember, NewsItem, StatMetric } from './types';

export const CURRENT_USER = {
  name: "Adam Kundison",
  email: "tommy@example.com",
  company: "Trädspecialisterna"
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Peter Max",
    role: "Account Manager",
    avatar: "https://picsum.photos/seed/fia/64/64"
  },
  {
    name: "Max Maxsson",
    role: "SEO-specialist",
    avatar: "https://picsum.photos/seed/axel/64/64"
  }
];

export const SEO_STATS: StatMetric[] = [
  {
    label: "Visningar på Google",
    value: "39 023",
    change: 6.0,
    trend: 'up'
  },
  {
    label: "Unika besökare",
    value: "474",
    change: -22.5,
    trend: 'down'
  },
  {
    label: "Konverteringar",
    value: "12",
    change: -57.1,
    trend: 'down'
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "Från synlighet till försprång: 5 sätt att vinna organisk tillväxt 2026",
    date: "17 januari 2026",
    summary: "Så kombinerar du SEO, innehåll och AI-svar för att skapa en stadig ström av leads med lägre kostnad per affär.",
    image: "https://picsum.photos/seed/news1/600/300",
    readTime: "2 min läsning"
  },
  {
    id: 2,
    title: "Meta + Google i samma funnel: så skapar du momentum hela vägen",
    date: "9 januari 2026",
    summary: "En enkel modell för att koppla annonsering, SEO och konvertering till en enda, mätbar kundresa.",
    image: "https://picsum.photos/seed/news2/600/300",
    readTime: "3 min läsning"
  },
  {
    id: 3,
    title: "Den snabbaste vägen till fler affärer: 3 förbättringar på din hemsida",
    date: "4 januari 2026",
    summary: "Små justeringar i struktur och budskap kan ge stora lyft i konvertering, utan att bygga om allt.",
    image: "https://picsum.photos/seed/news3/600/300",
    readTime: "4 min läsning"
  }
];

export const CHART_DATA = [
  { name: 'v.48', visningar: 4000 },
  { name: 'v.49', visningar: 3000 },
  { name: 'v.50', visningar: 2000 },
  { name: 'v.51', visningar: 2780 },
  { name: 'v.52', visningar: 1890 },
  { name: 'v.1', visningar: 2390 },
  { name: 'v.2', visningar: 3490 },
];
