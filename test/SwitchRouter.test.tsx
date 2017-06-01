import * as update from 'immutability-helper';
import * as UUID from 'uuid';
import { resolveExits, CaseProps, SwitchRouterProps } from '../src/components/routers/SwitchRouter';
import { SendMessageProps, WebhookProps } from '../src/interfaces';
import { FlowMutator } from '../src/components/FlowMutator';
import { FlowDefinition, Case, SwitchRouter, Exit } from '../src/FlowDefinition';
import { getFavorites, dump } from './utils';

describe('SwitchRouter', () => {

    var definition: FlowDefinition;
    var disasterChoice: SwitchRouterProps;
    var originalCases: CaseProps[];

    var tornado = 0;
    var tsunami = 1;
    var earthquake = 2;
    var other = 3;

    beforeEach(() => {
        definition = getFavorites();

        var switchNode = definition.nodes[5];
        disasterChoice = {
            router: switchNode.router as SwitchRouter,
            exits: switchNode.exits,
            type: switchNode.router.type,
            uuid: switchNode.uuid,
            context: null
        }

        originalCases = makeCaseProps(disasterChoice.router.cases);

        // assert our starting point
        chai.assert.equal(disasterChoice.exits[earthquake].name, "Earthquake");
        chai.assert.equal(originalCases[earthquake].kase.arguments[0], "Earthquake");

        // we have a default exit that is routed
        var defaultExit = getExit(disasterChoice.router.default, disasterChoice.exits);
        chai.assert.isNotNull(defaultExit);
        chai.assert.isNotNull(defaultExit.destination);

    });

    function makeCaseProps(cases: Case[]): CaseProps[] {
        var caseProps: CaseProps[] = [];
        for (let kase of cases) {
            caseProps.push({ kase: kase, exitName: null, onChanged: null, moveCase: null });
        }
        return caseProps;
    }

    function getExit(exitUUID: string, exits: Exit[]): Exit {
        for (let exit of exits) {
            if (exit.uuid == exitUUID) {
                return exit;
            }
        }
    }

    function resolve(newCases: CaseProps[], previous: SwitchRouterProps): { cases: Case[], exits: Exit[], defaultExit: string } {
        const { cases, exits, defaultExit } = resolveExits(newCases, previous);
        assertUniqueExits(exits);
        assertCasesHaveExits(cases, exits, defaultExit);
        assertNoOrphanedExits(cases, exits, defaultExit);
        return { cases, exits, defaultExit };
    }

    function assertNoOrphanedExits(cases: Case[], exits: Exit[], defaultExit: string) {
        for (let exit of exits) {
            if (exit.uuid != defaultExit && !cases.some(kase => kase.exit == exit.uuid)) {
                dump(exits);
                chai.assert.fail(exit.name, exit.name, "Found orphaned exit: " + exit.name)
            }
        }
    }

    function assertCasesHaveExits(cases: Case[], exits: Exit[], defaultExit: string) {

        for (let kase of cases) {
            if (!exits.some(exit => exit.uuid == kase.exit)) {
                dump(cases);
                chai.assert.fail(kase.exit, kase.exit, "Case routes to non-exisiting exit: " + kase.exit);
            }
        }

        if (!exits.some(exit => exit.uuid == defaultExit)) {
            chai.assert.fail(defaultExit, defaultExit, "Default route missing from exits: " + defaultExit);
        }

    }

    function assertUniqueExits(exits: Exit[]) {
        // they should have unique uuids
        var seen: { [uuid: string]: boolean } = {}
        for (let exit of exits) {
            if (exit.uuid in seen) {
                dump(exits);
                chai.assert.fail(exit.uuid, exit.uuid, "Duplicate exit uuid: " + exit.uuid);
            }
            seen[exit.uuid] = true;
        }

        // and unique names
        seen = {}
        for (let exit of exits) {
            if (exit.name in seen) {
                dump(exits);
                chai.assert.fail(exit.name, exit.name, "Duplicate exit name: " + exit.name);
            }
            seen[exit.name] = true;
        }
    }

    it('maintains the "other" destination', () => {

        // update without making any changes
        const { cases, exits, defaultExit } = resolve(originalCases, disasterChoice);

        // console.log(cases, exits, defaultExit);
        // our default route should be present and routed properly
        var exit = getExit(defaultExit, exits);
        chai.assert.isNotNull(exit);
        chai.assert.isNotNull(exit.destination);
    });

    it('merges cases to the same exit', () => {

        // point our earthquake rule to our tsunami exit
        var newCases = update(originalCases, { [earthquake]: { $merge: { exitName: "Tsunami" } } });
        const { cases, exits } = resolve(newCases, disasterChoice);

        // should have same number of cases, but one less exit since the earthquake exit is gone
        chai.assert.equal(cases.length, 3, "Incorrect number of cases after merged cases");
        chai.assert.equal(exits.length, disasterChoice.exits.length - 1, "Incorrect number of exits after merged cases");

        // we should now be pointed to our tsunami exit
        chai.assert.equal(cases[earthquake].exit, disasterChoice.exits[tsunami].uuid);

    });

    it('allows exit renaming', () => {

        // set a different exitName to our earthquake case                
        var newCases = update(originalCases, { [earthquake]: { $merge: { exitName: "Terramoto" } } });
        const { cases, exits } = resolve(newCases, disasterChoice);

        // number of cases and exits should remain
        chai.assert.equal(cases.length, 3, "Incorrect number of cases after a rename");
        chai.assert.equal(exits.length, 4, "Incorrect number of exits after a rename");

        // but we should have a new name for one of our exits
        chai.assert.equal("Terramoto", exits[earthquake].name);
        chai.assert.equal(cases[earthquake].arguments[0], "Earthquake");
        chai.assert.equal(cases[earthquake].exit, exits[earthquake].uuid);

        // and the uuid for our exit should not have changed
        chai.assert.equal(cases[earthquake].uuid, originalCases[earthquake].kase.uuid);

    });

    it('creates unique exit ids for unique names', () => {

        // merge earthquake into tsunami
        var newCases = update(originalCases, { [earthquake]: { $merge: { exitName: "Tsunami" } } });
        var { cases, exits } = resolve(newCases, disasterChoice);
        chai.assert.equal(exits.length, disasterChoice.exits.length - 1);

        // now rename earthquake
        disasterChoice.router.cases = cases;
        newCases = update(makeCaseProps(cases), { [earthquake]: { $merge: { exitName: "Terramoto" } } });
        var { exits } = resolve(newCases, disasterChoice);

        // should be back to the original number of exits
        chai.assert.equal(exits.length, disasterChoice.exits.length);

        // pointing to the same place
        chai.assert.equal(disasterChoice.exits[earthquake].destination, exits[earthquake].destination);

    });

    it('merges and separates cases', () => {
        // merge earthquake into tornado
        var newCases = update(originalCases, { [earthquake]: { $merge: { exitName: "Tornado" } } });
        var { cases, exits } = resolve(newCases, disasterChoice);
        chai.assert.equal(exits.length, disasterChoice.exits.length - 1);

        // merge tsunami into tornado
        disasterChoice.router.cases = cases;
        disasterChoice.exits = exits;
        newCases = update(makeCaseProps(cases), { [1]: { $merge: { exitName: "Tornado" } } });

        var { cases, exits } = resolve(newCases, disasterChoice);
        chai.assert.equal(exits.length, disasterChoice.exits.length - 1, "Incorrect number of exits after two merges");

        // now separate it back out
        disasterChoice.router.cases = cases;
        disasterChoice.exits = exits;
        newCases = update(makeCaseProps(cases), { [0]: { $merge: { exitName: "Big Swirly Wind" } } });

        var { cases, exits } = resolve(newCases, disasterChoice);

        // our original case, the one we separated from it, and other
        chai.assert.equal(exits.length, 3);

        // we still have the same number of cases we started with
        chai.assert.equal(cases.length, originalCases.length);

    });

    it('creates cases from scratch', () => {

        var defaultUUID = UUID.v4();
        var emptySwitch: SwitchRouterProps = {
            router: {
                cases: [],
                operand: "@input.text",
                default: defaultUUID,
                type: "switch",
            },
            exits: [],
            type: "switch",
            uuid: defaultUUID,
            context: null
        };

        // an empty switch with new cases
        var { cases, exits } = resolve([], emptySwitch);

        // we should have a single All Responses exit and no cases
        chai.assert.equal(cases.length, 0);
        chai.assert.equal(exits.length, 1);
        chai.assert.equal(exits[0].name, "All Responses");
        chai.assert.equal(exits[0].uuid, defaultUUID);

        // now try adding a new case
        var newCase: CaseProps = {
            kase: {
                uuid: UUID.v4(),
                type: "has_any_word",
                exit: null // no exit yet!
            },
            exitName: "New Exit",
            onChanged: null,
            moveCase: null
        };

        var { cases, exits } = resolve([newCase], emptySwitch);

        // two exits, our New Exit and the default
        chai.assert.equal(1, cases.length);
        chai.assert.equal(exits.length, 2);

        // the exitName should not be saved
        chai.assert.isNotNull(cases[0].exit);
        chai.assert.equal(cases[0].exit, exits[0].uuid);

    });

});

