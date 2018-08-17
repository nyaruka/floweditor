import { FlowState } from '../FlowContext';

export const FlowConsumer = (props: any): JSX.Element => {
    const flowState: FlowState = {
        results: {},
        nodes: {},
        ghostNode: null,
        definition: null,
        nodeEditorOpen: false,
        nodeEditor: null,
        typeConfig: null,
        languages: [],

        mutator: {
            fetchFlow: jest.fn(),
            initializeFlow: jest.fn(),
            addFlowResult: jest.fn(),
            addToNode: jest.fn(),
            removeNode: jest.fn(),
            updateNodePosition: jest.fn(),
            updateNodeDimensions: jest.fn(),
            updateConnection: jest.fn(),
            updateConnectionDrag: jest.fn(),
            ensureStartNode: jest.fn(),
            updateSticky: jest.fn(),
            removeAction: jest.fn(),
            moveActionUp: jest.fn(),
            updateRouter: jest.fn(),
            updateAction: jest.fn(),
            updateLocalizations: jest.fn(),
            disconnectExit: jest.fn(),
            openNodeEditor: jest.fn(),
            closeNodeEditor: jest.fn(),
            updateTypeConfig: jest.fn()
        }
    };

    return props.children(flowState);
};
