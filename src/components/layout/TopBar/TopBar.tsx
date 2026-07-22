import styles from './TopBar.module.css';

interface User {
  name: string;
  email: string;
}

interface TopBarProps {
  title: string;
  user: User;
}

export function TopBar({ title, user }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.mobileLeft}>
        <div className={styles.logoDot}></div>
      </div>
      
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.desktopCenter}>
        <div className={styles.searchBar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search..." readOnly />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
        </div>
        <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
      </div>
    </header>
  );
}
