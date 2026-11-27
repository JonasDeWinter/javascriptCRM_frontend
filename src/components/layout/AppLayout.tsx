import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import { CrmPage } from '../../types/crm';
import { useCompanyData } from '../../hooks/CompanyHooks';
import { useContactData } from '../../hooks/ContactHooks';

interface AppLayoutProps {
  activePage: CrmPage;
  onNavigate: (page: CrmPage) => void;
  pageTitle: string;
  search: string;
  onSearchChange: (value: string) => void;
  username: string;
  onLogout: () => void;
  children: React.ReactNode;
}

function AppLayout({
  activePage,
  onNavigate,
  pageTitle,
  search,
  onSearchChange,
  username,
  onLogout,
  children,
}: AppLayoutProps) {
  const contactCount = useContactData().length;
  const companyCount = useCompanyData().length;


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/contacts">
          <span className="brand__mark"><span /><span /><span /><span /></span>
          <span className="brand__name">orbit<span>crm</span></span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-switcher__logo">S</span>
          <span className="workspace-switcher__copy">
            <strong>Studio North</strong>
            <small>Free plan</small>
          </span>
          <span className="workspace-switcher__chevron"><Icon name="chevron" size={16} /></span>
        </div>
        <div className="sidebar__section-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={`nav-item ${activePage === CrmPage.Contacts ? 'nav-item--active' : ''}`}
            aria-current={activePage === CrmPage.Contacts ? 'page' : undefined}
            onClick={() => onNavigate(CrmPage.Contacts)}
            type="button"
          >
            <Icon name="users" size={19} /><span>Contacts</span><span className="nav-count">{contactCount}</span>
          </button>
          <button
            className={`nav-item ${activePage === CrmPage.Companies ? 'nav-item--active' : ''}`}
            aria-current={activePage === CrmPage.Companies ? 'page' : undefined}
            onClick={() => onNavigate(CrmPage.Companies)}
            type="button"
          >
            <Icon name="building" size={19} /><span>Companies</span><span className="nav-count">{companyCount}</span>
          </button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="upgrade-card">
          <span className="upgrade-card__icon"><Icon name="spark" size={17} /></span>
          <strong>Make more of Orbit</strong>
          <p>Upgrade to unlock automations and more.</p>
          <button type="button">Explore plans <Icon name="arrow" size={14} /></button>
        </div>
        <button className="profile" type="button">
          <Avatar name={username} size="medium" />
          <span className="profile__copy"><strong>{username}</strong><small>Signed in</small></span>
          <Icon name="more" size={20} />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar__breadcrumb"><span>Workspace</span><Icon name="chevron" size={15} /><strong>{pageTitle}</strong></div>
          <div className="topbar__actions">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input
                aria-label={`Search ${pageTitle.toLowerCase()}`}
                placeholder="Search anything..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" type="button" aria-label="Notifications">
              <span className="notification-dot" /><span className="bell-glyph">♧</span>
            </button>
            <span className="auth-username">{username}</span>
            <button className="button button--secondary button--compact" type="button" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;
