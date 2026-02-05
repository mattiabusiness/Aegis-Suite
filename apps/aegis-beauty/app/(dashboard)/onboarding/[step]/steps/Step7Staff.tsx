// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 7: STAFF
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step7Staff.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
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

const STAFF_COLORS = [
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
];

function getStaffLabel(type: BusinessType | null): { singular: string; plural: string; role: string } {
  switch (type) {
    case 'hair_salon':
      return { singular: 'parrucchiere', plural: 'parrucchieri', role: 'Parrucchiere' };
    case 'beauty_center':
      return { singular: 'estetista', plural: 'estetiste', role: 'Estetista' };
    case 'mixed':
    default:
      return { singular: 'operatore', plural: 'operatori', role: 'Operatore' };
  }
}

export function Step7Staff({ businessId, businessType, userFullName, userId, userEmail, userPhone }: Step7Props) {
  const router = useRouter();
  const supabase = createClient();
  
  const staffLabel = getStaffLabel(businessType);
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 'owner',
      name: userFullName || '',
      role: 'Titolare',
      isOwner: true,
    }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addStaffMember = () => {
    if (!newMemberName.trim()) return;
    
    setStaffMembers(prev => [
      ...prev,
      {
        id: `staff-${Date.now()}`,
        name: newMemberName.trim(),
        role: staffLabel.role,
        isOwner: false,
      }
    ]);
    setNewMemberName('');
  };

  const removeStaffMember = (id: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
  };

  const updateStaffName = (id: string, name: string) => {
    setStaffMembers(prev => prev.map(s => 
      s.id === id ? { ...s, name } : s
    ));
  };

  const handleBack = () => {
    router.push('/onboarding/6');
  };

  const handleContinue = async () => {
    const owner = staffMembers.find(s => s.isOwner);
    if (!owner?.name.trim()) {
      setError('Inserisci il tuo nome');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Elimina staff esistente
      await supabase
        .from('staff')
        .delete()
        .eq('business_id', businessId);

      // Ottieni tutti i servizi del business per associarli allo staff
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('business_id', businessId);

      // Inserisci staff
      for (let i = 0; i < staffMembers.length; i++) {
        const member = staffMembers[i];
        
        // Costruisci i dati per l'insert
        const staffInsertData: Record<string, unknown> = {
          business_id: businessId,
          full_name: member.name,
          display_order: i,
          is_active: true,
          color: STAFF_COLORS[i % STAFF_COLORS.length],
        };

        if (member.isOwner) {
          // TITOLARE: collega tutti i dati dell'account esistente
          staffInsertData.user_id = userId;
          staffInsertData.email = userEmail;
          staffInsertData.phone = userPhone;
          staffInsertData.role = 'owner';
        } else {
          // COLLABORATORE: solo nome, verrà completato dalla dashboard
          staffInsertData.user_id = null;
          staffInsertData.email = null;
          staffInsertData.phone = null;
          staffInsertData.role = 'employee';
        }

        const { data: insertedStaff, error: staffError } = await supabase
          .from('staff')
          .insert(staffInsertData as never)
          .select('id')
          .single();

        if (staffError) {
          console.error('Staff insert error:', staffError);
          throw staffError;
        }

        // Associa tutti i servizi a questo staff member
        if (services && services.length > 0 && insertedStaff) {
          const staffServices = services.map(service => ({
            staff_id: (insertedStaff as { id: string }).id,
            service_id: (service as { id: string }).id,
          }));

          const { error: servicesError } = await supabase
            .from('staff_services')
            .insert(staffServices as never);

          if (servicesError) {
            console.error('Staff services insert error:', servicesError);
          }
        }
      }

      // Aggiorna step
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ onboarding_step: 8 } as never)
        .eq('id', businessId);

      if (updateError) {
        console.error('Business update error:', updateError);
        throw updateError;
      }

      router.push('/onboarding/8');
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Il tuo team</CardTitle>
        <CardDescription className="text-base mt-2">
          Aggiungi te stesso e i tuoi collaboratori
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Staff List */}
        <div className="space-y-3 mb-6">
          {staffMembers.map((member, index) => (
            <div 
              key={member.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                style={{ backgroundColor: STAFF_COLORS[index % STAFF_COLORS.length] }}
              >
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </div>

              {/* Name input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateStaffName(member.id, e.target.value)}
                  placeholder={member.isOwner ? 'Il tuo nome' : `Nome ${staffLabel.singular}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Role badge */}
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                member.isOwner ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {member.role}
              </span>

              {/* Remove button (not for owner) */}
              {!member.isOwner && (
                <button
                  type="button"
                  onClick={() => removeStaffMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Rimuovi"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new staff member */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder={`Aggiungi ${staffLabel.singular}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && addStaffMember()}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addStaffMember}
            disabled={!newMemberName.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        {/* Info */}
        <div className="p-4 bg-purple-50 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-purple-700">
              Ogni membro dello staff potrà ricevere prenotazioni. 
              Potrai completare il profilo di ciascuno dalla dashboard (orari, servizi, permessi).
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="flex-1">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </Button>
          <Button type="button" onClick={handleContinue} loading={loading} className="flex-1">
            Continua
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Potrai aggiungere altri membri dalla dashboard
        </p>
      </CardContent>
    </Card>
  );
}