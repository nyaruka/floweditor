import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { FlowConsumer } from '~/components/context/flow/FlowContext';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/services/AssetService';
import { Result } from '~/store/flowContext';
import { FormState, StringEntry } from '~/store/nodeEditor';

import { nodeToState, stateToNode } from './helpers';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface ResultRouterFormState extends FormState {
    cases: CaseProps[];
    resultName: StringEntry;
    operand: StringEntry;
    result: Result;
}

export const leadInSpecId = 'lead-in';

class ResultRouterForm extends React.Component<RouterFormProps, ResultRouterFormState> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private handleUpdateResultName(value: string): void {
        this.setState({ resultName: { value } });
    }

    private handleResultChanged(selected: Asset[]): void {
        // this.setState({ operand: validate('Operand', value, [validateRequired]) });
    }

    private handleCasesUpdated(cases: CaseProps[]): void {
        this.setState({ cases });
    }

    private handleSave(): void {
        if (this.state.valid) {
            this.props.flowState.mutator.addFlowResult(
                this.state.resultName.value,
                this.props.nodeSettings.originalNode.node.uuid
            );
            this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: {
                name: 'Ok',
                onClick: this.handleSave
            },
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
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p>
                    If the result...
                    {Object.keys(this.props.flowState.results)}
                </p>

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

export default React.forwardRef((props: any) => (
    <FlowConsumer>
        {flowState => <ResultRouterForm {...props} flowState={flowState} />}
    </FlowConsumer>
));
