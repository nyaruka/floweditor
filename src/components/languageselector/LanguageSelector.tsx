import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import { languageSelector } from '~/components/languageselector/LanguageSelector.scss';
import { ConfigProviderContext } from '~/config';
import { Asset } from '~/store/flowContext';
import { Assets } from '~/store/flowContext';
import AppState from '~/store/state';
import { DispatchWithState, HandleLanguageChange, handleLanguageChange } from '~/store/thunks';
import { small } from '~/utils/reactselect';

export interface LanguageSelectorProps {
    language: Asset;
    languages: Assets;
    handleLanguageChange: HandleLanguageChange;
}

export const containerClasses = `${languageSelector} select-small`;
export const languageSelectorContainerSpecId = 'language-selector-container';

export class LanguageSelector extends React.Component<LanguageSelectorProps> {
    constructor(props: LanguageSelectorProps, context: ConfigProviderContext) {
        super(props, context);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public handleLanguageChanged(selections: Asset[]): void {
        const [language] = selections;
        this.props.handleLanguageChange(language);
    }

    public render(): JSX.Element {
        return (
            <div className={containerClasses} data-spec={languageSelectorContainerSpecId}>
                <AssetSelector
                    name="Language"
                    styles={small}
                    assets={this.props.languages}
                    entry={{ value: this.props.language }}
                    searchable={false}
                    onChange={this.handleLanguageChanged}
                />
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { assets }, editorState: { language } }: AppState) => ({
    languages: assets.languages,
    language
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
