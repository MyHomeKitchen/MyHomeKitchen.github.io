import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
                value={i18n.language}
                onChange={changeLanguage}
                className="language-select"
                style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                }}
            >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="bn">বাংলা (Bengali)</option>
            </select>
            <button
                onClick={toggleTheme}
                className="btn btn-icon"
                aria-label={theme === 'light' ? t('theme_dark') : t('theme_light')}
                title={theme === 'light' ? t('theme_dark') : t('theme_light')}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </div>
    );
}
