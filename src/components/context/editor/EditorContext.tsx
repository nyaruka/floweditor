import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { mergeEditorState } from '~/components/context/editor/helpers';
import { Asset } from '~/services/AssetService';

export interface EditorProps {}

// tslint:disable:no-shadowed-variable
export interface DragSelection {
    startX?: number;
    startY?: number;
    currentX?: number;
    currentY?: number;
    selected?: { [uuid: string]: boolean };
}

export interface DebugState {
    showUUIDs: boolean;
}

export interface EditorState {
    language: Asset;
    translating: boolean;
    fetchingFlow: boolean;
    nodeDragging: boolean;
    dragGroup: boolean;
    dragSelection: DragSelection;

    mutator: {
        mergeEditorState(updates: Partial<EditorState>): void;
    };

    debug?: DebugState;
}

const { Provider, Consumer } = React.createContext<EditorState | null>(null);

export class EditorProvider extends React.Component<EditorProps, EditorState> {
    constructor(props: EditorProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/]
        });

        this.state = {
            language: null,
            translating: false,
            fetchingFlow: false,
            nodeDragging: false,
            dragGroup: false,
            dragSelection: null,
            debug: null,

            mutator: {
                mergeEditorState: (changes: Partial<EditorState>) => {
                    this.setState(mergeEditorState(this.state, changes));
                }
            }
        };
    }

    public render(): JSX.Element {
        return <Provider value={this.state}>{this.props.children}</Provider>;
    }
}

export const EditorConsumer = Consumer;
