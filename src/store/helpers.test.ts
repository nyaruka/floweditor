import { getSuggestedResultName } from './helpers';
import { v4 as generateUUID } from 'uuid';

describe('helpers', () => {
    it('should suggest response names', () => {
        const suggestison = getSuggestedResultName({
            nodeA: {
                node: { uuid: generateUUID(), exits: [] },
                ui: { position: { x: 100, y: 100 } }
            }
        });

        expect(suggestison).toBe('Response 2');
    });
});
