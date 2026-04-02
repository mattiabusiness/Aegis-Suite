// ============================================================================
// AEGIS SUITE - CUSTOMER NAVIGATION
// File: packages/ui/src/components/customer/CustomerNav.tsx
//
//   <BottomNav>     — mobile only (lg:hidden), fixed bottom
//                    circular notch on TOP edge, bubble pops UP
//
//   <DesktopHeader> — desktop only (hidden lg:block), fixed top
//                    circular notch on BOTTOM edge, bubble pops DOWN
// ============================================================================

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Scissors, User, type LucideIcon } from 'lucide-react';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// SHARED — NAV ITEMS
// ============================================================================

interface NavItem { id: string; label: string; icon: LucideIcon; subpath: string | null; }

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    label: 'Home',    icon: Home,    subpath: null },
  { id: 'prenota', label: 'Prenota', icon: Scissors, subpath: 'prenota' },
  { id: 'account', label: 'Account', icon: User,     subpath: 'account' },
];

// ============================================================================
// SHARED — THEME GRADIENT COLORS
// ============================================================================

const THEME_GRADIENT: Record<string, [string, string]> = {
  beauty: ['#7c3aed', '#3b0764'],
  sport:  ['#059669', '#064e3b'],
  health: ['#0284c7', '#0c4a6e'],
  home:   ['#d97706', '#78350f'],
  law:    ['#374151', '#111827'],
  book:   ['#4f46e5', '#1e1b4b'],
};

// Page background — used as box-shadow ring to create visual gap between bubble and notch.
const PAGE_BG = '#f9f8fd';

// ============================================================================
// SHARED — SPRING CONFIG
// ============================================================================

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 32, mass: 0.85 };

// Visual gap between bubble edge and notch rim (filled by PAGE_BG box-shadow ring).
const GAP = 8;

// ============================================================================
// SHARED — PATH BUILDERS
//
// Both use k=0.5523 bezier approximation of a circular arc, so the notch
// wraps the bubble in a perfect circle with uniform GAP on all sides.
//
// buildTopNotchPath    → notch cuts DOWN from top edge   (BottomNav)
// buildBottomNotchPath → notch cuts UP from bottom edge  (DesktopHeader)
// ============================================================================

// k = 4/3 * tan(π/8) — bezier magic number for quarter-circle approximation
const K = 0.5523;

function buildTopNotchPath(
  cx: number, W: number, H: number,
  half: number, depth: number, cornerR: number,
): string {
  const nl = Math.max(cornerR + 4, cx - half);
  const nr = Math.min(W - cornerR - 4, cx + half);
  return [
    `M ${cornerR},0`,
    `L ${nl},0`,
    `C ${nl},${depth * K} ${cx - depth * K},${depth} ${cx},${depth}`,
    `C ${cx + depth * K},${depth} ${nr},${depth * K} ${nr},0`,
    `L ${W - cornerR},0`,
    `Q ${W},0 ${W},${cornerR}`,
    `L ${W},${H}`,
    `L 0,${H}`,
    `L 0,${cornerR}`,
    `Q 0,0 ${cornerR},0`,
    `Z`,
  ].join(' ');
}

function buildBottomNotchPath(
  cx: number, W: number, H: number,
  half: number, depth: number,
): string {
  const nl = Math.max(4, cx - half);
  const nr = Math.min(W - 4, cx + half);
  return [
    `M 0,0`,
    `L ${W},0`,
    `L ${W},${H}`,
    `L ${nr},${H}`,
    `C ${nr},${H - depth * K} ${cx + depth * K},${H - depth} ${cx},${H - depth}`,
    `C ${cx - depth * K},${H - depth} ${nl},${H - depth * K} ${nl},${H}`,
    `L 0,${H}`,
    `Z`,
  ].join(' ');
}

// ============================================================================
// SHARED — FLOATING BUBBLE
//
// The box-shadow `0 0 0 GAP px PAGE_BG` creates a solid ring of page-background
// color around the bubble. This ring fills the space between the bubble and the
// notch rim, giving a clean floating appearance without any backdrop div.
//
// flyDir:  1 → icon arrives from below  (mobile)
//         -1 → icon arrives from above  (desktop)
// ============================================================================

