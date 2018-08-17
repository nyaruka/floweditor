// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { EditorConsumer, EditorState } from '~/components/context/editor/EditorContext';
import {
    FlowConsumer,
    FlowState,
    LocalizationUpdates
} from '~/components/context/flow/FlowContext';
import { getDraggedFrom } from '~/components/helpers';
import Modal from '~/components/modal/Modal';
import { Type } from '~/config/typeConfigs';
import { AnyAction } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

export type UpdateLocalizations = (language: string, changes: LocalizationUpdates) => void;

export interface NodeEditorProps {
    plumberConnectExit: Function;
    plumberRepaintForDuration: Function;

    editorState: EditorState;
    flowState: FlowState;
}

export interface FormProps {
    // our two ways of updating
    updateRouter(renderNode: RenderNode): void;
    updateAction(action: AnyAction): void;

    nodeSettings?: NodeEditorSettings;
    typeConfig?: Type;
    onTypeChange?(config: Type): void;
    onClose?(canceled: boolean): void;

    flowState?: FlowState;
}

export interface LocalizationProps {
    nodeSettings?: NodeEditorSettings;
    typeConfig?: Type;
    onClose?(canceled: boolean): void;

    updateLocalizations: UpdateLocalizations;
    language: Asset;
}

export class NodeEditor extends React.Component<NodeEditorProps> {
    constructor(props: NodeEditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^close/, /^update/]
        });
    }

    public close(canceled: boolean): void {
        // Make sure we re-wire the old connection
        if (canceled) {
            const dragPoint = getDraggedFrom(this.props.flowState.nodeEditor.originalNode);
            if (dragPoint) {
                const renderNode = this.props.flowState.nodes[dragPoint.nodeUUID];
                for (const exit of renderNode.node.exits) {
                    if (exit.uuid === dragPoint.exitUUID) {
                        // TODO: should this just be taking literal uuids instead of objects?
                        this.props.plumberConnectExit(renderNode.node, exit);
                        break;
                    }
                }
            }
        }

        this.props.flowState.mutator.closeNodeEditor(canceled);
    }

    public render(): JSX.Element {
        const { flowState, editorState } = this.props;

        if (flowState.nodeEditorOpen) {
            const { typeConfig } = flowState;

            // see if we should use the localization form
            if (this.props.editorState.translating) {
                const { localization: LocalizationForm } = typeConfig;

                if (LocalizationForm) {
                    const localizationProps: LocalizationProps = {
                        updateLocalizations: flowState.mutator.updateLocalizations,
                        nodeSettings: flowState.nodeEditor,
                        typeConfig: flowState.typeConfig,
                        language: editorState.language
                    };

                    return (
                        <Modal width="600px" show={flowState.nodeEditorOpen}>
                            <LocalizationForm {...{ ...localizationProps }} />
                        </Modal>
                    );
                }
            }

            const { form: Form } = typeConfig;
            const formProps: FormProps = {
                updateAction: flowState.mutator.updateAction,
                updateRouter: flowState.mutator.updateRouter,
                nodeSettings: flowState.nodeEditor,
                typeConfig: flowState.typeConfig,
                onTypeChange: flowState.mutator.updateTypeConfig,
                onClose: flowState.mutator.closeNodeEditor,
                flowState
            };

            return (
                <Modal width="600px" show={this.props.flowState.nodeEditorOpen}>
                    <Form {...{ ...formProps }} />
                </Modal>
            );
        }
        return null;
    }
}

export default React.forwardRef((props: any) => (
    <EditorConsumer>
        {editorState => (
            <FlowConsumer>
                {flowState => (
                    <NodeEditor {...props} flowState={flowState} editorState={editorState} />
                )}
            </FlowConsumer>
        )}
    </EditorConsumer>
));
