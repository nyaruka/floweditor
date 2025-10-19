/* eslint-disable @typescript-eslint/no-explicit-any */
import { react as bindCallbacks } from 'auto-bind';
import Button from 'components/button/Button';
import { Canvas } from 'components/canvas/Canvas';
import { CanvasDraggableProps } from 'components/canvas/CanvasDraggable';
import Node from 'components/flow/node/Node';
import { getDraggedFrom } from 'components/helpers';
import NodeEditor from 'components/nodeeditor/NodeEditor';
import Sticky from 'components/sticky/Sticky';
import { ConfigProviderContext, fakePropType } from 'config/ConfigProvider';
import { FlowDefinition, FlowMetadata, FlowPosition } from 'flowTypes';
import * as React from 'react';
import Plumber from 'services/Plumber';
import { DragSelection, DebugState, CanvasPositions } from 'store/editor';
import { RenderNode } from 'store/flowContext';
import { createEmptyNode, detectLoops, getOrderedNodes } from 'store/helpers';
import { NodeEditorSettings } from 'store/nodeEditor';
import { ConnectionEvent } from 'store/thunks';
import {
  createUUID,
  isRealValue,
  renderIf,
  snapToGrid,
  timeEnd,
  timeStart
} from 'utils';
import Debug from 'utils/debug';

import styles from './Flow.module.scss';
import { Trans } from 'react-i18next';
import i18n from 'config/i18n';
import { store } from 'store';
import { TembaAppState } from 'temba-components';

declare global {
  interface Window {
    fe: any;
  }
}

export interface FlowStoreProps {
  ghostNode: RenderNode;
  debug: DebugState;
  popped: string;
  dragActive: boolean;

  definition: FlowDefinition;
  nodes: { [uuid: string]: RenderNode };
  metadata: FlowMetadata;
  nodeEditorSettings: NodeEditorSettings;
}

export interface Translations {
  [uuid: string]: any;
}

export const DRAG_THRESHOLD = 3;
export const REPAINT_TIMEOUT = 500;
export const GHOST_POSITION_INITIAL = { left: -1000, top: -1000 };

export const nodeSpecId = 'node';
export const nodesContainerSpecId = 'node-container';
export const ghostNodeSpecId = 'ghost-node';
export const dragSelectSpecId = 'drag-select';

export const isDraggingBack = (event: ConnectionEvent) => {
  return event.suspendedElementId === event.targetId && event.source !== null;
};

export const getDragStyle = (drag: DragSelection) => {
  const left = Math.min(drag.startX, drag.currentX);
  const top = Math.min(drag.startY, drag.currentY);
  const width = Math.max(drag.startX, drag.currentX) - left;
  const height = Math.max(drag.startY, drag.currentY) - top;
  return {
    left,
    top,
    width,
    height
  };
};

interface FlowState {
  isTranslating: boolean;
  languageCode: string;
  // Data from TembaStore
  ghostNode: RenderNode;
  debug: DebugState;
  popped: string;
  dragActive: boolean;
  definition: FlowDefinition;
  nodes: { [uuid: string]: RenderNode };
  metadata: FlowMetadata;
  nodeEditorSettings: NodeEditorSettings;
}

export class Flow extends React.PureComponent<{}, FlowState> {
  private Plumber: Plumber;
  private nodeContainerUUID: string;

  // Refs
  private ghost: any;

  public static contextTypes = {
    config: fakePropType
  };

  private unsubscribe: () => void;

  constructor(props: {}, context: ConfigProviderContext) {
    super(props, context);

    this.nodeContainerUUID = createUUID();
    this.Plumber = new Plumber();

    /* istanbul ignore next */
    if (context.config.debug) {
      window.fe = new Debug({}, null);
    }

    this.unsubscribe = store.getApp().subscribe((state: TembaAppState) => {
      this.mapState(state);
    });

    this.mapState(store.getState());

    bindCallbacks(this, {
      include: [/Ref$/, /^on/, /^is/, /^get/, /^handle/]
    });

    timeStart('Loaded Flow');
  }

