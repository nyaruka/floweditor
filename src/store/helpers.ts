import { Language } from '../component/LanguageSelector';
import { DragPoint } from '../component/Node';
import {
    AnyAction,
    FlowDefinition,
    Languages,
    Node,
    SwitchRouter,
    Exit,
    UIMetaData
} from '../flowTypes';
import Localization, { LocalizedObject } from '../services/Localization';
import { SearchResult, ContactFieldResult, Components } from './flowContext';
import { PendingConnections } from './flowEditor';

export interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface Reflow {
    uuid: string;
    bounds: Bounds;
}

export const getExistingGroups = (groups: { [id: string]: SearchResult }) =>
    Object.keys(groups).reduce((groupsList, groupKey) => {
        if (groups.hasOwnProperty(groupKey)) {
            groupsList.push(groups[groupKey]);
        }
        return groupsList;
    }, []);

export const getExistingResultNames = (resultNames: { [name: string]: string }) =>
    Object.keys(resultNames).reduce((resultNameList, resultNameKey) => {
        if (resultNameKey && resultNameKey.trim().length > 0) {
            resultNameList.push(
                {
                    name: `run.results.${resultNameKey}`,
                    description: `Result for "${resultNames[resultNameKey]}"`
                },
                {
                    name: `run.results.${resultNameKey}.category`,
                    description: `Category for "${resultNames[resultNameKey]}"`
                }
            );
        }
        return resultNameList;
    }, []);

export const getExistingFields = (
    reservedFields: ContactFieldResult[],
    fields: { [id: string]: ContactFieldResult }
) =>
    Object.keys(fields).reduce((existingFields, fieldKey) => {
        existingFields.push(fields[fieldKey]);
        return existingFields;
    }, reservedFields);

export const pureSort = (list: any[], fn: (a: any, b: any) => number) => [...list].sort(fn);

export const getNodesBelow = ({ uuid: nodeUUID }: Node, nodes: Node[]) => {
    const idx = nodes.findIndex(({ uuid }: Node) => uuid === nodeUUID);
    return nodes.slice(idx, nodes.length);
};

export const getPendingConnection = (
    nodeUUID: string,
    pendingConnections: PendingConnections
): DragPoint => pendingConnections[nodeUUID];

export const getDetails = (uuid: string, components: Components) => components[uuid];

export const isActionsNode = (uuid: string, components: Components) => {
    const details = getDetails(uuid, components);
    return details != null && !details.isRouter;
};

export const getNode = (uuid: string, components: Components, definition: FlowDefinition) => {
    const details = components[uuid];
    if (!details) {
        return null;
    }
    return definition.nodes[details.nodeIdx];
};

/**
 * Gets a suggested result name based on the current number of waits
 * in the current definition
 */
export const getSuggestedResultName = (nodes: Node[]) => {
    return 'Response ' + nodes.length;
};

export const getExit = (uuid: string, components: Components, definition: FlowDefinition) => {
    const details = components[uuid];
    if (details) {
        const node = definition.nodes[details.nodeIdx];
        return node.exits[details.exitIdx];
    }
    return null;
};

export const getNodeUI = (uuid: string, definition: FlowDefinition) => definition._ui.nodes[uuid];

export const collides = (a: Bounds, b: Bounds) =>
    a.bottom < b.top || a.top > b.bottom || a.left > b.right || a.right < b.left ? false : true;

/**
 * Computes translations prop for `Node` components in render()
 */
export const getTranslations = (definition: FlowDefinition, language: Language) => {
    if (definition.localization) {
        return definition.localization[language.iso];
    }
    return null;
};

export const getLocalizations = (
    node: Node,
    action: AnyAction,
    iso: string,
    languages: Languages,
    translations?: { [uuid: string]: any }
): LocalizedObject[] => {
    const localizations: LocalizedObject[] = [];

    // Account for localized cases
    if (node.router && node.router.type === 'switch') {
        const router = node.router as SwitchRouter;

        router.cases.forEach(kase =>
            localizations.push(Localization.translate(kase, iso, languages, translations))
        );

        // Account for localized exits
        if (node.exits) {
            node.exits.forEach(exit => {
                localizations.push(Localization.translate(exit, iso, languages, translations));
            });
        }
    }

    if (action) {
        localizations.push(Localization.translate(action, iso, languages, translations));
    }

    return localizations;
};

