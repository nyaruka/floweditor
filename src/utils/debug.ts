import { DebugState } from 'store/editor';
import { store } from 'store';

const mutate = require('immutability-helper');

/* istanbul ignore next */
export default class Debug {
  private state: DebugState;

  constructor(props: any, initial: DebugState) {
    this.state = initial || { showUUIDs: false };
  }

  public showUUIDs(): DebugState {
    const updated = mutate(this.state, { $merge: { showUUIDs: true } });
    
    // Update via TembaStore instead of Redux
    const currentEditorState = store.getState().editorState;
    store.getState().updateEditorState({ 
      ...currentEditorState, 
      debug: updated 
    });
    
    return updated;
  }
}
