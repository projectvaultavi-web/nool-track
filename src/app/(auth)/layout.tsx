import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.logoText}>Nool Track</span>
        <span className={styles.logoDot}></span>
      </div>
      <div className={styles.card}>
        {children}
      </div>
    </div>
  );
}
