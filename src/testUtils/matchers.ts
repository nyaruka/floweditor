import { RenderNode } from '../store/flowContext';
import { dump } from '../utils';
import { Exit } from '../flowTypes';
import { Store } from 'redux';
import { AppState } from '../store';

interface MatchResult {
    message: () => string;
    pass: boolean;
}

function toHaveInboundConnections<T>(this: jest.MatcherUtils, received: RenderNode): MatchResult {
    if (Object.keys(received.inboundConnections).length > 1) {
        return {
            message: () => `Node ${received.node.uuid} has an inbound connection`,
            pass: true
        };
    }

    return {
        message: () => `Node${received.node.uuid} has no inbound connections`,
        pass: false
    };
}

function toHaveInboundFrom<T>(
    this: jest.MatcherUtils,
    received: RenderNode,
    expected: Exit
): MatchResult {
    for (const exitUUID of Object.keys(received.inboundConnections)) {
        if (exitUUID === expected.uuid) {
            return {
                message: () =>
                    `Node ${received.node.uuid} incorrectly has inbound from ${expected.uuid}`,
                pass: true
            };
        }
    }

    return {
        message: () =>
            `Node ${received.node.uuid} doesn't have inbound connection from ${expected.uuid}`,
        pass: false
    };
}

function toPointTo<T>(this: jest.MatcherUtils, received: Exit, expected: RenderNode): MatchResult {
    if (received.destination_node_uuid === expected.node.uuid) {
        return {
            message: () => `${received.uuid} incorrectly points to ${expected.node.uuid}`,
            pass: true
        };
    }

    return {
        message: () => `Expected ${received.uuid} to point to ${expected.node.uuid}`,
        pass: false
    };
}

function toHaveExitWithDestination<T>(this: jest.MatcherUtils, received: RenderNode): MatchResult {
    for (const exit of received.node.exits) {
        if (exit.destination_node_uuid !== null) {
            return {
                message: () => `Exit ${exit.uuid} in node ${received.node.uuid} has a destination`,
                pass: true
            };
        }
    }

    return {
        message: () => `All exits for ${received.node.uuid} are disconnected`,
        pass: false
    };
}

function toHaveExitThatPointsTo<T>(
    this: jest.MatcherUtils,
    received: RenderNode,
    expected: RenderNode
): MatchResult {
    for (const exit of received.node.exits) {
        if (exit.destination_node_uuid === expected.node.uuid) {
            return {
                message: () =>
                    `${exit.uuid} incorrectly has exit that points to ${expected.node.uuid}`,
                pass: true
            };
        }
    }

    return {
        message: () =>
            `Expected ${received.node.uuid} to have an exit that points to ${expected.node.uuid}`,
        pass: false
    };
}

function toHavePayload<T>(
    this: jest.MatcherUtils,
    store: any,
    actionType: string,
    expectedPayload: any
): MatchResult {
    const payload = JSON.stringify(expectedPayload);
    for (const actionTaken of store.getActions()) {
        if (actionTaken.type === actionType) {
            if (JSON.stringify(actionTaken.payload) === payload) {
                return {
                    message: () =>
                        `Result contained action type ${actionType} with payload ${payload}`,
                    pass: true
                };
            }
        }
    }

    return {
        message: () => `Could not find action type ${actionType} with payload ${payload}`,
        pass: false
    };
}

function toHaveReduxAction<T>(
    this: jest.MatcherUtils,
    store: any,
    actionType: string
): MatchResult {
    for (const actionTaken of store.getActions()) {
        if (actionTaken.type === actionType) {
            return {
                message: () => `Result contained action type ${actionType}`,
                pass: true
            };
        }
    }

    return {
        message: () => `Could not find action type ${actionType}`,
        pass: false
    };
}

expect.extend({
    toPointTo,
    toHaveExitThatPointsTo,
    toHaveInboundFrom,
    toHaveExitWithDestination,
    toHaveInboundConnections,
    toHavePayload,
    toHaveReduxAction
});
