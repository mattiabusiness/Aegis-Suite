# AEGIS SUITE - SPECIALIZED AGENT SKILLS

## SKILL 1: ULTRA-FUTURISTIC UI/UX ARCHITECT
**Objective**: Create interfaces that look like they're from 2030. High-end, premium, and visually addictive.
- **Visual Stack**: Glassmorphism (blur 12px+), subtle border glows (purple-500/20), sophisticated shadows.
- **Motion Design**: 
    - Use `framer-motion` for every page entry (fade-in + slide-up).
    - Layout transitions for shared elements.
    - Micro-interactions on every button (subtle scale-down on click, hover glow).
- **Aesthetic Rule**: If a component looks "standard", it's not Aegis. Add depth with gradients or layered backgrounds.
- **Client Interface Exception**: Mobile layout usa bottom navigation, no sidebar. Cards più grandi, touch targets 48px min. Stesso design system ma senza glassmorphism pesante per performance mobile.

## SKILL 2: GRANDMA-PROOF USABILITY
**Objective**: Zero friction for non-tech users (business owners).
- **Rule of 3**: No core action should take more than 3 clicks.
- **Hit Targets**: Minimum 44x44px for every interactive element.
- **Visual Cues**: Clear, descriptive labels. Use icons (Lucide) + Text, never just icons.
- **Guidance**: Use Steppers (Wizard) for complex tasks like staff scheduling.

## SKILL 3: MONOREPO GUARD
**Objective**: Maintain 100% architectural integrity.
- **Enforcement**: 
    - Logic shared between 2+ verticals MUST move to `packages/core`.
    - UI shared between 2+ verticals MUST move to `packages/ui`.
    - `apps/aegis-beauty` must NEVER import directly from other apps.
- **Validation**: Before every commit, verify that components are "Generic" enough for Aegis Sport or Aegis Health.

## SKILL 4: BOOKING ALGORITHM STRESS-TESTER
**Objective**: Ensure the booking engine is bulletproof against concurrency and edge cases.
- **Test Scenarios**:
    - **Race Condition**: Simulate 2 clients booking the same slot at the exact same millisecond (Row-level locking verification).
    - **Timezone Drift**: Verify staff availability across different time zones.
    - **Fragmentation**: Check if the algorithm correctly identifies "dead zones" (e.g., a 15min gap between appointments where no service fits).
    - **Double Booking**: Ensure staff cannot be in two places at once, even if they provide different services.
    - **No Available Staff**: Slot mostrato solo se almeno uno staff è disponibile e abilitato per quel servizio.
    - **Same-second booking (client interface)**: Due clienti confermano stesso slot simultaneamente — il secondo riceve errore chiaro e vede slot aggiornati in tempo reale.

## SKILL 5: REFACTORING & PERFORMANCE
**Objective**: High-speed, low-token execution.
- **Protocol**: Never rewrite a 500-line file for a 5-line change. Use targeted edits.
- **Optimization**: Implement React Server Components (RSC) to minimize client-side JS. Use `next/image` for every asset.

## SKILL 6: THE ELITE DEVELOPMENT TEAM (MULTI-AGENT ORCHESTRATION)
**Objective**: Execute complex tasks through a specialized internal debate between 4 expert personas to ensure 100% perfection.

### THE ROLES:
1. **Frontend Developer (The Artist)**:
   - Focus: UI/UX Futuristica, Skill 1 (Sleek Design) e Skill 2 (Grandma-proof).
   - Tools: Framer Motion, Tailwind, Radix UI.
   - Goal: Rendere l'interfaccia "sexy" e irresistibile.

2. **Backend Developer (The Engine)**:
   - Focus: Business Logic, Supabase SSR, SQL e Algoritmi (Booking).
   - Tools: PostgreSQL, TypeScript, Edge Functions.
   - Goal: Performance estreme e logica di business infallibile senza bug o problemi.

3. **Monorepo Coordinator (The Architect)**:
   - Focus: Skill 3 (Structural Integrity). 
   - Rule: "Is it generic?". Sposta la logica in `packages/` e mantiene il codice DRY.
   - Goal: Scalabilità totale per i futuri verticali (Sport, Health, etc.).

4. **Security & Logic Auditor (The Skeptic)**:
   - Focus: Skill 4 (Stress-test), RLS Policies, Race Conditions e Sicurezza.
   - Mindset: "Cosa può rompersi?". Cerca bug nascosti e vulnerabilità.
   - Goal: Codice blindato e "Zero-Bug" policy.

### THE PROTOCOL (TRIAD + 1):
Quando viene attivata questa Skill, Claude Code DEVE:
1. **DEBATE**: Simulare un breve dialogo interno tra i 4 ruoli per analizzare il task.
2. **CONSENSUS**: Proporre un piano d'azione unico che soddisfi i requisiti di tutti (Bellezza, Logica, Struttura, Sicurezza).
3. **EXECUTE**: Implementare la soluzione solo dopo l'approvazione del piano.

## SKILL 7: CLIENT BOOKING INTERFACE ARCHITECT
**Objective**: Build the client-facing booking experience — mobile-first, 3-click max, white-label.

### Context:
- No public/SEO page for now. Access via direct URL o QR code → login/register required.
- Client sees ONLY their business's brand (logo, name, colors).
- Aegis Beauty branding: small logo on login page + "Powered by Aegis Group" in footer.

### Pages (3):
1. `/[slug]` — Business landing post-login (hero con brand business, servizi, staff, CTA "Prenota")
2. `/[slug]/prenota` — 3D carousel booking (max 3 step: Servizio → Data/Ora → Conferma)
3. `/[slug]/account` — Area personale (prossimi appuntamenti, storico, profilo, impostazioni)

### Booking Flow Rules:
- **3 click max**: Service → Slot → Confirm. No exceptions.
- **3D Carousel**: CSS perspective + Framer Motion `rotateY` per transizione tra step.
- **Slot logic**: Riusa SEMPRE `getAvailableSlots()` da `@aegis/core` — mai reimplementare.
- **Guest vs Auth**: Se non loggato → redirect login/register rapido → torna al flusso.
- **Pre-fill**: Se loggato, dati cliente pre-compilati alla conferma.

### Design Rules:
- Mobile-first strict: baseline 375px.
- White-label: il cliente vede solo il brand del suo business.
- Stesso design system della dashboard ma layout ribaltato (bottom nav, no sidebar).
- Skeleton loaders su ogni fetch (slot disponibili, servizi, staff).

### Performance:
- `/[slug]` → Server Component con dati business (SSR).
- `/[slug]/prenota` → Client Component (real-time slot updates).
- `/[slug]/account` → Protected route, richiede sessione cliente attiva.

### Availability Logic (reuse from packages/core):
- `getAvailableSlots()` — mai reimplementare
- Edge cases: business chiuso, nessun staff, nessun servizio attivo, slot esauriti