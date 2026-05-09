import React, { useMemo, useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';

const CATEGORY_ICON_SIZE = 18;

// Fallback icon mapper for dynamic categories
function getCategoryIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('payment')) return <CreditCard size={CATEGORY_ICON_SIZE} />;
  if (c.includes('defi')) return <TrendingUp size={CATEGORY_ICON_SIZE} />;
  if (c.includes('gam')) return <Gamepad2 size={CATEGORY_ICON_SIZE} />;
  if (c.includes('infra')) return <Server size={CATEGORY_ICON_SIZE} />;
  if (c.includes('rwa')) return <Landmark size={CATEGORY_ICON_SIZE} />;
  if (c.includes('predict') || c.includes('analytic')) return <BarChart3 size={CATEGORY_ICON_SIZE} />;
  if (c.includes('security')) return <ShieldCheck size={CATEGORY_ICON_SIZE} />;
  if (c.includes('social') || c.includes('creator')) return <Flame size={CATEGORY_ICON_SIZE} />;
  if (c.includes('gateway')) return <Layers size={CATEGORY_ICON_SIZE} />;
  return <Compass size={CATEGORY_ICON_SIZE} />;
}

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
  const trendingCats = useTrendingCategories(projects);

  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; label: string; dataValue: string; count: number }[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data: categories } = await supabase
        .from('projects')
        .select('category')
        .order('category');

      if (categories) {
        // Group and count dynamically
        const counts: Record<string, number> = {};
        for (const row of categories) {
          const cat = row.category;
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        }

        // Show only categories that actually have projects
        const validCats = Object.entries(counts)
          .filter(([_, count]) => count > 0)
          .map(([cat, count]) => ({
            id: cat.toLowerCase().replace(/\s+/g, '-'),
            label: cat,
            dataValue: cat,
            count
          }));
        
        setDynamicCategories(validCats);
      }
    }
    fetchCategories();
  }, []);

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
          {/* Always show "All Projects" at the top */}
          <li key="all">
            <button
              className={`sidebar-nav-item sidebar-cat-item ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => {
                onCategoryChange('All');
                if (activeView !== 'leaderboard') onNavigate('leaderboard');
                if (mobileOpen) onMobileClose();
              }}
              title={collapsed ? `All Projects (${projects.length})` : undefined}
            >
              <span className={`sidebar-nav-icon ${activeCategory === 'All' ? 'icon-active' : ''}`}><Layers size={CATEGORY_ICON_SIZE} /></span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="sidebar-nav-label"
                  >
                    All Projects
                  </motion.span>
                )}
              </AnimatePresence>

              {!collapsed && (
                <span className="sidebar-cat-meta">
                  <span className={`sidebar-cat-count ${activeCategory === 'All' ? 'count-active' : ''}`}>
                    {projects.length}
                  </span>
                </span>
              )}
            </button>
          </li>

          {dynamicCategories.map((cat) => {
            const isActive = activeCategory === cat.dataValue;
            const isTrending = trendingCats.has(cat.dataValue);

            return (
              <li key={cat.id}>
                <button
                  className={`sidebar-nav-item sidebar-cat-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onCategoryChange(cat.dataValue);
                    if (activeView !== 'leaderboard') onNavigate('leaderboard');
                    if (mobileOpen) onMobileClose();
                  }}
                  title={collapsed ? `${cat.label} (${cat.count})` : undefined}
                >
                  <span className={`sidebar-nav-icon ${isActive ? 'icon-active' : ''}`}>{getCategoryIcon(cat.label)}</span>
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
                      {isTrending && (
                        <span className="sidebar-trending-badge" title="Trending category">
                          <Flame size={12} />
                        </span>
                      )}
                      <span className={`sidebar-cat-count ${isActive ? 'count-active' : ''}`}>
                        {cat.count}
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
