import { getTypeConfig } from '../../../config';
import { createSetup, getSpecWrapper } from '../../../testUtils';
import { getLanguage, getLocalization } from '../../../utils';
import {
    actionContainerSpecId,
    actionOverlaySpecId,
    ActionWrapper,
    ActionWrapperProps,
    actionInteractiveDivSpecId,
    actionBodySpecId
} from './Action';
import { FlowNode, SendMsg, StartFlow, SwitchRouter } from '../../../flowTypes';

const config = require('../../../../__test__/assets/config');

const sendMsgAction: SendMsg = {
    uuid: 'send_msg_action0',
    type: 'send_msg',
    text: 'Hello World!'
};

const sendMsgAction1: SendMsg = {
    uuid: 'send_msg_action1',
    type: 'send_msg',
    text: 'Hello World!'
};

const sendMsgNode: FlowNode = {
    uuid: 'send_msg_node',
    actions: [sendMsgAction],
    exits: []
};

const startFlowAction: StartFlow = {
    uuid: 'start_flow_action',
    type: 'start_flow',
    flow_name: 'Flow to Start',
    flow_uuid: 'flow_to_start'
};

const startFlowNode: FlowNode = {
    uuid: 'start_flow_node',
    actions: [startFlowAction],
    exits: [],
    router: {
        type: 'switch',
        operand: '@child'
    } as SwitchRouter,
    wait: {
        type: 'flow',
        flow_uuid: 'flow_to_start'
    }
};

const context = {
    languages: config.languages
};

const english = getLanguage(config.languages, 'eng');
const spanish = getLanguage(config.languages, 'spa');

const baseProps = {
    thisNodeDragging: false,
    localization: { spa: {} },
    first: true,
    action: sendMsgAction,
    render: jest.fn(),
    node: sendMsgNode,
    language: english,
    translating: false,
    onOpenNodeEditor: jest.fn(),
    removeAction: jest.fn(),
    moveActionUp: jest.fn()
};

const setup = createSetup<ActionWrapperProps>(ActionWrapper, baseProps, context);

const COMPONENT_TO_TEST = ActionWrapper.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper, props: { action, render: renderMock }, instance } = setup(
                { render: jest.fn() },
                true
            );
            const { name } = getTypeConfig(action.type);
            const expectedClasses = 'action';
            const actionToInject = action;
            const titleBarClass = action.type;
            const showRemoval = true;
            const showMove = false;
            const actionContainer = getSpecWrapper(wrapper, actionContainerSpecId);

            expect(actionContainer.prop('id')).toBe(`action-${action.uuid}`);
            expect(actionContainer.hasClass(expectedClasses)).toBeTruthy();
            expect(getSpecWrapper(wrapper, actionOverlaySpecId).hasClass('overlay')).toBeTruthy();
            expect(getSpecWrapper(wrapper, actionInteractiveDivSpecId).exists()).toBeTruthy();
            expect(wrapper.find('TitleBar').props()).toEqual({
                __className: action.type,
                title: name,
                onRemoval: instance.onRemoval,
                showRemoval,
                showMove,
                onMoveUp: instance.onMoveUp
            });
            expect(getSpecWrapper(wrapper, actionBodySpecId).hasClass('body')).toBeTruthy();
            expect(renderMock).toHaveBeenCalledTimes(1);
            expect(renderMock).toHaveBeenCalledWith(action);
            expect(wrapper).toMatchSnapshot();
        });

        it('should show move icon', () => {
            const { wrapper } = setup({ first: false }, true);

            expect(wrapper.find('TitleBar').prop('showMove')).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should display translating style', () => {
            const { wrapper } = setup({ translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('translating')
            ).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should display not_localizable style', () => {
            const { wrapper } = setup({ action: startFlowAction, translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('not_localizable')
            ).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should display hybrid style', () => {
            const { wrapper } = setup({ node: startFlowNode }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('has_router')
            ).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });

        it('should display missing_localization style', () => {
            const { wrapper } = setup({ action: sendMsgAction1, translating: true }, true);

            expect(
                getSpecWrapper(wrapper, actionContainerSpecId).hasClass('missing_localization')
            ).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('onClick', () => {
            it('should be called when interactive div is clicked', () => {
                const onClickSpy = jest.spyOn(ActionWrapper.prototype, 'onClick');
                const { wrapper } = setup({}, true);
                const interactiveDiv = getSpecWrapper(wrapper, actionInteractiveDivSpecId);
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                interactiveDiv.simulate('mouseDown', mockEvent);
                interactiveDiv.simulate('mouseUp', mockEvent);

                expect(onClickSpy).toHaveBeenCalledTimes(1);
                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

                onClickSpy.mockRestore();
            });

            it("should call 'onOpenEditor' action creator if node is not dragging", () => {
                const {
                    wrapper,
                    props: { onOpenNodeEditor: onOpenNodeEditorMock, node, action },
                    context: { languages },
                    instance
                } = setup({ onOpenNodeEditor: jest.fn() }, true);
                const mockEvent = {
                    preventDefault: jest.fn(),
                    stopPropagation: jest.fn()
                };

                instance.onClick(mockEvent);

                expect(onOpenNodeEditorMock).toHaveBeenCalledTimes(1);
                expect(onOpenNodeEditorMock).toHaveBeenCalledWith(node, action, languages);
            });
        });

        describe('onRemoval', () => {
            it('should call removeAction action creator', () => {
                const {
                    wrapper,
                    props: { removeAction: removeActionMock, action, node },
                    instance
                } = setup({ removeAction: jest.fn() }, true);
                const mockEvent = {
                    stopPropagation: jest.fn()
                };

                instance.onRemoval(mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
                expect(removeActionMock).toHaveBeenCalledTimes(1);
                expect(removeActionMock).toHaveBeenCalledWith(node.uuid, action);
            });
        });

        describe('onMoveUp', () => {
            it('should call moveActionUp action creator', () => {
                const {
                    wrapper,
                    props: { moveActionUp: moveActionUpMock, action, node },
                    instance
                } = setup({ moveActionUp: jest.fn() }, true);
                const mockEvent = {
                    stopPropagation: jest.fn()
                };

                instance.onMoveUp(mockEvent);

                expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
                expect(moveActionUpMock).toHaveBeenCalledTimes(1);
                expect(moveActionUpMock).toHaveBeenCalledWith(node.uuid, action);
            });
        });

        describe('getAction', () => {
            it('should return the action passed via props if not localized', () => {
                const { wrapper, props: { action }, instance } = setup({ node: sendMsgNode }, true);
                expect(instance.getAction()).toEqual(action);
            });

            it('should return localized action if localized', () => {
                const {
                    wrapper,
                    props: { action, localization, language: { iso } },
                    context: { languages },
                    instance
                } = setup({}, true);
                const localizedObject = getLocalization(
                    action,
                    localization,
                    iso,
                    languages
                ).getObject();

                expect(instance.getAction()).toEqual(localizedObject);
            });
        });
    });
});
