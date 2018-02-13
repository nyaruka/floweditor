import * as React from 'react';
import Select from 'react-select';
import { Languages, SetLanguage } from '../flowTypes';

import { languageSelector } from './LanguageSelector.scss';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    iso: string;
    languages: Languages;
    onChange: (language: Language) => void;
}

export const composeLanguageMap = (languages: Languages): Language[] =>
    Object.keys(languages).map(iso => ({
        name: languages[iso],
        iso
    }));

const LanguageSelectorComp: React.SFC<LanguageSelectorProps> = (
    props
): JSX.Element => {
    const className = `${languageSelector} select-small`;
    const options = composeLanguageMap(props.languages);
    return (
        <div className={className}>
            <Select
                data-spec="language-selector"
                value={props.iso}
                onChange={props.onChange}
                // LanguageSelector
                valueKey="iso"
                labelKey="name"
                searchable={false}
                clearable={false}
                options={options}
            />
        </div>
    );
};

export default LanguageSelectorComp;
