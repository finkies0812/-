
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum MatchType {
  MALE_DOUBLES = '남복',
  FEMALE_DOUBLES = '여복',
  MIXED_DOUBLES = '혼복'
}

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  wins: number;
  losses: number;
  winRate: number;
  points: number; // 승점 (승리: 3점, 무승부: 1점)
}

export interface MatchResult {
  id: string;
  date: string;
  winnerIds: string[];
  loserIds: string[];
  score: string; // "6-4" 형식으로 저장됨을 가정
  matchType: MatchType;
  courtName?: string; // 경기장 이름 추가
}

export type Tab = 'members' | 'matches' | 'register';
