import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { hasErrors } from '~/components/flow/actions/helpers';
import { RouterFormProps } from '~/components/flow/props';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { nodeToState, stateToNode } from '~/components/flow/routers/response/helpers';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TimeoutControl from '~/components/form/timeout/TimeoutControl';
import TypeList from '~/components/nodeeditor/TypeList';
import { FormState, StringEntry } from '~/store/nodeEditor';
import { validate, validateAlphanumeric, validateDoesntStartWithNumber } from '~/store/validators';

// TODO: Remove use of Function
// tslint:disable:ban-types
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

export default class ResponseRouterForm extends React.Component<
    RouterFormProps,
    ResponseRouterFormState
> {
    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    private handleUpdateResultName(value: string): void {
        const resultName = validate('Result Name', value, [
            validateAlphanumeric,
            validateDoesntStartWithNumber
        ]);
        this.setState({ resultName, valid: this.state.valid && !hasErrors(resultName) });
    }

    private handleUpdateTimeout(timeout: number): void {
        this.setState({ timeout });
    }

    private handleCasesUpdated(cases: CaseProps[]): void {
        const invalidCase = cases.find((caseProps: CaseProps) => !caseProps.valid);
        this.setState({ cases, valid: !invalidCase });
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
        const typeConfig = this.props.typeConfig;

        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
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
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <div>If the message response...</div>
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
                    helpText="By naming the result, you can reference it later using @results.whatever_the_name_is"
                />
            </Dialog>
        );
    }

    public render(): JSX.Element {
        return this.renderEdit();
    }
}
