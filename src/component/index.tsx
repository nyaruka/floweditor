import '../global.scss';
import * as React from 'react';
import { connect, Provider as ReduxProvider } from 'react-redux';
import { bindActionCreators } from 'redux';

import ConfigProvider from '../config';
import { FlowDefinition, FlowEditorConfig } from '../flowTypes';
import {
    AppState,
    createStore,
    DispatchWithState,
    FetchFlow,
    fetchFlow,
    UpdateLanguage,
    updateLanguage
} from '../store';
import { getBaseLanguage, renderIf } from '../utils';
import ConnectedFlow from './Flow';
import ConnectedFlowList, { FlowOption } from './FlowList';
import * as styles from './index.scss';
import ConnectedLanguageSelector, { Language } from './LanguageSelector';
import AssetService, { Assets } from '../services/AssetService';
import { fakePropType } from '../config/ConfigProvider';

export type OnSelectFlow = ({ uuid }: FlowOption) => void;

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

export interface FlowEditorStoreProps {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
    updateLanguage: UpdateLanguage;
    fetchFlow: FetchFlow;
}

const hotStore = createStore();

// Root container, wires up context-providers/sets baseURL
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
    config.assetService = new AssetService(config);

    return (
        <ConfigProvider config={config}>
            <ReduxProvider store={hotStore}>
                <ConnectedFlowEditor />
            </ReduxProvider>
        </ConfigProvider>
    );
};

export const contextTypes = {
    endpoints: fakePropType,
    languages: fakePropType,
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
        const assetService: AssetService = this.context.assetService;
        this.props.updateLanguage(getBaseLanguage(this.context.languages));
        this.props.fetchFlow(assetService, this.context.flow);
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
                    <ConnectedLanguageSelector />
                    {renderIf(
                        this.props.definition && this.props.language && !this.props.fetchingFlow
                    )(<ConnectedFlow />)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    flowContext: { definition, dependencies },
    flowEditor: { editorUI: { translating, language, fetchingFlow } }
}: AppState) => ({
    translating,
    language,
    fetchingFlow,
    definition,
    dependencies
});

const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateLanguage,
            fetchFlow
        },
        dispatch
    );

export const ConnectedFlowEditor = connect(mapStateToProps, mapDispatchToProps)(FlowEditor);

export default FlowEditorContainer;
