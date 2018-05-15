import '../global.scss';

import * as React from 'react';
import { connect, Provider as ReduxProvider } from 'react-redux';
import { bindActionCreators } from 'redux';

import ConfigProvider from '../config';
import { fakePropType } from '../config/ConfigProvider';
import { FlowDefinition, FlowEditorConfig } from '../flowTypes';
import AssetService, { Asset } from '../services/AssetService';
import { AppState, createStore, DispatchWithState, FetchFlow, fetchFlow } from '../store';
import { renderIf } from '../utils';
import ConnectedFlow from './Flow';
import ConnectedFlowList, { FlowOption } from './FlowList';
import * as styles from './index.scss';
import ConnectedLanguageSelector from './LanguageSelector';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorStoreProps {
    language: Asset;
    languages: Asset[];
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    fetchFlow: FetchFlow;
}

const hotStore = createStore();

// Root container, wires up context-providers
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
    const assetService = new AssetService(config);
    return (
        <ConfigProvider config={{ ...config, assetService }}>
            <ReduxProvider store={hotStore}>
                <ConnectedFlowEditor />
            </ReduxProvider>
        </ConfigProvider>
    );
};

export const contextTypes = {
    flow: fakePropType,
    assetService: fakePropType
};

export const editorContainerSpecId = 'editor-container';
export const editorSpecId = 'editor';

/**
 * A navigable list of flows for an account
 */
export class FlowEditor extends React.Component<FlowEditorStoreProps> {
    public static contextTypes = contextTypes;

    public componentDidMount(): void {
        this.props.fetchFlow(this.context.assetService, this.context.flow);
    }

    public render(): JSX.Element {
        /* <ConnectedFlowList /> */
        return (
            <div
                id={editorContainerSpecId}
                className={this.props.translating ? styles.translating : undefined}
                data-spec={editorContainerSpecId}
            >
                <div className={styles.editor} data-spec={editorSpecId}>
                    {renderIf(this.props.languages.length > 0)(<ConnectedLanguageSelector />)}
                    {renderIf(
                        this.props.definition && this.props.language && !this.props.fetchingFlow
                    )(<ConnectedFlow />)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: { definition, dependencies, languages },
    flowEditor: { editorUI: { translating, language, fetchingFlow } }
}: AppState) => ({
    translating,
    language,
    fetchingFlow,
    definition,
    dependencies,
    languages
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            fetchFlow
        },
        dispatch
    );

export const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
