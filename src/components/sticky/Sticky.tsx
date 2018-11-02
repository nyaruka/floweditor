import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import TextareaAutosize from 'react-autosize-textarea/lib';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as styles from '~/components/sticky/Sticky.scss';
import { FlowDefinition, StickyNote } from '~/flowTypes';
import { DragEvent } from '~/services/Plumber';
import { CanvasPositions } from '~/store/editor';
import AppState from '~/store/state';
import {
    DispatchWithState,
    OnResetDragSelection,
    onResetDragSelection,
    UpdateDimensions,
    updateDimensions,
    UpdateSticky,
    updateSticky
} from '~/store/thunks';
import { CONFIRMATION_TIME, QUIET_NOTE, snapToGrid } from '~/utils';

type DragFunction = (event: DragEvent) => void;
export const STICKY_SPEC_ID: string = 'sticky-container';

export interface StickyPassedProps {
    uuid: string;
    sticky: StickyNote;
}

export interface StickyStoreProps {
    definition: FlowDefinition;
    canvasSelections: CanvasPositions;
    updateSticky: UpdateSticky;
    updateDimensions: UpdateDimensions;
    onResetDragSelection: OnResetDragSelection;
}

export type StickyProps = StickyPassedProps & StickyStoreProps;

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
    green: styles.green,
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
            include: [/^on/, /^get/, /^is/]
        });

        this.state = {
            title: this.props.sticky.title,
            body: this.props.sticky.body,
            color: this.props.sticky.color,
            showConfirmation: false
        };
    }

    private isSelected(): boolean {
        return this.props.canvasSelections && this.props.canvasSelections[this.props.uuid] != null;
    }

    private onRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public componentDidMount(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.uuid, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    public componentWillUnmount(): void {
        if (this.showConfirmation) {
            window.clearTimeout(this.showConfirmation);
        }

        if (this.debounceTextChanges) {
            window.clearTimeout(this.debounceTextChanges);
        }
    }

    public onDragStart(event: DragEvent): void {
        this.props.onResetDragSelection();
    }

    public onDrag(event: DragEvent): void {
        // noop
    }

    public onDragStop(event: DragEvent): void {
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

    public onClickRemove(event: React.MouseEvent<HTMLDivElement>): void {
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
            <div className={styles.colorChooserContainer}>
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

        const stickyClasses = [styles.sticky];
        if (this.isSelected()) {
            stickyClasses.push(styles.selected);
        }

        containerClasses.push(COLOR_OPTIONS[this.props.sticky.color]);
        const colorChooser = this.getColorChooser();

        return (
            <div
                key={this.props.uuid}
                className={containerClasses.join(' ')}
                data-spec={STICKY_SPEC_ID}
                ref={this.onRef}
                id={this.props.uuid}
            >
                <div className={stickyClasses.join(' ')}>
                    <div className={titleClasses.join(' ')}>
                        <div className={styles.removeButton} onClick={this.onClickRemove}>
                            <span className="fe-x" />
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

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { definition },
    editorState: { canvasSelections }
}: AppState) => ({
    definition,
    canvasSelections
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) => {
    return bindActionCreators({ updateSticky, onResetDragSelection, updateDimensions }, dispatch);
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: false }
)(Sticky);
