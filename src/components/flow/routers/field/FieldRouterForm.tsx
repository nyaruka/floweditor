import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { sortFieldsAndProperties } from '~/components/flow/actions/updatecontact/helpers';
import { CONTACT_PROPERTIES } from '~/components/flow/actions/updatecontact/UpdateContactForm';
import { RouterFormProps } from '~/components/flow/props';
import CaseList, { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Scheme, SCHEMES } from '~/config/typeConfigs';
import { Asset, AssetType } from '~/store/flowContext';
import { AssetEntry, FormState, StringEntry } from '~/store/nodeEditor';
import { small } from '~/utils/reactselect';

import * as styles from './FieldRouterForm.scss';
import { nodeToState, stateToNode } from './helpers';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface FieldRouterFormState extends FormState {
    field: AssetEntry;
    cases: CaseProps[];
    resultName: StringEntry;
}

export const leadInSpecId = 'lead-in';

export default class FieldRouterForm extends React.Component<
    RouterFormProps,
    FieldRouterFormState
> {
    private ROUTABLE_FIELDS: Asset[] = [
        ...CONTACT_PROPERTIES,
        ...SCHEMES.map((scheme: Scheme) => ({
            name: scheme.name,
            id: scheme.scheme,
            type: AssetType.Scheme
        }))
    ];

    constructor(props: RouterFormProps) {
        super(props);

        this.state = nodeToState(this.props.nodeSettings, this.props.assetStore);

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

    private handleFieldChanged(selected: Asset[]): void {
        this.setState({ field: { value: selected[0] } });
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
                <div className={styles.leadIn}>
                    If the contact's
                    <div className={`${styles.fieldSelect} select-small`}>
                        <AssetSelector
                            name="Contact Field"
                            styles={small}
                            assets={this.props.assetStore.fields}
                            additionalOptions={this.ROUTABLE_FIELDS}
                            entry={this.state.field}
                            searchable={true}
                            sortFunction={sortFieldsAndProperties}
                            onChange={this.handleFieldChanged}
                        />
                    </div>
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
