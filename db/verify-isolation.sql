-- ============================================================================
-- AEGIS SUITE — VERIFICA DB (isolamento · sicurezza · performance · trigger)
-- File: db/verify-isolation.sql
-- ----------------------------------------------------------------------------
-- Esegui nel Supabase SQL Editor (gira come 'postgres', bypassa le RLS).
-- Lancia i blocchi UNO ALLA VOLTA e leggi i risultati attesi.
-- ============================================================================


-- ── A) ISOLAMENTO: cross-tenant + orfani — DEVE essere TUTTO 0 ───────────────
WITH checks AS (
  SELECT 'servizio->categoria altro business' AS controllo, count(*) AS violations
    FROM services s JOIN service_categories c ON c.id=s.category_id WHERE c.business_id<>s.business_id
  UNION ALL SELECT 'staff_service mismatch', count(*)
    FROM staff_services ss JOIN staff st ON st.id=ss.staff_id JOIN services sv ON sv.id=ss.service_id
    WHERE st.business_id<>sv.business_id
  UNION ALL SELECT 'appuntamento->cliente altro business', count(*)
    FROM appointments a JOIN customers c ON c.id=a.customer_id WHERE c.business_id<>a.business_id
  UNION ALL SELECT 'appuntamento->staff altro business', count(*)
    FROM appointments a JOIN staff s ON s.id=a.staff_id WHERE s.business_id<>a.business_id
  UNION ALL SELECT 'appointment_service->servizio altro business', count(*)
    FROM appointment_services aps JOIN appointments a ON a.id=aps.appointment_id
    JOIN services sv ON sv.id=aps.service_id WHERE sv.business_id<>a.business_id
  UNION ALL SELECT 'recensione->cliente altro business', count(*)
    FROM reviews r JOIN customers c ON c.id=r.customer_id WHERE c.business_id<>r.business_id
  UNION ALL SELECT 'recensione->staff altro business', count(*)
    FROM reviews r JOIN staff s ON s.id=r.staff_id WHERE r.staff_id IS NOT NULL AND s.business_id<>r.business_id
  UNION ALL SELECT 'appuntamenti orfani', count(*)
    FROM appointments a LEFT JOIN businesses b ON b.id=a.business_id WHERE b.id IS NULL
  UNION ALL SELECT 'clienti orfani', count(*)
    FROM customers c LEFT JOIN businesses b ON b.id=c.business_id WHERE b.id IS NULL
  UNION ALL SELECT 'staff_hours orfani', count(*)
    FROM staff_hours sh LEFT JOIN staff s ON s.id=sh.staff_id WHERE s.id IS NULL
)
SELECT * FROM checks ORDER BY violations DESC, controllo;


-- ── B) SICUREZZA: RLS attiva + policy presenti — rls_enabled=true, policies>=1 ─
SELECT c.relname AS tabella,
       c.relrowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) AS policies
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
ORDER BY c.relrowsecurity ASC, policies ASC, c.relname;


-- ── C) PERFORMANCE: foreign key SENZA indice di supporto — 0 righe = ok ───────
SELECT conrelid::regclass::text AS tabella, conname AS foreign_key
FROM pg_constraint c
WHERE contype='f' AND connamespace='public'::regnamespace
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i WHERE i.indrelid=c.conrelid AND i.indkey[0]=c.conkey[1]
  )
ORDER BY conrelid::regclass::text;


-- ── D) TRIGGER PROFILI: deve esistere ed essere attivo ──────────────────────
SELECT t.tgname AS trigger,
       CASE t.tgenabled WHEN 'O' THEN 'attivo' WHEN 'A' THEN 'attivo (always)'
                        WHEN 'D' THEN 'DISATTIVATO' ELSE t.tgenabled::text END AS stato,
       p.proname AS funzione
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'auth.users'::regclass AND NOT t.tgisinternal;


-- ── E) SNAPSHOT PER BUSINESS: ogni attività ha i SUOI numeri ─────────────────
SELECT b.slug, b.name,
  (SELECT count(*) FROM services         x WHERE x.business_id=b.id) AS servizi,
  (SELECT count(*) FROM staff            x WHERE x.business_id=b.id) AS staff,
  (SELECT count(*) FROM customers        x WHERE x.business_id=b.id) AS clienti,
  (SELECT count(*) FROM appointments     x WHERE x.business_id=b.id) AS appuntamenti,
  (SELECT count(*) FROM business_hours   x WHERE x.business_id=b.id) AS orari,
  (SELECT count(*) FROM business_members x WHERE x.business_id=b.id) AS membri
FROM businesses b ORDER BY b.created_at;


-- ============================================================================
-- VERDE = pronto:
--   A) tutte le righe violations = 0
--   B) ogni tabella rls_enabled = true e policies >= 1
--   C) nessuna riga (tutte le FK indicizzate)
--   D) on_auth_user_created · attivo · handle_new_user
--   E) numeri coerenti per ogni attività (dopo un reset: nessuna riga)
-- ============================================================================
