// ============================================================================
// AEGIS SUITE - APPOINTMENT HELPERS (Customer-facing)
// File: packages/core/src/lib/appointments.ts
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;

// Customer-facing select: exclude private staff/internal notes
const APPOINTMENT_SELECT = `
  id, business_id, customer_id, staff_id,
  start_time, end_time, status,
  customer_notes, cancelled_at, cancellation_reason,
  confirmed_at, completed_at, total_price, deposit_paid,
  payment_status, booked_online, source, reminder_sent_at,
  created_at, updated_at,
  customers!inner(full_name, email, phone),
  staff(full_name, nickname),
  appointment_services(service_id, service_name, duration_minutes, price)
`;

/**
 * Appuntamenti futuri del cliente (non cancellati)
 */
export async function getUpcomingAppointments(
  supabase: AnySupabaseClient,
  customerId: string,
  businessId: string
) {
  const { data } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('customer_id', customerId)
    .eq('business_id', businessId)
    .gte('start_time', new Date().toISOString())
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true });

  return data ?? [];
}

/**
 * Appuntamenti passati del cliente
 */
export async function getPastAppointments(
  supabase: AnySupabaseClient,
  customerId: string,
  businessId: string,
  limit = 10
) {
  const { data } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('customer_id', customerId)
    .eq('business_id', businessId)
    .lt('start_time', new Date().toISOString())
    .order('start_time', { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Cancella un appuntamento (solo il cliente proprietario)
 */
export async function cancelAppointment(
  supabase: AnySupabaseClient,
  appointmentId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: customerId,
    })
    .eq('id', appointmentId)
    .eq('customer_id', customerId);

  if (error) {
    return { success: false, error: 'Impossibile cancellare l\'appuntamento. Riprova.' };
  }

  return { success: true };
}
