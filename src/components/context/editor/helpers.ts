import { EditorState } from '~/components/context/editor/EditorContext';

const mutate = require('immutability-helper');

export const mergeEditorState = (
    state: EditorState,
    changes: Partial<EditorState>
): EditorState => {
    return mutate(state, { $merge: changes });
};
