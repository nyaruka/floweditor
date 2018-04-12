import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import TextareaAutosize from 'react-autosize-textarea';

import { FlowPosition, StickyNote, FlowDefinition } from '../../flowTypes';
import * as styles from './Sticky.scss';
import { AppState, DispatchWithState, updateSticky, UpdateSticky } from '../../store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { snapToGrid, QUIET_NOTE, CONFIRMATION_TIME } from '../../utils';
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
    definition: FlowDefinition;
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
    color: string;
    showConfirmation: boolean;
}

const COLOR_OPTIONS = {
    yellow: styles.yellow,
    blue: styles.blue,
    purple: styles.purple,
    gray: styles.gray
};

export class Sticky extends React.Component<StickyProps, StickyState> {
    private dragging = false;
    private ele: HTMLDivElement;
    private debounceTextChanges: number;
    private showConfirmation: number;

    constructor(props: StickyProps & StickyStoreProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^on/, /^get/]
        });

        this.state = {
            title: this.props.sticky.title,
            body: this.props.sticky.body,
            color: this.props.sticky.color,
            showConfirmation: false
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

        if (this.showConfirmation) {
            window.clearTimeout(this.showConfirmation);
        }

        if (this.debounceTextChanges) {
            window.clearTimeout(this.showConfirmation);
        }
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
        if (this.debounceTextChanges) {
            window.clearTimeout(this.debounceTextChanges);
        }

        this.debounceTextChanges = window.setTimeout(() => {
            const updated = { ...this.props.sticky };
            updated.title = this.state.title;
            updated.body = this.state.body;
            this.props.updateSticky(this.props.uuid, updated);
            this.debounceTextChanges = null;
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

    private onClickRemove(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.state.showConfirmation) {
            this.props.updateSticky(this.props.uuid, null);
        } else {
            this.setState({ showConfirmation: true });
            this.showConfirmation = window.setTimeout(() => {
                this.setState({ showConfirmation: false });
            }, CONFIRMATION_TIME);
        }
    }

    private onChangeColor(color: string): void {
        this.props.sticky.color = color;
        this.props.updateSticky(this.props.uuid, this.props.sticky);
        this.setState({ color });
    }

    private getColorChooser(): JSX.Element {
        return (
            <div className={styles.colorChooser}>
                {Object.keys(COLOR_OPTIONS).map((color: string) => {
                    return (
                        <div
                            key={this.props.uuid + color}
                            onClick={() => {
                                this.onChangeColor(color);
                            }}
                            className={styles.colorOption + ' ' + COLOR_OPTIONS[color]}
                        />
                    );
                })}
            </div>
        );
    }

    public render(): JSX.Element {
        const sticky = this.props.sticky;

        // add our removal class if necessary
        const titleClasses = [styles.titleWrapper];
        if (this.state.showConfirmation) {
            titleClasses.push(styles.removal);
        }

        const containerClasses = [styles.stickyContainer];
        if (!this.props.sticky.color) {
            this.props.sticky.color = 'yellow';
        }

        containerClasses.push(COLOR_OPTIONS[this.props.sticky.color]);
        const colorChooser = this.getColorChooser();

        return (
            <div
                key={this.props.uuid}
                className={containerClasses.join(' ')}
                ref={this.onRef}
                id={this.props.uuid}
                style={{
                    left: sticky.position.left,
                    top: sticky.position.top
                }}
            >
                <div className={styles.sticky}>
                    <div className={titleClasses.join(' ')}>
                        <div className={styles.removeButton} onClick={this.onClickRemove}>
                            <span className="icon-remove" />
                        </div>
                        <div className={styles.confirmation}>Remove?</div>
                        <TextareaAutosize
                            className={styles.title}
                            value={this.state.title}
                            onChange={this.onChangeTitle}
                        />
                    </div>
                    <div className={styles.bodyWrapper}>
                        <TextareaAutosize
                            className={styles.body}
                            value={this.state.body}
                            onChange={this.onChangeBody}
                        />
                        {colorChooser}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ flowContext: { definition } }: AppState) => ({
    definition
});

const mapDispatchToProps = (dispatch: DispatchWithState) => {
    return bindActionCreators({ updateSticky, onResetDragSelection }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: false })(Sticky);
