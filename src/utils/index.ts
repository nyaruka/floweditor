import { ComponentClass, SFC, ReactElement } from 'react';
import { ShallowWrapper, ReactWrapper } from 'enzyme';
import { FlowDefinition, Node, Languages, SwitchRouter, AnyAction } from '../flowTypes';
import { DragPoint } from '../component/Node';
import { PendingConnections, Components } from '../redux';
import { Language } from '../component/LanguageSelector';
import Localization, { LocalizedObject } from '../services/Localization';
import { NodeEditorProps } from '../component/NodeEditor';

const SNAKED_CHARS = /\s+(?=\S)/g;
const GRID_SIZE = 20;
export const V4_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

interface BoolMap {
    [key: string]: boolean;
}

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/**
 * Adjusts the left and top offsets to a grid
 * @param left horizontal offset
 * @param top vertical offset
 */
export const snapToGrid = (left: number, top: number): { left: number; top: number } => {
    // Adjust our ghost into the grid
    let leftAdjust = left % GRID_SIZE;
    let topAdjust = top % GRID_SIZE;

    if (leftAdjust > GRID_SIZE / 3) {
        leftAdjust = GRID_SIZE - leftAdjust;
    } else {
        leftAdjust = leftAdjust * -1;
    }

    if (topAdjust > GRID_SIZE / 3) {
        topAdjust = GRID_SIZE - topAdjust;
    } else {
        topAdjust = topAdjust * -1;
    }

    return {
        left: Math.max(left + leftAdjust, GRID_SIZE * 2),
        top: Math.max(top + topAdjust, GRID_SIZE * 4)
    };
};

/**
 * Turns a string array into a bool map for constant lookup
 * @param {string[]} array - an array of strings, e.g. contact fields
 * @returns {object} A map of each string
 */
export const toBoolMap = (array: string[]): BoolMap =>
    array.reduce(
        (map: BoolMap, item: string) => ({
            ...map,
            [item]: true
        }),
        {}
    );

/**
 * Inserts commas into numbers where appropriate for better readability
 * @param {number} value - A number, e.g. 10000
 * @returns {string} A comma-separated string, e.g. 10,000
 */
export const addCommas = (value: number): string =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Replaces spaces with underscores
 * @param {string} value - A space-separated string to be snaked, e.g. a raw flow field name ('my flow field')
 * @returns {string} A snaked string, e.g. 'my_flow_field'
 */
export const snakify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(SNAKED_CHARS, '_');

/**
 * Returns a React component's name so we can attach it to a HOC's displayName property and view it in RDT
 * @param {ComponentClass | SFC} Component - A React component
 * @returns {string} The component's name
 */
export const getDisplayName = (WrappedComponent: ComponentClass | SFC): string =>
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

/**
 * NOTE: borrowed from EventBrite: https://github.com/eventbrite/javascript/blob/master/react/testing.md#finding-nodes
 * Finds all instances of components in the rendered `componentWrapper` that are DOM components
 * with the `data-spec` attribute matching `name`.
 * @param {ReactWrapper|ShallowWrapper} componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param  {string} snacName - Name of `data-spec` attribute value to find
 * @param {string|Function} (Optional) typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns {ReactWrapper|ReactWrapper[]|ShallowWrapper|ShallowWrapper[]} Matching DOM components
 */
export const getSpecWrapper = (
    componentWrapper: ReactWrapper<{}, {}> | ShallowWrapper<{}, {}>,
    specName: string,
    attributeName: string = 'data-spec'
): any => {
    return componentWrapper.find(`[${attributeName}="${specName}"]`);
};

/**
 * Returns true if a given UUID matches v4 format
 * @param {string} uuid - A version 4 UUID (no braces, uppercase OK)
 * @returns {boolean}
 */
export const validUUID = (uuid: string): boolean => V4_UUID.test(uuid);

/**
 * Returns a given string in title case, e.g. 'full name' becomes 'Full Name'
 * @param {string} str - string to be title-cased
 * @returns {string} Title-cased string
 */
export const titleCase = (str: string): string =>
    str.replace(/\b\w+/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());

export const getSelectClass = (errors: number): string => {
    if (errors === 0) {
        return '';
    }
    // We use a global selector here for react-select
    return 'select-invalid';
};

export const reorderList = (list: any[], startIndex: number, endIndex: number): any[] => {
    const [removed] = list.splice(startIndex, 1);

    list.splice(endIndex, 0, removed);

    return list;
};

/**
 * Compares basic objects (no methods and DOM nodes; property order important)
 * @param {object} objA - basic object
 * @param {object} objB - basic object
 * @returns {boolean}
 */
export const jsonEqual = (objA: {}, objB: {}): boolean =>
    JSON.stringify(objA) === JSON.stringify(objB);

/**
 * Checks whether any of a list of error strings contain one or more queries.
 * Used to determine whether a particular error has been encountered.
 */
export const hasErrorType = (errors: string[], exps: RegExp[]): boolean => {
    if (!errors.length) {
        return false;
    }
    for (const error of errors) {
        for (const exp of exps) {
            if (error.match(exp)) {
                return true;
            }
        }
    }
    return false;
};

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

export const getNode = (uuid: string, components: Components, definition: FlowDefinition) => {
    const details = components[uuid];
    if (!details) {
        return null;
    }
    return definition.nodes[details.nodeIdx];
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

export const collides = (a: Bounds, b: Bounds) => {
    if (a.bottom < b.top || a.top > b.bottom || a.left > b.right || a.right < b.left) {
        return false;
    }
    // console.log("COLLISION!");
    return true;
};

export const getConnectionError = (source: string, targetUUID: string, components: Components) => {
    const { nodeUUID } = getDetails(source, components);
    if (nodeUUID === targetUUID) {
        return 'Connections cannot route back to the same places.';
    }
    return null;
};

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
                console.log('exit:', exit);
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
    actions: AnyAction[],
    definition: FlowDefinition,
    components: Components
) => {
    if (actions.length) {
        return actions[actions.length - 1].type;
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

export const getLocalizedObject = (localizations: LocalizedObject[]) => {
    if (localizations && localizations.length) {
        return localizations[0];
    }
};
