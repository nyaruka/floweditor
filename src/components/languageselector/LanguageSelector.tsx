import * as React from 'react';
import { EditorConsumer, EditorState } from '~/components/context/editor/EditorContext';
import { FlowConsumer, FlowState } from '~/components/context/flow/FlowContext';
import SelectSearch from '~/components/form/select/SelectSearch';
import { languageSelector } from '~/components/languageselector/LanguageSelector.scss';
import { ConfigProviderContext } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/services/AssetService';

export interface LanguageSelectorProps {
    editorState?: EditorState;
    flowState?: FlowState;
}

export const containerClasses = `${languageSelector} select-small`;
export const languageSelectorContainerSpecId = 'language-selector-container';

export class LanguageSelector extends React.Component<LanguageSelectorProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: LanguageSelectorProps, context: ConfigProviderContext) {
        super(props, context);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
    }

    private handleLanguageChange(selections: Asset[]): void {
        const [language] = selections;
        this.props.editorState.mutator.mergeEditorState({ language });
    }

    public render(): JSX.Element {
        return (
            <div className={containerClasses} data-spec={languageSelectorContainerSpecId}>
                <SelectSearch
                    localSearchOptions={this.props.flowState.languages}
                    searchable={false}
                    multi={false}
                    initial={[this.props.editorState.language]}
                    name="Languages"
                    closeOnSelect={true}
                    onChange={this.handleLanguageChange}
                />
            </div>
        );
    }
}

export default React.forwardRef((props: any) => (
    <EditorConsumer>
        {editorState => (
            <FlowConsumer>
                {flowState => (
                    <LanguageSelector {...props} flowState={flowState} editorState={editorState} />
                )}
            </FlowConsumer>
        )}
    </EditorConsumer>
));
