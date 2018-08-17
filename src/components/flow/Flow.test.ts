import {
    dragSelectSpecId,
    Flow,
    FlowStoreProps,
    getDragStyle,
    ghostNodeSpecId,
    isDraggingBack,
    nodesContainerSpecId,
    nodeSpecId,
    REPAINT_TIMEOUT
} from '~/components/flow/Flow';
import { getDraggedFrom } from '~/components/helpers';
import { getActivity } from '~/external';
import ActivityManager from '~/services/ActivityManager';
import { getFlowComponents, getGhostNode } from '~/store/helpers';
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

jest.mock('~/services/ActivityManager');
jest.mock('~/services/Plumber');
jest.useFakeTimers();

mock(utils, 'createUUID', utils.seededUUIDs());

const {
    flowContext: { definition }
} = composeDuxState();

const { renderNodeMap: initialNodes } = getFlowComponents(definition);

const baseProps: FlowStoreProps = {
    editorState: {
        ghostNode: null,
        dragSelection: null
    },
    mergeEditorState: jest.fn(),
    definition,
    nodeEditorSettings: null,
    nodes: initialNodes,
    dependencies: [],
    ensureStartNode: jest.fn(),
    updateConnection: jest.fn(),
    onOpenNodeEditor: jest.fn(),
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
        // Clear instance mocks
        const waitNode = nodes[nodeMapKeys[nodeMapKeys.length - 1]];
        ghostNodeFromWait = getGhostNode(waitNode, waitNode.node.exits[0].uuid, 1);

        const actionNode = nodes[nodeMapKeys[0]];
        ghostNodeFromAction = getGhostNode(actionNode, actionNode.node.exits[0].uuid, 1);

        mockConnectionEvent = {
            sourceId: `${createUUID()}:${createUUID()}`,
            targetId: createUUID(),
            suspendedElementId: createUUID(),
            source: null
        };

        jest.clearAllTimers();
    });

    const dragSelection = {
        startX: 270,
        startY: 91,
        currentX: 500,
        currentY: 302,
        selected: {
            '46e8d603-8e5d-4435-97dd-1333291aafca': true,
            'bc978e00-2f3d-41f2-87c1-26b3f14e5925': true
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
        it('should render self, children with base props', () => {
            const { wrapper, instance, props } = setup();
            const nodeList = getSpecWrapper(wrapper, nodeSpecId);
            const nodeContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

            expect(nodeContainer.hasClass('nodeList')).toBeTruthy();
            expect(nodeContainer.props()).toEqual(
                expect.objectContaining({
                    onMouseDown: instance.onMouseDown,
                    onMouseMove: instance.onMouseMove,
                    onMouseUp: instance.onMouseUp
                })
            );
            expect(nodeList.length).toBe(props.definition.nodes.length);
            nodeList.forEach((node: any, idx: number) => {
                const renderMapKeys = Object.keys(props.nodes);
                const nodeUUID = renderMapKeys[idx];
                const renderNode = props.nodes[nodeUUID];

                expect(node.key()).toBe(nodeUUID);
                expect(node.props()).toMatchSnapshot();
            });
            expect(wrapper).toMatchSnapshot();
        });

        it('should render NodeEditor', () => {
            const { wrapper } = setup(true, {
                editorState: { $merge: { nodeEditorOpen: true } }
            });

            expect(wrapper.find('Connect(NodeEditor)').props()).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });

        it('should render Simulator', () => {
            const { wrapper, instance, props, context } = setup(
                false,
                {},
                {},
                {
                    endpoints: merge({ simulateStart: 'startMeUp' })
                }
            );

            // if we let jest string this one for us it fails
            // presumably it's hitting an OOM due to circular references
            // and reporting it as a RangeError
            // https://github.com/nodejs/node-v0.x-archive/issues/14170
            expect(JSON.stringify(wrapper.find('Simulator').props(), null, 1)).toMatchSnapshot();
            expect(wrapper.find('Simulator').html()).toMatchSnapshot();
        });

        it('should render dragNode', () => {
            const { wrapper, instance, props } = setup(true, {
                editorState: { ghostNode: set(ghostNodeFromWait) }
            });
            const ghost = getSpecWrapper(wrapper, ghostNodeSpecId);

            expect(ghost.key()).toBe(props.editorState.ghostNode.node.uuid);
            expect(ghost.props()).toEqual(
                expect.objectContaining({
                    ghost: true,
                    renderNode: props.editorState.ghostNode,
                    Activity: instance.Activity,
                    plumberRepaintForDuration: instance.Plumber.repaintForDuration,
                    plumberDraggable: instance.Plumber.draggable,
                    plumberMakeTarget: instance.Plumber.makeTarget,
                    plumberRemove: instance.Plumber.remove,
                    plumberRecalculate: instance.Plumber.recalculate,
                    plumberMakeSource: instance.Plumber.makeSource,
                    plumberConnectExit: instance.Plumber.connectExit,
                    plumberSetDragSelection: instance.Plumber.setDragSelection,
                    plumberClearDragSelection: instance.Plumber.clearDragSelection,
                    plumberRemoveFromDragSelection: instance.Plumber.removeFromDragSelection
                })
            );
        });

        it('should render drag selection box', () => {
            const { wrapper, props } = setup(true, {
                editorState: { dragSelection: set(dragSelection) }
            });
            const drag = getSpecWrapper(wrapper, dragSelectSpecId);

            expect(drag.hasClass('dragSelection')).toBeTruthy();
            expect(drag.prop('style')).toEqual(getDragStyle(props.editorState.dragSelection));
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('constructor', () => {
            const { wrapper, props } = setup();

            // Instanstiate ActivityManager, Plumber
            // expect(ActivityManager).toHaveBeenCalledTimes(1);
            expect(ActivityManager).toHaveBeenCalledWith(props.definition.uuid, getActivity);
            // expect(Plumber).toHaveBeenCalledTimes(1);
        });

        describe('componentDidMount', () => {
            const componentDidMountSpy = spyOn('componentDidMount');
            const { wrapper, instance, props } = setup(true, {
                ensureStartNode: setMock()
            });

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

            expect(props.ensureStartNode).toHaveBeenCalledTimes(1);

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
                const { wrapper, instance } = setup();
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
                const { wrapper, instance } = setup();

                expect(instance.onBeforeConnectorDrop(mockConnectionEvent)).toBeTruthy();
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
                expect(props.mergeEditorState).not.toHaveBeenCalled();
                expect(props.onOpenNodeEditor).not.toHaveBeenCalled();
            });

            it('should do NodeEditor work if the user is not dragging back', () => {
                const suspendedElementId = createUUID();
                const ghostRefSpy = spyOn('ghostRef');

                // tslint:disable-next-line:no-shadowed-variable
                const { instance, props } = setup(false, {
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

                expect(ghostRefSpy).toHaveBeenCalledTimes(1);
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

        describe('onMouseDown', () => {
            it('should call updateDragSelection prop', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    mergeEditorState: setMock()
                });

                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                const mockMouseDownEvent = {
                    pageX: 138,
                    pageY: 307,
                    target: { id: nodesContainer.props().id }
                };

                nodesContainer.simulate('mouseDown', mockMouseDownEvent);

                expect(props.mergeEditorState).toHaveBeenCalledTimes(1);
                expect(props.mergeEditorState).toHaveBeenCalledWith({
                    dragSelection: {
                        startX: mockMouseDownEvent.pageX,
                        startY: mockMouseDownEvent.pageY,
                        currentX: mockMouseDownEvent.pageX,
                        currentY: mockMouseDownEvent.pageY,
                        selected: null
                    }
                });
            });
        });

        describe('onMouseMove', () => {
            it('should call updateDragSelection prop if user is creating a drag selection', () => {
                const { wrapper, instance, props } = setup(true, {
                    editorState: {
                        updateDragSelection: setMock(),
                        dragSelection: set(dragSelection)
                    },
                    mergeEditorState: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                const mockMouseMoveEvent = {
                    pageX: 519,
                    pageY: 372,
                    target: { id: nodesContainer.props().id }
                };

                instance.containerOffset = {
                    left: 20,
                    top: 70
                };

                nodesContainer.simulate('mouseMove', mockMouseMoveEvent);

                expect(props.mergeEditorState).toHaveBeenCalledTimes(1);
                expect(props.mergeEditorState).toHaveBeenCalledWith({
                    dragSelection: {
                        startX: props.editorState.dragSelection.startX,
                        startY: props.editorState.dragSelection.startY,
                        currentX: mockMouseMoveEvent.pageX - instance.containerOffset.left,
                        currentY: mockMouseMoveEvent.pageY - instance.containerOffset.top,
                        selected: {}
                    }
                });
            });

            it('should not call updateDragSelection prop if user is not creating a drag selection', () => {
                const { wrapper, props } = setup(true, {
                    updateDragSelection: setMock(),
                    mergeEditorState: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseMove');

                expect(props.mergeEditorState).not.toHaveBeenCalled();
            });
        });

        describe('onMouseUp', () => {
            it('should call updateDragSelection if user is creating a drag selection', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    editorState: {
                        dragSelection: set(dragSelection)
                    },
                    mergeEditorState: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.mergeEditorState).toHaveBeenCalledTimes(1);
                expect(props.mergeEditorState).toHaveBeenCalledWith({
                    dragSelection: {
                        startX: null,
                        startY: null,
                        currentX: null,
                        currentY: null,
                        selected: props.editorState.dragSelection.selected
                    }
                });
            });

            it('notify jsplumb of the drag selection if nodes selected', () => {
                const { wrapper, instance, props } = setup(true, {
                    editorState: {
                        updateDragSelection: setMock(),
                        dragSelection: set(dragSelection)
                    }
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(instance.Plumber.setDragSelection).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.setDragSelection).toHaveBeenCalledWith(
                    props.editorState.dragSelection.selected
                );
            });

            it('should not call updateDragSelection, notify jsplumb of selection if no selection exists', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    mergeEditorState: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.mergeEditorState).not.toHaveBeenCalled();
                expect(instance.Plumber.setDragSelection).not.toHaveBeenCalled();
            });
        });
    });
});
