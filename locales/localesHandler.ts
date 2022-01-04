import type {
    Locale,
    Locales,
    LocaleTree,
    Parameters,
} from '../src/@types/locales';
import en from './en-us';
import fr from './fr-FR';

const locales: Locales = {
    'en-us': en,
    'fr-FR': fr,
};

export class RegionLocales {
    static locale(locale?: string): Locale {
        let locale2 = locale;
        if (!Object.keys(locales).includes(locale ?? 'en-us')) {
            locale2 = 'en-us';
        }

        const fetched: Locale = locales[locale2 as keyof Locales];
        return fetched;
    }

    static replace(input: string, parameters?: Parameters): string {
        let replaced: string = input;
        for (const parameter in parameters) {
            //@ts-expect-error hasOwn not implemented in typings.
            if (Object.hasOwn(parameters, parameter)) {
                const regex = new RegExp(`%{${parameter}}%`, 'g');
                replaced = replaced.replaceAll(
                    regex,
                    String(parameters[parameter]),
                );
            }
        }

        return replaced;
    }

    static get(path: string, locale?: string): LocaleTree | string {
        const pathArray: string[] = path.split('.');
        let fetched: LocaleTree | string = (locales as Locales)[
            (locale ?? 'en-us') as keyof Locales
        ];
        for (const pathCommand of pathArray) {
            if (typeof fetched === 'string') {
                break;
            }

            fetched = fetched?.[pathCommand as keyof LocaleTree] as
                | LocaleTree
                | string;
        }

        return fetched;
    }
}
