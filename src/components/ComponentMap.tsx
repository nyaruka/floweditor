import {
    FlowDefinition, SearchResult, ExitProps, ContactFieldResult, 
    Group, SaveToContactProps, AddToGroupProps
} from '../interfaces';

interface ComponentDetails {
    nodeUUID: string;
    nodeIdx: number
    actionIdx?: number;
    actionUUID?: string;
    exitIdx?: number
    exitUUID?: string;
    pointers?: string[]
}

export class ComponentMap {
    
    private components: {[uuid: string]: ComponentDetails};
    private contactFields: ContactFieldResult[];
    private groups: SearchResult[];

    // initialize our map with our flow def
    constructor(definition: FlowDefinition) {
        console.time("ComponentMap");
        this.initializeUUIDMap(definition);
        this.initializeFieldsAndGroups(definition);
        console.timeEnd("ComponentMap");
    }

    public initializeUUIDMap(definition: FlowDefinition) {

        var components: {[uuid: string]: ComponentDetails} = {};
        var exitsWithDestinations: ExitProps[] = [];

        if (!definition) {
            this.components = components;
            return;
        }

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
            if (node.exits) {
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
        }
        
        // add in our reverse lookups
        for (let exit of exitsWithDestinations) {
            components[exit.destination].pointers.push(exit.uuid);
        }

        this.components = components;

    }

    private initializeFieldsAndGroups(definition: FlowDefinition) {
        var fields: {[id:string]:ContactFieldResult} = {}
        var groups: {[id:string]:Group} = {}

        if (!definition) {
            this.contactFields = [];
            this.groups = [];
            return;
        }

        for (let node of definition.nodes) {
            if (node.actions) {
                for (let action of node.actions) {
                    if (action.type == 'save_to_contact') {
                        var saveProps = action as SaveToContactProps;
                        if (!(saveProps.field in fields)) {
                            fields[saveProps.field] = { id: saveProps.field, name: saveProps.name, type: "field" }
                        }
                    } else if (action.type == 'add_group') {
                        var addGroupProps = action as AddToGroupProps;
                        if (!(addGroupProps.uuid in groups)) {
                            groups[addGroupProps.uuid] = { uuid: addGroupProps.uuid, name: addGroupProps.name}
                        }
                    }
                }
            }
        }

        var contactFields: ContactFieldResult[] = []
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

    public getContactFields(): ContactFieldResult[] {
        // console.log("Get", this.contactFields)
        return this.contactFields;
    }

    public addContactField(field: SearchResult): ContactFieldResult {
        this.contactFields.push(field);
        return field;
    }


}

export default ComponentMap;