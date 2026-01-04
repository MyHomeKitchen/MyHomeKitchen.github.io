import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-icon"
            aria-label={theme === 'light' ? t('theme_dark') : t('theme_light')}
            title={theme === 'light' ? t('theme_dark') : t('theme_light')}
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
