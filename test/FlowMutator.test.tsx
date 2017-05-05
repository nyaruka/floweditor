import * as Interfaces from '../src/interfaces';
import FlowMutator from '../src/components/FlowMutator';
import {FlowDefinition, NodeProps} from '../src/interfaces';
import {getFavorites, dump} from './utils';
var sinon = require('sinon');
var UUID = require('uuid');

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

    it('adds new actions to new nodes', () => {
        var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        var actionUUID = UUID.v4();

        var newNode = mutator.updateAction({
            uuid: actionUUID,
            type: "msg",
            text: "A new message after dragging",
            draggedFrom: {
                exitUUID: lastNode.exits[0].uuid, 
                nodeUUID: lastNode.uuid
            },
            newPosition: {
                x: 444,
                y: 555
            }
        } as Interfaces.SendMessageProps);

        // we should have a new node
        chai.assert.equal(definition.nodes.length, 8);

        // we should now have a pending connection on our new ndoe
        lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");
        chai.assert.isNull(lastNode.exits[0].destination);
        chai.assert.equal(newNode.pendingConnection.exitUUID, lastNode.exits[0].uuid); 

        // resolve our pending connection and check the exit destination
        mutator.resolvePendingConnection(newNode);
        lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");
        chai.assert.isNotNull(lastNode.exits[0].destination);

        // we shouldn't have any turds
        newNode = mutator.getNode(newNode.uuid);
        chai.assert.isUndefined(newNode.actions[0].draggedFrom, "Still has reference to draggedFrom: " + newNode.draggedFrom);
        chai.assert.isUndefined(newNode.pendingConnection, "Still has a reference to pendingConnection");

        // check that we have our location set
        var ui = definition._ui.nodes[newNode.uuid] as Interfaces.UINode;
        chai.assert.notEqual(ui, undefined, "Couldn't find ui details for new node");
        chai.assert.deepEqual(ui.position, {x: 444, y: 555})

    });

    it ('updates existing actions to the same type', () => {
        var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        mutator.updateAction({
            uuid: lastNode.actions[0].uuid,
            type: "msg",
            text: "An update to an existing action",
        } as Interfaces.SendMessageProps);

        lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        var action = lastNode.actions[0] as Interfaces.SendMessageProps;
        chai.assert.equal(action.text, "An update to an existing action");
    });

    it ('updates existing actions to a different type', () => {
        var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        mutator.updateAction({
            uuid: lastNode.actions[0].uuid,
            type: "webhook",
            url: "http://www.webhook.com/endpoint",
            method: "GET"
        } as Interfaces.WebhookProps);

        lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        var action = lastNode.actions[0] as Interfaces.WebhookProps;
        chai.assert.equal(action.url, "http://www.webhook.com/endpoint");
        chai.assert.equal(action.method, "GET");
    });
    
    it ('adds actions to an existing node', () => {
        mutator.updateAction({
            uuid: UUID.v4(),
            type: "msg",
            text: "Add action to an existing node",
            addToNode: "47a0be00-59ad-4558-bd13-ec66518ce44a"
        } as Interfaces.SendMessageProps);

        var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
        chai.assert.equal(3, lastNode.actions.length);

        var action = lastNode.actions[2] as Interfaces.SendMessageProps;
        chai.assert.equal(action.text, "Add action to an existing node");
    });

    it('can remove added actions on new nodes', () => {
        var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")

        // first add a new action
        var newNode = mutator.updateAction({
            uuid: UUID.v4(),
            type: "msg",
            text: "An action that creates a new node",
            draggedFrom: {
                exitUUID: lastNode.exits[0].uuid, 
                nodeUUID: lastNode.uuid
            },
            newPosition: {
                x: 444,
                y: 555
            }
        } as Interfaces.SendMessageProps);

        // resolve its pending connection
        mutator.resolvePendingConnection(newNode);

        // now add an action to that node
        var newActionUUID = UUID.v4();
        mutator.updateAction({
            uuid: newActionUUID,
            type: "msg",
            text: "Add new action on our new node",
            addToNode: newNode.uuid,
        } as Interfaces.SendMessageProps);

        // we should have two actions now
        newNode = mutator.getNode(newNode.uuid);
        chai.assert.equal(newNode.actions.length, 2);

        // now remove our newly created action
        mutator.removeAction(newNode.actions[1]);
        newNode = mutator.getNode(newNode.uuid);
        chai.assert.equal(newNode.actions.length, 1);
    });

    xit('removes localization on node removal', () => {
        chai.assert.isTrue(false);
    });

});