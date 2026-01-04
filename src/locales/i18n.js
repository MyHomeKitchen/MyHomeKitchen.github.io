import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import te from './te.json';
import mr from './mr.json';
import gu from './gu.json';
import ta from './ta.json';
import kn from './kn.json';
import bn from './bn.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            te: { translation: te },
            mr: { translation: mr },
            gu: { translation: gu },
            ta: { translation: ta },
            kn: { translation: kn },
            bn: { translation: bn }
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
