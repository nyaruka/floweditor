import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import { FlowMutator } from '../src/components/FlowMutator';
import { FlowDefinition, UINode, SendMessage, Webhook, SaveFlowResult } from '../src/FlowDefinition';
import { NodeProps } from '../src/components/Node';
import { getFavorites, dump } from './utils';
import { ComponentMap } from "../src/components/ComponentMap";

describe('FlowMutator', () => {

    var mutator: FlowMutator;
    var definition: FlowDefinition;
    var components: ComponentMap;

    beforeEach(() => {
        definition = getFavorites()
        mutator = new FlowMutator(definition, (updated: FlowDefinition) => {
            definition = updated;
        });

        components = ComponentMap.get();
    });

    describe('Nodes', () => {

        it('updates positions', () => {
            // move our first node down
            var firstNode = definition.nodes[0].uuid;
            var originalPosition = definition._ui.nodes[firstNode].position;

            mutator.updateNodeUI(firstNode, {
                position: { $set: { x: originalPosition.x, y: originalPosition.y + 1000 } }
            });

            // our position should be updated
            var newPosition = definition._ui.nodes[firstNode].position;
            chai.assert.deepEqual(newPosition, { x: originalPosition.x, y: originalPosition.y + 1000 });

            // our first node should no longer be the first node
            chai.assert.notEqual(definition.nodes[0].uuid, firstNode, "Entry node didn't change on move");

            // check our component map agrees
            var details = components.getDetails(firstNode);
            chai.assert.notEqual(details.nodeIdx, 0);

        });

        it('removes nodes and remaps exits', () => {

            // we start with 7 nodes
            chai.assert.equal(definition.nodes.length, 7)
            chai.assert.equal(Object.keys(definition._ui.nodes).length, 7);

            // remove the action node following the first response
            mutator.removeNode(definition.nodes[4]);

            // now we should be down to 6 nodes
            chai.assert.equal(definition.nodes.length, 6);
            chai.assert.equal(Object.keys(definition._ui.nodes).length, 6);

            // our previous non-other exits should be rerouted to the next node
            for (let exit of definition.nodes[4].exits) {
                if (exit.name != "Other") {
                    chai.assert.equal(definition.nodes[5].uuid, exit.destination_node_uuid);
                }
            }

            // remove each remaining node, one by one
            while (definition.nodes.length > 0) {
                mutator.removeNode(definition.nodes[0]);
            }

            // we should be left with no nodes
            chai.assert.equal(definition.nodes.length, 0);
            chai.assert.equal(Object.keys(definition._ui.nodes).length, 0);

        });

        it('removes actions', () => {

            // our last node has two actions
            var indexes = components.getDetails("47a0be00-59ad-4558-bd13-ec66518ce44a");
            chai.assert.equal(definition.nodes[indexes.nodeIdx].actions.length, 2);

            // get our last message action in the flow
            var indexes = components.getDetails("76fe3759-e0b6-437e-ae6c-6005ff43fbb8");
            var action = definition.nodes[indexes.nodeIdx].actions[indexes.actionIdx];

            // remove that action
            mutator.removeAction(action);

            // now our node should have one action
            chai.assert.equal(1, definition.nodes[indexes.nodeIdx].actions.length);

        });

        it('removes the node if the last action is removed', () => {

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

            var newAction: SendMessage = {
                uuid: actionUUID,
                type: "msg",
                text: "A new message after dragging"
            }

            var newNode = mutator.updateAction(newAction, "47a0be00-59ad-4558-bd13-ec66518ce44a",
                {
                    exitUUID: lastNode.exits[0].uuid,
                    nodeUUID: lastNode.uuid
                },
                {
                    x: 444,
                    y: 555
                }
            );

            // we should have a new node
            chai.assert.equal(definition.nodes.length, 8, "Failed to add new node");

            // we should now have a pending connection on our new ndoe
            lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");
            chai.assert.isNull(lastNode.exits[0].destination_node_uuid);
            chai.assert.equal(components.getPendingConnection(newNode.uuid).exitUUID, lastNode.exits[0].uuid);

            // resolve our pending connection and check the exit destination
            mutator.resolvePendingConnection(newNode);
            lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");
            chai.assert.isNotNull(lastNode.exits[0].destination_node_uuid);

            // check that we have our location set
            var ui = definition._ui.nodes[newNode.uuid] as UINode;
            chai.assert.notEqual(ui, undefined, "Couldn't find ui details for new node");
            chai.assert.deepEqual(ui.position, { x: 444, y: 555 })
        });

        xit('removes localization on node removal', () => {
            chai.assert.isTrue(false);
        });
    });

    describe('Actions', () => {
        it('updates existing actions to the same type', () => {
            var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")

            var newAction: SendMessage = {
                uuid: lastNode.actions[0].uuid,
                type: "msg",
                text: "An update to an existing action",
            }
            mutator.updateAction(newAction, "47a0be00-59ad-4558-bd13-ec66518ce44a");

            lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
            var action = lastNode.actions[0] as SendMessage;
            chai.assert.equal(action.text, "An update to an existing action");
        });

        it('updates existing actions to a different type', () => {
            var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
            mutator.updateAction({
                uuid: lastNode.actions[0].uuid,
                type: "save_flow_result",
                value: "My Value",
                result_name: "New Flow Result"
            } as SaveFlowResult, null);

            lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")
            var action = lastNode.actions[0] as SaveFlowResult;
            chai.assert.equal(action.result_name, "New Flow Result");
            chai.assert.equal(action.value, "My Value");
        });

        it('adds actions to an existing node', () => {
            var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");

            mutator.updateAction({
                uuid: UUID.v4(),
                type: "msg",
                text: "Add action to an existing node",
                addToNode: "47a0be00-59ad-4558-bd13-ec66518ce44a",
                dragging: false,
                context: null
            } as SendMessage, null, null, null, lastNode);

            lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a");
            chai.assert.equal(3, lastNode.actions.length);

            var action = lastNode.actions[2] as SendMessage;
            chai.assert.equal(action.text, "Add action to an existing node");
        });

        it('can remove added actions on new nodes', () => {
            var lastNode = mutator.getNode("47a0be00-59ad-4558-bd13-ec66518ce44a")

            var newAction: SendMessage = {
                uuid: UUID.v4(),
                type: "msg",
                text: "An action that creates a new node",
            }

            // first add a new action
            var newNode = mutator.updateAction(newAction, "47a0be00-59ad-4558-bd13-ec66518ce44a",
                {
                    exitUUID: lastNode.exits[0].uuid,
                    nodeUUID: lastNode.uuid
                },
                {
                    x: 444,
                    y: 555
                }
            );

            // resolve its pending connection
            mutator.resolvePendingConnection(newNode);

            // now add an action to that node
            var newAction: SendMessage = {
                uuid: UUID.v4(),
                type: "msg",
                text: "Add new action on our new node",
            }

            mutator.updateAction(newAction, null, null, null, newNode);

            // we should have two actions now
            newNode = mutator.getNode(newNode.uuid);
            chai.assert.equal(newNode.actions.length, 2);

            // now remove our newly created action
            mutator.removeAction(newNode.actions[1]);
            newNode = mutator.getNode(newNode.uuid);
            chai.assert.equal(newNode.actions.length, 1);
        });
    });
});