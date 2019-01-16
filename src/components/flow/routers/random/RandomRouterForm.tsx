import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import SelectElement, { SelectOption } from '~/components/form/select/SelectElement';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Exit } from '~/flowTypes';
import { FormState, mergeForm, SelectOptionEntry, StringEntry } from '~/store/nodeEditor';
import { small } from '~/utils/reactselect';

import { BUCKET_OPTIONS, fillOutExits, nodeToState, stateToNode } from './helpers';
import * as styles from './RandomRouterForm.scss';

// TODO: Remove use of Function
// tslint:disable:ban-types
export enum InputToFocus {
    args = 'args',
    min = 'min',
    max = 'max',
    exit = 'exit'
}

export interface RandomRouterFormState extends FormState {
    bucketChoice: SelectOptionEntry;
    resultName: StringEntry;
    exits: Exit[];
}

export const leadInSpecId = 'lead-in';

export default class RandomRouterForm extends React.Component<
    RouterFormProps,
    RandomRouterFormState
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

    private handleBucketsChanged(selected: SelectOption): boolean {
        // create new exits if needed

        const count = parseInt(selected.value, 10);

        let exits = this.state.exits.concat([]);

        // prune off if we have too many
        exits = exits.slice(0, count);

        // add any that we still need
        exits = fillOutExits(exits, count);

        const updates: Partial<RandomRouterFormState> = {
            bucketChoice: { value: selected }
        };

        const updated = mergeForm(this.state, updates);
        this.setState({ ...updated, exits });

        return updated.valid;
    }

    private handleSave(): void {
        this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
        this.props.onClose(false);
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave, disabled: !this.state.valid },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private handleBucketNameChanged(exit: Exit, value: string): void {
        const exits = this.state.exits;
        exits.find((ex: Exit) => ex.uuid === exit.uuid).name = value;
        this.setState({ exits });
    }

    private renderBucketNames(): any {
        return this.state.exits.map((exit: Exit) => (
            <TextInputElement
                key={exit.uuid}
                __className={styles.bucketName}
                data-spec="optional-field"
                name={exit.uuid}
                entry={{ value: exit.name }}
                onChange={(value: string) => {
                    this.handleBucketNameChanged(exit, value);
                }}
            />
        ));
    }

    public renderEdit(): JSX.Element {
        const typeConfig = this.props.typeConfig;

        const OPTIONS = BUCKET_OPTIONS.concat([]);
        if (BUCKET_OPTIONS.indexOf(this.state.bucketChoice.value) === -1) {
            OPTIONS.push(this.state.bucketChoice.value);
        }

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
                <div className={styles.leadIn}>Split them randomly into one of</div>
                <div className={styles.bucketSelect}>
                    <SelectElement
                        styles={small}
                        name="Buckets"
                        entry={this.state.bucketChoice}
                        onChange={this.handleBucketsChanged}
                        options={OPTIONS}
                    />
                </div>
                <div className={styles.bucketList}>{this.renderBucketNames()}</div>
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
