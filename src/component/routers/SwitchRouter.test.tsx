import update from 'immutability-helper';
import * as React from 'react';
import { CaseElementProps } from '~/component/form/CaseElement';
import TextInputElement from '~/component/form/TextInputElement';
import { DEFAULT_OPERAND } from '~/component/NodeEditor';
import { getOperatorConfig, Operators } from '~/config/operatorConfigs';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { SwitchRouter } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { getLocalizations } from '~/store/helpers';
import { composeComponentTestUtils, getSpecWrapper, setMock } from '~/testUtils';
import { createCase, createExit, createWaitRouterNode, Spanish } from '~/testUtils/assetCreators';
import { reorderList } from '~/utils';

import { EXPRESSION_LABEL } from './constants';
import {
    addFocus,
    casePropsFromElement,
    DragCursor,
    getItemStyle,
    getListStyle,
    InputToFocus,
    leadInSpecId,
    SwitchRouterForm,
    SwitchRouterFormProps
} from './SwitchRouter';

let mockUuidCounts = 1;
jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => `generated_uuid_${mockUuidCounts++}`)
    };
});

const rulesMeta = [
    { exitUUID: 'exit-1', exitName: 'Yes', type: Operators.has_any_word, args: ['y, yes'] },
    { exitUUID: 'exit-2', exitName: 'No', type: Operators.has_any_word, args: ['n, no'] },
    {
        exitUUID: 'exit-3',
        exitName: 'No Response',
        type: Operators.has_wait_timed_out,
        args: ['@run']
    }
];

const exits = rulesMeta.map(({ exitUUID, exitName }, idx) =>
    createExit({
        uuid: exitUUID,
        name: exitName,
        destination_node_uuid: `node-${idx}`
    })
);

const cases = rulesMeta.map(({ exitUUID, type, args }, idx) =>
    createCase({
        uuid: `case-${idx}`,
        type,
        exit_uuid: exitUUID,
        args
    })
);

const nodeToEdit = createWaitRouterNode({
    exits,
    cases,
    timeout: 300
});

const baseProps: SwitchRouterFormProps = {
    language: { id: 'eng', name: 'English', type: AssetType.Language },
    typeConfig: getTypeConfig(Types.wait_for_response),
    translating: false,
    settings: { originalNode: nodeToEdit },
    operand: DEFAULT_OPERAND,
    showAdvanced: false,
    saveLocalizations: jest.fn(),
    updateRouter: jest.fn(),
    onExpressionChanged: jest.fn(),
    getExitTranslations: jest.fn(),
    getResultNameField: jest.fn(),
    onBindWidget: jest.fn(),
    onBindAdvancedWidget: jest.fn(),
    removeWidget: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SwitchRouterForm, baseProps);

