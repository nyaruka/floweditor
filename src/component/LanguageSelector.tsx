import * as React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators } from 'redux';
import { ConfigProviderContext } from '../config';
import { Languages } from '../flowTypes';
import {
    AppState,
    DispatchWithState,
    UpdateLanguage,
    updateLanguage,
    UpdateTranslating,
    updateTranslating
} from '../store';
import { getBaseLanguage, jsonEqual } from '../utils';
import { languageSelector } from './LanguageSelector.scss';
import { fakePropType } from '../config/ConfigProvider';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorStoreProps {
    language: Language;
    updateLanguage: UpdateLanguage;
    updateTranslating: UpdateTranslating;
}

export const mapOptions = (languages: Languages): Language[] =>
    Object.keys(languages).map(iso => ({
        name: languages[iso],
        iso
    }));

export const containerClass = `${languageSelector} select-small`;

export const languageSelectorContainerSpecId = 'language-selector-container';

export class LanguageSelector extends React.Component<LanguageSelectorStoreProps> {
    public static contextTypes = {
        languages: fakePropType
    };

    constructor(props: LanguageSelectorStoreProps, context: ConfigProviderContext) {
        super(props, context);
        this.onChange = this.onChange.bind(this);
    }

    public onChange(lang: Language): void {
        const baseLanguage = getBaseLanguage(this.context.languages);
        const translating = !jsonEqual(baseLanguage, lang);
        this.props.updateLanguage(lang);
        this.props.updateTranslating(translating);
    }

    public render(): JSX.Element {
        if (this.props.language) {
            const options = mapOptions(this.context.languages);
            if (options.length) {
                return (
                    <div className={containerClass} data-spec={languageSelectorContainerSpecId}>
                        <Select
                            value={this.props.language.iso}
                            onChange={this.onChange}
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
        }
        return null;
    }
}

const mapStateToProps = ({ flowEditor: { editorUI: { language } } }: AppState) => ({ language });

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateLanguage,
            updateTranslating
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
