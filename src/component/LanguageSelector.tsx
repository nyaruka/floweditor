import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { getBaseLanguage } from '.';
import { Config } from '../config';
import { Languages } from '../flowTypes';
import {
    DispatchWithState,
    ReduxState,
    updateLanguage,
    updateTranslating,
    UpdateLanguage,
    UpdateTranslating
} from '../redux';
import { jsonEqual } from '../utils';
import { languageSelector } from './LanguageSelector.scss';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    language: Language;
    languages: Languages;
    updateLanguageAC: (language: Language) => UpdateLanguage;
    updateTranslatingAC: (translating: boolean) => UpdateTranslating;
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
    updateLanguageAC,
    updateTranslatingAC
}) => {
    if (language) {
        const onChange = (lang: Language) => {
            const baseLanguage = getBaseLanguage(languages);
            const translating = !jsonEqual(baseLanguage, lang);
            updateLanguageAC(lang);
            updateTranslatingAC(translating);
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
    updateLanguageAC: (language: Language) => dispatch(updateLanguage(language)),
    updateTranslatingAC: (translating: boolean) => dispatch(updateTranslating(translating))
});

const ConnectedLanguageSelector = connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);

export default LanguageSelectorContainer;