  public mapState(state: TembaAppState): void {
    const changes = {
      isTranslating: state.isTranslating,
      languageCode: state.languageCode,
      ghostNode: state.editorState ? state.editorState.ghostNode : null,
      debug: state.editorState ? state.editorState.debug : null,
      popped: state.editorState ? state.editorState.popped : null,
      dragActive: state.editorState ? state.editorState.dragActive : false,
      definition: state.flowDefinition,
      nodes: state.flowNodes,
      metadata: state.flowMetadata,
      nodeEditorSettings: state.nodeEditorSettings
    };

    if (this.state) {
      this.setState(changes);
    } else {
      // eslint-disable-next-line
      this.state = changes;
    }
  }

  private ghostRef(ref: any): any {
    return (this.ghost = ref);
  }

  public isMobile() {
    const win = window as any;
    return win.isMobile && win.isMobile();
  }

  public componentDidMount(): void {
    this.Plumber.bind('connection', (event: ConnectionEvent) =>
      // TODO: Convert updateConnection thunk to TembaStore
      this.handleUpdateConnection(event.sourceId, event.targetId)
    );
    this.Plumber.bind('beforeDrag', (event: ConnectionEvent) => {
      this.beforeConnectionDrag(event);
    });

    this.Plumber.bind('connectionDrag', (event: ConnectionEvent) => {
      // TODO: Convert onConnectionDrag thunk to TembaStore
      this.handleConnectionDrag(event, this.context.config.flowType);
    });

    this.Plumber.bind('connectionDragStop', (event: ConnectionEvent) =>
      this.onConnectorDrop(event)
    );
    this.Plumber.bind(
      'beforeStartDetach',
      (event: ConnectionEvent) => !this.state.isTranslating && this.context.config.mutable
    );
    this.Plumber.bind('beforeDetach', (event: ConnectionEvent) => true);
    this.Plumber.bind('beforeDrop', (event: ConnectionEvent) => this.onBeforeConnectorDrop(event));
    this.Plumber.triggerLoaded(this.context.config.onLoad);

    timeEnd('Loaded Flow');
  }

  public componentWillUnmount(): void {
    this.unsubscribe();
    this.Plumber.reset();
    if ((window as any).activityTimeout) {
      clearTimeout((window as any).activityTimeout);
    }
  }

  private handleUpdateConnection(sourceId: string, targetId: string): void {
    // TODO: Convert updateConnection thunk to TembaStore
    // This would update the flow definition with new connections
  }
  
  private handleConnectionDrag(event: ConnectionEvent, flowType: any): void {
    // TODO: Convert onConnectionDrag thunk to TembaStore
    // This handles connection drag events
  }

  /**
   * Called right before a connector is dropped onto a new node
   */
  private onBeforeConnectorDrop(event: ConnectionEvent): boolean {
    // Reset node editor settings via TembaStore
    store.getState().updateNodeEditorSettings(null);
    const fromNodeUUID = event.sourceId.split(':')[0];
    try {
      detectLoops(this.state?.nodes || {}, fromNodeUUID, event.targetId);
    } catch {
      return false;
    }
    return true;
  }

