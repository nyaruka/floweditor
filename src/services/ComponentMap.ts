import { IDragPoint } from '../components/Node';
import {
    IFlowDefinition,
    INode,
    ISaveToContact,
    IChangeGroup,
    IExit,
    ISaveFlowResult
} from '../flowTypes';

import { snakify } from '../helpers/utils';

const RESERVED_FIELDS: IContactFieldResult[] = [
    { id: 'name', name: 'Name', type: 'update_contact' }
    // { id: "language", name: "Language", type: "update_contact" }
];

export interface IContactField {
    uuid: string;
    name: string;
}

export interface ISearchResult {
    name: string;
    id: string;
    type: string;
    prefix?: string;
    extraResult?: boolean;
}

export interface IContactFieldResult extends ISearchResult {
    key?: string;
}

interface IComponentDetails {
    nodeUUID: string;
    nodeIdx: number;
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number;
    exitUUID?: string;
    pointers?: string[];
    type?: string;
}

export interface ICompletionOption {
    name: string;
    description: string;
}

class ComponentMap {
    private components: { [uuid: string]: IComponentDetails };
    private pendingConnections: { [uuid: string]: IDragPoint };
    private contactFields: IContactFieldResult[];
    private resultNames: ICompletionOption[];
    private groups: ISearchResult[];
    private nodes: INode[];

    // initialize our map with our flow def
    constructor(definition: IFlowDefinition) {
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
        this.getContactFields = this.getContactFields.bind(this);
    }

    public getNodesBelow({ uuid: nodeUUID }: INode) {
        const idx = this.nodes.findIndex(({ uuid }: INode) => uuid === nodeUUID);
        return this.nodes.slice(idx, this.nodes.length);
    }

    public getPendingConnections(): { [uuid: string]: IDragPoint } {
        return this.pendingConnections;
    }

    public addPendingConnection(draggedTo: string, draggedFrom: IDragPoint) {
        this.pendingConnections = {
            ...this.pendingConnections,
            [draggedTo]: draggedFrom
        };
    }

    public getPendingConnection(nodeUUID: string): IDragPoint {
        return this.pendingConnections[nodeUUID];
    }

    public removePendingConnection(nodeUUID: string) {
        delete this.pendingConnections[nodeUUID];
    }

    public refresh(definition: IFlowDefinition) {
        var components: { [uuid: string]: IComponentDetails } = {};
        var exitsWithDestinations: IExit[] = [];

        var fields: { [id: string]: IContactFieldResult } = {};
        var groups: { [id: string]: ISearchResult } = {};
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

                    if (action.type == 'save_flow_result') {
                        var resultProps = action as ISaveFlowResult;
                        resultNames[snakify(resultProps.result_name)] = resultProps.result_name;
                    } else if (action.type == 'save_contact_field') {
                        var saveProps = action as ISaveToContact;
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
                        action.type == 'add_to_group' ||
                        action.type == 'remove_from_group'
                    ) {
                        var groupProps = action as IChangeGroup;
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

        var existingFields: IContactFieldResult[] = [];
        for (let reserved of RESERVED_FIELDS) {
            existingFields.push(reserved);
        }

        for (var key in fields) {
            existingFields.push(fields[key]);
        }

        var existingGroups: ISearchResult[] = [];
        for (var key in groups) {
            existingGroups.push(groups[key]);
        }

        var existingResultNames: ICompletionOption[] = [];
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

        this.contactFields = existingFields;
        this.groups = existingGroups;
        this.components = components;
        this.resultNames = existingResultNames;
        this.nodes = definition.nodes;
    }

    public getDetails(uuid: string): IComponentDetails {
        return this.components[uuid];
    }

    public getGroups(): ISearchResult[] {
        return this.groups;
    }

    public getResultNames(): ICompletionOption[] {
        return this.resultNames;
    }

    public getContactFields(): IContactFieldResult[] {
        return this.contactFields;
    }
}

export default ComponentMap;
