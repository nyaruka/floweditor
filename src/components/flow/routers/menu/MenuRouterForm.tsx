import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { RouterFormProps } from '~/components/flow/props';
import OptionalTextInput from '~/components/form/optionaltext/OptionalTextInput';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { FormState, StringEntry } from '~/store/nodeEditor';

import { nodeToState, stateToNode } from './helpers';
import * as styles from './MenuRouterForm.scss';

const mutate = require('immutability-helper');

export interface MenuRouterFormState extends FormState {
    resultName: StringEntry;
    menu: string[];
}

export const leadInSpecId = 'lead-in';

export default class MenuRouterForm extends React.Component<RouterFormProps, MenuRouterFormState> {
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

    private handleSave(): void {
        this.props.updateRouter(stateToNode(this.props.nodeSettings, this.state));
        this.props.onClose(false);
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private handleMenuChanged(index: number, value: string): void {
        const menu = mutate(this.state.menu, { [index]: { $set: value } });
        this.setState({ menu });
    }

    private renderOption(index: number): JSX.Element {
        return (
            <div key={'menuoption-' + index} className={styles.menuOption}>
                <div className={styles.digit}>{index === 9 ? 0 : index + 1}</div>
                <div className={styles.category}>
                    <TextInputElement
                        name={'Menu ' + index}
                        entry={{ value: this.state.menu[index] }}
                        onChange={(value: string) => {
                            this.handleMenuChanged(index, value);
                        }}
                    />
                </div>
            </div>
        );
    }

    private renderMenu(): any {
        const options: JSX.Element[] = [];
        for (let i = 0; i < 10; i++) {
            options.push(this.renderOption(i));
        }

        return options;
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
                <div className={styles.menu}>{this.renderMenu()}</div>
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
