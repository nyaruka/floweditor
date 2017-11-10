import * as React from 'react';
import * as UUID from 'uuid';
import * as FlipMove from 'react-flip-move';

//import {Case} from '../Case';
import { Type, GetOperatorConfig, Operator } from '../../services/EditorConfig';
import ComponentMap from '../../services/ComponentMap';
import { CaseElement } from '../form/CaseElement';
import TextInputElement, {  HTMLTextElement } from '../form/TextInputElement';
import { Node, Router, SwitchRouter, Exit, Case, AnyAction } from '../../flowTypes';

import { DragDropContext } from 'react-dnd';
import Widget from '../NodeEditor/Widget';
import { Language } from '../LanguageSelector';
import { LocalizedObject } from '../../services/Localization';

const HTML5Backend = require('react-dnd-html5-backend');
const update = require('immutability-helper');
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
    // create mapping of our old exit uuids to old exit settings
    var previousExitMap: { [uuid: string]: Exit } = {};
    if (previous.exits) {
        for (let exit of previous.exits) {
            previousExitMap[exit.uuid] = exit;
        }
    }

    var exits: Exit[] = [];
    var cases: Case[] = [];

    // map our new cases to an appropriate exit
    for (let newCase of newCases) {
        // see if we have a suitable exit for our case already
        var existingExit: Exit = null;

        // use our previous exit name if it isn't set
        if (!newCase.exitName && newCase.kase.exit_uuid in previousExitMap) {
            newCase.exitName = previousExitMap[newCase.kase.exit_uuid].name;
        }

        // ignore cases with empty names
        if (!newCase.exitName || newCase.exitName.trim().length == 0) {
            continue;
        }

        if (newCase.exitName) {
            // look through our new exits to see if we've already created one
            for (let exit of exits) {
                if (newCase.exitName && exit.name) {
                    if (exit.name.toLowerCase() == newCase.exitName.trim().toLowerCase()) {
                        existingExit = exit;
                        break;
                    }
                }
            }

            // couldn't find a new exit, look through our old ones
            if (!existingExit) {
                // look through our previous cases for a match
                if (previous.exits) {
                    for (let exit of previous.exits) {
                        if (newCase.exitName && exit.name) {
                            if (exit.name.toLowerCase() == newCase.exitName.trim().toLowerCase()) {
                                existingExit = exit;
                                exits.push(existingExit);
                                break;
                            }
                        }
                    }
                }
            }
        }

        // we found a suitable exit, point our case to it
        if (existingExit) {
            newCase.kase.exit_uuid = existingExit.uuid;
        } else {
            // no existing exit, create a new one
            // find our previous destination if we have one
            var destination = null;
            if (newCase.kase.exit_uuid in previousExitMap) {
                destination = previousExitMap[newCase.kase.exit_uuid].destination_node_uuid;
            }

            newCase.kase.exit_uuid = UUID.v4();

            exits.push({
                name: newCase.exitName,
                uuid: newCase.kase.exit_uuid,
                destination_node_uuid: destination
            });
        }

        // remove exitName from our case
        cases.push(newCase.kase);
    }

    // add in our default exit
    var defaultUUID = UUID.v4();
    if (previous.router && previous.router.type == 'switch') {
        var router = previous.router as SwitchRouter;
        if (router && router.default_exit_uuid) {
            defaultUUID = router.default_exit_uuid;
        }
    }

    var defaultName = 'All Responses';
    if (exits.length > 0) {
        defaultName = 'Other';
    }

    var defaultDestination = null;
    if (defaultUUID in previousExitMap) {
        defaultDestination = previousExitMap[defaultUUID].destination_node_uuid;
    }

    exits.push({
        uuid: defaultUUID,
        name: defaultName,
        destination_node_uuid: defaultDestination
    });

    return { cases: cases, exits: exits, defaultExit: defaultUUID };
}

export interface SwitchRouterState {
    cases: CaseProps[];
    resultName: string;
    setResultName: boolean;
    operand: string;
}

export interface SwitchRouterFormProps {
    advanced: boolean;
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
    getLocalizedExits(widgets: {
        [name: string]: Widget;
    }): { uuid: string; translations: any }[];
    getInitialRouter(): Router;
    renderExitTranslations(): JSX.Element;
    validationCallback: Function;
}

