
import React, { useState, useMemo } from 'react';
import { Member, MatchResult, MatchType, Gender } from '../types';

interface Props {
  members: Member[];
  matches: MatchResult[];
  onAddMatch: (winners: string[], losers: string[], score: string, matchType: MatchType, courtName?: string) => void;
}

const MatchManagement: React.FC<Props> = ({ members, matches, onAddMatch }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  const [selectorGenderTab, setSelectorGenderTab] = useState<Gender>(Gender.MALE);
  
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [courtName, setCourtName] = useState(''); // 상단 노출용 경기장
  
  const [winners, setWinners] = useState<string[]>([]);
  const [losers, setLosers] = useState<string[]>([]);
  const [score, setScore] = useState('');
  const [matchType, setMatchType] = useState<MatchType>(MatchType.MALE_DOUBLES);

  const dailyMatches = matches.filter(match => match.date === selectedDate);
  
  const activeParticipants = useMemo(() => 
    members.filter(m => participantIds.includes(m.id)),
  [members, participantIds]);

  const filteredParticipantsForMatch = useMemo(() => {
    if (matchType === MatchType.MALE_DOUBLES) {
      return activeParticipants.filter(m => m.gender === Gender.MALE);
    } else if (matchType === MatchType.FEMALE_DOUBLES) {
      return activeParticipants.filter(m => m.gender === Gender.FEMALE);
    }
    return activeParticipants; 
  }, [activeParticipants, matchType]);

  const handleToggleParticipant = (id: string) => {
    setParticipantIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleWinner = (id: string) => {
    if (winners.includes(id)) {
      setWinners(prev => prev.filter(w => w !== id));
    } else {
      if (winners.length < 2 && !losers.includes(id)) {
        setWinners(prev => [...prev, id]);
      }
    }
  };

  const handleToggleLoser = (id: string) => {
    if (losers.includes(id)) {
      setLosers(prev => prev.filter(l => l !== id));
    } else {
      if (losers.length < 2 && !winners.includes(id)) {
        setLosers(prev => [...prev, id]);
      }
    }
  };

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winners.length > 0 && losers.length > 0 && score.trim()) {
      onAddMatch(winners, losers, score, matchType, courtName);
      setWinners([]);
      setLosers([]);
      setScore('');
      setIsAdding(false);
    }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '알수없음';

  // 종목별 스타일 헬퍼
  const getMatchTypeStyles = (type: MatchType) => {
    switch (type) {
      case MatchType.MALE_DOUBLES:
        return "bg-sky-50 border-sky-100 hover:bg-sky-100/80";
      case MatchType.FEMALE_DOUBLES:
        return "bg-pink-50 border-pink-100 hover:bg-pink-100/80";
      case MatchType.MIXED_DOUBLES:
        return "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/80";
      default:
        return "bg-white border-slate-200 hover:bg-slate-50";
    }
  };

  const getBadgeStyles = (type: MatchType) => {
    switch (type) {
      case MatchType.MALE_DOUBLES: return "bg-sky-200 text-sky-700";
      case MatchType.FEMALE_DOUBLES: return "bg-pink-200 text-pink-700";
      case MatchType.MIXED_DOUBLES: return "bg-emerald-200 text-emerald-700";
      default: return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
          경기 기록 관리
        </h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus:ring-0 text-indigo-600 font-bold outline-none cursor-pointer text-sm"
          />
        </div>
      </div>

      {/* 1. 코트 참여 명단 */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">1. 코트 참여 ({activeParticipants.length}명)</h3>
            <input 
              type="text" 
              placeholder="경기장 이름 입력" 
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 outline-none focus:ring-1 focus:ring-indigo-500 w-32 sm:w-48"
            />
          </div>
          <button 
            onClick={() => setShowMemberSelector(true)}
            className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2 border border-indigo-100 rounded-lg"
          >
            편집하기
          </button>
        </div>
        <div className="p-3">
          {activeParticipants.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {activeParticipants.map(member => (
                <div key={member.id} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold ${member.gender === Gender.MALE ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-pink-50 border-pink-100 text-pink-700'}`}>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-slate-400 text-[11px]">참여자를 먼저 선택해주세요.</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. 경기 결과 기록 */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">2. 경기 결과 ({dailyMatches.length})</h3>
          <button 
            disabled={activeParticipants.length < 2}
            onClick={() => {
                setWinners([]);
                setLosers([]);
                setIsAdding(true);
            }}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:bg-slate-200"
          >
            + 새 경기
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {dailyMatches.length > 0 ? (
            dailyMatches.map((match) => (
              <div key={match.id} className={`p-5 transition-colors relative border-b last:border-0 ${getMatchTypeStyles(match.matchType)}`}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1 items-center">
                  <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${getBadgeStyles(match.matchType)}`}>
                    {match.matchType}
                  </span>
                  {match.courtName && (
                    <span className="px-1.5 py-0.5 bg-white/60 text-indigo-500 text-[9px] font-black rounded uppercase border border-indigo-100">
                      @{match.courtName}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-4">
                  {/* 승자 영역 (기본 파란색/검정색 볼드) */}
                  <div className="flex-1 text-right flex flex-col">
                    {match.winnerIds.map(id => (
                      <span key={id} className="font-extrabold text-indigo-900 text-[17px] leading-tight">{getMemberName(id)}</span>
                    ))}
                  </div>
                  
                  {/* 점수 영역 */}
                  <div className="flex flex-col items-center min-w-[70px]">
                    <span className="text-2xl font-black text-slate-900 drop-shadow-sm">{match.score}</span>
                  </div>
                  
                  {/* 패자 영역 (빨간색 표시) */}
                  <div className="flex-1 text-left flex flex-col">
                    {match.loserIds.map(id => (
                      <span key={id} className="font-extrabold text-red-600 text-[17px] leading-tight">{getMemberName(id)}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <span className="text-2xl mb-2">🎾</span>
              <p className="text-xs font-bold uppercase tracking-widest">NO DATA</p>
            </div>
          )}
        </div>
      </section>

      {/* 참여자 선택 모달 */}
      {showMemberSelector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">참여자 선택</h3>
              <button onClick={() => setShowMemberSelector(false)} className="text-2xl">&times;</button>
            </div>
            
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setSelectorGenderTab(Gender.MALE)}
                className={`flex-1 py-3 text-sm font-bold transition-all relative ${selectorGenderTab === Gender.MALE ? 'text-blue-600 bg-blue-50/30' : 'text-slate-400'}`}
              >
                남성 회원
                {selectorGenderTab === Gender.MALE && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
              </button>
              <button 
                onClick={() => setSelectorGenderTab(Gender.FEMALE)}
                className={`flex-1 py-3 text-sm font-bold transition-all relative ${selectorGenderTab === Gender.FEMALE ? 'text-pink-600 bg-pink-50/30' : 'text-slate-400'}`}
              >
                여성 회원
                {selectorGenderTab === Gender.FEMALE && <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-600"></div>}
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto grid grid-cols-2 gap-2">
              {members
                .filter(m => m.gender === selectorGenderTab)
                .map(m => (
                <button
                  key={m.id}
                  onClick={() => handleToggleParticipant(m.id)}
                  className={`p-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                    participantIds.includes(m.id)
                    ? selectorGenderTab === Gender.MALE 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => setShowMemberSelector(false)}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold"
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 경기 입력 모달 */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">경기 결과 입력</h3>
              <button onClick={() => setIsAdding(false)} className="text-2xl">&times;</button>
            </div>

            <form onSubmit={handleMatchSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">게임 형식</label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {Object.values(MatchType).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setMatchType(type);
                        setWinners([]);
                        setLosers([]);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        matchType === type ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-blue-600 uppercase">승자 팀</label>
                  <div className="bg-blue-50/30 p-2 rounded-2xl border border-blue-100 max-h-52 overflow-y-auto space-y-1">
                    {filteredParticipantsForMatch.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleWinner(m.id)}
                        disabled={losers.includes(m.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all truncate text-left ${
                          winners.includes(m.id) 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600'
                        } ${losers.includes(m.id) ? 'opacity-20 pointer-events-none' : ''}`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-red-500 uppercase">패자 팀</label>
                  <div className="bg-red-50/30 p-2 rounded-2xl border border-red-100 max-h-52 overflow-y-auto space-y-1">
                    {filteredParticipantsForMatch.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleLoser(m.id)}
                        disabled={winners.includes(m.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all truncate text-left ${
                          losers.includes(m.id) 
                          ? 'bg-red-500 border-red-500 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-600'
                        } ${winners.includes(m.id) ? 'opacity-20 pointer-events-none' : ''}`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">경기 결과 스코어</label>
                <input 
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="예: 6-4"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center text-xl"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={winners.length === 0 || losers.length === 0 || !score}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:bg-slate-200"
                >
                  결과 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
