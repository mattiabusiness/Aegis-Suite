// ============================================================================
// AEGIS BEAUTY - AIUTO CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/aiuto/AiutoContent.tsx
// Beauty-specific FAQ + Guides data, uses generic HelpPage from @aegis/ui
// ============================================================================

'use client';

import { useMemo } from 'react';
import {
  PageHeader,
  HelpPage,
  type FAQItem,
  type GuideItem,
} from '@aegis/ui';
import { useStaffPermissions } from '@/lib/staff-permissions-context';
import {
  Calendar,
  Scissors,
  Clock,
  UserPlus,
  Download,
  Settings,
  Users,
  Shield,
  BarChart3,
  Smartphone,
  BookOpen,
  Bell,
  Zap,
  CreditCard,
  HelpCircle,
  Lightbulb,
  MousePointerClick,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AiutoContentProps {
  userName: string;
  userEmail: string;
  businessName: string;
  businessId: string;
  businessType: string;
}

// ============================================================================
// BIZ LABEL HELPERS
// ============================================================================

function getBizLabel(businessType: string): string {
  if (businessType === 'beauty_center') return 'centro estetico';
  return 'salone'; // hair_salon, mixed, default
}

function replaceFaqLabel(items: FAQItem[], bizLabel: string): FAQItem[] {
  if (bizLabel === 'salone') return items;
  return items.map(item => ({
    ...item,
    question: item.question.replace(/salone/g, bizLabel),
    answer: (item.answer as string).replace(/salone/g, bizLabel),
  }));
}

function replaceGuideLabel(items: GuideItem[], bizLabel: string): GuideItem[] {
  if (bizLabel === 'salone') return items;
  return items.map(item => ({
    ...item,
    title: item.title.replace(/salone/g, bizLabel),
    description: item.description.replace(/salone/g, bizLabel),
    steps: item.steps.map((s: { title: string; description: string }) => ({
      ...s,
      title: s.title.replace(/salone/g, bizLabel),
      description: s.description.replace(/salone/g, bizLabel),
    })),
  }));
}

// ============================================================================
// BEAUTY-SPECIFIC FAQ
// ============================================================================

const BEAUTY_FAQ: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Come creo un nuovo appuntamento?',
    answer: 'Vai alla pagina Calendario e clicca il pulsante "Nuovo appuntamento" in alto a destra. Puoi anche cliccare direttamente su uno slot orario nel calendario per pre-compilare data e ora. Compila i campi cliente, servizio, operatore, data e ora, poi clicca "Crea appuntamento".',
    icon: Calendar,
  },
  {
    id: 'faq-2',
    question: 'Come aggiungo un nuovo servizio?',
    answer: 'Vai alla pagina Servizi dal menu laterale. Se hai già delle categorie, clicca "Aggiungi servizio" dentro la categoria desiderata. Altrimenti, puoi prima creare una categoria con "Nuova categoria", poi aggiungere i servizi. Per ogni servizio puoi impostare nome, durata, prezzo e descrizione.',
    icon: Scissors,
  },
  {
    id: 'faq-3',
    question: 'Come gestisco gli orari dello staff?',
    answer: 'Nella pagina Staff, clicca sul menu (tre puntini) accanto al membro desiderato e seleziona "Gestisci orari". Puoi scegliere se usare gli stessi orari del salone oppure impostare orari personalizzati per ogni giorno della settimana, incluse le pause pranzo.',
    icon: Clock,
  },
  {
    id: 'faq-4',
    question: 'Come invito un cliente a registrarsi?',
    answer: 'Puoi invitare i clienti in due modi. Dal modal "Nuovo appuntamento": inserisci l\'email del cliente e spunta "Invia invito email" — riceverà un link per impostare la password e accedere alla sua area personale. Dall\'importatore clienti (pagina Clienti → Importa): carica un file Excel o CSV con i dati dei tuoi clienti; al termine dell\'import puoi scegliere di inviare un invito email a tutti i contatti importati in una volta sola.',
    icon: UserPlus,
  },
  {
    id: 'faq-5',
    question: 'Come esporto i dati dei miei clienti?',
    answer: 'Vai alla pagina Clienti e clicca il pulsante "Esporta" in alto a destra. Verrà scaricato un file CSV compatibile con Excel contenente tutti i dati dei tuoi clienti: nome, contatti, numero visite, totale speso, note e preferenze.',
    icon: Download,
  },
  {
    id: 'faq-6',
    question: 'Come modifico i dati del mio salone?',
    answer: 'Vai su Impostazioni dal menu laterale. Da lì puoi modificare il nome del salone, l\'indirizzo, il telefono, gli orari di apertura, il logo e tutte le informazioni del tuo business.',
    icon: Settings,
  },
  {
    id: 'faq-7',
    question: 'Come assegno i servizi ai singoli operatori?',
    answer: 'Nella pagina Staff, clicca sul menu (tre puntini) dell\'operatore e seleziona "Gestisci servizi". Vedrai la lista completa dei servizi disponibili e potrai selezionare/deselezionare quelli che l\'operatore può eseguire. Se un servizio non è assegnato, nel calendario verrà mostrato un avviso.',
    icon: Users,
  },
  {
    id: 'faq-8',
    question: 'Come funziona la compatibilità staff-servizi?',
    answer: 'Quando crei un appuntamento, se selezioni un operatore e un servizio non compatibili (cioè il servizio non è stato assegnato a quell\'operatore), vedrai un avviso arancione. Puoi comunque procedere con la prenotazione, ma l\'avviso ti aiuta a evitare errori.',
    icon: Shield,
  },
  {
    id: 'faq-9',
    question: 'Posso vedere le statistiche del mio salone?',
    answer: 'Sì, la pagina Statistiche è uno strumento completo. Scegli il periodo tra Oggi, Settimana, Mese, 3 Mesi e Anno — ogni selezione mostra automaticamente il confronto con il periodo precedente. Nel tab Panoramica trovi 4 KPI principali (entrate totali, appuntamenti, clienti unici, tasso no-show), il grafico andamento entrate, il grafico appuntamenti nel tempo, il grafico ritenzione clienti (nuovi vs ritorno) e il fatturato medio per giorno della settimana. Nel tab Analisi trovi i top 5 servizi per fatturato, le performance di ogni operatore, la mappa calore dell\'attività settimanale e gli Insight AI — consigli personalizzati generati automaticamente sui tuoi dati reali: trend, servizi di punta, fasce orarie e confronti periodo su periodo.',
    icon: BarChart3,
  },
  {
    id: 'faq-10',
    question: 'Come gestisco le chiusure straordinarie?',
    answer: 'Nelle Impostazioni puoi aggiungere chiusure straordinarie (ferie, festività extra, lavori). Il calendario mostrerà automaticamente quei giorni come chiusi e non sarà possibile creare appuntamenti in quelle date.',
    icon: Calendar,
  },
  {
    id: 'faq-11',
    question: 'I miei clienti possono prenotare online?',
    answer: 'Sì! Ogni salone ha un link dedicato (il tuo slug personale) che puoi condividere ai clienti via WhatsApp, social o QR code in vetrina. I clienti potranno vedere i tuoi servizi, la disponibilità e prenotare autonomamente.',
    icon: Smartphone,
  },
  {
    id: 'faq-12',
    question: 'Come aggiungo note e preferenze a un cliente?',
    answer: 'Nella pagina Clienti, clicca su un cliente per aprire la sua scheda. Vai al tab "Note" dove troverai due campi: uno per le note generali (allergie, informazioni utili) e uno per le preferenze (orari preferiti, staff preferito). Le modifiche vengono salvate cliccando il bottone.',
    icon: BookOpen,
  },
  {
    id: 'faq-13',
    question: 'Cosa succede se un cliente non si presenta?',
    answer: 'Puoi segnare l\'appuntamento come "No-show" dal calendario. Il sistema tiene traccia del tasso di no-show per ogni cliente, visibile nella scheda dettaglio. Questo ti aiuta a identificare i clienti meno affidabili.',
    icon: Bell,
  },
  {
    id: 'faq-14',
    question: 'Posso avere più postazioni o poltrone?',
    answer: 'Sì, il numero di postazioni è stato configurato durante l\'onboarding iniziale. Puoi modificarlo nelle Impostazioni. Il sistema lo tiene in considerazione per evitare overbooking quando più operatori lavorano contemporaneamente.',
    icon: Zap,
  },
  {
    id: 'faq-15',
    question: 'Come funziona la prova gratuita?',
    answer: 'Durante la fase beta, Aegis Beauty è completamente gratuito e senza limiti di funzionalità. Avrai accesso a tutte le feature: calendario, CRM clienti, gestione staff, statistiche e molto altro. Ti avviseremo con largo anticipo prima di qualsiasi cambio.',
    icon: CreditCard,
  },
  {
    id: 'faq-16',
    question: 'Come funzionano i permessi dello staff?',
    answer: 'Nelle Impostazioni, nel tab Prenotazioni, trovi la sezione "Permessi Staff" con tre toggle. Calendario completo: lo staff vede gli appuntamenti di tutto il team nel calendario, non solo i propri; nell\'Overview appariranno anche i KPI del team con un tab switcher "I miei / Team". Statistiche business: lo staff accede ai dati dell\'intero salone nel tab "Business" della pagina Statistiche, oltre alle proprie statistiche personali. Gestione agenda team: scegli quali membri specifici possono creare appuntamenti per i colleghi — i membri selezionati vedranno tutti gli operatori nel campo "Operatore" quando creano un appuntamento, gli altri vedranno solo se stessi. I permessi sono modificabili in qualsiasi momento e diventano effettivi al prossimo accesso dello staff.',
    icon: Shield,
  },
];

