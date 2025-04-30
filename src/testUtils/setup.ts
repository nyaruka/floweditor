import { Console } from 'console';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Exit } from 'flowTypes';
import { loadStore } from 'store';
import { RenderNode } from 'store/flowContext';

// Declare custom matcher types
declare global {
  namespace jest {
    interface Matchers<R> {
      toPointTo(renderNode: RenderNode): R;
      toHaveExitThatPointsTo(renderNode: RenderNode): R;
      toHaveInboundFrom(exit: Exit): R;
      toHaveExitWithDestination(): R;
      toHaveInboundConnections(): R;
      toHavePayload(action: string, payload: any): R;
      toHaveReduxActions(actions: string[]): R;
      toMatchCallSnapshot(snapshotName?: string): R;
    }
  }
}

// Ensure console logs are visible while running tests https://github.com/facebook/jest/issues/3853
global.console = new Console(process.stderr, process.stderr);

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

// RAF shim
// tslint:disable-next-line:ban-types
(global as any).requestAnimationFrame = (callback: Function) => {
  setTimeout(callback, 0);
};
