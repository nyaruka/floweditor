import { EditorState } from '~/components/context/editor/EditorContext';
import { DebugState } from '~/store/editor';

const mutate = require('immutability-helper');

/* istanbul ignore next */
export default class Debug {
    private props: EditorState;
    private state: DebugState;

    constructor(props: EditorState, initial: DebugState) {
        this.props = props;
        this.state = initial || { showUUIDs: false };
    }

    public showUUIDs(): DebugState {
        const updated = mutate(this.state, { $merge: { showUUIDs: true } });
        this.props.mutator.mergeEditorState({ debug: updated });
        return updated;
    }
}
