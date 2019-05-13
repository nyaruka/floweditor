import {
    Flow,
    FlowStoreProps,
    getDragStyle,
    ghostNodeSpecId,
    isDraggingBack,
    REPAINT_TIMEOUT
} from '~/components/flow/Flow';
import { getDraggedFrom } from '~/components/helpers';
import { FlowTypes } from '~/config/interfaces';
import { createEmptyNode, getFlowComponents } from '~/store/helpers';
import { ConnectionEvent } from '~/store/thunks';
import {
    composeComponentTestUtils,
    composeDuxState,
    getSpecWrapper,
    mock,
    setMock
} from '~/testUtils';
import { createUUID, merge, set } from '~/utils';
import * as utils from '~/utils';

jest.mock('~/services/Plumber');
jest.useFakeTimers();

mock(utils, 'createUUID', utils.seededUUIDs());

const {
    flowContext: { definition }
} = composeDuxState();

const { renderNodeMap: initialNodes } = getFlowComponents(definition);

const baseProps: FlowStoreProps = {
    editorState: {
        ghostNode: null
    },
    mergeEditorState: jest.fn(),
    definition,
    nodeEditorSettings: null,
    nodes: initialNodes,
    dependencies: [],
    updateConnection: jest.fn(),
    onOpenNodeEditor: jest.fn(),
    onRemoveNodes: jest.fn(),
    onUpdateCanvasPositions: jest.fn(),
    resetNodeEditingState: jest.fn(),
    onConnectionDrag: jest.fn(),
    updateSticky: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(Flow, baseProps);

describe(Flow.name, () => {
    let ghostNodeFromWait: any;
    let ghostNodeFromAction: any;
    let mockConnectionEvent: Partial<ConnectionEvent>;

    const { nodes } = baseProps;
    const nodeMapKeys = Object.keys(nodes);

    beforeEach(() => {
        const waitNode = nodes[nodeMapKeys[nodeMapKeys.length - 6]];

        ghostNodeFromWait = createEmptyNode(
            waitNode,
            waitNode.node.exits[0].uuid,
            1,
            FlowTypes.MESSAGE
        );

        const actionNode = nodes[nodeMapKeys[0]];
        ghostNodeFromAction = createEmptyNode(
            actionNode,
            actionNode.node.exits[0].uuid,
            1,
            FlowTypes.MESSAGE
        );

        mockConnectionEvent = {
            sourceId: `${createUUID()}:${createUUID()}`,
            targetId: createUUID(),
            suspendedElementId: createUUID(),
            source: null
        };

        // Clear instance mocks
        jest.clearAllTimers();
    });

    const dragSelection = {
        startX: 270,
        startY: 91,
        currentX: 500,
        currentY: 302,
        selected: {
            '46e8d603-8e5d-4435-97dd-1333291aafca': { left: 500, top: 300 },
            'bc978e00-2f3d-41f2-87c1-26b3f14e5925': { left: 300, top: 200 }
        }
    };

    describe('helpers', () => {
        describe('isDraggingBack', () => {
            it('should return false if event indicates user is not returning to drag origin', () => {
                expect(isDraggingBack(mockConnectionEvent as ConnectionEvent)).toBeFalsy();
            });

            it('should return true if event indicates user is returning to drag origin', () => {
                const suspendedElementId = createUUID();

                expect(
                    isDraggingBack({
                        ...mockConnectionEvent,
                        source: document.createElement('div'),
                        suspendedElementId,
                        targetId: suspendedElementId
                    } as ConnectionEvent)
                ).toBeTruthy();
            });
        });

        describe('getDragStyle', () => {
            it('should return style object for drag selection box', () => {
                expect(getDragStyle(dragSelection)).toMatchSnapshot();
            });
        });
    });

    describe('render', () => {
        it('should render NodeEditor', () => {
            const { wrapper } = setup(true, {
                mergeEditorState: set(jest.fn()),
                nodeEditorSettings: { $set: { originalNode: null } }
            });

            expect(wrapper.find('Connect(NodeEditor)').props()).toMatchSnapshot();
        });

        it('should render Simulator', () => {
            const { wrapper } = setup(
                true,
                { mergeEditorState: set(jest.fn()) },
                {},
                {
                    config: { endpoints: merge({ simulateStart: 'startMeUp' }) }
                }
            );

            expect(wrapper.find('Connect(Simulator)').props()).toMatchSnapshot();
        });

        it('should render dragNode', () => {
            const { wrapper, instance, props } = setup(true, {
                mergeEditorState: set(jest.fn()),
                editorState: { ghostNode: set(ghostNodeFromWait) }
            });
            const ghost = getSpecWrapper(wrapper, ghostNodeSpecId);

            expect(ghost.key()).toBe(props.editorState.ghostNode.node.uuid);
            expect(ghost).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('componentDidMount', () => {
            const componentDidMountSpy = spyOn('componentDidMount');
            const { instance, props } = setup(true);

            jest.runAllTimers();

            expect(componentDidMountSpy).toHaveBeenCalledTimes(1);

            expect(instance.Plumber.bind).toHaveBeenCalledTimes(7);
            expect(instance.Plumber.bind).toHaveBeenCalledWith('connection', expect.any(Function));
            expect(instance.Plumber.bind).toHaveBeenCalledWith('connection', expect.any(Function));
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'connectionDrag',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'connectionDragStop',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'beforeStartDetach',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith(
                'beforeDetach',
                expect.any(Function)
            );
            expect(instance.Plumber.bind).toHaveBeenCalledWith('beforeDrop', expect.any(Function));
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), REPAINT_TIMEOUT);
            expect(instance.Plumber.repaint).toHaveBeenCalledTimes(1);

            componentDidMountSpy.mockRestore();
        });

        describe('componenWillUnmount', () => {
            const componentWillUnmountSpy = spyOn('componentWillUnmount');
            const { wrapper, instance } = setup();

            wrapper.unmount();

            expect(componentWillUnmountSpy).toHaveBeenCalledTimes(1);
            expect(instance.Plumber.reset).toHaveBeenCalledTimes(1);

            componentWillUnmountSpy.mockRestore();
        });

        describe('onBeforeConnectorDrop', () => {
            it('should call resetNodeEditingState prop', () => {
                const { wrapper, instance, props } = setup(true, {
                    resetNodeEditingState: setMock()
                });

                instance.onBeforeConnectorDrop(mockConnectionEvent);

                expect(props.resetNodeEditingState).toHaveBeenCalledTimes(1);
            });

            it('should return false if pointing to itself', () => {
                const { instance } = setup();
                const sourceId = createUUID();

                expect(
                    instance.onBeforeConnectorDrop({
                        ...mockConnectionEvent,
                        sourceId: `${sourceId}:${createUUID()}`,
                        targetId: sourceId
                    })
                ).toBeFalsy();
            });

            it('should return true if not pointing to itself', () => {
                const { instance, props } = setup();
                const uuids = Object.keys(props.nodes);
                const connectionEvent = {
                    sourceId: `${uuids[0]}:${props.nodes[uuids[0]].node.exits[0].uuid}`,
                    targetId: uuids[1],
                    suspendedElementId: uuids[0],
                    source: null as any
                };

                expect(instance.onBeforeConnectorDrop(connectionEvent)).toBeTruthy();
            });
        });

        describe('onConnectorDrop', () => {
            it('should not do NodeEditor work if the user is dragging back', () => {
                const { instance, props } = setup(true, {
                    onOpenNodeEditor: setMock()
                });

                jest.runAllTimers();

                instance.onConnectorDrop(mockConnectionEvent);

                expect(instance.Plumber.recalculate).not.toHaveBeenCalled();
                expect(instance.Plumber.connect).not.toHaveBeenCalled();
                expect(props.mergeEditorState).toHaveBeenCalled();
                expect(props.onOpenNodeEditor).not.toHaveBeenCalled();
            });

            it('should do NodeEditor work if the user is not dragging back', () => {
                // tslint:disable-next-line:no-shadowed-variable
                const { instance, props } = setup(true, {
                    editorState: {
                        onOpenNodeEditor: setMock(),
                        ghostNode: set(ghostNodeFromWait)
                    }
                });

                instance.onConnectorDrop({
                    ...mockConnectionEvent,
                    source: document.createElement('div')
                });

                jest.runAllTimers();

                expect(instance.Plumber.recalculate).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.recalculate).toHaveBeenCalledWith(
                    props.editorState.ghostNode.node.uuid
                );
                expect(instance.Plumber.connect).toHaveBeenCalledTimes(1);

                const dragPoint = getDraggedFrom(props.editorState.ghostNode);
                expect(instance.Plumber.connect).toHaveBeenCalledWith(
                    `${dragPoint.nodeUUID}:${dragPoint.exitUUID}`,
                    props.editorState.ghostNode.node.uuid
                );

                expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
                expect(props.onOpenNodeEditor).toMatchCallSnapshot();
            });
        });

        describe('beforeConnectionDrag', () => {
            it('should return reversse of translating prop', () => {
                const { wrapper, instance, props } = setup();

                expect(instance.beforeConnectionDrag(mockConnectionEvent)).toBe(
                    !props.editorState.translating
                );
            });
        });
    });
});
