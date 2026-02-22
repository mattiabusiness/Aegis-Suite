// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 7: STAFF
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step7Staff.tsx
// ============================================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessType } from '@aegis/types';

interface Step7Props {
  businessId: string;
  businessType: BusinessType | null;
  userFullName: string;
  userId: string;
  userEmail: string;
  userPhone: string | null;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
}

const STAFF_COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'];

function getStaffLabel(type: BusinessType | null): { singular: string; plural: string; role: string } {
  switch (type) {
    case 'hair_salon': return { singular: 'parrucchiere', plural: 'parrucchieri', role: 'Parrucchiere' };
    case 'beauty_center': return { singular: 'estetista', plural: 'estetiste', role: 'Estetista' };
    default: return { singular: 'operatore', plural: 'operatori', role: 'Operatore' };
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Step7Staff({ businessId, businessType, userFullName, userId, userEmail, userPhone }: Step7Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();
  const staffLabel = getStaffLabel(businessType);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: 'owner', name: userFullName || '', role: 'Titolare', isOwner: true },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Load saved staff from DB
  useEffect(() => {
    async function loadSavedStaff() {
      const { data: savedStaff } = await supabase
        .from('staff')
        .select('id, full_name, role')
        .eq('business_id', businessId)
        .order('display_order');

      if (savedStaff && savedStaff.length > 0) {
        setStaffMembers((savedStaff as { id: string; full_name: string; role: string }[]).map(s => ({
          id: s.id,
          name: s.full_name,
          role: s.role === 'owner' ? 'Titolare' : staffLabel.role,
          isOwner: s.role === 'owner',
        })));
      }
    }
    loadSavedStaff();
  }, [businessId, supabase, staffLabel.role]);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);
  const triggerShake = useCallback(() => { setShaking(true); setTimeout(() => setShaking(false), 500); }, []);

  const addStaffMember = () => {
    if (!newMemberName.trim()) return;
    const newId = `staff-${Date.now()}`;
    setStaffMembers(prev => [...prev, { id: newId, name: newMemberName.trim(), role: staffLabel.role, isOwner: false }]);
    setNewMemberName('');
    setLastAddedId(newId);
    setTimeout(() => setLastAddedId(null), 600);
  };

  const removeStaffMember = (id: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
  };

  const updateStaffName = (id: string, name: string) => {
    setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleBack = () => router.push('/onboarding/6');

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    const owner = staffMembers.find(s => s.isOwner);
    if (!owner?.name.trim()) { setError('Inserisci il tuo nome'); triggerShake(); return; }
    if (e) triggerRipple(e);
    setLoading(true); setError('');

    try {
      await supabase.from('staff').delete().eq('business_id', businessId);

      const { data: services } = await supabase.from('services').select('id').eq('business_id', businessId) as { data: { id: string }[] | null };

      for (let i = 0; i < staffMembers.length; i++) {
        const member = staffMembers[i];
        const staffData: Record<string, unknown> = {
          business_id: businessId,
          full_name: member.name,
          display_order: i,
          is_active: true,
          color: STAFF_COLORS[i % STAFF_COLORS.length],
        };

        if (member.isOwner) {
          staffData.user_id = userId;
          staffData.email = userEmail;
          staffData.phone = userPhone;
          staffData.role = 'owner';
        } else {
          staffData.user_id = null;
          staffData.email = null;
          staffData.phone = null;
          staffData.role = 'employee';
        }

        const { data: inserted, error: staffErr } = await supabase.from('staff').insert(staffData as never).select('id').single() as { data: { id: string } | null; error: unknown };
        if (staffErr) throw staffErr;

        if (inserted && services?.length) {
          const links = services.map(s => ({ staff_id: inserted.id, service_id: s.id }));
          await supabase.from('staff_services').insert(links as never);
        }
      }

      await supabase.from('businesses').update({ onboarding_step: 8 } as never).eq('id', businessId);
      showTransition('Team configurato ✓', () => router.push('/onboarding/8'));
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Errore durante il salvataggio. Riprova.'); triggerShake();
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-xl mx-auto" style={{ animation: shaking ? 's7Shake 0.5s ease-in-out' : undefined }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20">

        {/* Header */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Il tuo team</h2>
              <p className="text-gray-500 text-sm mt-0.5">Aggiungi i collaboratori del tuo team</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-7 pt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Staff list */}
          <div className="space-y-2 mb-4">
            {staffMembers.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-default group"
                style={{
                  background: lastAddedId === member.id ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(4px)',
                  borderTop: lastAddedId === member.id ? '1.5px solid rgba(16,185,129,0.2)' : '1.5px solid rgba(0,0,0,0.05)',
                  borderRight: lastAddedId === member.id ? '1.5px solid rgba(16,185,129,0.2)' : '1.5px solid rgba(0,0,0,0.05)',
                  borderBottom: lastAddedId === member.id ? '1.5px solid rgba(16,185,129,0.2)' : '1.5px solid rgba(0,0,0,0.05)',
                  borderLeft: `3px solid ${STAFF_COLORS[index % STAFF_COLORS.length]}`,
                  animation: lastAddedId === member.id
                    ? 's7FlashIn 0.5s ease-out'
                    : `s7FadeUp 0.3s ease-out ${index * 0.06}s both`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                  style={{ backgroundColor: STAFF_COLORS[index % STAFF_COLORS.length] }}
                >
                  {member.name.trim() ? getInitials(member.name) : '?'}
                </div>

                {/* Name input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateStaffName(member.id, e.target.value)}
                    onFocus={() => { if (error && member.isOwner) setError(''); }}
                    placeholder={member.isOwner ? 'Il tuo nome' : `Nome ${staffLabel.singular}`}
                    className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Role badge */}
                <span
                  className="text-[11px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
                  style={{
                    background: member.isOwner ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)',
                    color: member.isOwner ? '#7c3aed' : '#6b7280',
                    border: member.isOwner ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {member.role}
                </span>

                {/* Remove (not owner) */}
                {!member.isOwner && (
                  <button
                    type="button"
                    onClick={() => removeStaffMember(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add member */}
          <div className="flex gap-2 mb-5" style={{ animation: 's7FadeUp 0.3s ease-out 0.2s both' }}>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder={`Aggiungi ${staffLabel.singular}...`}
                onKeyDown={(e) => e.key === 'Enter' && addStaffMember()}
                className="w-full h-11 rounded-xl text-sm outline-none transition-all duration-200 pl-3.5 pr-3.5"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                }}
                onFocus={(e) => { e.currentTarget.style.border = '1.5px solid #a855f7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="button"
              onClick={addStaffMember}
              disabled={!newMemberName.trim()}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 outline-none disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: newMemberName.trim() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(0,0,0,0.04)',
                color: newMemberName.trim() ? 'white' : '#9ca3af',
                boxShadow: newMemberName.trim() ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {staffMembers.slice(0, 5).map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: STAFF_COLORS[i % STAFF_COLORS.length], zIndex: 5 - i }} />
              ))}
              {staffMembers.length > 5 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500" style={{ zIndex: 0 }}>
                  +{staffMembers.length - 5}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">{staffMembers.length} {staffMembers.length === 1 ? 'membro' : 'membri'}</span>
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl mb-5" style={{ background: 'rgba(168,85,247,0.04)', border: '1.5px solid rgba(168,85,247,0.12)' }}>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ogni membro potrà ricevere prenotazioni. Potrai completare il profilo di ciascuno dalla dashboard (orari, servizi, permessi).
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} disabled={loading}
              className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 transition-all duration-300 outline-none hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Indietro
            </button>
            <button type="button" onClick={handleContinue} disabled={loading}
              className="relative flex-1 h-12 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              {!loading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's7Shimmer 2.5s ease-in-out infinite' }} />}
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's7Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Continua<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>)}
              </span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai aggiungere altri membri dalla dashboard
          </p>
        </div>
      </div>

      <style>{`
        @keyframes s7FadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s7Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s7Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s7Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes s7FlashIn { 0% { opacity:0; transform:translateX(-10px); background:rgba(16,185,129,0.12); } 40% { opacity:1; transform:translateX(0); background:rgba(16,185,129,0.08); } 100% { background:rgba(255,255,255,0.7); } }
      `}</style>
    </div>
  );
}