// ============================================================================
// BEAUTY-SPECIFIC GUIDES
// ============================================================================

const BEAUTY_GUIDES: GuideItem[] = [
  {
    id: 'guide-setup',
    title: 'Primo accesso e setup',
    description: 'Configura il tuo salone in pochi minuti',
    icon: Lightbulb,
    colorClasses: 'bg-amber-50 text-amber-600 border-amber-200',
    steps: [
      { title: 'Accedi al tuo account', description: 'Dopo la registrazione, accedi con email e password. Se hai già completato l\'onboarding, verrai portato alla dashboard principale.' },
      { title: 'Completa l\'onboarding', description: 'Segui gli 8 step: tipo attività, dati salone, logo, orari, postazioni, servizi, staff e calcolo ROI. Puoi sempre modificare tutto dopo dalle Impostazioni.' },
      { title: 'Verifica i servizi', description: 'Vai alla pagina Servizi e controlla che i servizi predefiniti siano corretti. Modifica prezzi, durate e aggiungi servizi personalizzati.' },
      { title: 'Configura lo staff', description: 'Nella pagina Staff, verifica che tutti i membri siano presenti. Assegna i servizi e configura gli orari personalizzati se necessario.' },
      { title: 'Crea il primo appuntamento', description: 'Vai al Calendario, clicca "Nuovo appuntamento" e crea la tua prima prenotazione. Da qui in poi puoi iniziare a gestire tutto dal software!' },
    ],
  },
  {
    id: 'guide-calendar',
    title: 'Gestire il calendario',
    description: 'Padroneggia la gestione degli appuntamenti',
    icon: Calendar,
    colorClasses: 'bg-blue-50 text-blue-600 border-blue-200',
    steps: [
      { title: 'Naviga tra le viste', description: 'Usa i pulsanti Giorno, Settimana e Mese per cambiare vista. Puoi navigare avanti e indietro con le frecce, o tornare a "Oggi" con l\'apposito pulsante.' },
      { title: 'Crea un appuntamento', description: 'Clicca "Nuovo appuntamento" in alto a destra. Cerca un cliente esistente o creane uno nuovo. Seleziona servizio, operatore, data e ora.' },
      { title: 'Filtra per operatore', description: 'Usa i chip colorati sopra il calendario per filtrare gli appuntamenti per singolo operatore. Clicca "Tutti" per tornare alla vista completa.' },
      { title: 'Gestisci un appuntamento', description: 'Clicca su un appuntamento nel calendario per vederne i dettagli. Da lì puoi modificarlo, spostarlo o cancellarlo.' },
      { title: 'Giorni chiusi', description: 'I giorni di chiusura sono evidenziati nel calendario. Se provi a creare un appuntamento in un giorno chiuso, vedrai un avviso automatico.' },
    ],
  },
  {
    id: 'guide-services',
    title: 'Creare servizi e prezzi',
    description: 'Organizza il tuo listino completo',
    icon: Scissors,
    colorClasses: 'bg-purple-50 text-purple-600 border-purple-200',
    steps: [
      { title: 'Crea le categorie', description: 'Le categorie raggruppano i tuoi servizi (es. "Taglio", "Colore", "Trattamenti"). Clicca "Nuova categoria" e scegli un nome e un\'icona.' },
      { title: 'Aggiungi i servizi', description: 'Dentro ogni categoria, clicca "Aggiungi servizio". Imposta nome, durata in minuti, prezzo e una descrizione opzionale.' },
      { title: 'Ordina i servizi', description: 'Puoi riordinare sia le categorie che i servizi al loro interno trascinandoli nella posizione desiderata.' },
      { title: 'Attiva/Disattiva', description: 'Ogni servizio ha un toggle per attivarlo o disattivarlo. I servizi disattivati non saranno visibili ai clienti ma resteranno nel tuo archivio.' },
      { title: 'Assegna agli operatori', description: 'Dalla pagina Staff, assegna i servizi che ogni operatore sa eseguire. In questo modo eviti errori durante la prenotazione.' },
    ],
  },
  {
    id: 'guide-staff',
    title: 'Gestire lo staff',
    description: 'Configura il tuo team al meglio',
    icon: Users,
    colorClasses: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    steps: [
      { title: 'Aggiungi un membro', description: 'Nella pagina Staff, clicca "Aggiungi membro". Inserisci nome, email, telefono e ruolo. Scegli un colore che lo identifichi nel calendario.' },
      { title: 'Assegna i servizi', description: 'Dal menu del membro, scegli "Gestisci servizi" e seleziona quali servizi può eseguire. Questo influenza la compatibilità nella creazione appuntamenti.' },
      { title: 'Configura gli orari', description: 'Dal menu "Gestisci orari", scegli se usare gli orari del salone o impostare orari personalizzati per ogni giorno della settimana.' },
      { title: 'Invita a registrarsi', description: 'Se il membro ha un\'email, dal menu (tre puntini) clicca "Invia invito". Riceverà un\'email con un link per impostare la password e accedere alla propria area della dashboard. Puoi disattivarlo temporaneamente (ferie, malattia) senza eliminarlo: non apparirà nel calendario ma i suoi dati resteranno conservati.' },
      { title: 'Configura i permessi', description: 'Dopo la registrazione vai in Impostazioni → tab Prenotazioni → sezione Permessi Staff. Hai tre toggle: Calendario completo (vede l\'agenda di tutto il team), Statistiche business (accede ai dati del salone), Gestione agenda (può prenotare per i colleghi). Attiva solo ciò che serve al livello di responsabilità del membro.' },
    ],
  },
  {
    id: 'guide-clients',
    title: 'Gestire i clienti',
    description: 'Il tuo CRM clienti a portata di mano',
    icon: MousePointerClick,
    colorClasses: 'bg-rose-50 text-rose-600 border-rose-200',
    steps: [
      { title: 'Visualizza i clienti', description: 'Nella pagina Clienti trovi la lista completa. Usa i filtri (Tutti, Attivi, Nuovi, Inattivi) e la barra di ricerca per trovare chiunque.' },
      { title: 'Scheda cliente', description: 'Clicca su un cliente per aprire la scheda completa: panoramica con statistiche, storico appuntamenti e tab note/preferenze.' },
      { title: 'Aggiungi note', description: 'Nel tab Note puoi scrivere informazioni utili come allergie, preferenze prodotti, o qualsiasi dettaglio importante per il servizio.' },
      { title: 'Prenota dalla scheda', description: 'Il pulsante "Prenota" nella scheda cliente apre direttamente il form di nuovo appuntamento con il cliente già selezionato.' },
      { title: 'Esporta i dati', description: 'Clicca "Esporta" per scaricare un file CSV con tutti i dati clienti, perfetto per analisi o backup.' },
    ],
  },
  {
    id: 'guide-sharing',
    title: 'Condividi con i clienti',
    description: 'Link, QR code e prenotazioni online',
    icon: Smartphone,
    colorClasses: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    steps: [
      { title: 'Trova il tuo link', description: 'Il tuo salone ha un URL unico basato sullo slug scelto durante il setup. Lo trovi nella dashboard Overview, nel riquadro "Il tuo link" in basso. Da lì puoi copiarlo con un click.' },
      { title: 'Genera il QR code', description: 'Nella pagina Staff, apri il menu (tre puntini) di qualsiasi membro e seleziona "QR code invito". Otterrai un codice da scaricare e stampare da mettere in vetrina, sui bigliettini da visita o da pubblicare sui social.' },
      { title: 'Condividi via WhatsApp', description: 'Copia il link dall\'Overview e mandalo nelle chat WhatsApp con i tuoi clienti abituali. Potranno scegliere il servizio, l\'operatore e l\'orario direttamente dal telefono.' },
      { title: 'Social media', description: 'Pubblica il link nei tuoi profili Instagram, Facebook o TikTok. Aggiungilo alla bio e usalo nelle storie con un link cliccabile per massima visibilità.' },
      { title: 'Prenotazioni in arrivo', description: 'Ogni prenotazione online effettuata dai clienti appare automaticamente nel calendario, con notifica in tempo reale. Non devi fare nulla: il sistema gestisce disponibilità, conferme e conflitti in autonomia!' },
    ],
  },
];

