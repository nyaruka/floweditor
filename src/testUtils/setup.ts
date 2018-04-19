import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as $ from 'jquery';
import { RenderNode } from '../store/flowContext';
import { Exit } from '../flowTypes';

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

// RAF shim
(global as any).requestAnimationFrame = callback => {
    setTimeout(callback, 0);
};

// Make jest aware of our jQuery dep
(window as any).$ = $;

// Declare custom matcher types
declare global {
    namespace jest {
        interface Matchers<R> {
            toPointTo(renderNode: RenderNode): R;
            toHaveExitThatPointsTo(renderNode: RenderNode): R;
            toHaveInboundFrom(exit: Exit): R;
            toHaveExitWithDestination(): R;
            toHaveInboundConnections(): R;
            toHavePayload(action, payload): R;
            toHaveReduxAction(action): R;
        }
    }
}
