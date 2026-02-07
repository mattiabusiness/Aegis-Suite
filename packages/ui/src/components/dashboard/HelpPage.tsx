// ============================================================================
// AEGIS SUITE - HELP PAGE COMPONENT
// File: packages/ui/src/components/dashboard/HelpPage.tsx
// Reusable help/support page for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  X,
  Send,
  CheckCircle,
  Check,
  Search,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Bug,
  Sparkles,
  Key,
  CircleHelp,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface FAQItem {
  /** Unique id */
  id: string;
  /** Question text */
  question: string;
  /** Answer text (supports line breaks with \n) */
  answer: string;
  /** Icon for the question */
  icon?: LucideIcon;
  /** Category/tag */
  category?: string;
}

export interface GuideStep {
  title: string;
  description: string;
}

export interface GuideItem {
  /** Unique id */
  id: string;
  /** Guide title */
  title: string;
  /** Short description */
  description: string;
  /** Icon */
  icon: LucideIcon;
  /** Color classes (bg + text + border) */
  colorClasses: string;
  /** Steps of the guide */
  steps: GuideStep[];
}

export interface SupportCategory {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface HelpPageProps {
  /** FAQ items */
  faqItems: FAQItem[];
  /** Guide items */
  guides: GuideItem[];
  /** Support form categories */
  supportCategories?: SupportCategory[];
  /** User name (pre-filled, shown as info) */
  userName: string;
  /** User email (pre-filled, shown as info) */
  userEmail: string;
  /** Business name */
  businessName?: string;
  /** Callback when support form is submitted */
  onSubmitSupport?: (data: { category: string; message: string; userName: string; userEmail: string; businessName: string }) => Promise<void>;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// DEFAULT SUPPORT CATEGORIES
// ============================================================================

const DEFAULT_SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'bug', label: 'Problema tecnico', icon: Bug },
  { id: 'feature', label: 'Richiesta funzionalità', icon: Sparkles },
  { id: 'billing', label: 'Abbonamento e pagamenti', icon: CreditCard },
  { id: 'account', label: 'Account e accesso', icon: Key },
  { id: 'other', label: 'Altro', icon: CircleHelp },
];

// ============================================================================
// FAQ ACCORDION ITEM
// ============================================================================

function FAQAccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon || HelpCircle;

  return (
    <div className={`border rounded-xl transition-colors ${
      isOpen ? 'border-accent-200 bg-accent-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isOpen ? 'bg-accent-100 text-accent-600' : 'bg-gray-100 text-gray-500'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`flex-1 text-sm font-medium ${
          isOpen ? 'text-purple-900' : 'text-gray-900'
        }`}>
          {item.question}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-accent-500' : 'text-gray-400'
        }`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pl-[60px]">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GUIDE CARD
// ============================================================================

function GuideCard({ guide, onClick }: { guide: GuideItem; onClick: () => void }) {
  const Icon = guide.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-accent-200 hover:shadow-sm transition-all text-left group w-full"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${guide.colorClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-accent-700 transition-colors">
          {guide.title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">{guide.description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent-400 flex-shrink-0 mt-0.5 transition-colors" />
    </button>
  );
}

// ============================================================================
// GUIDE MODAL
// ============================================================================

function GuideModal({ guide, isOpen, onClose }: {
  guide: GuideItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !guide) return null;

  const Icon = guide.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${guide.colorClasses}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{guide.title}</h3>
              <p className="text-xs text-gray-500">{guide.steps.length} passaggi</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    {idx < guide.steps.length - 1 && (
                      <div className="w-px flex-1 bg-accent-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0">
            <Button onClick={onClose} variant="outline" className="w-full">
              Ho capito, grazie!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUPPORT FORM
// ============================================================================

function SupportForm({ 
  categories, 
  userName, 
  userEmail, 
  businessName,
  onSubmit,
}: {
  categories: SupportCategory[];
  userName: string;
  userEmail: string;
  businessName: string;
  onSubmit?: (data: { category: string; message: string; userName: string; userEmail: string; businessName: string }) => Promise<void>;
}) {
  const [category, setCategory] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = categories.find(c => c.id === category);

  const handleSubmit = async () => {
    if (!message.trim() || !category) return;
    setSending(true);
    try {
      if (onSubmit) {
        await onSubmit({ category, message, userName, userEmail, businessName });
      }
      setSent(true);
      setMessage('');
      setCategory('');
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error('Error submitting support:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="text-base font-semibold text-gray-900">Richiesta inviata!</h4>
          <p className="text-sm text-gray-500 mt-1">Ti risponderemo al più presto su <strong>{userEmail}</strong></p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User info (read-only) */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center">
              <span className="text-xs font-bold text-accent-600">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-gray-500">{userEmail}</p>
            </div>
          </div>

          {/* Category - Custom Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo di richiesta</label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
            >
              {selectedCategory ? (
                <span className="flex items-center gap-2 text-gray-900">
                  {selectedCategory.icon && <selectedCategory.icon className="w-4 h-4 text-accent-500" />}
                  {selectedCategory.label}
                </span>
              ) : (
                <span className="text-gray-400">Seleziona categoria...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {categories.map((cat, idx) => {
                  const CatIcon = cat.icon || HelpCircle;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setCategory(cat.id); setShowDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-accent-50 transition-colors ${
                        idx === 0 ? 'rounded-t-xl' : ''
                      } ${idx === categories.length - 1 ? 'rounded-b-xl' : ''}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <CatIcon className={`w-4 h-4 ${category === cat.id ? 'text-accent-600' : 'text-gray-400'}`} />
                        <span className="text-sm text-gray-900">{cat.label}</span>
                      </span>
                      {category === cat.id && (
                        <Check className="w-4 h-4 text-accent-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrivi il problema</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descrivi il problema o la tua richiesta in dettaglio..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            loading={sending}
            disabled={!message.trim() || !category}
            className="w-full flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Invia richiesta
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HelpPage({
  faqItems,
  guides,
  supportCategories,
  userName,
  userEmail,
  businessName = '',
  onSubmitSupport,
  className = '',
}: HelpPageProps) {
  const [openFaqId, setOpenFaqId] = React.useState<string | null>(null);
  const [faqSearch, setFaqSearch] = React.useState('');
  const [activeGuide, setActiveGuide] = React.useState<GuideItem | null>(null);

  const categories = supportCategories || DEFAULT_SUPPORT_CATEGORIES;

  // Filter FAQ by search
  const filteredFaq = React.useMemo(() => {
    if (!faqSearch.trim()) return faqItems;
    const search = faqSearch.toLowerCase();
    return faqItems.filter(item =>
      item.question.toLowerCase().includes(search) ||
      item.answer.toLowerCase().includes(search)
    );
  }, [faqItems, faqSearch]);

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  return (
    <div className={className}>
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: FAQ + Guides */}
        <div className="lg:col-span-2 space-y-8">

          {/* FAQ Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent-600" />
                <h2 className="text-lg font-bold text-gray-900">Domande frequenti</h2>
              </div>
              <span className="text-xs text-gray-400">{filteredFaq.length} risultati</span>
            </div>

            {/* FAQ Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca nelle FAQ..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white"
              />
            </div>

            {/* FAQ List */}
            <div className="space-y-2">
              {filteredFaq.length > 0 ? (
                filteredFaq.map(item => (
                  <FAQAccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openFaqId === item.id}
                    onToggle={() => toggleFaq(item.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Nessun risultato per "{faqSearch}"</p>
                </div>
              )}
            </div>
          </section>

          {/* Guides Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-accent-600" />
              <h2 className="text-lg font-bold text-gray-900">Guide rapide</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guides.map(guide => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onClick={() => setActiveGuide(guide)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right column: Support form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-accent-600" />
              <h2 className="text-lg font-bold text-gray-900">Contatta il supporto</h2>
            </div>
            <SupportForm
              categories={categories}
              userName={userName}
              userEmail={userEmail}
              businessName={businessName}
              onSubmit={onSubmitSupport}
            />
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <GuideModal
        guide={activeGuide}
        isOpen={!!activeGuide}
        onClose={() => setActiveGuide(null)}
      />
    </div>
  );
}