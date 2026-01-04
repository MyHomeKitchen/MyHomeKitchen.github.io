import { useTranslation } from 'react-i18next';
import { Home, Info, Mail } from 'lucide-react';

export function Navigation() {
    const { t } = useTranslation();

    return (
        <nav style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            marginBottom: '1rem'
        }}>
            {/* Home - Current page (active) */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: 600
                }}
            >
                <Home size={18} />
                <span>{t('Home') || 'Home'}</span>
            </div>

            {/* About - Link to about.html */}
            <a
                href="about.html"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    transition: 'all 0.2s ease'
                }}
                className="nav-link"
            >
                <Info size={18} />
                <span>{t('About') || 'About'}</span>
            </a>

            {/* Contact - Link to contact.html */}
            <a
                href="contact.html"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                    transition: 'all 0.2s ease'
                }}
                className="nav-link"
            >
                <Mail size={18} />
                <span>{t('Contact') || 'Contact'}</span>
            </a>

            <style>{`
                .nav-link:hover {
                    background-color: var(--bg-surface);
                }
            `}</style>
        </nav>
    );
}
