import * as Interfaces from '../interfaces';

interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number
    exitUUID?: string;
    pointers?: string[]
}

class ComponentMap {
    
    private components: {[uuid: string]: ComponentDetails};
    private contactFields: Interfaces.ContactFieldResult[];
    private groups: Interfaces.SearchResult[];

    // initialize our map with our flow def
    constructor(definition: Interfaces.FlowDefinition) {
        console.time("ComponentMap");
        this.initializeUUIDMap(definition);
        this.initializeFieldsAndGroups(definition);
        console.timeEnd("ComponentMap");
    }

    public initializeUUIDMap(definition: Interfaces.FlowDefinition){
        var components: {[uuid: string]: ComponentDetails} = {};
        var exitsWithDestinations: Interfaces.ExitProps[] = [];

        // determine our indexes
        for (let nodeIdx = 0; nodeIdx<definition.nodes.length; nodeIdx++) {
            let node = definition.nodes[nodeIdx];
            components[node.uuid] = {
                nodeUUID: node.uuid, 
                nodeIdx:nodeIdx,
                actionIdx: -1,
                exitIdx: -1,
                pointers: []
            }

            // map out our action idexes
            if (node.actions) {
                for (let actionIdx=0; actionIdx<node.actions.length; actionIdx++) {
                    let action = node.actions[actionIdx];
                    components[action.uuid] = {
                        nodeUUID: node.uuid, 
                        nodeIdx: nodeIdx, 
                        actionUUID: action.uuid,
                        actionIdx: actionIdx,
                    }
                }
            }

            // and the same for exits
            for (let exitIdx=0; exitIdx<node.exits.length; exitIdx++) {
                let exit = node.exits[exitIdx];
                components[exit.uuid] = {
                    nodeIdx: nodeIdx, 
                    nodeUUID: node.uuid,
                    exitIdx: exitIdx,
                    exitUUID: exit.uuid
                };

                if (exit.destination) {
                    exitsWithDestinations.push(exit);
                }
            }
        }
        
        // add in our reverse lookups
        for (let exit of exitsWithDestinations) {
            components[exit.destination].pointers.push(exit.uuid);
        }

        this.components = components;

    }

    private initializeFieldsAndGroups(definition: Interfaces.FlowDefinition) {
        var fields: {[id:string]:Interfaces.ContactFieldResult} = {}
        var groups: {[id:string]:Interfaces.Group} = {}

        for (let node of definition.nodes) {
            if (node.actions) {
                for (let action of node.actions) {
                    if (action.type == 'save_to_contact') {
                        var saveProps = action as Interfaces.SaveToContactProps;
                        if (!(saveProps.field in fields)) {
                            fields[saveProps.field] = { id: saveProps.field, name: saveProps.name, type: "field" }
                        }
                    } else if (action.type == 'add_group') {
                        var addGroupProps = action as Interfaces.AddToGroupProps;
                        if (!(addGroupProps.uuid in groups)) {
                            groups[addGroupProps.uuid] = { uuid: addGroupProps.uuid, name: addGroupProps.name}
                        }
                    }
                }
            }
        }

        var contactFields: Interfaces.ContactFieldResult[] = []
        for (var key in fields) {
            contactFields.push(fields[key]);
        }

        this.contactFields = contactFields;

        // TODO: implement group init
        this.groups = [];
    }

    public getDetails(uuid: string): ComponentDetails {
        return this.components[uuid];
    }

    public getContactFields(): Interfaces.SearchResult[] {
        return this.contactFields;
    }

    public addContactField(field: Interfaces.SearchResult) {
        this.contactFields.push(field);
    }
}

export default ComponentMap;