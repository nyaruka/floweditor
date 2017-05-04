import * as Interfaces from '../src/interfaces';
import FlowMutator from '../src/components/FlowMutator';
import {FlowDefinition, NodeProps} from '../src/interfaces';
import {getFavorites, dump} from './utils';
var sinon = require('sinon');

describe('FlowMutator', () => {

    var mutator: FlowMutator;
    var definition: FlowDefinition;

    beforeEach(() => {
        definition = getFavorites()
        mutator = new FlowMutator(definition, (updated: FlowDefinition)=>{
            definition = updated;
        });
    });

    it('removes nodes and remaps exits', () => {

        // we start with 7 nodes
        chai.assert.equal(definition.nodes.length, 7)

        // remove the action node following the first response
        mutator.removeNode(definition.nodes[4]);

        // now we should be down to 6 nodes
        chai.assert.equal(definition.nodes.length, 6);
    
        // our previous non-other exits should be rerouted to the next node
        for (let exit of definition.nodes[4].exits) {
            if (exit.name != "Other") {
                chai.assert.equal(definition.nodes[5].uuid, exit.destination);
            }
        }

        // remove each remaining node, one by one
        while (definition.nodes.length > 0) {
            mutator.removeNode(definition.nodes[0]);            
        }

        // we should be left with no nodes
        chai.assert.equal(definition.nodes.length, 0);
    });

    it('removes localization on node removal', () => {

    });

    it ('removes actions', ()=>{

        // our last node has two actions
        var indexes = mutator.getComponents().getDetails("47a0be00-59ad-4558-bd13-ec66518ce44a");
        chai.assert.equal(definition.nodes[indexes.nodeIdx].actions.length, 2);

        // get our last message action in the flow
        var indexes = mutator.getComponents().getDetails("76fe3759-e0b6-437e-ae6c-6005ff43fbb8");
        var action = definition.nodes[indexes.nodeIdx].actions[indexes.actionIdx];
        
        // remove that action
        mutator.removeAction(action);

        // now our node should have one action
        chai.assert.equal(1, definition.nodes[indexes.nodeIdx].actions.length);

    });

    it ('removes the node if the last action is removed', ()=>{
        
        // the first node is a single action
        var firstNode = definition.nodes[0];
        chai.assert.equal(1, firstNode.actions.length);
        
        // remove that action
        mutator.removeAction(firstNode.actions[0]);

        // we should have removed the node too
        chai.assert.notEqual(definition.nodes[0].uuid, firstNode.uuid);
        chai.assert.equal(definition.nodes.length, 6);
    });
});