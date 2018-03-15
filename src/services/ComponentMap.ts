import { DragPoint } from '../component/Node';
import {
    FlowDefinition,
    Node,
    SetContactField,
    ChangeGroups,
    Exit,
    SetRunResult
} from '../flowTypes';
import { snakify, toBoolMap } from '../utils';

const RESERVED_FIELDS: ContactFieldResult[] = [
    { id: 'name', name: 'Name', type: 'set_contact_property' }
    // { id: "language", name: "Language", type: "set_contact_property" }
];

export interface ContactField {
    uuid: string;
    name: string;
}

export interface SearchResult {
    name: string;
    id: string;
    type?: string;
    prefix?: string;
    extraResult?: boolean;
}

export interface ContactFieldResult extends SearchResult {
    key?: string;
}

export interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number;
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number;
    exitUUID?: string;
    pointers?: string[];
    type?: string;
}

export interface CompletionOption {
    name: string;
    description: string;
}

export default class ComponentMap {
    private components: { [uuid: string]: ComponentDetails };
    private pendingConnections: { [uuid: string]: DragPoint };
    private contactFields: ContactFieldResult[];
    private resultNameOptions: CompletionOption[];
    private resultNames: { [name: string]: boolean };
    private groups: SearchResult[];
    private nodes: Node[];

    // initialize our map with our flow def
    constructor(definition: FlowDefinition) {
        console.time('ComponentMap');
        this.refresh(definition);
        this.pendingConnections = {};
        console.timeEnd('ComponentMap');

        this.getNodesBelow = this.getNodesBelow.bind(this);
        this.getPendingConnections = this.getPendingConnections.bind(this);
        this.addPendingConnection = this.addPendingConnection.bind(this);
        this.getPendingConnection = this.getPendingConnection.bind(this);
        this.removePendingConnection = this.removePendingConnection.bind(this);
        this.refresh = this.refresh.bind(this);
        this.getDetails = this.getDetails.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.getResultNames = this.getResultNames.bind(this);
        this.getResultNameOptions = this.getResultNameOptions.bind(this);
        this.getContactFields = this.getContactFields.bind(this);
    }

    public getNodesBelow({ uuid: nodeUUID }: Node) {
        const idx = this.nodes.findIndex(({ uuid }: Node) => uuid === nodeUUID);
        return this.nodes.slice(idx, this.nodes.length);
    }

    public getPendingConnections(): { [uuid: string]: DragPoint } {
        return this.pendingConnections;
    }

    public addPendingConnection(draggedTo: string, draggedFrom: DragPoint) {
        this.pendingConnections = {
            ...this.pendingConnections,
            [draggedTo]: draggedFrom
        };
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

        var fields: { [id: string]: ContactFieldResult } = {};
        var groups: { [id: string]: SearchResult } = {};
        var resultNames: { [name: string]: string } = {};

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
            };

            // set our type
            let _ui = definition._ui.nodes[node.uuid];
            if (_ui && _ui.type) {
                components[node.uuid].type = _ui.type;
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
                        type: action.type
                    };

                    if (action.type == 'set_run_result') {
                        var resultProps = action as SetRunResult;
                        resultNames[snakify(resultProps.result_name)] = resultProps.result_name;
                    } else if (action.type == 'set_contact_field') {
                        var saveProps = action as SetContactField;
                        if (
                            !RESERVED_FIELDS.some(
                                fieldName => fieldName.name === saveProps.field_name
                            )
                        ) {
                            if (!(saveProps.field_uuid in fields)) {
                                fields[saveProps.field_uuid] = {
                                    id: saveProps.field_uuid,
                                    name: saveProps.field_name,
                                    type: 'field'
                                };
                            }
                        }
                    } else if (
                        action.type === 'add_contact_groups' ||
                        action.type === 'remove_contact_groups'
                    ) {
                        var groupProps = action as ChangeGroups;
                        for (let group of groupProps.groups) {
                            if (!(group.uuid in groups)) {
                                groups[group.uuid] = {
                                    id: group.uuid,
                                    name: group.name,
                                    type: 'group'
                                };
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
            var details = components[exit.destination_node_uuid];
            if (details) {
                details.pointers.push(exit.uuid);
            }
        }

        var existingFields: ContactFieldResult[] = [];
        for (let reserved of RESERVED_FIELDS) {
            existingFields.push(reserved);
        }

        for (var key in fields) {
            existingFields.push(fields[key]);
        }

        var existingGroups: SearchResult[] = [];
        for (var key in groups) {
            existingGroups.push(groups[key]);
        }

        var existingResultNames: CompletionOption[] = [];
        for (var key in resultNames) {
            if (key && key.trim().length > 0) {
                existingResultNames.push({
                    name: 'run.results.' + key,
                    description: 'Result for "' + resultNames[key] + '"'
                });
                existingResultNames.push({
                    name: 'run.results.' + key + '.category',
                    description: 'Category for "' + resultNames[key] + '"'
                });
            }
        }

        this.resultNames = toBoolMap(Object.values(resultNames));
        this.contactFields = existingFields;
        this.groups = existingGroups;
        this.components = components;
        this.resultNameOptions = existingResultNames;
        this.nodes = definition.nodes;
    }

    public getDetails(uuid: string): ComponentDetails {
        return this.components[uuid];
    }

    public getGroups(): SearchResult[] {
        return this.groups;
    }

    public getResultNames(): { [name: string] : boolean } {
        return this.resultNames;
    }

    public getResultNameOptions(): CompletionOption[] {
        return this.resultNameOptions;
    }

    public getContactFields(): ContactFieldResult[] {
        return this.contactFields;
    }
}
