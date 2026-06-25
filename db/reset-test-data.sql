-- ============================================================================
-- AEGIS SUITE — RESET COMPLETO DATI DI TEST
-- ----------------------------------------------------------------------------
-- Svuota TUTTI i dati (business, clienti, appuntamenti, account auth, ...)
-- SENZA toccare schema, policy RLS, funzioni o trigger.
--
-- COME USARLO:
--   Supabase Dashboard -> SQL Editor -> incolla tutto -> Run.
--   (gira come 'postgres' / owner, quindi bypassa le RLS)
--
-- ATTENZIONE: irreversibile. Esegui solo su ambiente di test/pre-produzione.
-- ============================================================================

BEGIN;

-- 1) Svuota tutte le tabelle dello schema public.
--    CASCADE gestisce le foreign key tra di loro in un colpo solo.
--    RESTART IDENTITY azzera eventuali sequence (i UUID non ne usano, innocuo).
TRUNCATE TABLE
  public.appointment_services,
  public.appointments,
  public.notifications,
  public.support_tickets,
  public.reviews,
  public.staff_services,
  public.staff_breaks,
  public.staff_time_off,
  public.staff_hours,
  public.staff,
  public.services,
  public.service_categories,
  public.business_hours,
  public.business_closures,
  public.customers,
  public.business_members,
  public.subscriptions,
  public.push_subscriptions,
  public.businesses,
  public.profiles
RESTART IDENTITY CASCADE;

-- 2) Cancella tutti gli account di login.
--    Va fatto DOPO il truncate di profiles (che vi fa riferimento).
--    Questo libera le email per poterle riusare nei nuovi onboarding.
DELETE FROM auth.users;

COMMIT;

-- ============================================================================
-- VERIFICA (esegui dopo il COMMIT, devono essere tutte a 0)
-- ============================================================================
-- SELECT
--   (SELECT count(*) FROM public.businesses)     AS businesses,
--   (SELECT count(*) FROM public.profiles)        AS profiles,
--   (SELECT count(*) FROM public.customers)       AS customers,
--   (SELECT count(*) FROM public.appointments)    AS appointments,
--   (SELECT count(*) FROM public.staff)           AS staff,
--   (SELECT count(*) FROM auth.users)             AS auth_users;