export const determineConfigType = (
    nodeToEdit: Node,
    action: AnyAction,
    definition: FlowDefinition,
    components: Components
) => {
    if (action && action.type) {
        return action.type;
    } else if (nodeToEdit.actions && nodeToEdit.actions.length) {
        return nodeToEdit.actions[nodeToEdit.actions.length - 1].type;
    } else {
        const nodeUI = definition._ui.nodes[nodeToEdit.uuid];
        if (nodeUI) {
            if (nodeUI.type) {
                return nodeUI.type;
            }
        }
    }

    // Account for ghost nodes
    if (nodeToEdit) {
        if (nodeToEdit.router) {
            return nodeToEdit.router.type;
        }

        if (nodeToEdit.actions) {
            return nodeToEdit.actions[0].type;
        }
    }

    const details = getDetails(nodeToEdit.uuid, components);
    if (details.type) {
        return details.type;
    }

    throw new Error(`Cannot initialize NodeEditor without a valid type: ${nodeToEdit.uuid}`);
};

export const getConnectionError = (source: string, targetUUID: string, components: Components) =>
    getDetails(source, components).nodeUUID === targetUUID
        ? 'Connections cannot route back to the same places.'
        : null;

export const nodeSort = (definition: FlowDefinition) => (a: Node, b: Node) => {
    const { position: aPos } = definition._ui.nodes[a.uuid];
    const { position: bPos } = definition._ui.nodes[b.uuid];
    const diff = aPos.y - bPos.y;
    // Secondary sort on X location
    if (diff === 0) {
        return aPos.x - bPos.x;
    }
    return diff;
};

export const getNodeBoundaries = (nodes: Node[], ui: UIMetaData) =>
    nodes
        .reduce((uiList, node) => {
            const uiDetails = ui.nodes[node.uuid];

            // This should only happen with freshly added nodes, since
            // they don't have dimensions until they are rendered.
            const dimensions = uiDetails.dimensions
                ? uiDetails.dimensions
                : { width: 250, height: 100 };

            uiList.push({
                uuid: node.uuid,
                bounds: {
                    left: uiDetails.position.x,
                    top: uiDetails.position.y,
                    right: uiDetails.position.x + dimensions.width,
                    bottom: uiDetails.position.y + dimensions.height
                }
            });

            return uiList;
        }, [])
        .sort((a: any, b: any) => {
            let diff = a.bounds.top - b.bounds.top;
            if (diff === 0) {
                diff = a.bounds.left - b.bounds.left;
            }
            return diff;
        });

export const getCollisions = (nodes: Node[], ui: UIMetaData, nodeSpacing: number) => {
    const boundaries = getNodeBoundaries(nodes, ui);
    const updatedNodes: Reflow[] = [];

    for (let i = 0; i < boundaries.length; i++) {
        const current = boundaries[i];

        if (!current.bounds) {
            throw new Error(`Dimensions missing for ${current.uuid}`);
        }

        for (let j = i + 1; j < boundaries.length; j++) {
            const other = boundaries[j];

            if (collides(current.bounds, other.bounds)) {
                // console.log("COLLISON:", current, other);
                let diff = current.bounds.bottom - other.bounds.top + nodeSpacing;
                diff += 20 - diff % 20;

                other.bounds.top += diff;
                other.bounds.bottom += diff;
                updatedNodes.push(other);

                // See if our collision cascades
                if (boundaries.length > j + 1) {
                    const next = boundaries[j + 1];
                    // If so, push everybody else down
                    for (let k = j + 1; k < boundaries.length; k++) {
                        const below = boundaries[k];
                        below.bounds.top += diff;
                        below.bounds.bottom += diff;
                        updatedNodes.push(below);
                    }
                }

                return updatedNodes;
            } else if (other.bounds.top > current.bounds.bottom) {
                // If they start below our lowest point, move on
                continue;
            }
        }
    }

    return updatedNodes;
};
