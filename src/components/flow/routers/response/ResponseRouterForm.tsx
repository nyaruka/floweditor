// TODO: Remove use of Function
// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog from '~/components/dialog/Dialog';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { nodeToState, stateToNode } from '~/components/flow/routers/response/helpers';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TimeoutControl from '~/components/form/timeout/TimeoutControl';
import { ButtonSet } from '~/components/modal/Modal';
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config';
import { Asset } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { FormState, NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export enum DragCursor {
    move = 'move',
    pointer = 'pointer'
}

export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface ResponseRouterFormState extends FormState {
    cases: CaseProps[];
    resultName: StringEntry;
    timeout: number;
}

export const leadInSpecId = 'lead-in';

export interface ResponseRouterFormProps {
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    // localization settings
    translating: boolean;
    language: Asset;

    // update handlers
    updateRouter(renderNode: RenderNode): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export default class ResponseRouterForm extends React.Component<
    ResponseRouterFormProps,
    ResponseRouterFormState
> {
    constructor(props: ResponseRouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings, this);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    private handleUpdateResultName(value: string): void {
        this.setState({ resultName: { value } });
    }

    private handleUpdateTimeout(timeout: number): void {
        this.setState({ timeout });
    }

    private handleCasesUpdated(cases: CaseProps[]): void {
        this.setState({ cases });
    }

    private handleSave(): void {
        console.log(this.state.valid);
        if (this.state.valid) {
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public renderTranslate(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            />
        );
    }

    public renderEdit(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
                gutter={
                    <TimeoutControl
                        timeout={this.state.timeout}
                        onChanged={this.handleUpdateTimeout}
                    />
                }
            >
                <TypeList
                    __className=""
                    initialType={this.props.typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <div>If the message response...</div>
                <CaseList cases={this.state.cases} onCasesUpdated={this.handleCasesUpdated} />
                <OptionalTextInput
                    name="Result Name"
                    value={this.state.resultName}
                    onChange={this.handleUpdateResultName}
                    toggleText="Save as.."
                    helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                />
            </Dialog>
        );
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.renderTranslate();
        } else {
            return this.renderEdit();
        }
    }
}
