import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/store/flowContext';
import { AssetEntry, FormState, mergeForm, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { small } from '~/utils/reactselect';

import { nodeToState, stateToNode } from './helpers';
import * as styles from './ResultRouterForm.scss';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface ResultRouterFormState extends FormState {
    result: AssetEntry;
    cases: CaseProps[];
    resultName: StringEntry;
}

export const leadInSpecId = 'lead-in';

export default class ResultRouterForm extends React.Component<
    RouterFormProps,
    ResultRouterFormState
> {
    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public static contextTypes = {
        assetService: fakePropType
    };

    private handleUpdateResultName(value: string): void {
        this.setState({ resultName: { value } });
    }

    private handleResultChanged(selected: Asset[]): boolean {
        const updates: Partial<ResultRouterFormState> = {
            result: validate('Result to split on', selected[0], [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleCasesUpdated(cases: CaseProps[]): void {
        this.setState({ cases });
    }

    private handleSave(): void {
        const valid = this.handleResultChanged([this.state.result.value]);
        if (valid) {
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
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <div className={styles.leadIn}>If the flow result</div>
                <div className={styles.resultSelect}>
                    <AssetSelector
                        entry={this.state.result}
                        styles={small}
                        name="Flow Result"
                        placeholder="Select Result"
                        searchable={true}
                        assets={this.props.assets.results}
                        onChange={this.handleResultChanged}
                    />
                </div>
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
