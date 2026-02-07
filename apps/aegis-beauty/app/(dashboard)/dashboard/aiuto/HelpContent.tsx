// ============================================================================
// AEGIS BEAUTY - AIUTO CONTENT
// File: apps/aegis-beauty/app/(dashboard)/dashboard/aiuto/AiutoContent.tsx
// Beauty-specific FAQ + Guides data, uses generic HelpPage from @aegis/ui
// ============================================================================

'use client';

import {
  PageHeader,
  HelpPage,
  type FAQItem,
  type GuideItem,
} from '@aegis/ui';
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
  Palette,
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
    answer: 'Quando crei un nuovo appuntamento per un cliente non registrato, inserisci la sua email e spunta la casella "Invia invito email". Il cliente riceverà un\'email con un link per completare la registrazione e accedere alla sua area personale.',
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
    answer: 'Sì, nella pagina Statistiche troverai grafici e dati su: entrate giornaliere/settimanali/mensili, servizi più richiesti, performance degli operatori, tasso di no-show e cancellazioni. Puoi anche esportare i report.',
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
      { title: 'Aggiungi un membro', description: 'Nella pagina Staff, clicca "Aggiungi membro". Inserisci nome, email (opzionale), telefono e ruolo. Scegli un colore che lo identifichi nel calendario.' },
      { title: 'Assegna i servizi', description: 'Dal menu del membro, scegli "Gestisci servizi" e seleziona quali servizi può eseguire. Questo influenza la compatibilità nella creazione appuntamenti.' },
      { title: 'Configura gli orari', description: 'Dal menu "Gestisci orari", scegli se usare gli orari del salone o impostare orari personalizzati per ogni giorno della settimana.' },
      { title: 'Invita a registrarsi', description: 'Se il membro ha un\'email, puoi generare un QR code o un link di invito. Una volta registrato, potrà accedere alla sua area personale.' },
      { title: 'Attiva/Disattiva', description: 'Puoi disattivare temporaneamente un membro (ferie, malattia) senza eliminarlo. Non apparirà nel calendario ma i suoi dati saranno conservati.' },
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
    description: 'QR code, link e prenotazioni online',
    icon: Smartphone,
    colorClasses: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    steps: [
      { title: 'Il tuo link dedicato', description: 'Il tuo salone ha un URL unico basato sullo slug scelto durante il setup. Questo link porta i clienti direttamente alla tua app di prenotazione.' },
      { title: 'QR code', description: 'Dalla pagina dello staff o dalle Impostazioni puoi generare un QR code da stampare e mettere in vetrina, sui bigliettini da visita o sui social.' },
      { title: 'Condividi via WhatsApp', description: 'Copia il link e condividilo nelle chat WhatsApp con i tuoi clienti abituali. Potranno prenotare direttamente dal telefono.' },
      { title: 'Social media', description: 'Pubblica il link nei tuoi profili Instagram, Facebook o TikTok. Aggiungi il link nella bio e nelle storie per massima visibilità.' },
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
}: AiutoContentProps) {

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
        description="FAQ, guide e supporto per il tuo salone"
      />

      <div className="mt-6 pb-8">
        <HelpPage
          faqItems={BEAUTY_FAQ}
          guides={BEAUTY_GUIDES}
          userName={userName}
          userEmail={userEmail}
          businessName={businessName}
          onSubmitSupport={handleSubmitSupport}
        />
      </div>
    </div>
  );
}