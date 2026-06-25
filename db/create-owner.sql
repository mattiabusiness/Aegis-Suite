-- ============================================================================
-- AEGIS SUITE — CREAZIONE TITOLARE (owner) MANUALE via SQL
-- File: db/create-owner.sql
-- ----------------------------------------------------------------------------
-- PREREQUISITO: crea prima l'utente in
--   Supabase → Authentication → Users → "Add user" (email + password).
-- Il TRIGGER `handle_new_user` crea AUTOMATICAMENTE la riga in `profiles`
-- (con full_name vuoto) → quindi NON serve più inserirla a mano.
--
-- Poi esegui i 3 step nel SQL Editor sostituendo i valori in MAIUSCOLO.
-- L'UUID dell'utente si copia da Authentication → Users.
-- ============================================================================

-- ── STEP 1 — Assegna nome e telefono al profilo (già creato dal trigger) ─────
-- NB: ora è un UPDATE (non più INSERT): la riga profiles esiste già.
UPDATE profiles
SET full_name = 'NOME COGNOME',
    phone     = '+39 333 1234567'
WHERE id = 'UUID_UTENTE';          -- UUID da Authentication → Users

-- ── STEP 2 — Crea il business (annota l'id che ritorna) ──────────────────────
INSERT INTO businesses (slug, name, email, vertical, owner_id)
VALUES (
  'slug-salone',                   -- URL: solo minuscole, numeri, trattini
  'Nome Salone',                   -- nome visualizzato
  'email@salone.it',               -- email del salone (può = owner)
  'beauty',                        -- sempre 'beauty' per Aegis Beauty
  'UUID_UTENTE'                    -- stesso UUID dell'utente
)
RETURNING id;                      -- copia questo id per lo STEP 3

-- ── STEP 3 — Collega l'utente come OWNER del business ────────────────────────
INSERT INTO business_members (business_id, user_id, role, is_active, joined_at)
VALUES (
  'UUID_BUSINESS',                 -- id ritornato dallo STEP 2
  'UUID_UTENTE',                   -- UUID dell'utente
  'owner'::user_role,
  true,
  NOW()
);

-- Dopo: l'utente fa login → dashboard → onboarding (8 step).
