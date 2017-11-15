import * as React from 'react';
import * as FlipMove from 'react-flip-move';
import * as update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';
import { DragDropContext } from 'react-dnd';
import { Node, SwitchRouter, Exit, Case, AnyAction } from '../../flowTypes';
import { Type, GetOperatorConfig, Operator } from '../../services/EditorConfig';
import { NodeEditorFormChildProps } from '../NodeEditor/NodeEditorForm';
import ComponentMap from '../../services/ComponentMap';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';
import CaseElement from '../form/CaseElement';
import TextInputElement, { HTMLTextElement } from '../form/TextInputElement';

const HTML5Backend = require('react-dnd-html5-backend');
const styles = require('./SwitchRouter.scss');

export interface CaseProps {
    kase: Case;
    exitName: string;
    onChanged: Function;
    moveCase: Function;
}

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 * @param newCases
 * @param previousExits
 */
export function resolveExits(newCases: CaseProps[], previous: Node): CombinedExits {
    /** Create mapping of our old exit uuids to old exit settings */
    let previousExitMap: { [uuid: string]: Exit } = {};

    if (previous.exits) {
        previousExitMap = previous.exits.reduce(
            (map, exit) => (map = { ...map, [exit.uuid]: exit }),
            {}
        );

        let exits: Exit[] = [];
        let cases: Case[] = [];

        /** Map our new cases to an appropriate exit */
        newCases.forEach(newCase => {
            /** See if we already have a suitable exit */
            let existingExit: Exit = null;

            /** Use our previous exit name if it isn't set */
            if (!newCase.exitName && newCase.kase.exit_uuid in previousExitMap) {
                newCase = { ...newCase, exitName: previousExitMap[newCase.kase.exit_uuid].name };
            }

            /** Ignore cases with empty names */
            if (!newCase.exitName || newCase.exitName.trim().length === 0) {
                return;
            }

            if (newCase.exitName) {
                /** Look through our new exits to see if we've already created one */
                for (let exit of exits) {
                    if (newCase.exitName && exit.name) {
                        if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
                            existingExit = exit;
                            break;
                        }
                    }
                }

                /** Couldn't find a new exit, look through our old ones */
                if (!existingExit) {
                    /** Look through our previous cases for a match */
                    if (previous.exits) {
                        for (let exit of previous.exits) {
                            if (newCase.exitName && exit.name) {
                                if (
                                    exit.name.toLowerCase() ===
                                    newCase.exitName.trim().toLowerCase()
                                ) {
                                    existingExit = exit;
                                    exits = [...exits, existingExit];
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            /** We found a suitable exit, point our case to it */
            if (existingExit) {
                newCase = update(newCase, {
                    kase: {
                        exit_uuid: {
                            $set: existingExit.uuid
                        }
                    }
                });
            } else {
                /** No existing exit, create a new one */
                /** Find our previous destination if we have one */
                let destination_node_uuid: string = null;

                if (newCase.kase.exit_uuid in previousExitMap) {
                    ({ [newCase.kase.exit_uuid]: { destination_node_uuid } } = previousExitMap);
                }

                newCase = update(newCase, {
                    kase: {
                        exit_uuid: {
                            $set: generateUUID()
                        }
                    }
                });

                const { exitName: name, kase: { exit_uuid: uuid } } = newCase;

                exits = [
                    ...exits,
                    {
                        name,
                        uuid,
                        destination_node_uuid
                    }
                ];
            }

            const { kase } = newCase;

            /** Remove exitName from our case */
            cases = [...cases, kase];
        });

        /** Add in our default exit */
        let defaultUUID: string = generateUUID();

        if (previous.router && previous.router.type === 'switch') {
            const router = previous.router as SwitchRouter;
            if (router && router.default_exit_uuid) {
                defaultUUID = router.default_exit_uuid;
            }
        }

        let defaultName: string = 'All Responses';

        if (exits.length > 0) {
            defaultName = 'Other';
        }

        let defaultDestination: string = null;

        if (defaultUUID in previousExitMap) {
            ({ [defaultUUID]: { destination_node_uuid: defaultDestination } } = previousExitMap);
        }

        exits = [
            ...exits,
            {
                uuid: defaultUUID,
                name: defaultName,
                destination_node_uuid: defaultDestination
            }
        ];

        return { cases, exits, defaultExit: defaultUUID };
    }
}

export interface SwitchRouterState {
    cases: CaseProps[];
    resultName: string;
    setResultName: boolean;
    operand: string;
}

export interface SwitchRouterFormProps extends NodeEditorFormChildProps {
    showAdvanced: boolean;
    node: Node;
    action: AnyAction;
    config: Type;
    updateRouter(node: Node, type: string, previousAction: AnyAction): void;
    getOperatorConfig: GetOperatorConfig;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    removeWidget(name: string): void;
    localizations?: LocalizedObject[];
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    ComponentMap: ComponentMap;
    operatorConfigList: Operator[];
    isTranslating: boolean;
    getLocalizedExits(widgets: { [name: string]: any }): { uuid: string; translations: any }[];
    renderExitTranslations(): JSX.Element;
}

class SwitchRouterForm extends React.Component<SwitchRouterFormProps, SwitchRouterState> {
    constructor(props: SwitchRouterFormProps) {
        super(props);

        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.moveCase = this.moveCase.bind(this);

        let cases: CaseProps[] = [];
        let resultName = '';
        let operand = '@input';

        const { exits } = this.props.node;
        const router = this.props.node.router as SwitchRouter;

        if (router && router.type === 'switch' && router.cases) {
            resultName = router.result_name;
            operand = router.operand;

            router.cases.forEach(kase => {
                let exitName: string = null;

                if (kase.exit_uuid) {
                    const exit = exits.find(exit => exit.uuid === kase.exit_uuid);

                    if (exit) {
                        exitName = exit.name;
                    }
                }

                try {
                    const config = this.props.getOperatorConfig(kase.type);

                    cases = [
                        ...cases,
                        {
                            kase,
                            exitName,
                            onChanged: this.onCaseChanged,
                            moveCase: this.moveCase
                        }
                    ];
                } catch (error) {
                    /** Ignore missing cases */
                }
            });
        }

        this.state = {
            cases,
            setResultName: false,
            resultName,
            operand
        };

        this.onValid = this.onValid.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
        this.onCaseRemoved = this.onCaseRemoved.bind(this);
        this.onShowNameField = this.onShowNameField.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        if (this.props.isTranslating) {
            return this.saveLocalization(widgets);
        }

        const { cases, exits, defaultExit } = resolveExits(this.state.cases, this.props.node);
        let optionalRouter = {};
        const resultNameEle = widgets['Result Name'] as TextInputElement;

        if (resultNameEle) {
            optionalRouter = {
                result_name: resultNameEle.state.value
            };
        }

        let optionalNode = {};

        if (this.props.config.type === 'wait_for_response') {
            optionalNode = {
                wait: { type: 'msg' }
            };
        }

        const router: SwitchRouter = {
            type: 'switch',
            default_exit_uuid: defaultExit,
            cases,
            operand: this.state.operand,
            ...optionalRouter
        };

        this.props.updateRouter(
            {
                uuid: this.props.node.uuid,
                router,
                exits,
                ...optionalNode
            },
            this.props.config.type,
            this.props.action
        );
    }

    private onShowNameField(): void {
        this.setState({
            setResultName: true
        });
    }

    private onExpressionChanged(event: React.SyntheticEvent<HTMLTextElement>): void {
        this.setState({
            operand: event.currentTarget.value
        });
    }

    private onCaseRemoved(c: CaseElement): void {
        let idx = this.state.cases.findIndex(
            (props: CaseProps) => props.kase.uuid === c.props.kase.uuid
        );

        if (idx > -1) {
            const cases = update(this.state.cases, { $splice: [[idx, 1]] });
            this.setState({ cases });
        }

        this.props.removeWidget(c.props.name);
    }

    private onCaseChanged(c: CaseElement): void {
        const newCase: CaseProps = {
            kase: {
                uuid: c.props.kase.uuid,
                type: c.state.operator,
                exit_uuid: c.props.kase.exit_uuid,
                arguments: c.state.arguments
            },
            onChanged: c.props.onChanged,
            moveCase: c.props.moveCase,
            exitName: c.state.exitName
        };

        let cases = this.state.cases;
        let found = false;

        for (let idx in cases) {
            const props = cases[idx];
            if (props.kase.uuid === c.props.kase.uuid) {
                cases = update(cases, { [idx]: { $set: newCase } });
                found = true;
                break;
            }
        }

        if (!found) {
            cases = update(cases, { $push: [newCase] });
        }

        this.setState({
            cases
        });
    }

    private saveLocalization(widgets: { [name: string]: any }): void {
        const { iso: language } = this.props.localizations[0].getLanguage();
        const updates = [
            ...this.props.getLocalizedExits(widgets),
            this.getLocalizedCases(widgets)
        ] as {
            uuid: string;
            translations: any;
        }[];

        this.props.updateLocalizations(language, updates);
    }

    private getLocalizedCases(widgets: {
        [name: string]: any;
    }): { uuid: string; translations: any }[] {
        let results: { uuid: string; translations: any }[] = [];
        const { cases } = this.props.node.router as SwitchRouter;

        cases.forEach(kase => {
            const input = widgets[kase.uuid] as TextInputElement;

            if (input) {
                const value = input.state.value.trim();
                if (value) {
                    results = [
                        ...results,
                        { uuid: kase.uuid, translations: { arguments: [value] } }
                    ];
                } else {
                    results = [...results, { uuid: kase.uuid, translations: null }];
                }
            }
        });

        return results;
    }

    private renderAdvanced(): JSX.Element {
        if (this.props.isTranslating) {
            let kases: JSX.Element[] = [];

            let language: Language;

            if (this.props.localizations && this.props.localizations.length) {
                language = this.props.localizations[0].getLanguage();
            }

            if (!language) {
                return null;
            }

            const { cases } = this.props.node.router as SwitchRouter;

            cases.forEach(kase => {
                if (kase.arguments && kase.arguments.length === 1) {
                    const localized = this.props.localizations.find(
                        (localizedObject: LocalizedObject) =>
                            localizedObject.getObject().uuid === kase.uuid
                    );

                    if (localized) {
                        let value: string = null;

                        if ('arguments' in localized.localizedKeys) {
                            const localizedCase: Case = localized.getObject() as Case;

                            if (localizedCase.arguments.length > 0) {
                                [value] = localizedCase.arguments;
                            }
                        }

                        const { verboseName } = this.props.getOperatorConfig(kase.type);

                        const [argument] = kase.arguments;

                        kases = [
                            ...kases,
                            <div key={`translate_${kase.uuid}`} className={styles.translating_case}>
                                <div className={styles.translating_operator}>{verboseName}</div>
                                <div className={styles.translating_from}>{argument}</div>
                                <div className={styles.translating_to}>
                                    <TextInputElement
                                        ref={this.props.onBindAdvancedWidget}
                                        name={kase.uuid}
                                        placeholder={`${language.name} Translation`}
                                        showLabel={false}
                                        value={value}
                                        ComponentMap={this.props.ComponentMap}
                                    />
                                </div>
                            </div>
                        ];
                    }
                }
            });

            if (!kases.length) {
                return null;
            }

            return (
                <div>
                    <div className={styles.title}>Rules</div>
                    <div className={styles.instructions}>
                        Sometimes languages need special rules to route things properly. If a
                        translation is not provided, the original rule will be used.
                    </div>
                    <div>{kases}</div>
                </div>
            );
        }

        return null;
    }

    private renderForm(): JSX.Element {
        if (this.props.isTranslating) {
            return this.props.renderExitTranslations();
        } else {
            let cases: JSX.Element[] = [];
            let needsEmpty: boolean = true;

            if (this.state.cases) {
                this.state.cases.map((c: CaseProps, index: number) => {
                    /** Is this case empty? */
                    if (
                        (!c.exitName || c.exitName.trim().length === 0) &&
                        (!c.kase.arguments || c.kase.arguments[0].trim().length === 0)
                    ) {
                        needsEmpty = false;
                    }

                    cases = [
                        ...cases,
                        <CaseElement
                            key={c.kase.uuid}
                            kase={c.kase}
                            ref={this.props.onBindWidget}
                            name={`case_${index}`}
                            exitName={c.exitName}
                            onRemove={this.onCaseRemoved}
                            onChanged={this.onCaseChanged}
                            moveCase={this.moveCase}
                            getOperatorConfig={this.props.getOperatorConfig}
                            operatorConfigList={this.props.operatorConfigList}
                            ComponentMap={this.props.ComponentMap}
                        />
                    ];
                });
            }

            if (needsEmpty) {
                const newCaseUUID = generateUUID();

                cases = [
                    ...cases,
                    <CaseElement
                        kase={{
                            uuid: newCaseUUID,
                            type: 'has_any_word',
                            exit_uuid: null
                        }}
                        key={newCaseUUID}
                        ref={this.props.onBindWidget}
                        name={`case_${cases.length}`}
                        exitName={null}
                        onRemove={this.onCaseRemoved}
                        moveCase={this.moveCase}
                        onChanged={this.onCaseChanged}
                        getOperatorConfig={this.props.getOperatorConfig}
                        operatorConfigList={this.props.operatorConfigList}
                        ComponentMap={this.props.ComponentMap}
                    />
                ];
            }

            let nameField: JSX.Element = null;

            if (this.state.setResultName || this.state.resultName) {
                nameField = (
                    <TextInputElement
                        ref={this.props.onBindWidget}
                        name="Result Name"
                        showLabel={true}
                        value={this.state.resultName}
                        helpText="By naming the result, you can reference it later using @run.results.whatever_the_name_is"
                        ComponentMap={this.props.ComponentMap}
                    />
                );
            } else {
                nameField = (
                    <span className={styles.save_link} onClick={this.onShowNameField}>
                        Save as..
                    </span>
                );
            }

            let leadIn: JSX.Element = null;

            if (this.props.config.type === 'wait_for_response') {
                leadIn = <div className={styles.instructions}>If the message response..</div>;
            } else if (this.props.config.type === 'expression') {
                leadIn = (
                    <div className={styles.instructions}>
                        <p>If the expression..</p>
                        <TextInputElement
                            ref={this.props.onBindWidget}
                            key={`expression_${this.props.node.uuid}`}
                            name="Expression"
                            showLabel={false}
                            value={this.state.operand}
                            onChange={this.onExpressionChanged}
                            autocomplete
                            required
                            ComponentMap={this.props.ComponentMap}
                        />
                    </div>
                );
            }

            return (
                <div className={styles.switch}>
                    {leadIn}
                    <div className={styles.cases}>{cases}</div>
                    <div className={styles.save_as}>{nameField}</div>
                </div>
            );
        }
    }

    private moveCase(dragIndex: number, hoverIndex: number): void {
        const { cases } = this.state;
        const dragCase = cases[dragIndex];

        this.setState(
            update(this.state, {
                cards: {
                    $splice: [[dragIndex, 1], [hoverIndex, 0, dragCase]]
                }
            })
        );
    }

    public render(): JSX.Element {
        const { cases } = this.state;
        const { showAdvanced } = this.props;

        if (showAdvanced && cases.length) {
            return this.renderAdvanced();
        }
        return this.renderForm();
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
