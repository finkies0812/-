
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Member, Gender, MatchResult, MatchType, CourtType } from '../types';

interface Props {
  members: Member[];
  matches: MatchResult[];
}

const animationStyles = `
  @keyframes highlightUpdate {
    0% { background-color: rgba(79, 70, 229, 0.2); }
    100% { background-color: transparent; }
  }
  .animate-update {
    animation: highlightUpdate 1s ease-out;
  }
  .rank-1 { background: linear-gradient(135deg, #fde047 0%, #ca8a04 100%); color: white; }
  .rank-2 { background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%); color: white; }
  .rank-3 { background: linear-gradient(135deg, #ffedd5 0%, #d97706 100%); color: white; }
`;

const MemberManagement: React.FC<Props> = ({ members, matches }) => {
  const [activeGenderTab, setActiveGenderTab] = useState<Gender>(Gender.MALE);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const prevMembersRef = useRef<Member[]>(members);
  const [updatedMemberIds, setUpdatedMemberIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newlyUpdated = new Set<string>();
    members.forEach(m => {
      const prev = prevMembersRef.current.find(p => p.id === m.id);
      if (prev && (prev.points !== m.points || prev.wins !== m.wins || prev.draws !== m.draws)) {
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

  const selectedMember = useMemo(() => members.find(m => m.id === selectedMemberId), [members, selectedMemberId]);
  
  const currentRank = useMemo(() => {
    if (!selectedMember) return 0;
    const sameGenderMembers = members
      .filter(m => m.gender === selectedMember.gender)
      .sort((a, b) => (b.points || 0) - (a.points || 0) || b.winRate - a.winRate || b.wins - a.wins);
    return sameGenderMembers.findIndex(m => m.id === selectedMember.id) + 1;
  }, [members, selectedMember]);

  const memberMatchHistory = useMemo(() => {
    if (!selectedMemberId) return [];
    return matches
      .filter(match => [...match.winnerIds, ...match.loserIds].includes(selectedMemberId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches, selectedMemberId]);

  const detailStats = useMemo(() => {
    if (!selectedMemberId) return null;
    
    const stats: any = {
      total: { wins: 0, losses: 0, draws: 0, total: 0, points: 0, winRate: 0 },
      byType: {
        [MatchType.MALE_DOUBLES]: { wins: 0, total: 0 },
        [MatchType.FEMALE_DOUBLES]: { wins: 0, total: 0 },
        [MatchType.MIXED_DOUBLES]: { wins: 0, total: 0 }
      },
      byCourt: {
        [CourtType.GRASS]: { wins: 0, total: 0 },
        [CourtType.HARD]: { wins: 0, total: 0 },
        [CourtType.CLAY]: { wins: 0, total: 0 }
      }
    };

    memberMatchHistory.forEach(match => {
      const isWinner = match.winnerIds.includes(selectedMemberId);
      stats.total.total += 1;
      
      if (match.isDraw) {
        stats.total.draws += 1;
        stats.total.points += 1;
      } else if (isWinner) {
        stats.total.wins += 1;
        stats.total.points += 3;
      } else {
        stats.total.losses += 1;
      }

      if (!match.isDraw) {
        stats.byType[match.matchType].total += 1;
        if (isWinner) stats.byType[match.matchType].wins += 1;
        
        stats.byCourt[match.courtType].total += 1;
        if (isWinner) stats.byCourt[match.courtType].wins += 1;
      }
    });

    stats.total.winRate = stats.total.total > 0 ? (stats.total.wins / stats.total.total) * 100 : 0;
    return stats;
  }, [memberMatchHistory, selectedMemberId]);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '알수없음';

  const isFemale = activeGenderTab === Gender.FEMALE;

  return (
    <div className="space-y-4 animate-fadeIn max-w-full overflow-hidden">
      <style>{animationStyles}</style>
      
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
          <span className={`w-1.5 h-7 rounded-full ${isFemale ? 'bg-pink-500' : 'bg-indigo-600'}`}></span>
          실시간 랭킹
        </h2>
      </div>

      <section className={`bg-white rounded-[1.5rem] shadow-sm border overflow-hidden ${isFemale ? 'border-pink-100' : 'border-slate-100'}`}>
        <div className="flex border-b border-slate-50">
          <button onClick={() => setActiveGenderTab(Gender.MALE)} className={`flex-1 py-4 text-lg font-black relative ${activeGenderTab === Gender.MALE ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400'}`}>남성부 {activeGenderTab === Gender.MALE && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600"></div>}</button>
          <button onClick={() => setActiveGenderTab(Gender.FEMALE)} className={`flex-1 py-4 text-lg font-black relative ${activeGenderTab === Gender.FEMALE ? 'text-pink-600 bg-pink-50/30' : 'text-slate-400'}`}>여성부 {activeGenderTab === Gender.FEMALE && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-pink-500"></div>}</button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left table-fixed border-collapse min-w-[320px]">
            <thead className={`${isFemale ? 'bg-pink-50/30' : 'bg-slate-50/50'} text-[10px] uppercase font-black border-b border-slate-100 text-slate-900`}>
              <tr>
                <th className="w-[8%] px-0.5 py-3 text-center">#</th>
                <th className="w-[28%] px-4 py-3">이름</th>
                <th className="w-[11%] px-0 py-3 text-center">경기</th>
                <th className="w-[8%] px-0 py-3 text-center">승</th>
                <th className="w-[8%] px-0 py-3 text-center">무</th>
                <th className="w-[8%] px-0 py-3 text-center">패</th>
                <th className="w-[12%] px-0 py-3 text-center">승률</th>
                <th className="w-[17%] px-1 py-3 text-center">점수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className={`transition-colors active:bg-slate-50 ${updatedMemberIds.has(member.id) ? 'animate-update' : ''}`}>
                  <td className="px-0.5 py-3.5 text-center">
                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full font-black text-[13px] ${index === 0 ? 'rank-1 shadow-md shadow-amber-200' : index === 1 ? 'rank-2 shadow-md shadow-slate-200' : index === 2 ? 'rank-3 shadow-md shadow-amber-100' : 'text-slate-400 bg-slate-50'}`}>{index + 1}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setSelectedMemberId(member.id)} className="truncate w-full text-[17px] font-black text-left text-slate-800 tracking-tight">{member.name}</button>
                  </td>
                  <td className="px-0 py-3.5 text-center font-bold text-slate-400 text-[14px]">{memberTotalGamesMap[member.id] || 0}</td>
                  <td className="px-0 py-3.5 text-center font-black text-[16px] text-blue-600">{member.wins}</td>
                  <td className="px-0 py-3.5 text-center font-bold text-slate-400 text-[14px]">{member.draws || 0}</td>
                  <td className="px-0 py-3.5 text-center text-red-400 font-bold text-[14px]">{member.losses}</td>
                  <td className="px-0 py-3.5 text-center">
                    <span className="text-slate-800 font-black text-[14px]">{member.winRate.toFixed(0)}%</span>
                  </td>
                  <td className="px-1 py-3.5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-xl font-black text-[16px] shadow-sm ${isFemale ? 'bg-pink-500 text-white shadow-pink-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                      {member.points || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Member Report Modal */}
      {selectedMember && detailStats && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-t-[2.5rem] w-full max-h-[95vh] overflow-hidden flex flex-col animate-slideUp shadow-2xl">
            
            <div className={`${selectedMember.gender === Gender.FEMALE ? 'bg-pink-600' : 'bg-indigo-600'} px-6 pt-8 pb-6 text-white shrink-0`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black mb-1">{selectedMember.name} 리포트</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">ACE TENNIS ANALYTICS</p>
                </div>
                <button onClick={() => setSelectedMemberId(null)} className="bg-white/10 p-2 rounded-full active:scale-90 transition-transform">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-12">
              {/* Summary Score Card */}
              <div className="bg-slate-50 rounded-[2rem] p-4 flex items-center justify-between border border-slate-100">
                <div className="flex flex-col items-center flex-1 border-r border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-1">순위</span>
                  <span className="text-2xl font-black text-slate-800">#{currentRank}</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-1">승률</span>
                  <span className={`text-2xl font-black ${selectedMember.gender === Gender.FEMALE ? 'text-pink-600' : 'text-indigo-600'}`}>{detailStats.total.winRate.toFixed(0)}%</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-1">포인트</span>
                  <span className="text-2xl font-black text-slate-800">{selectedMember.points || 0}</span>
                </div>
              </div>

              {/* Analysis Tables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase px-2 tracking-widest">경기 방식 분석</h4>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3 text-left">구분</th>
                          <th className="py-2.5 px-3 text-center">전적(승/계)</th>
                          <th className="py-2.5 px-3 text-right">승률</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedMember.gender === Gender.MALE && (
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-700">남복</td>
                            <td className="py-3 px-3 text-center text-slate-500 font-medium">{detailStats.byType[MatchType.MALE_DOUBLES].wins} / {detailStats.byType[MatchType.MALE_DOUBLES].total}</td>
                            <td className="py-3 px-3 text-right font-black text-indigo-600">{detailStats.byType[MatchType.MALE_DOUBLES].total > 0 ? ((detailStats.byType[MatchType.MALE_DOUBLES].wins / detailStats.byType[MatchType.MALE_DOUBLES].total) * 100).toFixed(0) : 0}%</td>
                          </tr>
                        )}
                        {selectedMember.gender === Gender.FEMALE && (
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-700">여복</td>
                            <td className="py-3 px-3 text-center text-slate-500 font-medium">{detailStats.byType[MatchType.FEMALE_DOUBLES].wins} / {detailStats.byType[MatchType.FEMALE_DOUBLES].total}</td>
                            <td className="py-3 px-3 text-right font-black text-pink-600">{detailStats.byType[MatchType.FEMALE_DOUBLES].total > 0 ? ((detailStats.byType[MatchType.FEMALE_DOUBLES].wins / detailStats.byType[MatchType.FEMALE_DOUBLES].total) * 100).toFixed(0) : 0}%</td>
                          </tr>
                        )}
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-700">혼복</td>
                          <td className="py-3 px-3 text-center text-slate-500 font-medium">{detailStats.byType[MatchType.MIXED_DOUBLES].wins} / {detailStats.byType[MatchType.MIXED_DOUBLES].total}</td>
                          <td className="py-3 px-3 text-right font-black text-slate-800">{detailStats.byType[MatchType.MIXED_DOUBLES].total > 0 ? ((detailStats.byType[MatchType.MIXED_DOUBLES].wins / detailStats.byType[MatchType.MIXED_DOUBLES].total) * 100).toFixed(0) : 0}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase px-2 tracking-widest">코트 종류 분석</h4>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3 text-left">코트</th>
                          <th className="py-2.5 px-3 text-center">전적(승/계)</th>
                          <th className="py-2.5 px-3 text-right">승률</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { key: CourtType.GRASS, label: '인잔', color: 'text-emerald-600' },
                          { key: CourtType.HARD, label: '하드', color: 'text-blue-500' },
                          { key: CourtType.CLAY, label: '클레이', color: 'text-orange-600' }
                        ].map(court => (
                          <tr key={court.key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-700">{court.label}</td>
                            <td className="py-3 px-3 text-center text-slate-500 font-medium">{detailStats.byCourt[court.key].wins} / {detailStats.byCourt[court.key].total}</td>
                            <td className={`py-3 px-3 text-right font-black ${court.color}`}>{detailStats.byCourt[court.key].total > 0 ? ((detailStats.byCourt[court.key].wins / detailStats.byCourt[court.key].total) * 100).toFixed(0) : 0}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Matches History Table (Optimized for 10 matches) */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-slate-400 uppercase px-2 tracking-widest">최근 전적 히스토리 (최신 10경기)</h4>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-center border-collapse table-fixed">
                    <thead className="bg-slate-50 text-[9px] font-black text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-2 px-1 w-[12%]">결과</th>
                        <th className="py-2 px-1 w-[35%]">내 팀</th>
                        <th className="py-2 px-1 w-[18%]">스코어</th>
                        <th className="py-2 px-1 w-[35%]">상대 팀</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {memberMatchHistory.slice(0, 10).map((m) => {
                        const isWinner = m.winnerIds.includes(selectedMemberId);
                        const partnerIds = (isWinner ? m.winnerIds : m.loserIds).filter(id => id !== selectedMemberId);
                        const opponentIds = isWinner ? m.loserIds : m.winnerIds;
                        return (
                          <tr key={m.id} className="active:bg-slate-50 hover:bg-slate-50/30 transition-colors">
                            <td className="py-3 px-1">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${m.isDraw ? 'bg-slate-100 text-slate-500' : isWinner ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                                {m.isDraw ? '무' : isWinner ? '승' : '패'}
                              </span>
                            </td>
                            <td className="py-3 px-1 text-[11px]">
                              <div className="flex flex-col leading-tight justify-center items-center">
                                <span className="font-black text-slate-900 truncate w-full">{selectedMember.name}</span>
                                {partnerIds.map(id => <span key={id} className="font-black text-slate-900 truncate w-full">{getMemberName(id)}</span>)}
                              </div>
                            </td>
                            <td className="py-3 px-1">
                              <span className="font-black text-[12px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{m.score}</span>
                            </td>
                            <td className="py-3 px-1 text-[11px]">
                              <div className="flex flex-col leading-tight justify-center items-center">
                                {opponentIds.map(id => <span key={id} className="font-black text-slate-900 truncate w-full">{getMemberName(id)}</span>)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {memberMatchHistory.length === 0 && (
                    <div className="py-10 text-center text-slate-300 font-bold text-xs">경기 데이터가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-50 bg-white shrink-0 pb-8">
              <button onClick={() => setSelectedMemberId(null)} className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl ${selectedMember.gender === Gender.FEMALE ? 'bg-pink-600' : 'bg-indigo-600'} active:scale-95 transition-all`}>
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
