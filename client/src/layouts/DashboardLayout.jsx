import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Edit3,
  LayoutTemplate,
  Briefcase,
  Bookmark,
  Sparkles,
  Gauge,
  Compass,
  Send,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/dashboard/profile') return 'Master Profile (Source of Truth)';
    if (path === '/dashboard/resumes') return 'My Resumes';
    if (path.startsWith('/dashboard/builder')) return 'AI Resume Editor';
    if (path === '/dashboard/templates') return 'ATS-Friendly Templates';
    if (path.startsWith('/dashboard/optimizer')) return 'Optimize Resume for Role';
    if (path.startsWith('/dashboard/ats')) return 'ATS Compatibility Analyzer';
    if (path === '/dashboard/skill-gap') return 'Skill & Keyword Analysis';
    if (path === '/dashboard/settings') return 'Account & AI Settings';
    return 'Dashboard';
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.brand}>
          <NavLink to="/dashboard" className={styles.brandLink}>
            <div className={styles.brandIcon}>
              <FileText size={18} />
            </div>
            {!collapsed && <span>ResumeAI</span>}
          </NavLink>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px', border: 'none', background: 'transparent' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className={styles.navSection}>
          {/* Main Links */}
          <div className={styles.navGroup}>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <LayoutDashboard size={18} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </div>

          {/* My Resume Group */}
          <div className={styles.navGroup}>
            {!collapsed && <div className={styles.groupLabel}>My Resume</div>}
            <NavLink
              to="/dashboard/resumes"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <FileText size={18} />
              {!collapsed && <span>My Resumes</span>}
            </NavLink>
            <NavLink
              to="/dashboard/builder"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Edit3 size={18} />
              {!collapsed && <span>Resume Editor</span>}
            </NavLink>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <User size={18} />
              {!collapsed && <span>Master Profile</span>}
            </NavLink>
          </div>

          {/* Core ATS & Optimization Tools */}
          <div className={styles.navGroup}>
            {!collapsed && <div className={styles.groupLabel}>Optimization</div>}
            <NavLink
              to="/dashboard/ats"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Gauge size={18} />
              {!collapsed && <span>ATS Analyzer</span>}
            </NavLink>
            <NavLink
              to="/dashboard/optimizer"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Sparkles size={18} />
              {!collapsed && <span>Optimize for Role</span>}
            </NavLink>
            <NavLink
              to="/dashboard/skill-gap"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Compass size={18} />
              {!collapsed && <span>Skill & Keyword Analysis</span>}
            </NavLink>
            <NavLink
              to="/dashboard/templates"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <LayoutTemplate size={18} />
              {!collapsed && <span>Templates</span>}
            </NavLink>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <button onClick={handleLogout} className={styles.navItem} style={{ width: '100%', background: 'transparent' }}>
            <LogOut size={18} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${styles.mainWrapper} ${collapsed ? styles.mainWrapperCollapsed : ''}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          </div>

          <div className={styles.topbarRight}>
            <div className="badge badge-success" style={{ gap: '6px', padding: '4px 10px' }}>
              <ShieldCheck size={14} />
              <span>Anti-Fabrication Active</span>
            </div>

            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user?.name || 'Candidate'}</span>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
