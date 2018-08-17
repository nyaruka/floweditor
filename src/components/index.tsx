import '~/global.scss';

import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Button, { ButtonTypes } from '~/components/button/Button';
import {
    EditorConsumer,
    EditorProvider,
    EditorState
} from '~/components/context/editor/EditorContext';
import { FlowConsumer, FlowProvider, FlowState } from '~/components/context/flow/FlowContext';
import Flow from '~/components/flow/Flow';
import * as styles from '~/components/index.scss';
import ConfigProvider from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { FlowEditorConfig } from '~/flowTypes';
import AssetService from '~/services/AssetService';
import { renderIf } from '~/utils';

export const contextTypes = {
    flow: fakePropType,
    assetService: fakePropType
};

export const editorContainerSpecId = 'editor-container';
export const editorSpecId = 'editor';

export interface FlowEditorProps {
    flowState?: FlowState;
    editorState?: EditorState;
}

class FlowEditor extends React.Component<FlowEditorProps> {
    public static contextTypes = contextTypes;

    constructor(props: FlowEditorProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public componentDidMount(): void {
        this.props.flowState.mutator.fetchFlow(this.context.assetService, this.context.flow);
    }

    private handleDownloadClicked(): void {
        // downloadJSON(getCurrentDefinition(this.props.definition, this.props.nodes), 'definition');
    }

    public getFooter(): JSX.Element {
        return (
            <div className={styles.footer}>
                <div className={styles.downloadButton}>
                    <Button
                        name="Download"
                        onClick={this.handleDownloadClicked}
                        type={ButtonTypes.primary}
                    />
                </div>
            </div>
        );
    }

    public render(): JSX.Element {
        /* <ConnectedFlowList /> */
        return (
            <div
                id={editorContainerSpecId}
                className={this.props.editorState.translating ? styles.translating : undefined}
                data-spec={editorContainerSpecId}
            >
                {this.getFooter()}
                <div className={styles.editor} data-spec={editorSpecId}>
                    {/* renderIf(this.props.languages.length > 0)(<ConnectedLanguageSelector />) */}
                    {renderIf(this.props.flowState.definition !== null)(<Flow />)}
                </div>
            </div>
        );
    }
}

export interface FlowEditorContainerProps {
    config: FlowEditorConfig;
}

// Root container, wires up context providers
const FlowEditorContainer: React.SFC<FlowEditorContainerProps> = ({ config }) => {
    const assetService = new AssetService(config);
    return (
        <ConfigProvider config={{ ...config, assetService }}>
            <EditorProvider>
                <FlowProvider>
                    <EditorConsumer>
                        {editorState => (
                            <FlowConsumer>
                                {flowState => (
                                    <FlowEditor flowState={flowState} editorState={editorState} />
                                )}
                            </FlowConsumer>
                        )}
                    </EditorConsumer>
                </FlowProvider>
            </EditorProvider>
        </ConfigProvider>
    );
};

export default FlowEditorContainer;
