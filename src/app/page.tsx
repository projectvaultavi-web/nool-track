import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.logo}>
            <h1>Nool Track</h1>
            <span className={styles.logoDot}></span>
          </div>
          
          <h2 className={styles.tagline}>The operating system for textile job-work management</h2>
          
          <ul className={styles.valueProp}>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Track production in real-time
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Monitor wastage & quality
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Manage contractor payments
            </li>
          </ul>

          <div className={styles.actions}>
            <Link href="/signup">
              <Button size="lg" variant="primary" className={styles.btn}>Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className={styles.btn}>Login</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
