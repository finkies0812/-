
import React, { useState, useMemo } from 'react';
import { Member, MatchResult, MatchType, Gender, CourtType } from '../types';

interface Props {
  members: Member[];
  matches: MatchResult[];
  attendance: Record<string, string[]>;
  onUpdateAttendance: (date: string, memberIds: string[]) => void;
  onAddMatch: (winners: string[], losers: string[], score: string, matchType: MatchType, courtType: CourtType, courtName?: string, matchDate?: string) => void;
}

const MatchManagement: React.FC<Props> = ({ members, matches, attendance, onUpdateAttendance, onAddMatch }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [selectorGenderTab, setSelectorGenderTab] = useState<Gender>(Gender.MALE);
  
  const participantIds = useMemo(() => attendance[selectedDate] || [], [attendance, selectedDate]);
  
  const [winners, setWinners] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [matchType, setMatchType] = useState<MatchType>(MatchType.MALE_DOUBLES);
  const [courtType, setCourtType] = useState<CourtType>(CourtType.GRASS);

  const dailyMatches = useMemo(() => {
    return matches
      .filter(match => match.date === selectedDate)
      .reverse();
  }, [matches, selectedDate]);

  const matchDates = useMemo(() => {
    const dates = new Set<string>();
    matches.forEach(m => dates.add(m.date));
    return dates;
  }, [matches]);

  const activeParticipants = useMemo(() => 
    members.filter(m => participantIds.includes(m.id)),
  [members, participantIds]);

  const filteredParticipantsForMatch = useMemo(() => {
    if (matchType === MatchType.MALE_DOUBLES) return activeParticipants.filter(m => m.gender === Gender.MALE);
    if (matchType === MatchType.FEMALE_DOUBLES) return activeParticipants.filter(m => m.gender === Gender.FEMALE);
    return activeParticipants; 
  }, [activeParticipants, matchType]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [viewDate]);

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winners.length > 0 && losers.length > 0) {
      const finalScore = `${scoreA}-${scoreB}`;
      onAddMatch(winners, losers, finalScore, matchType, courtType, undefined, selectedDate);
      setWinners([]);
      setLosers([]);
      setScoreA(0);
      setScoreB(0);
      setIsAdding(false);
    }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '알수없음';

  const toggleWinner = (id: string) => {
    if (winners.includes(id)) {
      setWinners(winners.filter(wId => wId !== id));
    } else {
      if (!losers.includes(id)) {
        setWinners([...winners, id]);
      }
    }
  };

  const toggleLoser = (id: string) => {
    if (losers.includes(id)) {
      setLosers(losers.filter(lId => lId !== id));
    } else {
      if (!winners.includes(id)) {
        setLosers([...losers, id]);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
          <span className="w-1.5 h-7 bg-indigo-600 rounded-full"></span>
          경기 기록 관리
        </h2>
      </div>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-lg font-black text-slate-800">{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h3>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-[300px]">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div key={d} className={`text-center text-[10px] font-black uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              const hasMatches = matchDates.has(dateStr);
              const hasAttendance = (attendance[dateStr] || []).length > 0;
              return (
                <button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${isSelected ? 'border-indigo-600 bg-indigo-50/50 scale-105 shadow-md' : 'border-transparent'} ${hasMatches ? 'bg-blue-500 text-white' : hasAttendance ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50'}`}>
                  <span className="text-base font-black">{date.getDate()}</span>
                  {(hasMatches || hasAttendance) && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${hasMatches ? 'bg-white' : 'bg-indigo-400'}`}></div>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">1. 참석자 ({activeParticipants.length}명)</h3>
          <button onClick={() => setShowMemberSelector(true)} className="text-sm font-black text-indigo-600 hover:bg-indigo-50 py-1.5 px-4 border border-indigo-100 rounded-xl transition-all">참석 등록</button>
        </div>
        <div className="p-6 flex flex-wrap gap-2">
          {activeParticipants.length > 0 ? activeParticipants.map(m => (
            <div key={m.id} className={`px-2 py-1 rounded-md border text-[11px] font-black ${m.gender === Gender.MALE ? 'bg-blue-50/40 border-blue-100 text-blue-700' : 'bg-pink-50/40 border-pink-100 text-pink-700'}`}>{m.name}</div>
          )) : <p className="text-slate-400 text-sm font-bold italic py-2">오늘의 참석자를 선택해주세요.</p>}
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">2. 경기 기록 리스트</h3>
          <button disabled={activeParticipants.length < 2} onClick={() => { setWinners([]); setLosers([]); setIsAdding(true); }} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50">+ 새 경기 기록</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="py-4 px-2 w-[12%]">순번</th>
                <th className="py-4 px-2 w-[34%]">승리팀 (WIN)</th>
                <th className="py-4 px-2 w-[20%]">스코어 (SCORE)</th>
                <th className="py-4 px-2 w-[34%] opacity-60">패배팀 (LOSE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyMatches.length > 0 ? dailyMatches.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-6 px-2 font-black text-slate-400 text-xs">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">#{dailyMatches.length - idx}</span>
                  </td>
                  <td className="py-6 px-2">
                    <div className="flex flex-col gap-0.5 items-center justify-center">
                      {m.winnerIds.map(id => (
                        <span key={id} className="text-slate-900 font-black text-base md:text-lg leading-tight">
                          {getMemberName(id)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-6 px-2">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="bg-slate-900 text-white px-4 py-1.5 rounded-2xl text-2xl font-black tracking-tight shadow-lg inline-flex items-center justify-center min-w-[70px]">
                        {m.score}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {m.courtType} • {m.matchType}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-2 opacity-40">
                    <div className="flex flex-col gap-0.5 items-center justify-center">
                      {m.loserIds.map(id => (
                        <span key={id} className="text-slate-900 font-black text-base md:text-lg leading-tight">
                          {getMemberName(id)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-300 font-black uppercase tracking-widest text-sm italic">
                    등록된 경기 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 참석자 선택 모달 */}
      {showMemberSelector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">참석자 등록</h3>
              <button onClick={() => setShowMemberSelector(false)} className="text-3xl">&times;</button>
            </div>
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setSelectorGenderTab(Gender.MALE)} 
                className={`flex-1 py-4 text-base font-black transition-all ${
                  selectorGenderTab === Gender.MALE 
                  ? 'text-indigo-600 bg-indigo-50 border-b-4 border-indigo-600' 
                  : 'text-slate-400'
                }`}
              >
                남성
              </button>
              <button 
                onClick={() => setSelectorGenderTab(Gender.FEMALE)} 
                className={`flex-1 py-4 text-base font-black transition-all ${
                  selectorGenderTab === Gender.FEMALE 
                  ? 'text-pink-600 bg-pink-50 border-b-4 border-pink-600' 
                  : 'text-slate-400'
                }`}
              >
                여성
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {members.filter(m => m.gender === selectorGenderTab).map(m => (
                <button key={m.id} onClick={() => {
                  const current = attendance[selectedDate] || [];
                  const next = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                  onUpdateAttendance(selectedDate, next);
                }} className={`p-4 rounded-2xl text-base font-black border-2 transition-all ${
                  participantIds.includes(m.id) 
                  ? (m.gender === Gender.FEMALE ? 'border-pink-600 bg-pink-50 text-pink-600 shadow-sm' : 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm')
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}>
                  {m.name}
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-slate-50">
              <button onClick={() => setShowMemberSelector(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-lg">
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 경기 결과 입력 모달 */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black">경기 결과 입력</h3>
              <button onClick={() => setIsAdding(false)} className="text-3xl">&times;</button>
            </div>
            <form onSubmit={handleMatchSubmit} className="p-6 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">경기 방식</label>
                  <select value={matchType} onChange={e => {
                    setMatchType(e.target.value as MatchType);
                    setWinners([]);
                    setLosers([]);
                  }} className="w-full bg-slate-100 p-4 rounded-2xl font-black text-base outline-none border-2 border-transparent focus:border-indigo-500 transition-all">
                    {Object.values(MatchType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">코트 종류</label>
                  <select value={courtType} onChange={e => setCourtType(e.target.value as CourtType)} className="w-full bg-slate-100 p-4 rounded-2xl font-black text-base outline-none border-2 border-transparent focus:border-indigo-500 transition-all">
                    {Object.values(CourtType).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-xs font-black text-blue-600 uppercase ml-1">Team A (승리팀)</label>
                  <div className="bg-blue-50/30 p-2.5 rounded-[1.5rem] border-2 border-blue-50 min-h-[180px] space-y-2">
                    {filteredParticipantsForMatch.map(m => {
                      const isDisabled = losers.includes(m.id);
                      return (
                        <button 
                          type="button" 
                          key={m.id} 
                          disabled={isDisabled}
                          onClick={() => toggleWinner(m.id)} 
                          className={`w-full p-3.5 rounded-xl text-base font-black border-2 transition-all ${
                            winners.includes(m.id) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 
                            isDisabled ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' :
                            'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-red-600 uppercase ml-1">Team B (패배팀)</label>
                  <div className="bg-red-50/30 p-2.5 rounded-[1.5rem] border-2 border-red-50 min-h-[180px] space-y-2">
                    {filteredParticipantsForMatch.map(m => {
                      const isDisabled = winners.includes(m.id);
                      return (
                        <button 
                          type="button" 
                          key={m.id} 
                          disabled={isDisabled}
                          onClick={() => toggleLoser(m.id)} 
                          className={`w-full p-3.5 rounded-xl text-base font-black border-2 transition-all ${
                            losers.includes(m.id) ? 'bg-red-600 border-red-600 text-white shadow-md' : 
                            isDisabled ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed' :
                            'bg-white border-slate-200 text-slate-600 hover:border-red-400'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-200 shadow-inner flex flex-col items-center">
                <label className="block text-[11px] font-black text-slate-500 uppercase text-center tracking-widest w-full">최종 스코어 선택 (FINAL SCORE)</label>
                <div className="flex items-center justify-center gap-6 w-full mt-2">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Team A</span>
                    <select value={scoreA} onChange={e => setScoreA(parseInt(e.target.value))} className="bg-white border-2 border-blue-500 text-4xl font-black p-5 rounded-2xl w-24 text-center shadow-lg appearance-none outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                      {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="text-5xl font-black text-slate-300 pb-2">:</div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-red-600 uppercase">Team B</span>
                    <select value={scoreB} onChange={e => setScoreB(parseInt(e.target.value))} className="bg-white border-2 border-red-500 text-4xl font-black p-5 rounded-2xl w-24 text-center shadow-lg appearance-none outline-none focus:ring-4 focus:ring-red-100 transition-all">
                      {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 shrink-0 pb-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">취소</button>
                <button type="submit" disabled={winners.length === 0 || losers.length === 0} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all">경기 기록 저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