// ============================================================================
// STAFF FAQ
// ============================================================================

const STAFF_FAQ: FAQItem[] = [
  {
    id: 'sfaq-1',
    question: 'Come vedo i miei appuntamenti di oggi?',
    answer: 'Nella dashboard principale (Overview) trovi il riquadro "I miei appuntamenti oggi" con la lista completa degli appuntamenti della giornata. Per una vista più dettagliata con orari e navigazione per data, vai alla pagina Calendario.',
    icon: Calendar,
  },
  {
    id: 'sfaq-2',
    question: 'Come creo un nuovo appuntamento per un cliente?',
    answer: 'Vai alla pagina Calendario e clicca "Nuovo appuntamento" in alto a destra. Puoi anche cliccare direttamente su uno slot orario libero per pre-compilare data e ora. Seleziona il cliente, il servizio che vuoi eseguire, poi conferma con "Crea appuntamento".',
    icon: Calendar,
  },
  {
    id: 'sfaq-3',
    question: 'Quali servizi posso eseguire?',
    answer: 'Nella pagina Servizi puoi vedere tutti i trattamenti che ti sono stati assegnati dal titolare. Sono in sola lettura: se hai bisogno di aggiungere o modificare un servizio, contatta il titolare o l\'amministratore del salone.',
    icon: Scissors,
  },
  {
    id: 'sfaq-4',
    question: 'Come invito un cliente a registrarsi?',
    answer: 'Nella pagina Clienti, trova il cliente con il badge "Non registrato" e clicca su di esso per inviare l\'invito. Puoi farlo anche dalla scheda dettaglio del cliente con il pulsante "Invia invito". Il cliente riceverà una email per completare la registrazione.',
    icon: UserPlus,
  },
  {
    id: 'sfaq-5',
    question: 'Come aggiungo note a un cliente?',
    answer: 'Nella pagina Clienti, clicca su un cliente per aprire la sua scheda. Vai al tab "Note" dove puoi scrivere informazioni utili (allergie, preferenze prodotti, note generali) e al tab "Preferenze" per dettagli come orari preferiti. Clicca il tasto di salvataggio per confermare.',
    icon: BookOpen,
  },
  {
    id: 'sfaq-6',
    question: 'Cosa faccio se un cliente non si presenta?',
    answer: 'Dal Calendario, clicca sull\'appuntamento e segna lo stato come "No-show". Il sistema tiene traccia dei no-show per ogni cliente, visibili nella scheda dettaglio. Questo aiuta a identificare i clienti che necessitano di promemoria.',
    icon: Bell,
  },
  {
    id: 'sfaq-7',
    question: 'Come vedo le mie statistiche personali?',
    answer: 'Nella pagina Statistiche trovi le tue performance personali: appuntamenti completati, ticket medio, servizi più eseguiti, fasce orarie di punta e molto altro. Tutti i dati si riferiscono esclusivamente ai tuoi appuntamenti. Puoi filtrare per periodo (oggi, settimana, mese, anno).',
    icon: BarChart3,
  },
  {
    id: 'sfaq-8',
    question: 'Come prenoto un appuntamento dalla scheda cliente?',
    answer: 'Nella pagina Clienti, apri la scheda di un cliente e clicca il pulsante "Prenota". Si aprirà direttamente il form di nuovo appuntamento con il cliente già preselezionato. Scegli il servizio, la data e l\'ora disponibile.',
    icon: MousePointerClick,
  },
  {
    id: 'sfaq-9',
    question: 'Cosa posso e non posso modificare?',
    answer: 'Come operatore puoi: creare appuntamenti, aggiungere note ai clienti, inviare inviti e vedere le tue statistiche. Non puoi modificare i servizi del salone, aggiungere o rimuovere membri dello staff, cambiare le impostazioni del salone, o esportare la lista clienti. Se hai bisogno di permessi aggiuntivi, contatta il titolare.',
    icon: Shield,
  },
  {
    id: 'sfaq-10',
    question: 'Come funzionano i miei permessi?',
    answer: 'I tuoi permessi sono gestiti dal titolare del salone dalla pagina Impostazioni. Di default vedi solo i tuoi appuntamenti nel calendario e le tue statistiche personali. Il titolare può abilitare funzionalità aggiuntive come la visualizzazione del calendario completo, le statistiche di tutto il salone o la gestione degli appuntamenti del team.',
    icon: HelpCircle,
  },
  {
    id: 'sfaq-11',
    question: 'I clienti possono prenotare direttamente online?',
    answer: 'Sì! Il salone ha un link dedicato che i clienti possono usare per prenotare autonomamente. Quando un cliente prenota online e ti seleziona come operatore, l\'appuntamento apparirà direttamente nel tuo calendario.',
    icon: Smartphone,
  },
  {
    id: 'sfaq-12',
    question: 'Come funziona la prova gratuita?',
    answer: 'Durante la fase beta, Aegis Beauty è completamente gratuito e senza limiti. Tutte le funzionalità sono disponibili senza costi aggiuntivi. Sarai avvisato con largo anticipo prima di qualsiasi cambio di piano.',
    icon: CreditCard,
  },
];

