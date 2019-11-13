import * as React from 'react';

import styles from './DragHelper.module.scss';
import { Trans } from 'react-i18next';

interface DragHelperState {
  visible: boolean;
}

export default class DragHelper extends React.Component<{}, DragHelperState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      visible: false
    };
  }

  public componentDidMount(): void {
    window.setTimeout(() => {
      if (!this.state.visible) {
        this.setState({ visible: true });
      }
    }, 100);
  }

  public render(): JSX.Element {
    return (
      <div className={styles.drag_helper + ' ' + (this.state.visible ? styles.visible : '')}>
        <div className={styles.arrow}>
          <div className={styles.tail} />
          <div className={styles.head} />
        </div>
        <div className={styles.help_text}>
          <Trans i18nKey="drag_helper">
            To connect nodes, <span className={styles.bold}>drag</span> from the red circle.
          </Trans>
        </div>
      </div>
    );
  }
}
