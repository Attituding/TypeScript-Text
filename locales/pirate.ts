import * as en from './en-us.json';
import { nestedIterate } from '../src/util/utility';
import { Locale } from '../src/@types/locales';

const translate = {
    and: "'n",
    are: 'be',
    before: 'afore',
    find: 'come across',
    for: 'fer',
    have: "'ave",
    hello: 'ahoy',
    however: "howe'ver",
    is: 'be',
    just: "jus'",
    my: 'me',
    of: "o'",
    remove: 'scuttle',
    to: "t'",
    want: 'wants',
    with: "wit'",
    you: 'ye',
    your: 'yer',
};

export default nestedIterate(en, input => {
    if (typeof input === 'string') {
        return input
            .split(' ')
            .map(value => {
                const translated =
                    translate[
                        value
                            .match(/(\w+)/gi)?.[0]
                            ?.toLowerCase() as keyof typeof translate
                    ] ?? value;
                if (value.charAt(0).toUpperCase() === value.charAt(0)) {
                    return (
                        translated.charAt(0).toUpperCase() + translated.slice(1)
                    );
                }
                return translated;
            })
            .join(' ')
            .replaceAll(/(\w+ing)/gi, "in'");
            ///((ing[.!?; ])|(ing$))/gi
    }

    return input;
}) as Locale;
