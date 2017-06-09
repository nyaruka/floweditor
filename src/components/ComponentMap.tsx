import { DragPoint } from '../components/Node';
import { FlowDefinition, SaveToContact, ChangeGroup, Exit, SaveFlowResult } from '../FlowDefinition';

import { snakify } from '../utils';

const RESERVED_FIELDS: ContactFieldResult[] = [
    { id: "name", name: "Name", type: "update_contact" },
    // { id: "language", name: "Language", type: "update_contact" }
];

export interface ContactField {
    uuid: string;
    name: string;
}

export interface SearchResult {
    name: string,
    id: string,
    type: string,
    prefix?: string,
    extraResult?: boolean
}

export interface ContactFieldResult extends SearchResult {
    key?: string
}

interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number
    exitUUID?: string;
    pointers?: string[]
}

export interface CompletionOption {
    name: string;
    description: string;
}

export class ComponentMap {

    private static singleton: ComponentMap;

    public static initialize(definition: FlowDefinition): ComponentMap {
        this.singleton = new ComponentMap(definition);
        return this.singleton;
    }

    public static get(): ComponentMap {
        return this.singleton;
    }

    private components: { [uuid: string]: ComponentDetails };
    private pendingConnections: { [uuid: string]: DragPoint };
    private contactFields: ContactFieldResult[];
    private resultNames: CompletionOption[];
    private groups: SearchResult[];

    // initialize our map with our flow def
    private constructor(definition: FlowDefinition) {
        console.time("ComponentMap");
        this.refresh(definition);
        this.pendingConnections = {};
        console.timeEnd("ComponentMap");
    }

    public addPendingConnection(draggedTo: string, draggedFrom: DragPoint) {
        this.pendingConnections[draggedTo] = draggedFrom;
    }

    public getPendingConnection(nodeUUID: string): DragPoint {
        return this.pendingConnections[nodeUUID];
    }

    public removePendingConnection(nodeUUID: string) {
        delete this.pendingConnections[nodeUUID];
    }

    public refresh(definition: FlowDefinition) {

        var components: { [uuid: string]: ComponentDetails } = {};
        var exitsWithDestinations: Exit[] = [];

        var fields: { [id: string]: ContactFieldResult } = {}
        var groups: { [id: string]: SearchResult } = {}
        var resultNames: { [name: string]: string } = {}

        if (!definition) {
            this.components = components;
            return;
        }

        // determine our indexes
        for (let nodeIdx = 0; nodeIdx < definition.nodes.length; nodeIdx++) {
            let node = definition.nodes[nodeIdx];
            components[node.uuid] = {
                nodeUUID: node.uuid,
                nodeIdx: nodeIdx,
                actionIdx: -1,
                exitIdx: -1,
                pointers: []
            }

            // map out our action idexes
            if (node.actions) {
                for (let actionIdx = 0; actionIdx < node.actions.length; actionIdx++) {
                    let action = node.actions[actionIdx];
                    components[action.uuid] = {
                        nodeUUID: node.uuid,
                        nodeIdx: nodeIdx,
                        actionUUID: action.uuid,
                        actionIdx: actionIdx,
                    }

                    if (action.type == "save_flow_result") {
                        var resultProps = action as SaveFlowResult;
                        resultNames[snakify(resultProps.result_name)] = resultProps.result_name;
                    } else if (action.type == 'save_contact_field') {
                        var saveProps = action as SaveToContact;
                        if (!RESERVED_FIELDS.some(fieldName => fieldName.name === saveProps.field_name)) {
                            if (!(saveProps.field_uuid in fields)) {
                                fields[saveProps.field_uuid] = { id: saveProps.field_uuid, name: saveProps.field_name, type: "field" }
                            }
                        }
                    } else if (action.type == 'add_to_group' || action.type == 'remove_from_group') {
                        var groupProps = action as ChangeGroup;
                        for (let group of groupProps.groups) {
                            if (!(group.uuid in groups)) {
                                groups[group.uuid] = { id: group.uuid, name: group.name, type: "group" }
                            }
                        }
                    }
                }
            }

            if (node.router && node.router.result_name) {
                resultNames[snakify(node.router.result_name)] = node.router.result_name;
            }

            // and the same for exits
            if (node.exits) {
                for (let exitIdx = 0; exitIdx < node.exits.length; exitIdx++) {
                    let exit = node.exits[exitIdx];
                    components[exit.uuid] = {
                        nodeIdx: nodeIdx,
                        nodeUUID: node.uuid,
                        exitIdx: exitIdx,
                        exitUUID: exit.uuid
                    };

                    if (exit.destination_node_uuid) {
                        exitsWithDestinations.push(exit);
                    }
                }
            }
        }

        // add in our reverse lookups
        for (let exit of exitsWithDestinations) {
            components[exit.destination_node_uuid].pointers.push(exit.uuid);
        }

        var existingFields: ContactFieldResult[] = []
        for (let reserved of RESERVED_FIELDS) {
            existingFields.push(reserved);
        }

        for (var key in fields) {
            existingFields.push(fields[key]);
        }

        var existingGroups: SearchResult[] = []
        for (var key in groups) {
            existingGroups.push(groups[key]);
        }

        var existingResultNames: CompletionOption[] = []
        for (var key in resultNames) {
            if (key && key.trim().length > 0) {
                existingResultNames.push({ name: "run.results." + key, description: "Result for \"" + resultNames[key] + "\"" });
                existingResultNames.push({ name: "run.results." + key + ".category", description: "Category for \"" + resultNames[key] + "\"" });
            }
        }

        this.contactFields = existingFields;
        this.groups = existingGroups;
        this.components = components;
        this.resultNames = existingResultNames;
    }

    public getDetails(uuid: string): ComponentDetails {
        return this.components[uuid];
    }

    public getGroups(): SearchResult[] {
        return this.groups;
    }

    public getResultNames(): CompletionOption[] {
        return this.resultNames;
    }

    public getContactFields(): ContactFieldResult[] {
        return this.contactFields;
    }
}

export default ComponentMap;