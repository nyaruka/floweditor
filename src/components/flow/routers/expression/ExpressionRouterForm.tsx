import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { nodeToState, stateToNode } from '~/components/flow/routers/expression/helpers';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config';
import { RenderNode } from '~/store/flowContext';
import { FormState, NodeEditorSettings, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface ExpressionRouterFormState extends FormState {
    cases: CaseProps[];
    resultName: StringEntry;
    operand: StringEntry;
}

export const leadInSpecId = 'lead-in';

export interface ExpressionRouterFormProps {
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    // update handlers
    updateRouter(renderNode: RenderNode): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export default class ExpressionRouterForm extends React.Component<
    ExpressionRouterFormProps,
    ExpressionRouterFormState
> {
    constructor(props: ExpressionRouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    private handleUpdateResultName(value: string): void {
        this.setState({ resultName: { value } });
    }

    private handleOperandUpdated(value: string): void {
        this.setState({ operand: validate('Operand', value, [validateRequired]) });
    }

    private handleCasesUpdated(cases: CaseProps[]): void {
        this.setState({ cases });
    }

    private handleSave(): void {
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

    public renderEdit(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={this.props.typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p>If the expression...</p>
                <TextInputElement
                    name="Operand"
                    showLabel={false}
                    onChange={this.handleOperandUpdated}
                    entry={this.state.operand}
                />
                <CaseList
                    data-spec="cases"
                    cases={this.state.cases}
                    onCasesUpdated={this.handleCasesUpdated}
                />
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
        return this.renderEdit();
    }
}
