import { v4 as generateUUID } from 'uuid';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { DefaultExitNames } from '~/components/nodeeditor/NodeEditor';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import { Action, Case, Exit, FlowNode, Router, RouterTypes, SwitchRouter, Wait } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

export interface CombinedExits {
    cases: Case[];
    exits: Exit[];
    defaultExit: string;
}

export const createRenderNode = (
    uuid: string,
    router: Router,
    exits: Exit[],
    type: Types,
    actions: Action[] = [],
    wait: Wait = null
): RenderNode => {
    return {
        node: {
            uuid,
            actions,
            router,
            exits,
            wait
        },
        ui: {
            type,
            position: null
        },
        inboundConnections: {}
    };
};

export const hasCases = (node: FlowNode): boolean => {
    if (
        node.router &&
        (node.router as SwitchRouter).cases &&
        (node.router as SwitchRouter).cases.length
    ) {
        return true;
    }
    return false;
};

export const createCaseProps = (cases: Case[], exits: Exit[]): CaseProps[] => {
    return cases
        .filter((kase: Case) => kase.type !== Operators.has_wait_timed_out)
        .map((kase: Case) => {
            const matchingExit = exits.find((exit: Exit) => exit.uuid === kase.exit_uuid);
            return {
                uuid: kase.uuid,
                kase,
                exitName: matchingExit ? matchingExit.name : null
            };
        });
};

/**
 * Given a set of cases and previous exits, determines correct merging of cases
 * and the union of exits
 */
export const resolveExits = (
    newCases: CaseProps[],
    hasTimeout: boolean,
    settings: NodeEditorSettings
): CombinedExits => {
    // create mapping of our old exit uuids to old exit settings
    const previousExitMap: { [uuid: string]: Exit } = {};

    if (settings.originalNode.node.exits) {
        for (const exit of settings.originalNode.node.exits) {
            previousExitMap[exit.uuid] = exit;
        }
    }

    const exits: Exit[] = [];
    const cases: Case[] = [];

    // map our new cases to an appropriate exit
    for (const newCase of newCases) {
        // see if we have a suitable exit for our case already
        let existingExit: Exit = null;

        // use our previous exit name if it isn't set
        if (!newCase.exitName && newCase.kase.exit_uuid in previousExitMap) {
            newCase.exitName = previousExitMap[newCase.kase.exit_uuid].name;
        }

        // ignore cases with empty names
        if (!newCase.exitName || newCase.exitName.trim().length === 0) {
            continue;
        }

        if (newCase.exitName) {
            // look through our new exits to see if we've already created one
            for (const exit of exits) {
                if (newCase.exitName && exit.name) {
                    if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
                        existingExit = exit;
                        break;
                    }
                }
            }

            // couldn't find a new exit, look through our old ones
            if (!existingExit) {
                // look through our previous cases for a match
                if (settings.originalNode.node.exits) {
                    for (const exit of settings.originalNode.node.exits) {
                        if (newCase.exitName && exit.name) {
                            if (exit.name.toLowerCase() === newCase.exitName.trim().toLowerCase()) {
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
            let destination = null;
            if (newCase.kase.exit_uuid in previousExitMap) {
                destination = previousExitMap[newCase.kase.exit_uuid].destination_node_uuid;
            }

            newCase.kase.exit_uuid = generateUUID();

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
    let defaultUUID = generateUUID();
    if (
        settings.originalNode.node.router &&
        settings.originalNode.node.router.type === RouterTypes.switch
    ) {
        const router = settings.originalNode.node.router as SwitchRouter;
        if (router && router.default_exit_uuid) {
            defaultUUID = router.default_exit_uuid;
        }
    }

    let defaultName = DefaultExitNames.All_Responses;

    if (settings.originalNode.node.wait && settings.originalNode.node.wait.type === 'exp') {
        defaultName = DefaultExitNames.Any_Value;
    }

    if (exits.length > 0) {
        defaultName = DefaultExitNames.Other;
    }

    let defaultDestination = null;
    if (defaultUUID in previousExitMap) {
        defaultDestination = previousExitMap[defaultUUID].destination_node_uuid;
    }

    exits.push({
        uuid: defaultUUID,
        name: defaultName,
        destination_node_uuid: defaultDestination
    });

    // is a timeout set?
    if (hasTimeout) {
        // do we have an existing timeout exit?
        const existingExit = settings.originalNode.node.exits.find(
            (exit: Exit) => exit.name === DefaultExitNames.No_Response
        );
        const timeoutExit: Exit = {
            uuid: (existingExit && existingExit.uuid) || generateUUID(),
            name: DefaultExitNames.No_Response,
            destination_node_uuid: existingExit && existingExit.destination_node_uuid
        };
        // add our timeout exit accordingly
        if (exits[exits.length - 1].name === DefaultExitNames.Other) {
            exits.splice(exits.length - 1, 0, timeoutExit);
        } else {
            exits.push(timeoutExit);
        }

        // Add a case for the timeout.
        // We strip passive cases (like timeouts) when SwitchRouter mounts.
        cases.push({
            uuid: generateUUID(),
            type: Operators.has_wait_timed_out,
            arguments: ['@run'],
            exit_uuid: timeoutExit.uuid
        });
    }

    return { cases, exits, defaultExit: defaultUUID };
};
