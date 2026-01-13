
import React, { useState, useMemo } from 'react';
import { Member, Gender } from '../types';

interface Props {
  members: Member[];
  onAddMember: (name: string, gender: Gender) => void;
  onDeleteMember: (id: string) => void;
}

const MemberRegistration: React.FC<Props> = ({ members, onAddMember, onDeleteMember }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [filterGender, setFilterGender] = useState<'ALL' | Gender>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMember(name, gender);
      setName('');
    }
  };

  const filteredMembers = useMemo(() => {
    if (filterGender === 'ALL') return members;
    return members.filter(m => m.gender === filterGender);
  }, [members, filterGender]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10">
      {/* Registration Form */}
      <section className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-5 text-white">
          <h2 className="text-xl font-black mb-0.5">신규 회원 등록</h2>
          <p className="text-indigo-100 text-[11px] font-bold opacity-80">클럽의 새로운 플레이어를 추가하세요.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-slate-500 ml-1 uppercase">이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="플레이어 이름 입력"
              required
              className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all text-lg font-bold placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-black text-slate-500 ml-1 uppercase">성별</label>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setGender(Gender.MALE)}
                className={`flex-1 py-3.5 rounded-xl border-2 transition-all font-black text-base ${
                  gender === Gender.MALE 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                  : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                남자
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.FEMALE)}
                className={`flex-1 py-3.5 rounded-xl border-2 transition-all font-black text-base ${
                  gender === Gender.FEMALE 
                  ? 'border-pink-500 bg-pink-50 text-pink-600' 
                  : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                여자
              </button>
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98] shadow-indigo-100"
            >
              회원 등록 완료
            </button>
          </div>
        </form>
      </section>

      {/* Member Management List with Tabs */}
      <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              멤버 리스트 
              <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">{members.length}</span>
            </h2>
            
            {/* Gender Filter Tabs */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl w-full sm:w-auto">
              {['ALL', Gender.MALE, Gender.FEMALE].map((g) => (
                <button 
                  key={g}
                  onClick={() => setFilterGender(g as any)}
                  className={`flex-1 sm:px-6 py-2 rounded-lg text-[11px] font-black transition-all ${
                    filterGender === g 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {g === 'ALL' ? '전체' : g === Gender.MALE ? '남자' : '여자'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-2.5 w-[50%]">이름</th>
                <th className="px-4 py-2.5 w-[25%] text-center">성별</th>
                <th className="px-6 py-2.5 w-[25%] text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-2.5 font-black text-base text-slate-800">{member.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        member.gender === Gender.MALE ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {member.gender === Gender.MALE ? '남자' : '여자'}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="text-slate-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50 active:scale-90"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-300 font-black italic text-xs">
                    표시할 멤버가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MemberRegistration;
