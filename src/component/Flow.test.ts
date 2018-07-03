import { v4 as generateUUID } from 'uuid';

import {
    dragSelectSpecId,
    Flow,
    FlowStoreProps,
    getDragStyle,
    getGhostUI,
    GHOST_POSITION_INITIAL,
    ghostNodeSpecId,
    isDraggingBack,
    nodesContainerSpecId,
    nodeSpecId,
    REPAINT_TIMEOUT
} from '../component/Flow';
import { Types } from '../config/typeConfigs';
import { getActivity } from '../external';
import ActivityManager from '../services/ActivityManager';
import Plumber from '../services/Plumber';
import { ConnectionEvent } from '../store';
import { getFlowComponents, getGhostNode } from '../store/helpers';
import { composeComponentTestUtils, composeDuxState, getSpecWrapper, setMock } from '../testUtils';
import { merge, set, setTrue } from '../utils';

jest.mock('../services/ActivityManager');
jest.mock('../services/Plumber');
jest.useFakeTimers();

let mockUuidCounts = 1;
jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => `generated_uuid_${mockUuidCounts++}`)
    };
});

const { flowContext: { definition } } = composeDuxState();

const { renderNodeMap: initialNodes } = getFlowComponents(definition);

const baseProps: FlowStoreProps = {
    translating: false,
    definition,
    nodes: initialNodes,
    dependencies: [],
    ghostNode: null,
    pendingConnection: null,
    dragSelection: null,
    nodeEditorOpen: false,
    ensureStartNode: jest.fn(),
    updateConnection: jest.fn(),
    onOpenNodeEditor: jest.fn(),
    resetNodeEditingState: jest.fn(),
    onConnectionDrag: jest.fn(),
    updateCreateNodePosition: jest.fn(),
    updateDragSelection: jest.fn(),
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
        mockUuidCounts = 1;
        ghostNodeFromWait = getGhostNode(nodes[nodeMapKeys[nodeMapKeys.length - 1]], 1);
        ghostNodeFromAction = getGhostNode(nodes[nodeMapKeys[0]], 1);

        mockConnectionEvent = {
            sourceId: `${generateUUID()}:${generateUUID()}`,
            targetId: generateUUID(),
            suspendedElementId: generateUUID(),
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
                const suspendedElementId = generateUUID();

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

        describe('getGhostUI', () => {
            it('should return only the position of the ghost node if it does not have a router', () => {
                const ghostUI = getGhostUI(ghostNodeFromWait);

                expect(ghostUI).toEqual({
                    position: GHOST_POSITION_INITIAL
                });
                expect(ghostUI).toMatchSnapshot();
            });

            it('should return the position and type of the ghost node if it has a router', () => {
                const ghostUI = getGhostUI(ghostNodeFromAction);

                expect(ghostUI).toEqual({
                    position: GHOST_POSITION_INITIAL,
                    type: Types.wait_for_response
                });
                expect(ghostUI).toMatchSnapshot();
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
                expect(node.props()).toEqual(
                    expect.objectContaining({
                        node: renderNode.node,
                        ui: renderNode.ui,
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
            expect(wrapper).toMatchSnapshot();
        });

        it('should render NodeEditor', () => {
            const { wrapper, instance } = setup(true, {
                nodeEditorOpen: setTrue()
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
                ghostNode: set(ghostNodeFromWait)
            });
            const ghost = getSpecWrapper(wrapper, ghostNodeSpecId);

            expect(ghost.key()).toBe(props.ghostNode.uuid);
            expect(ghost.props()).toEqual(
                expect.objectContaining({
                    ghost: true,
                    node: props.ghostNode,
                    ui: getGhostUI(props.ghostNode),
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
                dragSelection: set(dragSelection)
            });
            const drag = getSpecWrapper(wrapper, dragSelectSpecId);

            expect(drag.hasClass('dragSelection')).toBeTruthy();
            expect(drag.prop('style')).toEqual(getDragStyle(props.dragSelection));
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('instance methods', () => {
        describe('constructor', () => {
            const { wrapper, props } = setup();

            // Instanstiate ActivityManager, Plumber
            expect(ActivityManager).toHaveBeenCalledTimes(1);
            expect(ActivityManager).toHaveBeenCalledWith(props.definition.uuid, getActivity);
            expect(Plumber).toHaveBeenCalledTimes(1);
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
                const sourceId = generateUUID();

                expect(
                    instance.onBeforeConnectorDrop({
                        ...mockConnectionEvent,
                        sourceId: `${sourceId}:${generateUUID()}`,
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
                const { wrapper, instance, props } = setup(true, {
                    updateCreateNodePosition: setMock(),
                    onOpenNodeEditor: setMock()
                });

                jest.runAllTimers();

                instance.onConnectorDrop(mockConnectionEvent);

                expect(instance.Plumber.recalculate).not.toHaveBeenCalled();
                expect(instance.Plumber.connect).not.toHaveBeenCalled();
                expect(props.updateCreateNodePosition).not.toHaveBeenCalled();
                expect(props.onOpenNodeEditor).not.toHaveBeenCalled();
            });

            it('should do NodeEditor work if the user is not dragging back', () => {
                const pendingConnection = {
                    exitUUID: generateUUID(),
                    nodeUUID: generateUUID()
                };
                const suspendedElementId = generateUUID();
                const ghostRefSpy = spyOn('ghostRef');

                // tslint:disable-next-line:no-shadowed-variable
                const { wrapper, instance, props, context } = setup(false, {
                    updateCreateNodePosition: setMock(),
                    onOpenNodeEditor: setMock(),
                    ghostNode: set(ghostNodeFromWait),
                    pendingConnection: set(pendingConnection)
                });

                instance.onConnectorDrop({
                    ...mockConnectionEvent,
                    source: document.createElement('div')
                });

                jest.runAllTimers();

                expect(ghostRefSpy).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.recalculate).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.recalculate).toHaveBeenCalledWith(props.ghostNode.uuid);
                expect(instance.Plumber.connect).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.connect).toHaveBeenCalledWith(
                    `${props.pendingConnection.nodeUUID}:${props.pendingConnection.exitUUID}`,
                    props.ghostNode.uuid
                );
                expect(props.updateCreateNodePosition).toHaveBeenCalledTimes(1);
                expect(props.onOpenNodeEditor).toHaveBeenCalledTimes(1);
                expect(props.onOpenNodeEditor).toHaveBeenCalledWith({
                    originalNode: props.ghostNode
                });
            });
        });

        describe('beforeConnectionDrag', () => {
            it('should return reversse of translating prop', () => {
                const { wrapper, instance, props } = setup();

                expect(instance.beforeConnectionDrag(mockConnectionEvent)).toBe(!props.translating);
            });
        });

        describe('onMouseDown', () => {
            it('should call updateDragSelection prop', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock()
                });

                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                const mockMouseDownEvent = {
                    pageX: 138,
                    pageY: 307,
                    target: { id: nodesContainer.props().id }
                };

                nodesContainer.simulate('mouseDown', mockMouseDownEvent);

                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: mockMouseDownEvent.pageX,
                    startY: mockMouseDownEvent.pageY,
                    currentX: mockMouseDownEvent.pageX,
                    currentY: mockMouseDownEvent.pageY,
                    selected: null
                });
            });
        });

        describe('onMouseMove', () => {
            it('should call updateDragSelection prop if user is creating a drag selection', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    dragSelection: set(dragSelection)
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

                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: props.dragSelection.startX,
                    startY: props.dragSelection.startY,
                    currentX: mockMouseMoveEvent.pageX - instance.containerOffset.left,
                    currentY: mockMouseMoveEvent.pageY - instance.containerOffset.top,
                    selected: {}
                });
            });

            it('should not call updateDragSelection prop if user is not creating a drag selection', () => {
                const { wrapper, props } = setup(true, {
                    updateDragSelection: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseMove');

                expect(props.updateDragSelection).not.toHaveBeenCalled();
            });
        });

        describe('onMouseUp', () => {
            it('should call updateDragSelection if user is creating a drag selection', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    dragSelection: set(dragSelection)
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.updateDragSelection).toHaveBeenCalledTimes(1);
                expect(props.updateDragSelection).toHaveBeenCalledWith({
                    startX: null,
                    startY: null,
                    currentX: null,
                    currentY: null,
                    selected: props.dragSelection.selected
                });
            });

            it('notify jsplumb of the drag selection if nodes selected', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock(),
                    dragSelection: set(dragSelection)
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(instance.Plumber.setDragSelection).toHaveBeenCalledTimes(1);
                expect(instance.Plumber.setDragSelection).toHaveBeenCalledWith(
                    props.dragSelection.selected
                );
            });

            it('should not call updateDragSelection, notify jsplumb of selection if no selection exists', () => {
                const { wrapper, instance, props } = setup(true, {
                    updateDragSelection: setMock()
                });
                const nodesContainer = getSpecWrapper(wrapper, nodesContainerSpecId);

                nodesContainer.simulate('mouseUp');

                expect(props.updateDragSelection).not.toHaveBeenCalled();
                expect(instance.Plumber.setDragSelection).not.toHaveBeenCalled();
            });
        });
    });
});
