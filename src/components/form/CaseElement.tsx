import * as React from 'react';
import Select from 'react-select';
import { Operator } from '../../providers/ConfigProvider/operatorConfigs';
import ComponentMap from '../../services/ComponentMap';
import FormElement from './FormElement';
import TextInputElement, { HTMLTextElement } from './TextInputElement';
import {
    operatorConfigListPT,
    getOperatorConfigPT
} from '../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider/configContext';
import { Case } from '../../flowTypes';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

const forms = require('./FormElement.scss');
const styles = require('./CaseElement.scss');

export interface CaseElementProps {
    id?: number;
    name?: string; // satisfy form widget props
    onRemove?(c: CaseElement): void;
    ComponentMap?: ComponentMap;
    kase: Case;
    exitName: string;
    empty?: boolean;
    onChanged: Function;
    draggable?: boolean;
    canDrag?: boolean;
    draggingCase?: any;
    isOver?: boolean;
    connectDragSource?: Function;
    connectDropTarget?: Function;
}

interface CaseElementState {
    errors: string[];
    operator: string;
    arguments: string[];
    exitName: string;
}

export default class CaseElement extends React.Component<CaseElementProps, CaseElementState> {
    private category: TextInputElement;
    private operatorConfig: Operator;

    public static contextTypes = {
        operatorConfigList: operatorConfigListPT,
        getOperatorConfig: getOperatorConfigPT
    };

    constructor(props: CaseElementProps, context: ConfigProviderContext) {
        super(props, context);

        this.state = {
            errors: [],
            operator: this.props.kase.type,
            arguments: this.props.kase.arguments,
            exitName: this.props.exitName ? this.props.exitName : ''
        };

        this.operatorConfig = this.context.getOperatorConfig(this.props.kase.type);

        this.hasArguments = this.hasArguments.bind(this);
        this.onChangeArguments = this.onChangeArguments.bind(this);
        this.onChangeOperator = this.onChangeOperator.bind(this);
        this.onChangeExitName = this.onChangeExitName.bind(this);
        this.remove = this.remove.bind(this);
    }

    private generateExitNameFromArguments(args: string[]): string {
        let prefix = '';

        if (this.state.operator.indexOf('_lt') > -1) {
            if (this.state.operator.indexOf('date') > -1) {
                prefix = 'Before ';
            } else {
                if (this.state.operator.indexOf('lte') > -1) {
                    prefix = '<= ';
                } else {
                    prefix = '< ';
                }
            }
        } else if (this.state.operator.indexOf('_gt') > -1) {
            if (this.state.operator.indexOf('date') > -1) {
                prefix = 'After ';
            } else {
                if (this.state.operator.indexOf('gte') > -1) {
                    prefix = '>= ';
                } else {
                    prefix = '>';
                }
            }
        }

        if (args && args.length > 0) {
            const [firstArg] = args;
            const words = firstArg.match(/\w+/g);

            if (words && words.length > 0) {
                const [firstWord] = words;
                return prefix + firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
            }
            return prefix + firstArg.charAt(0).toUpperCase() + firstArg.slice(1);
        }
        return null;
    }

    private getExitName(args: string[] = null) {
        let exitName = this.state.exitName;

        if (!args) {
            /** If the category name is specified for our operator, use that */
            if (this.operatorConfig.categoryName) {
                ({ categoryName: exitName } = this.operatorConfig);
            }
        } else {
            if (
                !exitName ||
                exitName === this.generateExitNameFromArguments(this.props.kase.arguments)
            ) {
                exitName = this.generateExitNameFromArguments(args);
            }
        }

        return exitName;
    }

    private onChangeOperator(val: Operator) {
        this.operatorConfig = val;

        this.setState(
            {
                operator: val.type,
                exitName: this.getExitName()
            },
            () => this.props.onChanged(this)
        );
    }

    private onChangeArguments(val: React.ChangeEvent<HTMLTextElement>) {
        const args = [val.target.value];
        const exitName = this.getExitName(args);

        // prettier-ignore
        this.setState(
            {
                arguments: args,
                exitName
            },
            () => {
                this.props.onChanged(this);
                this.category.setState(
                    {
                        value: exitName
                    },
                    () => {
                        /** If the case doesn't have both an argument & an exit name, remove it */
                        if (!this.state.arguments[0] && !this.state.exitName) {
                            return this.remove();
                        }
                    }
                );
            }
        );
    }

    private onChangeExitName(val: React.ChangeEvent<HTMLTextElement>) {
        this.setState(
            {
                exitName: val.target.value
            },
            () => this.props.onChanged(this)
        );
    }

    private remove(ele?: any) {
        this.props.onRemove(this);
    }

    private hasArguments(): boolean {
        return (
            this.state.arguments &&
            this.state.arguments.length > 0 &&
            this.state.arguments[0].trim().length > 0
        );
    }

