import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, HeaderStyle, Tab } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import CheckboxElement from '~/components/form/checkbox/CheckboxElement';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import SelectElement, { SelectOption } from '~/components/form/select/SelectElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/store/flowContext';
import { AssetEntry, FormState, mergeForm, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { small } from '~/utils/reactselect';

import {
    DELIMITER_OPTIONS,
    FIELD_NUMBER_OPTIONS,
    getDelimiterOption,
    getFieldOption,
    nodeToState,
    stateToNode
} from './helpers';
import * as styles from './ResultRouterForm.scss';

export interface ResultRouterFormState extends FormState {
    result: AssetEntry;
    cases: CaseProps[];
    resultName: StringEntry;
    shouldDelimit: boolean;

    fieldNumber: number;
    delimiter: string;
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
            primary: { name: 'Ok', onClick: this.handleSave, disabled: !this.state.valid },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private handleShouldDelimitChanged(checked: boolean): void {
        this.setState({ shouldDelimit: checked });
    }

    private handleFieldNumberChanged(selected: SelectOption): void {
        this.setState({ fieldNumber: parseInt(selected.value, 10) });
    }

    private handleDelimiterChanged(selected: SelectOption): void {
        this.setState({ delimiter: selected.value });
    }

    private renderField(): JSX.Element {
        return (
            <>
                <div className={styles.leadIn}>If the flow result</div>
                <div className={styles.resultSelect}>
                    <AssetSelector
                        entry={this.state.result}
                        styles={small}
                        name="Flow Result"
                        placeholder="Select Result"
                        searchable={true}
                        assets={this.props.assetStore.results}
                        onChange={this.handleResultChanged}
                    />
                </div>
            </>
        );
    }

    private renderFieldDelimited(): JSX.Element {
        return (
            <>
                <div className={styles.leadIn}>If the</div>
                <div className={styles.fieldNumber}>
                    <SelectElement
                        styles={small}
                        name="Field Number"
                        entry={{ value: getFieldOption(this.state.fieldNumber) }}
                        onChange={this.handleFieldNumberChanged}
                        options={FIELD_NUMBER_OPTIONS}
                    />
                </div>
                <div className={styles.leadInSub}>field of</div>
                <div className={styles.resultSelectDelimited}>
                    <AssetSelector
                        entry={this.state.result}
                        styles={small}
                        name="Flow Result"
                        placeholder="Select Result"
                        searchable={true}
                        assets={this.props.assetStore.results}
                        onChange={this.handleResultChanged}
                    />
                </div>
                <div className={styles.leadInSub}>delimited by</div>
                <div className={styles.delimiter}>
                    <SelectElement
                        styles={small}
                        name="Delimiter"
                        entry={{ value: getDelimiterOption(this.state.delimiter) }}
                        onChange={this.handleDelimiterChanged}
                        options={DELIMITER_OPTIONS}
                    />
                </div>
            </>
        );
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;

        const back = (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                headerStyle={HeaderStyle.BARBER}
                subtitle="Advanced Settings"
                buttons={this.getButtons()}
                headerIcon="fe-cog"
            />
        );

        const advanced: Tab = {
            name: 'Advanced',
            body: (
                <div className={styles.shouldDelimit}>
                    <CheckboxElement
                        name="Delimit"
                        title="Delimit Result"
                        checked={this.state.shouldDelimit}
                        description="Evaluate your rules against a delimited part of your result"
                        onChange={this.handleShouldDelimitChanged}
                    />
                </div>
            ),
            checked: this.state.shouldDelimit
        };

        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
                tabs={[advanced]}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />

                {this.state.shouldDelimit ? this.renderFieldDelimited() : this.renderField()}

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
}
