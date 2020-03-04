import * as React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps {
  id?: string;
}

export class Portal extends React.Component<PortalProps> {
  private el: HTMLDivElement = null;
  private portalRoot: HTMLElement = null;

  constructor(props: PortalProps) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    window.setTimeout(() => {
      this.portalRoot = document.getElementById(this.props.id || 'portal-root');
      if (this.portalRoot) {
        this.portalRoot.appendChild(this.el);
      }
    }, 100);
  }

  componentWillUnmount() {
    if (this.portalRoot) {
      this.el.remove();
    }
  }

  componentDidUpdate(prevProps: PortalProps) {
    if (this.props.id && prevProps.id !== this.props.id) {
      window.setTimeout(() => {
        this.portalRoot = document.getElementById(this.props.id || 'portal-root');
        this.portalRoot.appendChild(this.el);
      }, 100);
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}