class SwitchRouterForm extends React.Component<SwitchRouterFormProps, SwitchRouterState> {
    constructor(props: SwitchRouterFormProps) {
        super(props);

        var cases: CaseProps[] = [];
        var resultName = '';
        var operand = '@input';

        var initial = this.props.getInitialRouter() as SwitchRouter;

        var exits = this.props.node.exits;
        if (initial && initial.type === 'switch' && initial.cases) {
            for (let kase of initial.cases) {
                var exitName = null;
                if (kase.exit_uuid) {
                    var exit = exits.find(exit => {
                        return exit.uuid == kase.exit_uuid;
                    });
                    if (exit) {
                        exitName = exit.name;
                    }
                }

                try {
                    var config = this.props.getOperatorConfig(kase.type);
                    cases.push({
                        kase: kase,
                        exitName: exitName,
                        onChanged: this.onCaseChanged.bind(this),
                        moveCase: this.moveCase.bind(this)
                    });
                } catch (error) {
                    // ignore missing cases
                }
            }

            resultName = initial.result_name;
            operand = initial.operand;
        }

        this.state = {
            cases,
            setResultName: false,
            resultName: resultName,
            operand: operand
        } as SwitchRouterState;

        this.validationCallback = this.validationCallback.bind(this);
        this.onCaseChanged = this.onCaseChanged.bind(this);
        this.onExpressionChanged = this.onExpressionChanged.bind(this);
    }

    private onShowNameField() {
        this.setState({
            setResultName: true
        });
    }

    onExpressionChanged(event: React.SyntheticEvent<HTMLTextElement>) {
        this.setState({
            operand: event.currentTarget.value
        });
    }

    onCaseRemoved(c: CaseElement) {
        let idx = this.state.cases.findIndex((props: CaseProps) => {
            return props.kase.uuid == c.props.kase.uuid;
        });
        if (idx > -1) {
            var cases = update(this.state.cases, { $splice: [[idx, 1]] });
            this.setState({ cases: cases });
        }
        this.props.removeWidget(c.props.name);
    }

