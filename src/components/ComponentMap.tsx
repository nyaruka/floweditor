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

    // initialize our map with our flow def
    constructor(definition: Interfaces.FlowDefinition) {

        console.time("ComponentMap");
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
        console.timeEnd("ComponentMap");
    }

    public getDetails(uuid: string): ComponentDetails {
        console.log(uuid, this.components[uuid]);
        return this.components[uuid];
    }
}

export default ComponentMap;