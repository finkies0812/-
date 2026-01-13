
import React, { useState, useEffect } from 'react';
import { Member, MatchResult, Tab, Gender, MatchType, CourtType } from './types';
import MemberManagement from './components/MemberManagement';
import MatchManagement from './components/MatchManagement';
import MemberRegistration from './components/MemberRegistration';

const INITIAL_MEMBERS: Member[] = [
  // 남자 멤버
  { id: 'm1', name: '김형걸', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm2', name: '원태훈', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm3', name: '양규', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm4', name: '황순철', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm5', name: '이강규', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm6', name: '이진석', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm7', name: '송원택', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'm8', name: '최영락', gender: Gender.MALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  // 여자 멤버
  { id: 'f1', name: '박소희', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f2', name: '최지혜', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f3', name: '송이슬', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f4', name: '장소연', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f5', name: '국유정', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f6', name: '이나리', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f7', name: '임이슬', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
  { id: 'f8', name: '최은경', gender: Gender.FEMALE, wins: 0, losses: 0, draws: 0, winRate: 0, points: 0 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('tennis_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  const [matches, setMatches] = useState<MatchResult[]>(() => {
    const saved = localStorage.getItem('tennis_matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [attendance, setAttendance] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('tennis_attendance');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tennis_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('tennis_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('tennis_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const updateAttendance = (date: string, memberIds: string[]) => {
    setAttendance(prev => ({ ...prev, [date]: memberIds }));
  };

  const addMember = (name: string, gender: Gender) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      gender,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      points: 0
    };
    setMembers(prev => [...prev, newMember]);
    setActiveTab('members');
  };

  const deleteMember = (id: string) => {
    const memberToDelete = members.find(m => m.id === id);
    if (confirm(`정말로 ${memberToDelete?.name} 회원을 삭제하시겠습니까? 관련 경기 기록은 유지되지만 참석 명단에서는 제외됩니다.`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      setAttendance(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(date => {
          next[date] = next[date].filter(mId => mId !== id);
        });
        return next;
      });
    }
  };

  const addMatch = (winnerIds: string[], loserIds: string[], score: string, matchType: MatchType, courtType: CourtType, courtName?: string, matchDate?: string) => {
    const targetDate = matchDate || new Date().toISOString().split('T')[0];
    const scores = score.split('-').map(s => parseInt(s.trim()) || 0);
    const isDraw = scores.length === 2 && scores[0] === scores[1];

    const newMatch: MatchResult = {
      id: Date.now().toString(),
      date: targetDate,
      winnerIds,
      loserIds,
      score,
      matchType,
      courtType,
      courtName,
      isDraw
    };
    
    setMatches(prev => [newMatch, ...prev]);

    setMembers(prevMembers => {
      return prevMembers.map(member => {
        let newWins = member.wins;
        let newLosses = member.losses;
        let newDraws = member.draws || 0;
        let newPoints = member.points;

        const allParticipants = [...winnerIds, ...loserIds];
        if (!allParticipants.includes(member.id)) return member;

        if (isDraw) {
          newDraws += 1;
          newPoints += 1;
        } else {
          if (winnerIds.includes(member.id)) {
            newWins += 1;
            newPoints += 3;
          } else if (loserIds.includes(member.id)) {
            newLosses += 1;
          }
        }

        const total = newWins + newLosses + newDraws;
        const newWinRate = total > 0 ? (newWins / total) * 100 : 0;

        return { ...member, wins: newWins, losses: newLosses, draws: newDraws, winRate: newWinRate, points: newPoints };
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('members')}>
            <div className="bg-lime-400 p-2 rounded-full text-indigo-900 shadow-inner border-2 border-white/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                <path d="M5.64 5.64c1.7-1.7 4.04-2.64 6.36-2.64v2c-1.85 0-3.69.71-5.06 2.06-1.35 1.35-2.06 3.2-2.06 5.06h-2c0-2.32.94-4.66 2.64-6.36zM18.36 18.36c-1.7 1.7-4.04 2.64-6.36 2.64v-2c1.85 0-3.69-.71 5.06-2.06 1.35-1.35 2.06-3.2 2.06-5.06h2c0 2.32-.94 4.66-2.64 6.36z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">천하테평 랭킹테이블</h1>
          </div>
          
          <nav className="flex bg-indigo-700/50 p-1 rounded-xl gap-1">
            <button onClick={() => setActiveTab('members')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'members' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:text-white'}`}>회원랭킹</button>
            <button onClick={() => setActiveTab('matches')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'matches' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:text-white'}`}>경기결과</button>
            <button onClick={() => setActiveTab('register')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-100 hover:text-white'}`}>회원관리</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {activeTab === 'members' && <MemberManagement members={members} matches={matches} />}
        {activeTab === 'matches' && <MatchManagement members={members} matches={matches} attendance={attendance} onUpdateAttendance={updateAttendance} onAddMatch={addMatch} />}
        {activeTab === 'register' && <MemberRegistration members={members} onAddMember={addMember} onDeleteMember={deleteMember} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm font-medium">
          © 2024 천하테평 랭킹테이블 (Ace Tennis Club)
        </div>
      </footer>
    </div>
  );
};

export default App;
