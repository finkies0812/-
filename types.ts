
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum MatchType {
  MALE_DOUBLES = '남복',
  FEMALE_DOUBLES = '여복',
  MIXED_DOUBLES = '혼복'
}

export enum CourtType {
  GRASS = '인잔',
  HARD = '하드',
  CLAY = '클레이'
}

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  points: number;
}

export interface MatchResult {
  id: string;
  date: string;
  winnerIds: string[];
  loserIds: string[];
  score: string; 
  matchType: MatchType;
  courtType: CourtType; // 코트 종류 추가
  courtName?: string;
  isDraw?: boolean;
}

export type Tab = 'members' | 'matches' | 'register';
