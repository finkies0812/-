
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Member, Gender, MatchResult, MatchType } from '../types';

interface Props {
  members: Member[];
  matches: MatchResult[];
}

interface MemberStats {
  wins: number;
  losses: number;
  winRate: number;
  pointsWon: number;
  pointsLost: number;
  totalGames: number;
  points: number;
}

// 애니메이션 스타일 정의
const animationStyles = `
  @keyframes highlightUpdate {
    0% { background-color: rgba(79, 70, 229, 0.2); }
    100% { background-color: transparent; }
  }
  .animate-update {
    animation: highlightUpdate 1s ease-out;
  }
`;

const MemberManagement: React.FC<Props> = ({ members, matches }) => {
  const [activeGenderTab, setActiveGenderTab] = useState<Gender>(Gender.MALE);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const prevMembersRef = useRef<Member[]>(members);
  const [updatedMemberIds, setUpdatedMemberIds] = useState<Set<string>>(new Set());

  // 데이터 변경 감지 로직 (포인트나 승수가 변한 멤버 ID 추적)
  useEffect(() => {
    const newlyUpdated = new Set<string>();
    members.forEach(m => {
      const prev = prevMembersRef.current.find(p => p.id === m.id);
      if (prev && (prev.points !== m.points || prev.wins !== m.wins)) {
        newlyUpdated.add(m.id);
      }
    });

    if (newlyUpdated.size > 0) {
      setUpdatedMemberIds(newlyUpdated);
      const timer = setTimeout(() => setUpdatedMemberIds(new Set()), 1500);
      prevMembersRef.current = members;
      return () => clearTimeout(timer);
    }
    prevMembersRef.current = members;
  }, [members]);

  const memberTotalGamesMap = useMemo(() => {
    const map: Record<string, number> = {};
    matches.forEach(match => {
      [...match.winnerIds, ...match.loserIds].forEach(id => {
        map[id] = (map[id] || 0) + 1;
      });
    });
    return map;
  }, [matches]);

  const filteredMembers = useMemo(() => {
    return [...members]
      .filter(m => m.gender === activeGenderTab)
      .sort((a, b) => (b.points || 0) - (a.points || 0) || b.winRate - a.winRate || b.wins - a.wins);
  }, [members, activeGenderTab]);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId), 
    [members, selectedMemberId]
  );

  const memberMatchHistory = useMemo(() => {
    if (!selectedMemberId) return [];
    return matches
      .filter(match => [...match.winnerIds, ...match.loserIds].includes(selectedMemberId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, selectedMemberId]);

  const detailStats = useMemo(() => {
    if (!selectedMemberId) return null;

    const stats: Record<MatchType | 'total', MemberStats> = {
      [MatchType.MALE_DOUBLES]: { wins: 0, losses: 0, winRate: 0, pointsWon: 0, pointsLost: 0, totalGames: 0, points: 0 },
      [MatchType.FEMALE_DOUBLES]: { wins: 0, losses: 0, winRate: 0, pointsWon: 0, pointsLost: 0, totalGames: 0, points: 0 },
      [MatchType.MIXED_DOUBLES]: { wins: 0, losses: 0, winRate: 0, pointsWon: 0, pointsLost: 0, totalGames: 0, points: 0 },
      total: { wins: 0, losses: 0, winRate: 0, pointsWon: 0, pointsLost: 0, totalGames: 0, points: 0 }
    };

    memberMatchHistory.forEach(match => {
      const isWinner = match.winnerIds.includes(selectedMemberId);
      const scores = match.score.split('-').map(s => parseInt(s.trim()) || 0);
      const winScore = Math.max(...scores);
      const loseScore = Math.min(...scores);
      const type = match.matchType;

      stats[type].totalGames += 1;
      stats.total.totalGames += 1;

      if (isWinner) {
        stats[type].wins += 1;
        stats[type].points += 3;
        stats[type].pointsWon += winScore;
        stats[type].pointsLost += loseScore;
        stats.total.wins += 1;
        stats.total.points += 3;
        stats.total.pointsWon += winScore;
        stats.total.pointsLost += loseScore;
      } else {
        stats[type].losses += 1;
        stats[type].pointsWon += loseScore;
        stats[type].pointsLost += winScore;
        stats.total.losses += 1;
        stats.total.pointsWon += loseScore;
        stats.total.pointsLost += winScore;
      }
    });

    [MatchType.MALE_DOUBLES, MatchType.FEMALE_DOUBLES, MatchType.MIXED_DOUBLES, 'total'].forEach((key) => {
      const k = key as MatchType | 'total';
      const total = stats[k].wins + stats[k].losses;
      stats[k].winRate = total > 0 ? (stats[k].wins / total) * 100 : 0;
    });

    return stats;
  }, [memberMatchHistory, selectedMemberId]);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '알수없음';

  return (
    <div className="space-y-4 animate-fadeIn">
      <style>{animationStyles}</style>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
          <span className="w-1.5 h-7 bg-indigo-600 rounded-full"></span>
          실시간 랭킹
        </h2>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Updates</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveGenderTab(Gender.MALE)}
            className={`flex-1 py-4 text-base font-bold transition-all relative ${activeGenderTab === Gender.MALE ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}
          >
            남성부
            {activeGenderTab === Gender.MALE && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>}
          </button>
          <button 
            onClick={() => setActiveGenderTab(Gender.FEMALE)}
            className={`flex-1 py-4 text-base font-bold transition-all relative ${activeGenderTab === Gender.FEMALE ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}
          >
            여성부
            {activeGenderTab === Gender.FEMALE && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>}
          </button>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 text-slate-500 text-[13px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="w-10 px-1 py-4 text-center">순위</th>
                <th className="px-2 py-4">이름</th>
                <th className="w-12 px-1 py-4 text-center">경기</th>
                <th className="w-10 px-1 py-4 text-center">승</th>
                <th className="w-10 px-1 py-4 text-center">패</th>
                <th className="w-16 px-1 py-4 text-center">승률</th>
                <th className="w-16 px-2 py-4 text-center">포인트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-indigo-50/20 transition-colors ${updatedMemberIds.has(member.id) ? 'animate-update' : ''}`}
                  >
                    <td className="px-1 py-4 text-center">
                      <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-bold text-xs ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-bold text-slate-700 truncate">
                      <button 
                        onClick={() => setSelectedMemberId(member.id)}
                        className="hover:text-indigo-600 hover:underline decoration-indigo-300 underline-offset-4 text-[15px] text-left truncate w-full transition-all"
                      >
                        {member.name}
                      </button>
                    </td>
                    <td className="px-1 py-4 text-center font-bold text-slate-500 text-[13px]">
                      {memberTotalGamesMap[member.id] || 0}
                    </td>
                    <td className="px-1 py-4 text-center text-blue-600 font-bold text-[13px]">{member.wins}</td>
                    <td className="px-1 py-4 text-center text-red-500 font-bold text-[13px]">{member.losses}</td>
                    <td className="px-1 py-4 text-center">
                      <span className="text-[13px] font-black text-indigo-700">
                        {member.winRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className={`px-2 py-1 bg-indigo-600 text-white rounded-lg text-[13px] font-black transition-transform ${updatedMemberIds.has(member.id) ? 'scale-110' : ''}`}>
                        {member.points || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-base font-medium">
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 상세 정보 모달 */}
      {selectedMember && detailStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-bold">{selectedMember.name} 님의 기록</h3>
                <p className="text-indigo-100 text-sm opacity-80">{selectedMember.gender === Gender.MALE ? '남성' : '여성'} 회원</p>
              </div>
              <button onClick={() => setSelectedMemberId(null)} className="text-white/80 hover:text-white text-3xl focus:outline-none">&times;</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">경기</p>
                  <p className="text-lg font-black text-slate-800">{detailStats.total.totalGames}</p>
                </div>
                <div className="bg-indigo-50 p-2 rounded-xl text-center">
                  <p className="text-[9px] text-indigo-500 font-bold mb-1 uppercase">승률</p>
                  <p className="text-lg font-black text-indigo-600">{detailStats.total.winRate.toFixed(0)}%</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl text-center">
                  <p className="text-[9px] text-blue-600 font-bold mb-1 uppercase">승</p>
                  <p className="text-lg font-black text-blue-700">{detailStats.total.wins}</p>
                </div>
                <div className="bg-red-50 p-2 rounded-xl text-center">
                  <p className="text-[9px] text-red-500 font-bold mb-1 uppercase">패</p>
                  <p className="text-lg font-black text-red-700">{detailStats.total.losses}</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl text-center border border-amber-100">
                  <p className="text-[9px] text-amber-600 font-bold mb-1 uppercase">포인트</p>
                  <p className="text-lg font-black text-amber-700">{detailStats.total.points}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">종목별 상세</h4>
                <div className="overflow-hidden border border-slate-100 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2 text-left">종목</th>
                        <th className="px-2 py-2 text-center">승-패</th>
                        <th className="px-2 py-2 text-center">포인트</th>
                        <th className="px-2 py-2 text-center">득/실</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[MatchType.MALE_DOUBLES, MatchType.FEMALE_DOUBLES, MatchType.MIXED_DOUBLES].map((type) => (
                        <tr key={type} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-bold text-slate-700">{type}</td>
                          <td className="px-2 py-3 text-center font-bold">
                            <span className="text-blue-600">{detailStats[type].wins}</span>
                            <span className="mx-1 text-slate-200">-</span>
                            <span className="text-red-500">{detailStats[type].losses}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="font-black text-indigo-600">{detailStats[type].points}</span>
                          </td>
                          <td className="px-2 py-3 text-center text-slate-400 font-medium text-[12px]">
                            {detailStats[type].pointsWon}/{detailStats[type].pointsLost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 pb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between">
                  <span>최근 경기 기록</span>
                  <span>{memberMatchHistory.length}건</span>
                </h4>
                <div className="space-y-2">
                  {memberMatchHistory.length > 0 ? (
                    memberMatchHistory.map((match) => {
                      const isWinner = match.winnerIds.includes(selectedMemberId);
                      return (
                        <div key={match.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-400">{match.date}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${isWinner ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                              {isWinner ? 'WIN (+3pts)' : 'LOSS'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 text-xs space-y-0.5">
                              <p className="text-slate-400 font-medium">함께한 팀</p>
                              <p className="font-bold text-slate-700">
                                {isWinner 
                                  ? match.winnerIds.filter(id => id !== selectedMemberId).map(id => getMemberName(id)).join(', ') || '단식/없음'
                                  : match.loserIds.filter(id => id !== selectedMemberId).map(id => getMemberName(id)).join(', ') || '단식/없음'}
                              </p>
                            </div>
                            <div className="px-4 text-center">
                              <span className="text-lg font-black text-slate-800">{match.score}</span>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{match.matchType}</p>
                            </div>
                            <div className="flex-1 text-right text-xs space-y-0.5">
                              <p className="text-slate-400 font-medium">상대 팀</p>
                              <p className="font-bold text-slate-500">
                                {isWinner 
                                  ? match.loserIds.map(id => getMemberName(id)).join(', ') 
                                  : match.winnerIds.map(id => getMemberName(id)).join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-slate-300 italic text-sm">경기 기록이 없습니다.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <button 
                onClick={() => setSelectedMemberId(null)}
                className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-base shadow-lg active:scale-95 transition-transform"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
