import { getSwitchRouter, resolveRoutes } from 'components/flow/routers/helpers';
import { createCases, createMatchRouter, createRoutes } from 'testUtils/assetCreators';

describe('routers', () => {
  describe('system categories', () => {
    it('creates all responses category', () => {
      const { categories } = resolveRoutes(createCases([]), false, null);
      expect(categories.length).toBe(1);
      expect(categories[0].name).toBe('All Responses');
    });

    it('creates converts all responses category to other', () => {
      const renderNode = createMatchRouter([]);
      const router = getSwitchRouter(renderNode.node);
      expect(router.categories.length).toBe(1);
      expect(router.categories[0].name).toBe('All Responses');

      // now edit our node to add a rule
      const { categories } = resolveRoutes(createCases(['Red']), false, renderNode.node);
      expect(categories.length).toBe(2);
      expect(categories[1].name).toBe('Other');
    });

    it('creates other category', () => {
      const { categories } = resolveRoutes(createCases(['Red', 'Green', 'Blue']), false, null);
      expect(categories.length).toBe(4);
      expect(categories[categories.length - 1].name).toBe('Other');
    });

    it('reuses other category', () => {
      const renderNode = createMatchRouter(['Red', 'Green', 'Blue']);
      const originalCategories = renderNode.node.router.categories;
      expect(originalCategories[originalCategories.length - 1].name).toBe('Other');

      const { categories } = resolveRoutes(
        createCases(['Red', 'Green', 'Blue']),
        false,
        renderNode.node
      );

      // we should have reused our other category
      expect(categories[categories.length - 1].uuid).toBe(
        originalCategories[originalCategories.length - 1].uuid
      );
    });

    it('creates timeout category', () => {
      const { categories } = resolveRoutes(createCases(['Red', 'Green', 'Blue']), true, null);
      expect(categories.length).toBe(5);
      expect(categories[categories.length - 1].name).toBe('No Response');
    });

    it('reuses timeout category', () => {
      const renderNode = createMatchRouter(['Red', 'Green', 'Blue'], true);
      const originalCategories = renderNode.node.router.categories;
      expect(originalCategories[originalCategories.length - 1].name).toBe('No Response');

      const { categories } = resolveRoutes(
        createCases(['Red', 'Green', 'Blue']),
        true,
        renderNode.node
      );

      // we should have reused our timeout category
      expect(categories[categories.length - 1].uuid).toBe(
        originalCategories[originalCategories.length - 1].uuid
      );
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
      const originalNode = createMatchRouter(['Red']);
      const categories = originalNode.node.router.categories;
      const cases = getSwitchRouter(originalNode.node).cases;
      const exits = originalNode.node.exits;

      expect(categories[0].name).toBe('Red');
      expect(categories[1].name).toBe('Other');

      const routes = resolveRoutes(createCases(['Red', 'Green', 'Blue']), false, originalNode.node);

      // we now have three cases
      expect(routes.cases.length).toBe(3);

      // our cases got new uuids
      expect(routes.cases[0].uuid).not.toEqual(cases[0].uuid);

      // but they reused the categories
      expect(routes.categories[0].uuid).toEqual(categories[0].uuid);

      // and reused exits
      expect(routes.exits[0].uuid).toEqual(exits[0].uuid);
    });
  });
});
