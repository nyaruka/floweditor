import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { getBaseLanguage } from '.';
import { Config } from '../config';
import { Languages } from '../flowTypes';
import { DispatchWithState, ReduxState, setLanguage, setTranslating } from '../redux';
import { jsonEqual } from '../utils';
import { languageSelector } from './LanguageSelector.scss';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    language: Language;
    languages: Languages;
    setLanguageAC: (language: Language) => void;
    setTranslatingAC: (translating: boolean) => void;
}

export const composeLanguageMap = (languages: Languages): Language[] =>
    Object.keys(languages).map(iso => ({
        name: languages[iso],
        iso
    }));

const LanguageSelectorContainer: React.SFC = () => (
    <Config
        render={({ languages }) =>
            // prettier-ignore
            <ConnectedLanguageSelector
                languages={languages}
            />
        }
    />
);

const LanguageSelector: React.SFC<LanguageSelectorProps> = ({
    language,
    languages,
    setLanguageAC,
    setTranslatingAC
}) => {
    if (language) {
        const onChange = (lang: Language) => {
            const baseLanguage = getBaseLanguage(languages);
            const translating = !jsonEqual(baseLanguage, lang);
            setLanguageAC(lang);
            setTranslatingAC(translating);
        };

        const options = composeLanguageMap(languages);

        return (
            <div className={`${languageSelector} select-small`}>
                <Select
                    data-spec="language-selector"
                    // Flow
                    value={language.iso}
                    onChange={onChange}
                    // LanguageSelector
                    valueKey="iso"
                    labelKey="name"
                    searchable={false}
                    clearable={false}
                    options={options}
                />
            </div>
        );
    }

    return null;
};

const mapStateToProps = ({ language }: ReduxState) => ({ language });

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    setLanguageAC: (language: Language) => dispatch(setLanguage(language)),
    setTranslatingAC: (translating: boolean) => dispatch(setTranslating(translating))
});

const ConnectedLanguageSelector = connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);

export default LanguageSelectorContainer;