  /**
   * Called the moment a connector is done dragging, whether it is dropped on an
   * existing node or on to empty space.
   */
  private onConnectorDrop(event: ConnectionEvent): boolean {
    const ghostNode = this.state?.ghostNode;
    // Don't show the node editor if we a dragging back to where we were
    if (isRealValue(ghostNode) && !isDraggingBack(event)) {
      // Wire up the drag from to our ghost node
      this.Plumber.recalculate(ghostNode.node.uuid);

      const dragPoint = getDraggedFrom(ghostNode);

      this.Plumber.connect(dragPoint.nodeUUID + ':' + dragPoint.exitUUID, ghostNode.node.uuid);

      // Save our position for later
      const { left, top } = (this.ghost &&
        snapToGrid(this.ghost.ele.offsetLeft, this.ghost.ele.offsetTop)) || { left: 0, top: 0 };

      // Update ghost node position via TembaStore
      const updatedGhostNode = { ...ghostNode };
      updatedGhostNode.ui.position = { left, top };
      
      const currentEditorState = store.getState().editorState;
      store.getState().updateEditorState({
        ...currentEditorState,
        ghostNode: updatedGhostNode
      });

      let originalAction = null;
      if (ghostNode.node.actions?.length === 1) {
        originalAction = ghostNode.node.actions[0];
      }

      // Bring up the node editor
      store.getState().updateNodeEditorSettings({
        originalNode: ghostNode,
        originalAction
      });
    }

    if (isDraggingBack(event)) {
      const currentEditorState = store.getState().editorState;
      store.getState().updateEditorState({
        ...currentEditorState,
        ghostNode: null
      });
    }

    /* istanbul ignore next */
    document.removeEventListener('mousemove', (window as any).ghostListener);

    return true;
  }

  private beforeConnectionDrag(event: ConnectionEvent): boolean {
    if (event.source) {
      event.source.dispatchEvent(new Event('disconnect'));
    }
    return !this.state.isTranslating;
  }

  private handleStickyCreation(props: CanvasDraggableProps) {
    const stickyMap = this.state?.definition?._ui.stickies || {};
    const uuid = props.uuid;
    return <Sticky key={uuid} uuid={uuid} sticky={stickyMap[uuid]} selected={props.selected} />;
  }

  private handleNodeCreation(props: CanvasDraggableProps) {
    const onlyNode = Object.keys(this.state?.nodes || {}).length === 1;
    return (
      <Node
        onlyNode={onlyNode}
        startingNode={props.idx === 0}
        selected={props.selected}
        key={props.uuid}
        data-spec={nodeSpecId}
        nodeUUID={props.uuid}
        plumberMakeTarget={this.Plumber.makeTarget}
        plumberRemove={this.Plumber.remove}
        plumberRecalculate={this.Plumber.recalculate}
        plumberMakeSource={this.Plumber.makeSource}
        plumberConnectExit={this.Plumber.connectExit}
        plumberUpdateClass={this.Plumber.updateClass}
      />
    );
  }

  private getNodes(): CanvasDraggableProps[] {
    return getOrderedNodes(this.state?.nodes || {}).map((renderNode: RenderNode, idx: number) => {
      return {
        uuid: renderNode.node.uuid,
        position: renderNode.ui.position,
        elementCreator: this.handleNodeCreation,
        config: renderNode,
        idx
      };
    });
  }

  private getStickies(): CanvasDraggableProps[] {
    const stickyMap = this.state?.definition?._ui.stickies || {};
    return Object.keys(stickyMap).map((uuid: string, idx: number) => {
      return {
        uuid,
        elementCreator: this.handleStickyCreation,
        position: stickyMap[uuid].position,
        idx
      };
    });
  }

  private getDragNode(): JSX.Element {
    return isRealValue(this.state?.ghostNode) ? (
      <div
        data-spec={ghostNodeSpecId}
        key={this.state.ghostNode.node.uuid}
        style={{ position: 'absolute', display: 'block', visibility: 'hidden' }}
      >
        <Node
          onlyNode={false}
          selected={false}
          startingNode={false}
          ref={this.ghostRef}
          ghost={true}
          nodeUUID={this.state.ghostNode.node.uuid}
          plumberMakeTarget={this.Plumber.makeTarget}
          plumberRemove={this.Plumber.remove}
          plumberRecalculate={this.Plumber.recalculate}
          plumberMakeSource={this.Plumber.makeSource}
          plumberConnectExit={this.Plumber.connectExit}
          plumberUpdateClass={this.Plumber.updateClass}
        />
      </div>
    ) : null;
  }

