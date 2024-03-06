/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

export class TembaComponent extends React.Component {
  eventCallbacks = {};
  componentRef = React.createRef();
  onEvent = eventType => {
    return event => {
      // we will get the latest callback when the event happens
      // eslint-disable-next-line react/prop-types
      this.props.eventHandlers[eventType](event);
    };
  };

  componentDidMount() {
    // eslint-disable-next-line react/prop-types
    const { eventHandlers } = this.props;
    Object.keys(eventHandlers || {}).forEach(eventType => {
      this.eventCallbacks[eventType] = this.onEvent(eventType);
      this.componentRef.current.addEventListener(eventType, this.eventCallbacks[eventType]);
    });
  }
  componentWillUnmount() {
    Object.keys(this.eventCallbacks).forEach(eventType => {
      this.componentRef.current.removeEventListener(eventType, this.eventCallbacks[eventType]);
    });
  }
  render() {
    // eslint-disable-next-line react/prop-types
    const { tag: Component, ...restProps } = this.props;
    return <Component {...restProps} ref={this.componentRef} />;
  }
}