    validate(): boolean {
        const errors: string[] = [];

        if (this.operatorConfig.operands === 0) {
            if (this.state.exitName.trim().length === 0) {
                const { verboseName } = this.operatorConfig;
                errors.push(`A category name is required when using "${verboseName}"`);
            }
        } else {
            /**
             * Check our argument list
             * If we have arguments, we need an exit name
             */
            if (this.hasArguments()) {
                if (!this.category || !this.category.state.value) {
                    errors.push('A category name is required');
                }
            }

            /** If we have an exit name we need arguments */
            if (this.state.exitName) {
                if (!this.hasArguments()) {
                    const operator = this.context.getOperatorConfig(this.state.operator);
                    const { verboseName } = operator;
                    errors.push(`When using "${verboseName}", an argument is required.`);
                }
            }

            /** Validate numeric and date operators */
            if (this.hasArguments() && this.state.arguments[0].trim().indexOf('@') !== 0) {
                if (this.state.operator.indexOf('number') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(parseInt(this.state.arguments[0]))) {
                            errors.push('Enter a number when using numeric rules.');
                        }
                    }
                }

                if (this.state.operator.indexOf('date') > -1) {
                    if (this.state.arguments[0]) {
                        if (isNaN(Date.parse(this.state.arguments[0]))) {
                            errors.push('Enter a date when using date rules (e.g. 1/1/2017).');
                        }
                    }
                }
            }
        }

        if (this.state.errors.length === 0 && errors.length === 0) {
            return true;
        }

        this.setState({ errors });

        return errors.length === 0;
    }

    private getRemoveButton(): JSX.Element {
        let removeButton: JSX.Element = null;

        if (!this.props.empty) {
            removeButton = (
                <div className={styles['remove-button']} onClick={this.remove}>
                    <span className="icon-remove" />
                </div>
            );
        }

        return removeButton;
    }

    private getCase(): JSX.Element {
        const classes = [styles.case];

        if (this.state.errors.length > 0) {
            classes.push(forms.invalid);
        }

        const value = this.state.arguments ? this.state.arguments[0] : '';

        let args: JSX.Element = null;

        if (this.operatorConfig && this.operatorConfig.operands === 1) {
            args = (
                <TextInputElement
                    className={styles.input}
                    name="arguments"
                    onChange={this.onChangeArguments}
                    value={value}
                    autocomplete
                    ComponentMap={this.props.ComponentMap}
                />
            );
        }

        let cursor: string = 'default';
        let opacity: number = 1;

        /**
         * All cases except the empty, last case
         * and cases that have no siblings are draggable
         */
        if (this.props.draggable) {
            /** Draggable props */
            // prettier-ignore
            const {
                draggingCase,
                canDrag,
                isOver
            } = this.props;

            const dragging = draggingCase && draggingCase.id === this.props.id;

            if (dragging) {
                opacity = 0.25;
            }

            if (draggingCase) {
                cursor = 'move';
            } else {
                cursor = 'pointer';
            }
        }

        const removeButton: JSX.Element = this.getRemoveButton();

        return (
            /**
             * NOTE: Only native element nodes can be passed to React DnD connectors,
             * so we wrap FormElement in an arbitrary div.
             */
            <div
                style={{
                    /** Entire list should honor dragging cursor if we have a draggingCase */
                    cursor,
                    opacity
                }}>
                <FormElement
                    name={this.props.name}
                    errors={this.state.errors}
                    className={styles.group}>
                    <div className={`${styles.case} select-medium`}>
                        <div className={styles.choice}>
                            <Select
                                name="operator"
                                clearable={false}
                                options={this.context.operatorConfigList}
                                value={this.state.operator}
                                valueKey="type"
                                labelKey="verboseName"
                                optionClassName="operator"
                                searchable={false}
                                onChange={this.onChangeOperator}
                            />
                        </div>
                        <div className={styles.operand}>{args}</div>
                        <div className={styles['categorize-as']}>categorize as</div>
                        <div className={styles.category}>
                            <TextInputElement
                                ref={ele => (this.category = ele)}
                                className={styles.input}
                                name="exitName"
                                onChange={this.onChangeExitName}
                                value={this.state.exitName}
                                ComponentMap={this.props.ComponentMap}
                            />
                        </div>
                        {removeButton}
                    </div>
                </FormElement>
            </div>
        );
    }

    public render(): JSX.Element {
        const kase: JSX.Element = this.getCase();
        if (this.props.empty || !this.props.draggable) {
            /**
             * We return an unconnected case here because we don't
             * want empty cases or cases that don't have siblings to participate
             * in dragging or dropping.
             */
            return kase;
        } else {
            // prettier-ignore
            const {
                connectDragSource,
                connectDropTarget
            } = this.props;
            // prettier-ignore
            return connectDragSource(
                connectDropTarget(
                    kase
                )
            );
        }
    }
}
