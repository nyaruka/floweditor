import { resolveRoutes } from '~/components/flow/routers/helpers';
import { createUUID, dump } from '~/utils';
import { RouterTypes, SwitchRouter, FlowNode } from '~/flowTypes';
import { createCases, createRoutes } from '~/testUtils/assetCreators';

describe('routers', () => {
    describe('system categories', () => {
        it('creates other category', () => {
            const { categories } = resolveRoutes(
                createCases(['Red', 'Green', 'Blue']),
                false,
                null
            );
            expect(categories.length).toBe(4);
            expect(categories[categories.length - 1].name).toBe('Other');
        });
    });

    describe('route resolving', () => {
        it('chains cases to categories to exits', () => {
            const { cases, categories, exits } = createRoutes(['Red', 'Green', 'Blue']);

            expect(cases.length).toEqual(3);
            expect(categories.length).toEqual(4);
            expect(exits.length).toEqual(4);

            for (let i = 0; i < cases.length; i++) {
                // cases point to categories
                expect(cases[i].category_uuid).toEqual(categories[i].uuid);

                // categories point to exits
                expect(categories[i].exit_uuid).toEqual(exits[i].uuid);
            }
        });

        it('ignores empty cases', () => {
            const { cases } = createRoutes(['Red', 'Green', 'Blue', '']);
            expect(cases.length).toEqual(3);
        });

        it('reuses existing categories and exits', () => {
            // start off with a red case
            const { cases, categories, exits } = resolveRoutes(createCases(['Red']), false, null);
            expect(categories[0].name).toBe('Red');
            expect(categories[1].name).toBe('Other');
            const defaultCategory = categories[categories.length - 1];

            // now call back in with red already category
            const originalNode: FlowNode = {
                uuid: createUUID(),
                router: {
                    operand: '@input',
                    default_category_uuid: defaultCategory.uuid,
                    type: RouterTypes.switch,
                    cases,
                    categories
                } as SwitchRouter,
                actions: [],
                exits
            };

            const routes = resolveRoutes(
                createCases(['Red', 'Green', 'Blue']),
                false,
                originalNode
            );

            // we now have three cases
            expect(routes.cases.length).toBe(3);

            // our cases got new uuids
            expect(routes.cases[0].uuid).not.toEqual(cases[0].uuid);

            // but they reused the categories
            expect(routes.categories[0].uuid).toEqual(categories[0].uuid);

            // and reused exits
            expect(routes.exits[0].uuid).toEqual(exits[0].uuid);

            // and reused default category
            const category = routes.categories[routes.categories.length - 1];
            expect(category).toEqual({
                name: 'Other',
                uuid: defaultCategory.uuid,
                exit_uuid: exits[exits.length - 1].uuid
            });
        });
    });
});
