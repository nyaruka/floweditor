import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext } from '../config';
import { fakePropType } from '../config/ConfigProvider';
import { ResultType } from '../flowTypes';
import { Asset } from '../services/AssetService';
import {
    AppState,
    DispatchWithState,
    HandleLanguageChange,
    handleLanguageChange,
    UpdateLanguage,
    updateLanguage,
    UpdateTranslating,
    updateTranslating
} from '../store';
import { languageSelector } from './LanguageSelector.scss';
import SelectSearch from './SelectSearch/SelectSearch';

export interface Language {
    name: string;
    iso: string;
}

export interface LanguageSelectorStoreProps {
    language: Asset;
    updateLanguage: UpdateLanguage;
    updateTranslating: UpdateTranslating;
    handleLanguageChange: HandleLanguageChange;
}

export const containerClass = `${languageSelector} select-small`;

export const languageSelectorContainerSpecId = 'language-selector-container';

export class LanguageSelector extends React.Component<LanguageSelectorStoreProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: LanguageSelectorStoreProps, context: ConfigProviderContext) {
        super(props, context);

        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    private handleLanguageChange(selections: Asset[]): void {
        const [language] = selections;
        this.props.handleLanguageChange(language);
    }

    private getInitial(): Asset {
        return;
    }

    public render(): JSX.Element {
        return (
            <div className={containerClass} data-spec={languageSelectorContainerSpecId}>
                <SelectSearch
                    resultType={ResultType.language}
                    assets={this.context.assetService.getLanguageAssets()}
                    searchable={false}
                    multi={false}
                    initial={[this.props.language]}
                    name="Languages"
                    closeOnSelect={true}
                    onChange={this.handleLanguageChange}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ flowEditor: { editorUI: { language } } }: AppState) => ({ language });

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateLanguage,
            updateTranslating,
            handleLanguageChange
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