function Bubble({ x, top, size, icon: Icon, glowColor, iconKey, flyDir = 1 }: {
  x:          number;
  top:        number;
  size:       number;
  icon:       LucideIcon;
  glowColor:  string;
  iconKey:    number;
  flyDir?:    1 | -1;
}) {
  const dy = 14 * flyDir;
  return (
    <motion.div
      aria-hidden="true"
      animate={{ x }}
      transition={SPRING}
      style={{
        position:             'absolute',
        top,
        left:                 0,
        width:                size,
        height:               size,
        borderRadius:         '50%',
        background:           `radial-gradient(circle at 35% 35%, ${glowColor}55 0%, ${glowColor}22 100%)`,
        backdropFilter:       'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border:               `1.5px solid ${glowColor}cc`,
        // First shadow layer = PAGE_BG ring that creates the visible gap from the notch
        boxShadow:            `0 0 0 ${GAP}px ${PAGE_BG}, 0 8px 28px rgba(0,0,0,0.3), 0 0 40px ${glowColor}cc, 0 0 24px ${glowColor}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
        zIndex:               20,
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'center',
        pointerEvents:        'none',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={iconKey}
          initial={{ scale: 0.35, opacity: 0, y: dy }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.35, opacity: 0, y: -dy }}
          transition={{ type: 'spring', stiffness: 480, damping: 32 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon style={{
            width:  size * 0.4,
            height: size * 0.4,
            color:  '#fff',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.35))',
          }} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// SHARED — HOOK: active index + nav width measurement
// ============================================================================

function useNav(basePath: string, currentPath: string) {
  const activeIndex = React.useMemo(() => {
    if (currentPath.startsWith(`${basePath}/prenota`)) return 1;
    if (currentPath.startsWith(`${basePath}/account`)) return 2;
    return 0;
  }, [currentPath, basePath]);

  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(375);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.offsetWidth);
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { activeIndex, ref, width };
}

// ============================================================================
// SHARED — SVG BACKGROUND
// ============================================================================

function NavSvg({ path, width, height, gradId, gradFrom, gradTo }: {
  path:     string;
  width:    number;
  height:   number;
  gradId:   string;
  gradFrom: string;
  gradTo:   string;
}) {
  return (
    <svg
      width="100%"
      height={height}
      style={{ position: 'absolute', inset: 0, display: 'block' }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={gradFrom} />
          <stop offset="100%" stopColor={gradTo} />
        </linearGradient>
      </defs>
      <motion.path
        d={path}
        fill={`url(#${gradId})`}
        animate={{ d: path }}
        transition={SPRING}
      />
    </svg>
  );
}

// ============================================================================
// BOTTOM NAV (mobile — lg:hidden)
//
// Bubble center sits at the nav top edge (y=0).
// Notch radius = bubbleR + GAP = 28+8 = 36 → wraps bubble+ring perfectly.
// ============================================================================

export interface BottomNavProps {
  businessSlug: string;
  currentPath:  string;
  theme:        DashboardTheme;
  onNavigate?:  (href: string) => void;
}

const BN_R    = 28;              // bubble radius  (bubbleD / 2)
const BN_NOTCH = BN_R + GAP;    // = 36 — notch radius traces bubble+ring circle
const BN = {
  h:        70,
  bubbleD:  BN_R * 2,           // = 56
  bubbleTop: -BN_R,             // = -28 → bubble center at y=0 (nav top edge)
  half:     BN_NOTCH,           // = 36 → notch enters at cx±36 on the nav top edge
  depth:    BN_NOTCH,           // = 36 → notch bottom at y=36
  cornerR:  24,
};

export function BottomNav({ businessSlug, currentPath, theme, onNavigate }: BottomNavProps) {
  const basePath = `/${businessSlug}`;
  const { activeIndex, ref, width } = useNav(basePath, currentPath);

  const bubbleCX         = [width / 6, width / 2, (width * 5) / 6];
  const cx               = bubbleCX[activeIndex];
  const path             = buildTopNotchPath(cx, width, BN.h, BN.half, BN.depth, BN.cornerR);
  const [gFrom, gTo]     = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (onNavigate) { e.preventDefault(); onNavigate(href); }
  }

  return (
    <div
      ref={ref}
      className="lg:hidden fixed bottom-0 left-0 right-0"
      style={{
        height:     `calc(${BN.h}px + env(safe-area-inset-bottom, 0px))`,
        background: gTo,   // fills iPhone home-bar safe area below the SVG
        zIndex:     50,
        overflow:   'visible',
      }}
    >
      <NavSvg path={path} width={width} height={BN.h} gradId="bn-grad" gradFrom={gFrom} gradTo={gTo} />

      <Bubble
        x={cx - BN.bubbleD / 2}
        top={BN.bubbleTop}
        size={BN.bubbleD}
        icon={NAV_ITEMS[activeIndex].icon}
        glowColor={gFrom}
        iconKey={activeIndex}
        flyDir={1}
      />

      {/* Nav items — height=BN.h so they don't extend into the safe-area fill */}
      <div style={{ display: 'flex', height: BN.h, position: 'relative', zIndex: 10 }}>
        {NAV_ITEMS.map((item, i) => {
          const href     = item.subpath ? `${basePath}/${item.subpath}` : basePath;
          const isActive = i === activeIndex;
          const Icon     = item.icon;
          return (
            <a
              key={item.id}
              href={href}
              onClick={(e) => handleClick(e, href)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <AnimatePresence initial={false}>
                {!isActive && (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.75, y: 8 }}
                    animate={{ opacity: 1, scale: 1,    y: 0 }}
                    exit={{   opacity: 0, scale: 0.6,   y: -14 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  >
                    <Icon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.78)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.62)', letterSpacing: '0.02em', lineHeight: 1 }}>
                      {item.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// AEGIS LOGO (desktop header only)
// ============================================================================

function AegisLogo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size, height: size, color: '#fff' }}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

// ============================================================================
// DESKTOP HEADER (hidden lg:block)
//
// Bubble center sits at the header bottom edge (y=DH.h).
// Notch radius = bubbleR + GAP = 28+8 = 36 → wraps bubble+ring perfectly.
// ============================================================================

export interface DesktopHeaderProps {
  business:    { slug: string; name: string; logo_url: string | null };
  currentPath: string;
  theme:       DashboardTheme;
  onNavigate?: (href: string) => void;
  brandLabel?: string;
}

const DH_R      = 28;              // bubble radius
const DH_NOTCH  = DH_R + GAP;     // = 36
const DH = {
  h:       68,
  bubbleD: DH_R * 2,              // = 56
  half:    DH_NOTCH,              // = 36
  depth:   DH_NOTCH,              // = 36 → notch rises to y=68-36=32
};
// Bubble center at header bottom (y=68). Bubble top at y=68-28=40, bottom at y=96 (28px below).
const DH_BUBBLE_TOP      = DH.h - DH_R;           // = 40
const DH_BUBBLE_OVERFLOW = DH_BUBBLE_TOP + DH.bubbleD - DH.h; // = 28

export function DesktopHeader({ business, currentPath, theme, onNavigate, brandLabel = 'Aegis Beauty' }: DesktopHeaderProps) {
  const basePath = `/${business.slug}`;
  const { activeIndex, ref, width } = useNav(basePath, currentPath);

  const navLeft    = (width - 300) / 2;
  const tabCenters = [navLeft + 50, navLeft + 150, navLeft + 250];
  const cx         = tabCenters[activeIndex];
  const path       = buildBottomNotchPath(cx, width, DH.h, DH.half, DH.depth);
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (onNavigate) { e.preventDefault(); onNavigate(href); }
  }

  return (
    <div
      ref={ref}
      className="hidden lg:block fixed top-0 left-0 right-0 z-30"
      style={{ height: DH.h, overflow: 'visible' }}
    >
      <NavSvg
        path={path} width={width} height={DH.h}
        gradId="dh-grad"
        gradFrom={gFrom}
        gradTo={gTo}
      />

      {/* Fill the 28px gap between gradient bottom and content start — prevents body-white showing through */}
      <div style={{
        position:  'absolute',
        top:       DH.h,
        left:      0,
        right:     0,
        height:    DH_BUBBLE_OVERFLOW,
        background: gTo,
        zIndex:    4,
      }} />

      <Bubble
        x={cx - DH.bubbleD / 2}
        top={DH_BUBBLE_TOP}
        size={DH.bubbleD}
        icon={NAV_ITEMS[activeIndex].icon}
        glowColor={gFrom}
        iconKey={activeIndex}
        flyDir={-1}
      />

      {/* Header content row */}
      <div style={{ position: 'relative', zIndex: 10, height: DH.h, display: 'flex', alignItems: 'center', paddingInline: 40 }}>

        {/* Left: business brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} width={36} height={36}
              style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
            {business.name}
          </span>
        </div>

        {/* Center: 300px nav items */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex' }}>
          {NAV_ITEMS.map((item, i) => {
            const href     = item.subpath ? `${basePath}/${item.subpath}` : basePath;
            const isActive = i === activeIndex;
            const Icon     = item.icon;
            return (
              <a
                key={item.id}
                href={href}
                onClick={(e) => handleClick(e, href)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: DH.h, textDecoration: 'none', position: 'relative',
                  WebkitTapHighlightColor: 'transparent', userSelect: 'none',
                  overflow: 'hidden',
                }}
              >
                <AnimatePresence initial={false}>
                  {!isActive && (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.75, y: -8 }}
                      animate={{ opacity: 1, scale: 1,    y: 0 }}
                      exit={{   opacity: 0, scale: 0.6,   y: 14 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <Icon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.78)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'rgba(255,255,255,0.68)', letterSpacing: '0.01em' }}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </a>
            );
          })}
        </div>

        {/* Right: Aegis brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <AegisLogo size={17} />
          </div>
          <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', opacity: 0.9, fontFamily: "var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)" }}>
            {brandLabel}
          </span>
        </div>

      </div>
    </div>
  );
}

// Re-export for tree-shaking friendliness
export { DH_BUBBLE_OVERFLOW };
