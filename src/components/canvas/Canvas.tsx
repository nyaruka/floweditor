import { react as bindCallbacks } from 'auto-bind';
import mutate from 'immutability-helper';
import * as React from 'react';
import { CanvasDraggable, CanvasDraggableProps } from '~/components/canvas/CanvasDraggable';
import { draggable } from '~/components/canvas/CanvasDraggable.scss';
import { getCollisions } from '~/components/canvas/helpers';
import { DRAG_THRESHOLD } from '~/components/flow/Flow';
import { dragGroup } from '~/components/flow/node/Node.scss';
import { Dimensions, FlowPosition } from '~/flowTypes';
import { CanvasPositions, DragSelection } from '~/store/editor';
import { addPosition } from '~/store/helpers';
import { MergeEditorState } from '~/store/thunks';
import { snapPositionToGrid } from '~/utils';

import * as styles from './Canvas.scss';

interface CanvasProps {
    uuid: string;
    dragActive: boolean;
    draggables: CanvasDraggableProps[];
    onDragged: (draggedUUIDs: string[]) => void;
    onUpdateDragPositions: (
        delta: FlowPosition,
        originalPositions: CanvasPositions,
        snap: boolean
    ) => void;
    mergeEditorState: MergeEditorState;
}

interface CanvasState {
    dragDownPosition: FlowPosition;
    dragUUID: string;
    dragGroup: boolean;
    dragSelection: DragSelection;
    uuid: string;
    positions: CanvasPositions;
    selected: CanvasPositions;
}

export class Canvas extends React.PureComponent<CanvasProps, CanvasState> {
    private ele: HTMLDivElement;
    private parentOffset: FlowPosition;

    // did we just select something
    private justSelected = false;

    constructor(props: CanvasProps) {
        super(props);

        const positions: { [uuid: string]: FlowPosition } = {};
        this.props.draggables.forEach((draggable: CanvasDraggableProps) => {
            positions[draggable.uuid] = draggable.position;
        });

        this.state = {
            dragDownPosition: null,
            dragUUID: null,
            dragGroup: false,
            dragSelection: null,
            uuid: this.props.uuid,
            selected: {},
            positions
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
        this.justSelected = false;

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

            const selected = getCollisions(this.state.positions, { left, top, right, bottom });

            this.setState({
                dragSelection: {
                    startX: drag.startX,
                    startY: drag.startY,
                    currentX: event.pageX - this.parentOffset.left,
                    currentY: event.pageY - this.parentOffset.top
                }
            });

            this.setState({ selected });

            if (Object.keys(selected).length > 0) {
                this.justSelected = true;
            }
        }

        if (this.state.dragUUID) {
            this.updatePositions(event, false);
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
        }

        if (!this.justSelected) {
            this.props.mergeEditorState({
                dragActive: false
            });

            this.setState({ selected: {} });
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

        this.justSelected = false;
    }

    private handleUpdateDimensions(uuid: string, dimensions: Dimensions): void {
        let pos = this.state.positions[uuid];

        if (!pos) {
            pos = this.props.draggables.find((item: CanvasDraggableProps) => item.uuid === uuid)
                .position;
        }

        const newPosition = {
            left: pos.left,
            top: pos.top,
            right: pos.left + dimensions.width,
            bottom: pos.top + dimensions.height
        };

        if (newPosition.right !== pos.right || newPosition.bottom !== pos.bottom) {
            const newPositions = mutate(this.state.positions, {
                $merge: {
                    [uuid]: newPosition
                }
            });

            this.setState({ positions: newPositions });
        }
    }

    private updatePositions(event: React.MouseEvent<HTMLDivElement>, snap: boolean): void {
        const { dragUUID } = this.state;

        const startPosition = this.props.dragActive
            ? this.state.selected[dragUUID]
            : this.state.positions[dragUUID];

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
            const uuids = Object.keys(this.state.selected);

            let newPositions = this.state.positions;
            const delta = { left: xd, top: yd };
            uuids.forEach((uuid: string) => {
                let newPosition = addPosition(this.state.selected[uuid], delta);
                if (snap) {
                    newPosition = snapPositionToGrid(newPosition);
                }
                newPositions = mutate(newPositions, {
                    $merge: { [uuid]: newPosition }
                });
            });

            this.setState({ positions: newPositions });

            this.props.onDragged(uuids);
        } else {
            if (Math.abs(xd) + Math.abs(yd) > DRAG_THRESHOLD) {
                let selected = this.state.selected;
                if (!(this.state.dragUUID in selected)) {
                    selected = { [dragUUID]: this.state.positions[dragUUID] };
                }

                this.props.mergeEditorState({
                    dragActive: true
                });

                this.setState({ selected });
            }
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
                {this.props.draggables.map((draggable: CanvasDraggableProps) => {
                    const pos = this.state.positions[draggable.uuid] || draggable.position;
                    return (
                        <CanvasDraggable
                            key={'draggable_' + draggable.uuid}
                            uuid={draggable.uuid}
                            updateDimensions={this.handleUpdateDimensions}
                            position={pos}
                            selected={!!this.state.selected[draggable.uuid]}
                            ele={draggable.ele}
                            onDragStart={this.handleDragStart}
                            onDragStop={this.handleDragStop}
                        />
                    );
                })}
                {this.props.children}
                {this.renderSelectionBox()}
            </div>
        );
    }
}
