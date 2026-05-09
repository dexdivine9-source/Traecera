import React, { useMemo } from 'react';
import {
  Home,
  Compass,
  Trophy,
  CreditCard,
  TrendingUp,
  Gamepad2,
  Server,
  ShieldCheck,
  Landmark,
  BarChart3,
  Palette,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  Flame,
} from 'lucide-react';
import type { Project } from '../data/projects';
import { motion, AnimatePresence } from 'motion/react';

// ─── Category Definitions ───
export interface CategoryDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  dataValue: string; // The actual value to filter by in `projects`
}

const CATEGORY_ICON_SIZE = 18;

export const CATEGORIES: CategoryDef[] = [
  { id: 'all',             label: 'All Projects',   icon: <Layers size={CATEGORY_ICON_SIZE} />,      dataValue: 'All' },
  { id: 'payments',        label: 'Payments',        icon: <CreditCard size={CATEGORY_ICON_SIZE} />,  dataValue: 'Payments' },
  { id: 'defi',            label: 'DeFi',            icon: <TrendingUp size={CATEGORY_ICON_SIZE} />,  dataValue: 'DeFi' },
  { id: 'gaming',          label: 'Gaming',          icon: <Gamepad2 size={CATEGORY_ICON_SIZE} />,    dataValue: 'Gaming' },
  { id: 'infrastructure',  label: 'Infrastructure',  icon: <Server size={CATEGORY_ICON_SIZE} />,      dataValue: 'Infrastructure' },
  { id: 'rwa',             label: 'RWAs',            icon: <Landmark size={CATEGORY_ICON_SIZE} />,    dataValue: 'RWA' },
  { id: 'prediction',      label: 'Prediction Mkts', icon: <BarChart3 size={CATEGORY_ICON_SIZE} />,   dataValue: 'Prediction Markets' },
];

// ─── Sidebar Props ───
interface SidebarProps {
  projects: Project[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onNavigate: (view: 'home' | 'leaderboard') => void;
  activeView: string;
  onSignup: () => void;
}

// ─── Helper: compute project counts per category ───
function useCategoryCounts(projects: Project[]) {
  return useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    for (const proj of projects) {
      counts[proj.category] = (counts[proj.category] || 0) + 1;
    }
    return counts;
  }, [projects]);
}

// ─── Helper: determine which categories are "trending" ───
function useTrendingCategories(projects: Project[]): Set<string> {
  return useMemo(() => {
    // A category is trending if its average growth > 40%
    const catGrowth: Record<string, { sum: number; count: number }> = {};
    for (const proj of projects) {
      if (!catGrowth[proj.category]) catGrowth[proj.category] = { sum: 0, count: 0 };
      catGrowth[proj.category].sum += proj.metrics.growth_percent;
      catGrowth[proj.category].count += 1;
    }
    const trending = new Set<string>();
    for (const [cat, data] of Object.entries(catGrowth)) {
      if (data.sum / data.count > 40) trending.add(cat);
    }
    return trending;
  }, [projects]);
}

// ─── Main Sidebar Component ───
export default function Sidebar({
  projects,
  activeCategory,
  onCategoryChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onNavigate,
  activeView,
  onSignup,
}: SidebarProps) {
  const counts = useCategoryCounts(projects);
  const trendingCats = useTrendingCategories(projects);

  const navLinks = [
    { id: 'home', label: 'Home', icon: <Home size={CATEGORY_ICON_SIZE} />, action: () => onNavigate('home') },
    { id: 'leaderboard', label: 'Explore', icon: <Compass size={CATEGORY_ICON_SIZE} />, action: () => onNavigate('leaderboard') },
    { id: 'rankings', label: 'Rankings', icon: <Trophy size={CATEGORY_ICON_SIZE} />, action: () => onNavigate('leaderboard') },
  ];

  const sidebarContent = (
    <div className="sidebar-inner">
      {/* ─── Logo / Brand ─── */}
      <div className="sidebar-header">
        <div className="sidebar-logo-row">
          <img src="/logo.png" alt="Træcera" className="sidebar-logo-img" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="sidebar-logo-text"
              >
                TRÆCERA
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop collapse button */}
        <button
          className="sidebar-collapse-btn desktop-only"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile close button */}
        <button
          className="sidebar-collapse-btn mobile-only"
          onClick={onMobileClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* ─── Primary Navigation ─── */}
      <nav className="sidebar-nav-section">
        {!collapsed && <div className="sidebar-section-label">Navigation</div>}
        <ul className="sidebar-nav-list">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                className={`sidebar-nav-item ${activeView === link.id ? 'active' : ''}`}
                onClick={() => { link.action(); if (mobileOpen) onMobileClose(); }}
                title={collapsed ? link.label : undefined}
              >
                <span className="sidebar-nav-icon">{link.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="sidebar-nav-label"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── Divider ─── */}
      <div className="sidebar-divider" />

      {/* ─── Category Filters ─── */}
      <nav className="sidebar-nav-section sidebar-categories">
        {!collapsed && <div className="sidebar-section-label">Categories</div>}
        <ul className="sidebar-nav-list">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.dataValue;
            const isTrending = trendingCats.has(cat.dataValue);
            const count = counts[cat.dataValue] || 0;

            return (
              <li key={cat.id}>
                <button
                  className={`sidebar-nav-item sidebar-cat-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange(cat.dataValue);
                    // Auto-navigate to leaderboard when selecting a category
                    if (activeView !== 'leaderboard') onNavigate('leaderboard');
                    if (mobileOpen) onMobileClose();
                  }}
                  title={collapsed ? `${cat.label} (${count})` : undefined}
                >
                  <span className={`sidebar-nav-icon ${isActive ? 'icon-active' : ''}`}>{cat.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="sidebar-nav-label"
                      >
                        {cat.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Right side: count + trending */}
                  {!collapsed && (
                    <span className="sidebar-cat-meta">
                      {isTrending && cat.dataValue !== 'All' && (
                        <span className="sidebar-trending-badge" title="Trending category">
                          <Flame size={12} />
                        </span>
                      )}
                      <span className={`sidebar-cat-count ${isActive ? 'count-active' : ''}`}>
                        {count}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ─── Bottom / Footer ─── */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!collapsed && (
          <div className="sidebar-footer-content">
            <div className="sidebar-live-badge">
              <span className="sidebar-live-dot" />
              <span className="sidebar-live-text">Live Data</span>
            </div>
          </div>
        )}
        
        {/* Unified Sign Up CTA */}
        {!collapsed && (
          <button 
            className="sidebar-cta-btn"
            onClick={() => {
              onSignup();
              if (mobileOpen) onMobileClose();
            }}
          >
            Sign In / Subscribe
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
