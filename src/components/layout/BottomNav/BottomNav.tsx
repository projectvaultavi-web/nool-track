'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

function IconHome() {
  return <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />;
}
function IconClipboard() {
  return (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  );
}
function IconWallet() {
  return (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </>
  );
}
function IconUsers() {
  return (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  );
}
function IconChart() {
  return (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </>
  );
}
function IconSettings() {
  return (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  );
}

interface TabItem {
  name: string;
  path: string;
  Icon: () => React.JSX.Element;
}

interface MoreLinkItem {
  name: string;
  path: string;
  Icon: () => React.JSX.Element;
}

const TABS: TabItem[] = [
  { name: 'Home', path: '/dashboard', Icon: IconHome },
  { name: 'Orders', path: '/orders', Icon: IconClipboard },
  { name: 'Payments', path: '/payments', Icon: IconWallet },
];

const MORE_LINKS: MoreLinkItem[] = [
  { name: 'Contractors', path: '/contractors', Icon: IconUsers },
  { name: 'Reports', path: '/reports', Icon: IconChart },
  { name: 'Settings', path: '/settings', Icon: IconSettings },
];

export function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const currentPath = usePathname();

  return (
    <>
      {showMore && (
        <div className={styles.bottomSheetOverlay} onClick={() => setShowMore(false)}>
          <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.bottomSheetHeader}>
              <h3>More</h3>
              <button onClick={() => setShowMore(false)} aria-label="Close menu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.bottomSheetContent}>
              {MORE_LINKS.map(link => (
                <Link key={link.name} href={link.path} className={styles.sheetLink} onClick={() => setShowMore(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <link.Icon />
                  </svg>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className={styles.bottomNav}>
        {TABS.map((tab, index) => (
          <span key={tab.name}>
            {index === 1 && (
              <>
                <Link href={tab.path} className={`${styles.tab} ${currentPath.startsWith(tab.path) ? styles.active : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <tab.Icon />
                  </svg>
                  <span>{tab.name}</span>
                </Link>
                <Link href="/jobs/new" className={styles.fabContainer}>
                  <div className={styles.fab}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </Link>
              </>
            )}
            {index !== 1 && (
              <Link href={tab.path} className={`${styles.tab} ${currentPath.startsWith(tab.path) ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <tab.Icon />
                </svg>
                <span>{tab.name}</span>
              </Link>
            )}
          </span>
        ))}

        <button className={`${styles.tab} ${showMore ? styles.active : ''}`} onClick={() => setShowMore(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
