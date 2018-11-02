import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { CanvasDraggable, CanvasDraggableProps } from '~/components/canvas/CanvasDraggable';
import { DRAG_THRESHOLD } from '~/components/flow/Flow';
import { FlowPosition } from '~/flowTypes';
import { CanvasPositions, DragSelection } from '~/store/editor';
import { MergeEditorState } from '~/store/thunks';
import { createUUID } from '~/utils';

import * as styles from './Canvas.scss';

interface CanvasProps {
    dragActive: boolean;
    draggables: CanvasDraggableProps[];
    getCurrentPosition: (uuid: string) => FlowPosition;
    onUpdateDragPositions: (
        delta: FlowPosition,
        originalPositions: CanvasPositions,
        snap: boolean
    ) => void;
    onCheckCollisions: (box: FlowPosition) => CanvasPositions;
    canvasSelections: CanvasPositions;
    mergeEditorState: MergeEditorState;
}

interface CanvasState {
    dragDownPosition: FlowPosition;
    dragUUID: string;
    dragGroup: boolean;
    dragSelection: DragSelection;
    uuid: string;
}

export class Canvas extends React.Component<CanvasProps, CanvasState> {
    private ele: HTMLDivElement;
    private parentOffset: FlowPosition;

    constructor(props: CanvasProps) {
        super(props);

        this.state = {
            dragDownPosition: null,
            dragUUID: null,
            dragGroup: false,
            dragSelection: null,
            uuid: createUUID()
        };

        bindCallbacks(this, {
            include: [/^handle/, /^render/]
        });
    }

    public componentDidMount(): void {
        let offset = { left: 0, top: 0 };
        /* istanbul ignore next */
        if (this.ele) {
            offset = this.ele.getBoundingClientRect();
        }
        this.parentOffset = { left: offset.left, top: offset.top + window.scrollY };
    }

    public renderSelectionBox(): JSX.Element {
        const drag = this.state.dragSelection;

        if (drag) {
            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const width = Math.max(drag.startX, drag.currentX) - left;
            const height = Math.max(drag.startY, drag.currentY) - top;

            if (this.state.dragSelection && this.state.dragSelection.startX) {
                return (
                    <div className={styles.dragSelection} style={{ left, top, width, height }} />
                );
            }
        }

        return null;
    }

    private isClickOnCanvas(event: React.MouseEvent<HTMLDivElement>): boolean {
        return (event.target as any).id === this.state.uuid;
    }

    private handleMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.isClickOnCanvas(event)) {
            this.setState({
                dragSelection: {
                    startX: event.pageX - this.parentOffset.left,
                    startY: event.pageY - this.parentOffset.top,
                    currentX: event.pageX - this.parentOffset.left,
                    currentY: event.pageY - this.parentOffset.top
                }
            });
        }
    }

    private handleMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.state.dragSelection && this.state.dragSelection.startX) {
            const drag = this.state.dragSelection;
            const left = Math.min(drag.startX, drag.currentX);
            const top = Math.min(drag.startY, drag.currentY);
            const right = Math.max(drag.startX, drag.currentX);
            const bottom = Math.max(drag.startY, drag.currentY);

            const selected = this.props.onCheckCollisions({ left, top, right, bottom });
            this.setState({
                dragSelection: {
                    startX: drag.startX,
                    startY: drag.startY,
                    currentX: event.pageX - this.parentOffset.left,
                    currentY: event.pageY - this.parentOffset.top
                }
            });

            this.props.mergeEditorState({ canvasSelections: selected });
        }

        if (this.state.dragUUID) {
            this.updatePositions(event, false);
        }
    }

    private updatePositions(event: React.MouseEvent<HTMLDivElement>, snap: boolean) {
        const { dragUUID } = this.state;

        const startPosition = this.props.dragActive
            ? this.props.canvasSelections[dragUUID]
            : this.props.getCurrentPosition(dragUUID);

        const xd =
            event.pageX -
            this.parentOffset.left -
            this.state.dragDownPosition.left -
            startPosition.left;

        const yd =
            event.pageY -
            this.parentOffset.top -
            this.state.dragDownPosition.top -
            startPosition.top;

        if (this.props.dragActive) {
            this.props.onUpdateDragPositions(
                { left: xd, top: yd },
                this.props.canvasSelections,
                snap
            );
        } else {
            if (Math.abs(xd) + Math.abs(yd) > DRAG_THRESHOLD) {
                let selected = this.props.canvasSelections;
                if (!(this.state.dragUUID in selected)) {
                    selected = { [dragUUID]: this.props.getCurrentPosition(dragUUID) };
                }

                this.props.mergeEditorState({
                    dragActive: true,
                    canvasSelections: selected
                });
            }
        }
    }

    private handleMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
        if (this.state.dragUUID) {
            this.updatePositions(event, true);

            this.setState({
                dragDownPosition: null,
                dragSelection: null,
                dragUUID: null
            });

            this.props.mergeEditorState({
                canvasSelections: {},
                dragActive: false
            });
        }

        if (this.state.dragSelection && this.state.dragSelection.startX) {
            this.setState({
                dragSelection: {
                    startX: null,
                    startY: null,
                    currentX: null,
                    currentY: null
                }
            });
        }
    }

    private handleDragStart(uuid: string, position: FlowPosition): void {
        this.setState({
            dragUUID: uuid,
            dragDownPosition: {
                left: position.left - this.parentOffset.left,
                top: position.top - this.parentOffset.top
            }
        });
    }

    private handleDragStop(): void {
        this.setState({
            dragUUID: null,
            dragDownPosition: null,
            dragSelection: null
        });

        this.props.mergeEditorState({
            dragActive: false
        });
    }

    public render(): JSX.Element {
        return (
            <div
                id={this.state.uuid}
                ref={(ele: HTMLDivElement) => {
                    this.ele = ele;
                }}
                className={styles.canvas}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
            >
                {this.props.draggables.map((draggable: CanvasDraggableProps) => (
                    <CanvasDraggable
                        selected={!!this.props.canvasSelections[draggable.uuid]}
                        key={draggable.ele.key}
                        {...draggable}
                        onDragStart={this.handleDragStart}
                        onDragStop={this.handleDragStop}
                    />
                ))}
                {this.props.children}
                {this.renderSelectionBox()}
            </div>
        );
    }
}
