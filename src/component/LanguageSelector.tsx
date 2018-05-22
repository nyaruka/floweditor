import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext } from '../config';
import { fakePropType } from '../config/ConfigProvider';
import { ResultType } from '../flowTypes';
import { Asset } from '../services/AssetService';
import { AppState, DispatchWithState, HandleLanguageChange, handleLanguageChange } from '../store';
import { languageSelector } from './LanguageSelector.scss';
import SelectSearch from './SelectSearch/SelectSearch';

export interface LanguageSelectorStoreProps {
    language: Asset;
    languages: Asset[];
    handleLanguageChange: HandleLanguageChange;
}

export const containerClasses = `${languageSelector} select-small`;
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

    public render(): JSX.Element {
        return (
            <div className={containerClasses} data-spec={languageSelectorContainerSpecId}>
                <SelectSearch
                    resultType={ResultType.language}
                    localSearchOptions={this.props.languages}
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

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { languages },
    flowEditor: { editorUI: { language } }
}: AppState) => ({ language, languages });

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            handleLanguageChange
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelector);
