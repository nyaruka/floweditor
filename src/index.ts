/* istanbul ignore next */
import FlowEditor from '~/components';

declare global {
    interface Window {
        fe: any;
    }
}

/* istanbul ignore next */
export default FlowEditor;
