import * as React from 'react';
import { Redux } from 'redux-render';
import Select from 'react-select';
import { Config } from '../config';
import { ReduxState, updateLanguage, updateTranslating, Dispatch } from '../redux';
import { Languages } from '../flowTypes';
import { getBaseLanguage } from './index';
import { jsonEqual } from '../utils';
import { languageSelector } from './LanguageSelector.scss';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorProps {
    iso: string;
    onChange: (language: Language) => void;
    options: Language[];
}

export const composeLanguageMap = (languages: Languages): Language[] =>
    Object.keys(languages).map(iso => ({
        name: languages[iso],
        iso
    }));

const LanguageSelectorContainer: React.SFC = () => (
    <Config
        render={({ languages }) => (
            <Redux selector={({ language }: ReduxState): Partial<ReduxState> => ({ language })}>
                {({ language }: ReduxState, dispatch: Dispatch) => {
                    if (language) {
                        const onChange = (lang: Language) => {
                            const baseLanguage = getBaseLanguage(languages);
                            const translating = !jsonEqual(baseLanguage, lang);
                            dispatch(updateLanguage(lang));
                            dispatch(updateTranslating(translating));
                        };
                        const options = composeLanguageMap(languages);
                        return (
                            // prettier-ignore
                            <LanguageSelectorComp
                                iso={language.iso}
                                onChange={onChange}
                                options={options}
                            />
                        );
                    }
                    return null;
                }}
            </Redux>
        )}
    />
);

class LanguageSelectorComp extends React.Component<LanguageSelectorProps> {
    public shouldComponentUpdate(nextProps: LanguageSelectorProps): boolean {
        if (!jsonEqual(nextProps, this.props)) {
            return true;
        }
        return false;
    }

    public render(): JSX.Element {
        return (
            <div className={`${languageSelector} select-small`}>
                <Select
                    data-spec="language-selector"
                    // Flow
                    value={this.props.iso}
                    onChange={this.props.onChange}
                    // LanguageSelector
                    valueKey="iso"
                    labelKey="name"
                    searchable={false}
                    clearable={false}
                    options={this.props.options}
                />
            </div>
        );
    }
}

export default LanguageSelectorContainer;