// ============================================================================
// STAFF GUIDES
// ============================================================================

const STAFF_GUIDES: GuideItem[] = [
  {
    id: 'sguide-start',
    title: 'Primo accesso come operatore',
    description: 'Orientati nella tua nuova area di lavoro',
    icon: Lightbulb,
    colorClasses: 'bg-amber-50 text-amber-600 border-amber-200',
    steps: [
      { title: 'Accedi con il tuo account', description: 'Usa le credenziali ricevute via email di invito. Se non hai ancora completato la registrazione, apri il link nell\'email e segui i passaggi.' },
      { title: 'Scopri la dashboard', description: 'Nella Overview trovi i tuoi appuntamenti di oggi, il link del salone e i tuoi dati principali. È il tuo punto di partenza ogni mattina.' },
      { title: 'Controlla il tuo calendario', description: 'Vai alla pagina Calendario per vedere tutti i tuoi appuntamenti in vista giornaliera, settimanale o mensile.' },
      { title: 'Esplora i tuoi servizi', description: 'Nella pagina Servizi trovi i trattamenti che puoi eseguire, con durata e prezzo. Se manca qualcosa, segnalalo al titolare.' },
      { title: 'Familiarizza con i clienti', description: 'Nella pagina Clienti puoi vedere le schede, aggiungere note e prenotare nuovi appuntamenti.' },
    ],
  },
  {
    id: 'sguide-calendar',
    title: 'Il tuo calendario',
    description: 'Gestisci i tuoi appuntamenti al meglio',
    icon: Calendar,
    colorClasses: 'bg-blue-50 text-blue-600 border-blue-200',
    steps: [
      { title: 'Naviga tra le viste', description: 'Usa i pulsanti Giorno, Settimana e Mese per cambiare prospettiva. La vista Giorno è ideale per seguire la giornata in tempo reale.' },
      { title: 'Crea un appuntamento', description: 'Clicca "Nuovo appuntamento" o clicca direttamente su uno slot libero. Cerca un cliente esistente o registrane uno nuovo sul momento.' },
      { title: 'Consulta i dettagli', description: 'Clicca su un appuntamento per vedere cliente, servizio, durata e note. Da qui puoi anche modificare lo stato (completato, no-show, cancellato).' },
      { title: 'Giorni chiusi', description: 'I giorni di chiusura del salone sono evidenziati automaticamente. Non puoi creare appuntamenti in quei giorni.' },
      { title: 'Aggiungi note all\'appuntamento', description: 'Durante la creazione o la modifica, puoi aggiungere note specifiche per quell\'appuntamento, utili per ricordare richieste particolari del cliente.' },
    ],
  },
  {
    id: 'sguide-clients',
    title: 'I tuoi clienti',
    description: 'Gestisci le relazioni con i clienti',
    icon: MousePointerClick,
    colorClasses: 'bg-rose-50 text-rose-600 border-rose-200',
    steps: [
      { title: 'Trova un cliente', description: 'Usa la barra di ricerca per trovare un cliente per nome, email o telefono. Puoi anche usare i filtri per vedere solo i clienti attivi o i nuovi.' },
      { title: 'Apri la scheda cliente', description: 'Clicca su un cliente per vederne tutta la storia: visite totali, totale speso, storico appuntamenti, note e preferenze.' },
      { title: 'Aggiungi note utili', description: 'Nel tab Note annota allergie, prodotti preferiti o qualsiasi informazione utile per il servizio. Le note sono visibili a tutto il team.' },
      { title: 'Prenota dalla scheda', description: 'Clicca "Prenota" nella scheda cliente per aprire direttamente il form con il cliente già selezionato. Velocissimo!' },
      { title: 'Invia un invito', description: 'Se il cliente non è ancora registrato su Aegis, clicca "Non registrato" o "Invia invito" per mandargli un\'email di registrazione.' },
    ],
  },
  {
    id: 'sguide-stats',
    title: 'Le tue statistiche',
    description: 'Monitora le tue performance personali',
    icon: BarChart3,
    colorClasses: 'bg-purple-50 text-purple-600 border-purple-200',
    steps: [
      { title: 'Scegli il periodo', description: 'Nella pagina Statistiche puoi filtrare per oggi, settimana, mese, 3 mesi o anno. Il confronto con il periodo precedente è automatico.' },
      { title: 'Leggi i KPI', description: 'I 4 riquadri in alto mostrano: entrate generate, appuntamenti completati, clienti unici e tasso di no-show. La freccia indica il trend rispetto al periodo precedente.' },
      { title: 'Analizza i tuoi servizi', description: 'Nel tab Analisi, il grafico "Top 5 Servizi" mostra i trattamenti che generi più spesso. Ottimo per capire dove sei più richiesto.' },
      { title: 'Scopri i tuoi orari di punta', description: 'La mappa attività mostra quando sei più impegnato durante la settimana. Utile per pianificare le energie e le pause.' },
      { title: 'Leggi gli insight', description: 'Aegis AI genera consigli personalizzati basati sui tuoi dati reali: trend, servizi top, giorni più trafficati e suggerimenti per migliorare.' },
    ],
  },
  {
    id: 'sguide-sharing',
    title: 'Condividi con i clienti',
    description: 'Link e prenotazioni online',
    icon: Smartphone,
    colorClasses: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    steps: [
      { title: 'Il link del salone', description: 'Il salone ha un URL unico che i clienti possono usare per prenotare online. Trovi il link nella Overview (riquadro "Il tuo link").' },
      { title: 'Condividi via WhatsApp', description: 'Copia il link e mandalo ai tuoi clienti su WhatsApp. Potranno scegliere il servizio, selezionarti come operatore e prenotare autonomamente.' },
      { title: 'Social media', description: 'Puoi condividere il link del salone sui tuoi profili personali per portare nuovi clienti. Ogni prenotazione online arriverà direttamente nel calendario.' },
      { title: 'Prenotazioni in arrivo', description: 'Quando un cliente prenota online e ti seleziona, l\'appuntamento appare automaticamente nel tuo calendario senza che tu debba fare nulla.' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function AiutoContent({
  userName,
  userEmail,
  businessName,
  businessId,
  businessType,
}: AiutoContentProps) {
  const { isStaff, canSeeBusinessCalendar, canSeeBusinessStats, canManageTeamBookings } = useStaffPermissions();
  const bizLabel = getBizLabel(businessType);

  // ── FAQ dinamiche per staff in base ai toggle attivi ──────────────────────
  const faqItems = useMemo<FAQItem[]>(() => {
    if (!isStaff) return replaceFaqLabel(BEAUTY_FAQ, bizLabel);

    const allActive = canSeeBusinessCalendar && canSeeBusinessStats && canManageTeamBookings;

    // Sostituzioni contestuali di alcune risposte base
    const base: FAQItem[] = STAFF_FAQ.map(item => {
      // sfaq-1: overview tab switcher se vede il calendario team
      if (item.id === 'sfaq-1' && canSeeBusinessCalendar) {
        return {
          ...item,
          answer: 'Nella dashboard (Overview) trovi il riquadro appuntamenti con due tab: "I miei" mostra solo i tuoi di oggi, "Team" mostra tutti gli appuntamenti del salone. I KPI in alto mostrano sia i tuoi numeri che quelli del team. Per la vista completa per data, vai al Calendario.',
        };
      }
      // sfaq-2: creazione appuntamento per colleghi se gestione team attiva
      if (item.id === 'sfaq-2' && canManageTeamBookings) {
        return {
          ...item,
          answer: 'Vai alla pagina Calendario e clicca "Nuovo appuntamento", oppure clicca su uno slot libero. Nel campo "Operatore" puoi selezionare qualsiasi membro del team, non solo te stesso. Questo ti permette di gestire l\'intera agenda del salone.',
        };
      }
      // sfaq-7: statistiche con tab business se abilitato
      if (item.id === 'sfaq-7' && canSeeBusinessStats) {
        return {
          ...item,
          answer: 'Nella pagina Statistiche trovi un tab switcher in alto: "Le mie statistiche" mostra le tue performance personali, "Business" mostra i dati completi del salone (entrate totali, tutti gli appuntamenti, performance team, top servizi e insights AI). Puoi filtrare per periodo e navigare tra i tab Panoramica e Analisi.',
        };
      }
      // sfaq-9: lista aggiornata di cosa puoi/non puoi fare
      if (item.id === 'sfaq-9') {
        const canDo = [
          'creare e gestire appuntamenti',
          'aggiungere note e preferenze ai clienti',
          'inviare inviti di registrazione ai clienti',
          'vedere le tue statistiche personali',
          canSeeBusinessCalendar && 'visualizzare il calendario completo del team',
          canSeeBusinessStats && 'accedere alle statistiche di tutto il salone',
          canManageTeamBookings && 'creare appuntamenti per i tuoi colleghi',
        ].filter(Boolean) as string[];
        return {
          ...item,
          answer: `Come operatore puoi: ${canDo.join(', ')}. Non puoi modificare servizi, impostazioni del salone, aggiungere/rimuovere staff o esportare la lista clienti. Per permessi aggiuntivi, contatta il titolare.`,
        };
      }
      // sfaq-10: stato attuale permessi (non più generico)
      if (item.id === 'sfaq-10') {
        const activePerms = [
          canSeeBusinessCalendar && 'visualizzazione calendario completo del team',
          canSeeBusinessStats && 'statistiche di tutto il salone',
          canManageTeamBookings && 'gestione appuntamenti del team',
        ].filter(Boolean) as string[];
        const activeText = activePerms.length > 0
          ? `Al momento hai abilitato: ${activePerms.join(', ')}.`
          : 'Al momento hai accesso base: vedi solo i tuoi appuntamenti e le tue statistiche personali.';
        return {
          ...item,
          answer: `I tuoi permessi sono gestiti dal titolare dalla pagina Impostazioni. ${activeText} Per modifiche, contatta il titolare del salone.`,
        };
      }
      return item;
    });

    // FAQ extra per toggle attivi
    const extras: FAQItem[] = [];

    if (canSeeBusinessCalendar) {
      extras.push({
        id: 'sfaq-cal-team',
        question: 'Come visualizzo il calendario di tutto il team?',
        answer: 'Hai accesso al calendario completo del salone. Usa il filtro "Staff" in alto nel calendario per focalizzarti su un singolo operatore, o lascia "Tutti" per vedere tutti gli appuntamenti del team in una sola schermata. La vista funziona sia in modalità Giorno che Settimana.',
        icon: Calendar,
      });
    }

    if (canSeeBusinessStats) {
      extras.push({
        id: 'sfaq-stats-business',
        question: 'Come accedo alle statistiche di tutto il salone?',
        answer: 'Nella pagina Statistiche, clicca "Business" nel tab switcher in alto. Vedrai i dati completi del salone: entrate totali, tutti gli appuntamenti del team, top servizi, performance di ogni operatore, mappa attività e insights AI. Sul tab Analisi trovi anche la sezione "Performance Staff" con il confronto tra operatori.',
        icon: BarChart3,
      });
    }

    if (canManageTeamBookings) {
      extras.push({
        id: 'sfaq-team-bookings',
        question: 'Posso creare appuntamenti per i miei colleghi?',
        answer: 'Sì! Quando crei un nuovo appuntamento dal Calendario o dalla scheda cliente, nel campo "Operatore" puoi selezionare qualsiasi membro del team. Questo ti permette di organizzare l\'agenda del salone, coprire i colleghi o gestire le prenotazioni che arrivano quando il titolare non è disponibile.',
        icon: Users,
      });
    }

    if (allActive) {
      extras.push({
        id: 'sfaq-full-access',
        question: 'Ho tutti i permessi attivi: c\'è qualcosa che devo sapere?',
        answer: 'Con tutti i permessi attivi hai una visione completa del salone: vedi il calendario di tutto il team, puoi prenotare per i colleghi e accedere alle statistiche complete. L\'unica differenza rispetto al titolare è che non puoi modificare impostazioni, servizi o gestire lo staff. Leggi la "Guida rapida — Accesso completo" nelle guide qui sotto per un riepilogo pratico.',
        icon: Zap,
      });
    }

    return replaceFaqLabel([...base, ...extras], bizLabel);
  }, [isStaff, canSeeBusinessCalendar, canSeeBusinessStats, canManageTeamBookings, bizLabel]);

  // ── Guide dinamiche per staff ─────────────────────────────────────────────
  const guides = useMemo<GuideItem[]>(() => {
    if (!isStaff) return replaceGuideLabel(BEAUTY_GUIDES, bizLabel);

    const allActive = canSeeBusinessCalendar && canSeeBusinessStats && canManageTeamBookings;

    if (!allActive) return replaceGuideLabel(STAFF_GUIDES, bizLabel);

    // Guida rapida preposta quando tutti e 3 i toggle sono attivi
    const quickGuide: GuideItem = {
      id: 'sguide-quickstart-full',
      title: 'Guida rapida — Accesso completo',
      description: 'Hai tutti i permessi attivi: ecco cosa puoi fare',
      icon: Zap,
      colorClasses: 'bg-purple-50 text-purple-600 border-purple-200',
      steps: [
        {
          title: 'Dashboard: vista I miei / Team',
          description: 'Nell\'Overview hai 4 KPI (i tuoi oggi, la tua settimana, team oggi, team settimana) e un tab switcher "I miei / Team" nel riquadro appuntamenti. Ogni mattina hai un colpo d\'occhio sia sulla tua giornata che su quella del salone.',
        },
        {
          title: 'Calendario completo del team',
          description: 'Nel Calendario vedi gli appuntamenti di tutti gli operatori. Usa il filtro "Staff" per focalizzarti su un collega specifico. Puoi navigare liberamente tra giorno, settimana e mese.',
        },
        {
          title: 'Crea appuntamenti per chiunque',
          description: 'Quando crei un nuovo appuntamento, il campo "Operatore" non è bloccato sul tuo nome: puoi selezionare qualsiasi membro del team. Utile per gestire le prenotazioni telefoniche o coprire un collega assente.',
        },
        {
          title: 'Statistiche Business',
          description: 'Nella pagina Statistiche usa il tab "Business" per vedere i dati completi del salone. Sul tab Analisi trovi anche le performance di ogni operatore a confronto, gli insight AI sull\'andamento del business e la mappa attività dell\'intero team.',
        },
        {
          title: 'Cosa resta solo al titolare',
          description: 'Non puoi modificare servizi, impostazioni del salone, gestire i membri dello staff o esportare la lista clienti. I tuoi permessi estesi riguardano esclusivamente la gestione degli appuntamenti e la visualizzazione dei dati.',
        },
      ],
    };

    return replaceGuideLabel([quickGuide, ...STAFF_GUIDES], bizLabel);
  }, [isStaff, canSeeBusinessCalendar, canSeeBusinessStats, canManageTeamBookings, bizLabel]);

  const handleSubmitSupport = async (data: {
    category: string;
    message: string;
    userName: string;
    userEmail: string;
    businessName: string;
  }) => {
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Errore durante l\'invio');
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <PageHeader
        title="Aiuto"
        description={isStaff ? 'FAQ, guide e supporto per il tuo lavoro' : `FAQ, guide e supporto per il tuo ${bizLabel}`}
      />

      <div className="mt-6 pb-8">
        <HelpPage
          faqItems={faqItems}
          guides={guides}
          userName={userName}
          userEmail={userEmail}
          businessName={businessName}
          onSubmitSupport={handleSubmitSupport}
        />
      </div>
    </div>
  );
}