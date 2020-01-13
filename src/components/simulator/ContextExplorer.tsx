import * as React from 'react';
import styles from './ContextExplorer.module.scss';
import { react as bindCallbacks } from 'auto-bind';

interface ContextExplorerProps {
  visible: boolean;
  onClose: () => void;
}

interface ContextExplorerState {}

export default class ContextExplorer extends React.Component<
  ContextExplorerProps,
  ContextExplorerState
> {
  constructor(props: ContextExplorerProps) {
    super(props);
    this.state = {};

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleHide(): void {
    this.props.onClose();
  }

  public render(): JSX.Element {
    return (
      <div className={styles.context_explorer + ' ' + (this.props.visible ? styles.visible : '')}>
        <div className={'fe-x ' + styles.close_button} onClick={this.handleHide} />
      </div>
    );
  }
}
