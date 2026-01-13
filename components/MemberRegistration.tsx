
import React, { useState } from 'react';
import { Member, Gender } from '../types';

interface Props {
  members: Member[];
  onAddMember: (name: string, gender: Gender) => void;
  onDeleteMember: (id: string) => void;
}

const MemberRegistration: React.FC<Props> = ({ members, onAddMember, onDeleteMember }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMember(name, gender);
      setName('');
      alert(`${name} 회원이 등록되었습니다.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
      {/* Registration Form */}
      <section className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">신규 회원 등록</h2>
          <p className="text-indigo-100 opacity-80">클럽의 새로운 플레이어를 추가하세요.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">회원 이름</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함 또는 닉네임"
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">성별</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setGender(Gender.MALE)}
                className={`flex-1 flex items-center justify-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                  gender === Gender.MALE 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200'
                }`}
              >
                <span className="font-bold">남성</span>
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.FEMALE)}
                className={`flex-1 flex items-center justify-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                  gender === Gender.FEMALE 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200'
                }`}
              >
                <span className="font-bold">여성</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
            >
              회원 등록하기
            </button>
          </div>
        </form>
      </section>

      {/* Member Management (Delete) List */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">등록된 회원 목록 및 삭제 관리</h2>
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-medium">총 {members.length}명</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-8 py-4">이름</th>
                <th className="px-8 py-4">성별</th>
                <th className="px-8 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700">{member.name}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        member.gender === Gender.MALE ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                      }`}>
                        {member.gender === Gender.MALE ? '남성' : '여성'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="text-red-400 hover:text-red-600 transition-colors font-medium text-sm flex items-center gap-1 ml-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic">
                    등록된 회원이 없습니다.
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