describe(SwitchRouterForm.name, () => {
    beforeEach(() => {
        mockUuidCounts = 1;
    });

    describe('helpers', () => {
        describe('getListStyle', () => {
            it('should return null', () => {
                expect(getListStyle(true, true)).toBeNull();
            });

            it('should return dragging cursor', () => {
                expect(getListStyle(true, false)).toEqual({ cursor: DragCursor.move });
            });

            it('should return pointer cursor', () => {
                expect(getListStyle(false, false)).toEqual({ cursor: DragCursor.pointer });
            });
        });

        describe('getItemStyle', () => {
            const draggableStyle = {
                position: 'fixed',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 4500,
                width: 605,
                height: 40,
                top: 262,
                left: 389,
                margin: 0,
                transform: 'translate(0px, 0.036933467580315696px)',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                touchAction: 'manipulation'
            };

            it('should return draggable style', () => {
                expect(getItemStyle(draggableStyle, false)).toEqual({
                    ...draggableStyle,
                    userSelect: 'none',
                    outline: 'none'
                });
            });

            it('should return modified draggable style', () => {
                expect(getItemStyle(draggableStyle, true)).toMatchSnapshot();
            });
        });

        describe('addFocus', () => {
            it('should apply arg focus', () => {
                expect(addFocus({} as any, InputToFocus.args)).toEqual({ focusArgs: true });
            });

            it('should apply min focus', () => {
                expect(addFocus({} as any, InputToFocus.min)).toEqual({ focusMin: true });
            });

            it('should apply max focus', () => {
                expect(addFocus({} as any, InputToFocus.max)).toEqual({ focusMax: true });
            });

            it('should apply exit focus', () => {
                expect(addFocus({} as any, InputToFocus.exit)).toEqual({ focusExit: true });
            });
        });

        describe('casePropsFromElement', () => {
            it('should convert CaseElement properties into a CaseElementProps object', () => {
                expect(
                    casePropsFromElement({
                        caseElement: {
                            props: {
                                kase: {
                                    uuid: '75541df6-f5f7-4f7b-944b-9604cd6cf338',
                                    exit_uuid: null
                                }
                            },
                            state: {
                                operatorConfig: getOperatorConfig(Operators.has_any_word),
                                arguments: ['no'],
                                exitName: 'No'
                            }
                        } as any
                    })
                ).toMatchSnapshot();
            });
        });
    });

    describe('render', () => {
        it('should render base form', () => {
            const { wrapper, props } = setup(false, { getResultNameField: setMock() });

            expect(wrapper.find('CaseElement').length).toBe(3);
            expect(props.getResultNameField).toHaveBeenCalledTimes(1);
        });

        it('should render exit translation form', () => {
            const { wrapper, props } = setup(true, {
                translating: { $set: true },
                getExitTranslations: setMock(() => <div />)
            });

            expect(props.getExitTranslations).toHaveBeenCalledTimes(1);
            expect(wrapper).toMatchSnapshot();
        });

        it('should render advanced form', () => {
            const renderAdvancedSpy = spyOn('renderAdvanced');
            const translations = {
                [(nodeToEdit.router as SwitchRouter).cases[0].uuid]: {
                    name: ['Si'],
                    arguments: ['si, simón']
                }
            };
            const localizations = getLocalizations(nodeToEdit, null, Spanish, translations);
            const { wrapper, props } = setup(true, {
                translating: { $set: true },
                showAdvanced: { $set: true },
                $merge: {
                    settings: {
                        originalNode: nodeToEdit,
                        localizations
                    }
                }
            });

            expect(renderAdvancedSpy).toHaveBeenCalledTimes(1);
            expect(wrapper).toMatchSnapshot();

            renderAdvancedSpy.mockRestore();
        });
    });

    describe('instance methods', () => {
        describe('getCaseContext', () => {
            it('should return unwrapped, empty case', () => {
                const { wrapper, props } = setup(true, {
                    settings: {
                        originalNode: { router: { $merge: { cases: [] } } }
                    }
                });

                expect(getSpecWrapper(wrapper, leadInSpecId).exists()).toBeTruthy();
                expect(wrapper.find('CaseElement').length).toBe(1);
                expect(wrapper).toMatchSnapshot();
            });
        });

        describe('getLeadIn', () => {
            it('should return expression input', () => {
                const { wrapper, props } = setup(true, {
                    typeConfig: { $set: getTypeConfig(Types.split_by_expression) }
                });

                expect(wrapper.find('p').text()).toBe(EXPRESSION_LABEL);
                expect(wrapper.find(TextInputElement).exists()).toBeTruthy();
                expect(getSpecWrapper(wrapper, leadInSpecId)).toMatchSnapshot();
            });
        });

        describe('getCasesToRender', () => {
            const partialCase: CaseElementProps = {
                exitName: '',
                kase: {
                    arguments: [],
                    exit_uuid: null,
                    type: Operators.has_all_words,
                    uuid: 'partial-case'
                }
            };

            it('should add an undraggable, displayable case', () => {
                const { wrapper } = setup(true, {
                    settings: {
                        originalNode: {
                            router: {
                                $merge: {
                                    cases: [cases[0]]
                                }
                            }
                        }
                    }
                });

                expect(wrapper).toMatchSnapshot();
            });

            it('should add partially-formed case', () => {
                const { wrapper, props } = setup(false);

                // create a partially-formed case
                wrapper.setState({
                    displayableCases: [...wrapper.state('displayableCases')[0], partialCase]
                });

                // register update
                wrapper.update();

                // find our cases
                const caseElements = wrapper.find('CaseElement');

                expect(caseElements.length).toBe(2);
                expect(caseElements.at(1).props()).toMatchSnapshot();
            });

            it("should hold off on adding an empty case if displayable case's operator expects 1 or more operand and its arguments and exitName are empty", () => {
                const { wrapper, props } = setup(false);

                // create a partially-formed case
                wrapper.setState({
                    displayableCases: [...wrapper.state('displayableCases'), partialCase]
                });

                // register update
                wrapper.update();

                // find our cases
                const caseElements = wrapper.find('CaseElement');

                expect(caseElements.length).toBe(3);
                expect(caseElements.at(2).props()).toMatchSnapshot();
            });
        });

        describe('onDragEnd', () => {
            it('should return early if no destination is passed', () => {
                const { wrapper, instance } = setup();

                expect(instance.onDragEnd({})).toBeUndefined();
            });

            it('should update state w/ reordered cases', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const mockDropResult = {
                    draggableId: '3ed694c3-9f51-4b2e-b459-92e3e15c8bef',
                    type: 'DEFAULT',
                    source: {
                        index: 0,
                        droppableId: 'droppable'
                    },
                    destination: {
                        droppableId: 'droppable',
                        index: 2
                    }
                };
                const reorderedCases = reorderList(
                    wrapper.state('displayableCases'),
                    mockDropResult.source.index,
                    mockDropResult.destination.index
                );

                instance.onDragEnd(mockDropResult);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({ displayableCases: reorderedCases });

                setStateSpy.mockRestore();
            });
        });

        describe('onValid', () => {
            it('should update router', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateRouter: setMock()
                });

                instance.onValid();

                expect(props.updateRouter).toHaveBeenCalledTimes(1);
                expect(props.updateRouter).toHaveBeenCalledWith(wrapper.state('displayableCases'));
            });

            it('should save localizations', () => {
                const widgets = {
                    ['7eb09740-7692-401c-ad41-41545bf442bc']: true,
                    ['8adcc59f-3390-4f34-b02f-4b0fbe6eefe3']: true
                };
                const { wrapper, instance, props } = setup(true, {
                    translating: { $set: true },
                    saveLocalizations: setMock()
                });

                instance.onValid(widgets);

                expect(props.saveLocalizations).toHaveBeenCalledTimes(1);
                expect(props.saveLocalizations).toHaveBeenCalledWith(
                    widgets,
                    wrapper.state('displayableCases')
                );
            });
        });

        describe('handleCaseRemoved', () => {
            it('should update state, remove widget', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance, props } = setup(true, {
                    removeWidget: setMock()
                });
                const { uuid: caseUUID } = (props.settings.originalNode
                    .router as SwitchRouter).cases[0];
                const caseToRemove = {
                    props: {
                        name: `case_${caseUUID}`,
                        kase: {
                            uuid: caseUUID
                        }
                    }
                };

                const displayableCases = update(wrapper.state('displayableCases'), {
                    $splice: [[0, 1]]
                });

                instance.handleCaseRemoved(caseToRemove);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith(
                    { displayableCases },
                    expect.any(Function)
                );
                expect(props.removeWidget).toHaveBeenCalledTimes(1);
                expect(props.removeWidget).toHaveBeenCalledWith(caseToRemove.props.name);

                setStateSpy.mockRestore();
            });
        });

        describe('handleCaseChanged', () => {
            it('should update existing case', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const { uuid: existingCaseUUID, type: operatorType } = cases[0];
                const { uuid: exitsingExitUUID, name: exitName } = exits[0];
                // updating the first case's arguments
                const updatedCase = {
                    props: {
                        kase: {
                            uuid: existingCaseUUID,
                            exit_uuid: exitsingExitUUID
                        }
                    },
                    state: {
                        operatorConfig: getOperatorConfig(operatorType),
                        arguments: ['y', 'yes', 'sure'],
                        exitName
                    }
                };
                const updatedCaseProps = casePropsFromElement({
                    caseElement: updatedCase as any,
                    inputToFocus: InputToFocus.args
                });

                instance.handleCaseChanged(updatedCase, InputToFocus.args);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({
                    displayableCases: [
                        updatedCaseProps,
                        ...wrapper.state('displayableCases').slice(1)
                    ]
                });

                setStateSpy.mockRestore();
            });

            it('should add new case', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper, instance } = setup();
                const newCase = {
                    props: {
                        kase: {
                            uuid: '75541df6-f5f7-4f7b-944b-9604cd6cf338',
                            exit_uuid: null as string
                        }
                    },
                    state: {
                        operatorConfig: getOperatorConfig(Operators.has_any_word),
                        arguments: ['maybe'],
                        exitName: 'Maybe'
                    }
                };
                const newCaseProps = casePropsFromElement({
                    caseElement: newCase as any,
                    inputToFocus: InputToFocus.args
                });
                const currentState = wrapper.state('displayableCases');

                instance.handleCaseChanged(newCase, InputToFocus.args);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({
                    displayableCases: [
                        ...currentState.slice(0, currentState.length - 1),
                        newCaseProps
                    ]
                });

                setStateSpy.mockRestore();
            });
        });
    });
});