    onCaseChanged(c: CaseElement) {
        var cases = this.state.cases;
        var newCase: CaseProps = {
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

        var found = false;
        for (var idx in this.state.cases) {
            var props = this.state.cases[idx];
            if (props.kase.uuid == c.props.kase.uuid) {
                cases = update(this.state.cases, { [idx]: { $set: newCase } });
                found = true;
                break;
            }
        }

        if (!found) {
            cases = update(this.state.cases, { $push: [newCase] });
        }

        this.setState({
            cases: cases
        });
    }

    saveLocalization(widgets: { [name: string]: Widget }) {
        let updates = this.props.getLocalizedExits(widgets);
        let { iso: language } = this.props.localizations[0].getLanguage();
        updates = [...updates, this.getLocalizedCases(widgets)] as { uuid: string; translations: any }[];
        this.props.updateLocalizations(language, updates);
    }

    getLocalizedCases(widgets: { [name: string]: Widget }): { uuid: string; translations: any }[] {
        var results: { uuid: string; translations: any }[] = [];
        var router = this.props.getInitialRouter() as SwitchRouter;
        for (let kase of router.cases) {
            var input = widgets[kase.uuid] as TextInputElement;
            if (input) {
                var value = input.state.value.trim();
                if (value) {
                    results.push({ uuid: kase.uuid, translations: { arguments: [value] } });
                } else {
                    results.push({ uuid: kase.uuid, translations: null });
                }
            }
        }
        return results;
    }

    renderAdvanced(): JSX.Element {
        if (this.props.isTranslating) {
            // var cases: JSX.Element[] = [];
            var kases: JSX.Element[] = [];

            var language: Language;
            if (this.props.hasOwnProperty('localizations') && this.props.localizations.length > 0) {
                language = this.props.localizations[0].getLanguage();
            }

            if (!language) {
                return null;
            }

            var router = this.props.getInitialRouter() as SwitchRouter;
            for (let kase of router.cases) {
                if (kase.arguments && kase.arguments.length == 1) {
                    var localized = this.props.localizations.find(
                        (localizedObject: LocalizedObject) => {
                            return localizedObject.getObject().uuid == kase.uuid;
                        }
                    );
                    if (localized) {
                        var value = null;
                        if ('arguments' in localized.localizedKeys) {
                            var localizedCase: Case = localized.getObject() as Case;
                            if (localizedCase.arguments.length > 0) {
                                value = localizedCase.arguments[0];
                            }
                        }

                        var config = this.props.getOperatorConfig(kase.type);

                        kases.push(
                            <div key={'translate_' + kase.uuid} className={styles.translating_case}>
                                <div className={styles.translating_operator}>
                                    {config.verboseName}
                                </div>
                                <div className={styles.translating_from}>{kase.arguments[0]}</div>
                                <div className={styles.translating_to}>
                                    <TextInputElement
                                        ref={this.props.onBindAdvancedWidget}
                                        name={kase.uuid}
                                        placeholder={language.name + ' Translation'}
                                        showLabel={false}
                                        value={value}
                                        ComponentMap={this.props.ComponentMap}
                                    />
                                </div>
                            </div>
                        );
                    }
                }
            }

            if (kases.length == 0) {
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

    renderForm(): JSX.Element {
        if (this.props.isTranslating) {
            return this.props.renderExitTranslations();
        } else {
            var cases: JSX.Element[] = [];
            var needsEmpty = true;
            if (this.state.cases) {
                this.state.cases.map((c: CaseProps, index: number) => {
                    // is this case empty?
                    if (
                        (!c.exitName || c.exitName.trim().length == 0) &&
                        (!c.kase.arguments || c.kase.arguments[0].trim().length == 0)
                    ) {
                        needsEmpty = false;
                    }

                    cases.push(
                        <CaseElement
                            key={c.kase.uuid}
                            kase={c.kase}
                            ref={this.props.onBindWidget}
                            name={'case_' + index}
                            exitName={c.exitName}
                            onRemove={this.onCaseRemoved.bind(this)}
                            onChanged={this.onCaseChanged.bind(this)}
                            moveCase={this.moveCase.bind(this)}
                            getOperatorConfig={this.props.getOperatorConfig}
                            operatorConfigList={this.props.operatorConfigList}
                            ComponentMap={this.props.ComponentMap}
                        />
                    );
                });
            }

            if (needsEmpty) {
                var newCaseUUID = UUID.v4();
                cases.push(
                    <CaseElement
                        kase={{
                            uuid: newCaseUUID,
                            type: 'has_any_word',
                            exit_uuid: null
                        }}
                        key={newCaseUUID}
                        ref={this.props.onBindWidget}
                        name={'case_' + cases.length}
                        exitName={null}
                        onRemove={this.onCaseRemoved.bind(this)}
                        moveCase={this.moveCase.bind(this)}
                        onChanged={this.onCaseChanged.bind(this)}
                        getOperatorConfig={this.props.getOperatorConfig}
                        operatorConfigList={this.props.operatorConfigList}
                        ComponentMap={this.props.ComponentMap}
                    />
                );
            }

            var nameField = null;
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
                    <span className={styles.save_link} onClick={this.onShowNameField.bind(this)}>
                        Save as..
                    </span>
                );
            }

            var leadIn = null;

            if (this.props.config.type == 'wait_for_response') {
                leadIn = <div className={styles.instructions}>If the message response..</div>;
            } else if (this.props.config.type == 'expression') {
                leadIn = (
                    <div className={styles.instructions}>
                        <p>If the expression..</p>
                        <TextInputElement
                            ref={this.props.onBindWidget}
                            key={'expression_' + this.props.node.uuid}
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

    moveCase(dragIndex: number, hoverIndex: number) {
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

    validationCallback(widgets: { [name: string]: Widget }) {
        if (this.props.isTranslating) {
            return this.saveLocalization(widgets);
        }

        const { cases, exits, defaultExit } = resolveExits(this.state.cases, this.props.node);
        var optionalRouter = {};
        var resultNameEle = widgets['Result Name'] as TextInputElement;
        if (resultNameEle) {
            optionalRouter = {
                result_name: resultNameEle.state.value
            };
        }

        var optionalNode = {};
        if (this.props.config.type == 'wait_for_response') {
            optionalNode = {
                wait: { type: 'msg' }
            };
        }

        var router: SwitchRouter = {
            type: 'switch',
            default_exit_uuid: defaultExit,
            cases: cases,
            operand: this.state.operand,
            ...optionalRouter
        };

        this.props.updateRouter(
            {
                uuid: this.props.node.uuid,
                router: router,
                exits: exits,
                ...optionalNode
            },
            this.props.config.type,
            this.props.action
        );
    }

    render(): JSX.Element {
        this.props.validationCallback(this.validationCallback);

        if (this.props.advanced) {
            return this.renderAdvanced();
        }
        return this.renderForm();
    }
}

export default DragDropContext(HTML5Backend)(SwitchRouterForm);
