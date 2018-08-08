import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SelectSearch from '~/components/form/select/SelectSearch';
import { languageSelector } from '~/components/languageselector/LanguageSelector.scss';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/services/AssetService';
import AppState from '~/store/state';
import { DispatchWithState, HandleLanguageChange, handleLanguageChange } from '~/store/thunks';

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
const mapStateToProps = ({ flowContext: { languages }, editorState: { language } }: AppState) => ({
    language,
    languages
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            handleLanguageChange
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LanguageSelector);
