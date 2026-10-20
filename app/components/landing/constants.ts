export interface FeaturedCompany {
  id: string;
  name: string;
  tag: string;
}

export const FEATURED_COMPANIES: FeaturedCompany[] = [
  { id: "005930", name: "삼성전자", tag: "반도체 대장주" },
  { id: "000660", name: "SK하이닉스", tag: "AI/HBM 주도" },
  { id: "005380", name: "현대차", tag: "완성차/밸류업" },
  { id: "035420", name: "NAVER", tag: "플랫폼/AI" },
  { id: "068270", name: "셀트리온", tag: "바이오시밀러" },
  { id: "105560", name: "KB금융", tag: "금융 밸류업" },
  { id: "373220", name: "LG에너지솔루션", tag: "2차전지" },
  { id: "035720", name: "카카오", tag: "빅테크 플랫폼" },
];
