import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import TextareaAutosize from 'react-autosize-textarea';

import { FlowPosition, StickyNote } from '../../flowTypes';
import * as styles from './Sticky.scss';
import { AppState, DispatchWithState, updateSticky, UpdateSticky } from '../../store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { snapToGrid, QUIET_NOTE } from '../../utils';
import { DragEvent } from '../../services/Plumber';
import { onResetDragSelection, OnResetDragSelection } from '../../store/thunks';

type DragFunction = (event: DragEvent) => void;

interface StickyPassedProps {
    uuid: string;
    sticky: StickyNote;
    plumberClearDragSelection: () => void;
    plumberRemove: (uuid: string) => void;
    plumberDraggable: (
        uuid: string,
        start: DragFunction,
        drag: DragFunction,
        stop: DragFunction,
        beforeDrag?: () => void
    ) => void;
}

interface StickyStoreProps {
    updateSticky: UpdateSticky;
    onResetDragSelection: OnResetDragSelection;
}

type StickyProps = StickyPassedProps & StickyStoreProps;

/**
 * We have internal state to track as the user types so
 * we can debounce updates to the store.
 */
interface StickyState {
    title: string;
    body: string;
}

export class Sticky extends React.Component<StickyProps, StickyState> {
    private dragging = false;
    private ele: HTMLDivElement;
    private debounce: number;

    constructor(props: StickyProps & StickyStoreProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^on/]
        });

        this.state = {
            title: this.props.sticky.title,
            body: this.props.sticky.body
        };
    }

    private onRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public componentDidMount(): void {
        this.props.plumberDraggable(
            this.props.uuid,
            (event: DragEvent) => this.onDragStart(event),
            (event: DragEvent) => this.onDrag(event),
            (event: DragEvent) => this.onDragStop(event),
            () => {
                return true;
            }
        );
    }

    public componentWillUnmount(): void {
        this.props.plumberRemove(this.props.uuid);
    }

    private onDragStart(event: DragEvent): void {
        this.props.plumberClearDragSelection();
        this.props.onResetDragSelection();
    }

    private onDrag(event: DragEvent): void {
        // noop
    }

    private onDragStop(event: DragEvent): void {
        // snap us to the same grid
        const { left, top } = snapToGrid(event.finalPos[0], event.finalPos[1]);
        this.ele.style.left = `${left}px`;
        this.ele.style.top = `${top}px`;

        this.props.sticky.position = { left, top };
        this.props.updateSticky(this.props.uuid, this.props.sticky);
    }

    private onUpdateText(): void {
        if (this.debounce) {
            window.clearTimeout(this.debounce);
        }

        this.debounce = window.setTimeout(() => {
            const updated = { ...this.props.sticky };
            updated.title = this.state.title;
            updated.body = this.state.body;
            this.props.updateSticky(this.props.uuid, updated);
        }, QUIET_NOTE);
    }

    private onChangeTitle(event: React.FormEvent<HTMLTextAreaElement>): void {
        this.setState({ title: event.currentTarget.value });
        this.onUpdateText();
    }

    private onChangeBody(event: React.FormEvent<HTMLTextAreaElement>): void {
        this.setState({ body: event.currentTarget.value });
        this.onUpdateText();
    }

    public render(): JSX.Element {
        const sticky = this.props.sticky;
        return (
            <div
                key={this.props.uuid}
                className={styles.stickyContainer}
                ref={this.onRef}
                id={this.props.uuid}
                style={{
                    left: sticky.position.left,
                    top: sticky.position.top
                }}
            >
                <div className={styles.sticky}>
                    <TextareaAutosize
                        className={styles.title}
                        value={this.state.title}
                        onChange={this.onChangeTitle}
                    />
                    <TextareaAutosize
                        className={styles.body}
                        value={this.state.body}
                        onChange={this.onChangeBody}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch: DispatchWithState) => {
    return bindActionCreators({ updateSticky, onResetDragSelection }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: false })(Sticky);
