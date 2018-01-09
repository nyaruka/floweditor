import * as React from 'react';
import Select from 'react-select';
import { Languages } from '../flowTypes';

import { languageSelector } from './LanguageSelector.scss';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    iso: string;
    languages: Languages;
    onChange(language: Language): void;
}

const LanguageSelectorComp: React.SFC<LanguageSelectorProps> = (props): JSX.Element => {
    const options: Language[] = Object.keys(props.languages).map(iso => ({
        name: props.languages[iso],
        iso
    }));

    return (
        <div className={`${languageSelector} select-small`}>
            <Select
                // Flow
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