  private getSimulator(): JSX.Element {
    // TODO: Convert Simulator component to use TembaStore instead of Redux
    return null;
    /*
    return renderIf(this.context.config.endpoints && this.context.config.endpoints.simulateStart)(
      <Simulator
        key="simulator"
        popped={this.state?.popped}
        onToggled={(visible: boolean, tab: PopTabType) => {
          const currentEditorState = store.getState().editorState;
          store.getState().updateEditorState({
            ...currentEditorState,
            popped: visible ? tab : null
          });
        }}
      />
    );
    */
  }

  private getNodeEditor(): JSX.Element {
    return renderIf(this.state?.nodeEditorSettings !== null)(
      <NodeEditor
        key="node-editor"
        helpArticles={this.context.config.help}
        plumberConnectExit={this.Plumber.connectExit}
      />
    );
  }

  // TODO: this should be a callback from the canvas
  private handleDoubleClick(position: FlowPosition): void {
    // TODO: Convert updateSticky thunk to TembaStore
    // const { left, top } = position;
    // this.props.updateSticky(createUUID(), {
    //   position: snapToGrid(left - 90 + NODE_PADDING, top - 40),
    //   title: STICKY_TITLE,
    //   body: STICKY_BODY
    // });
  }

  private getEmptyFlow(): JSX.Element {
    return (
      <div key="create_node" className={styles.empty_flow}>
        <Trans i18nKey="empty_flow_message">
          <h1>Let's get started</h1>
          <div>
            We recommend starting your flow by sending a message. This message will be sent to
            anybody right after they join the flow. This is your chance to send a single message or
            ask them a question.
          </div>
        </Trans>

        <Button
          name={i18n.t('buttons.create_message', 'Create Message')}
          onClick={() => {
            const emptyNode = createEmptyNode(null, null, 1, this.context.config.flowType);
            store.getState().updateNodeEditorSettings({
              originalNode: emptyNode,
              originalAction: emptyNode.node.actions[0]
            });
          }}
        />
      </div>
    );
  }

  /* 
  public componentDidUpdate(prevProps: FlowStoreProps): void {
    traceUpdate(this, prevProps);
  }
  */

  public handleDragging(uuids: string[]): void {
    uuids.forEach((uuid: string) => {
      try {
        const ele = document.getElementById(uuid);
        const exits = ele.querySelectorAll('.jtk-connected');
        this.Plumber.revalidate([ele, ...exits]);
      } catch (error) {}
    });
  }

  public handleCanvasLoaded(): void {
    this.Plumber.setContainer('canvas');
  }

  public render(): JSX.Element {
    const nodes = this.getNodes();

    const draggables = this.getStickies().concat(nodes);

    return (
      <div>
        {nodes.length === 0 ? this.getEmptyFlow() : <>{this.getSimulator()}</>}
        {this.getNodeEditor()}

        <Canvas
          mutable={!this.isMobile() && this.context.config.mutable}
          draggingNew={!!this.state?.ghostNode && !this.state?.nodeEditorSettings}
          newDragElement={this.getDragNode()}
          onDragging={this.handleDragging}
          uuid={this.nodeContainerUUID}
          dragActive={this.state?.dragActive || false}
          mergeEditorState={null} // TODO: Convert Canvas to work without Redux
          onRemoveNodes={this.handleRemoveNodes}
          draggables={draggables}
          onDoubleClick={this.handleDoubleClick}
          onUpdatePositions={this.handleUpdatePositions}
          onLoaded={this.handleCanvasLoaded}
        ></Canvas>
        <div id="activity_recent_contacts"></div>
      </div>
    );
  }

  private handleRemoveNodes(uuids: string[]): void {
    store.getState().removeNodes(uuids);
  }

  private handleUpdatePositions(positions: CanvasPositions) {
    store.getState().updateCanvasPositions(positions);
  }
}

export default Flow;
