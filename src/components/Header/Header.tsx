import styles from '../../App.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <span className={styles.headerIcon} role="img" aria-label="Tasks">📝</span>
      Task Manager
    </div>
  );
};

export default Header;