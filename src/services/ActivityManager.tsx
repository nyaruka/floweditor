import { IExit } from '../flowTypes';
import { TGetActivity } from '../services/External';
import { CounterComp } from '../components/Counter';

// how often we ask the server for new data
const REFRESH_SECONDS = 10;

/**
 * Contains all the activity data for a flow
 */
export interface IActivity {
    // exit_uuid:destination_node_uuid -> count
    segments: { [key: string]: number };

    // node_uuid -> count
    nodes: { [key: string]: number };
}

class ActivityManager {
    private static singleton: ActivityManager;

    // our main activity fetch from the external
    private activity: IActivity;

    // our simulation activity
    private simulation: IActivity;

    private flowUUID: string;
    private getActivityExternal: TGetActivity;

    private listeners: { [key: string]: CounterComp } = {};
    private timer: any;

    constructor(flowUUID: string, getActivity: TGetActivity) {
        this.flowUUID = flowUUID;
        this.getActivityExternal = getActivity;

        this.clearSimulation = this.clearSimulation.bind(this);
        this.setSimulation = this.setSimulation.bind(this);
        this.fetchActivity = this.fetchActivity.bind(this);
        this.notifyListeners = this.notifyListeners.bind(this);
        this.deregister = this.deregister.bind(this);
        this.registerListener = this.registerListener.bind(this);
        this.getActivity = this.getActivity.bind(this);
        this.getActiveCount = this.getActiveCount.bind(this);
        this.getPathCount = this.getPathCount.bind(this);

        this.fetchActivity();
    }

    public clearSimulation() {
        this.simulation = null;
        this.notifyListeners();
        this.fetchActivity();
    }

    public setSimulation(activity: IActivity) {
        this.simulation = activity;
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.notifyListeners();
    }

    private fetchActivity(wait: number = 0) {
        if (!this.timer) {
            this.timer = window.setTimeout(() => {
                this.timer = null;
                this.getActivityExternal(this.flowUUID)
                    .then((activity: IActivity) => {
                        this.activity = activity;
                        this.notifyListeners();
                    })
                    .catch(() => {
                        // ignore missing activity
                    });

                this.fetchActivity(REFRESH_SECONDS * 1000);
            }, wait);
        }
    }

    public notifyListeners() {
        for (let counter in this.listeners) {
            this.listeners[counter].requestUpdate();
        }
    }

    public deregister(key: string) {
        delete this.listeners[key];
    }

    public registerListener(counter: CounterComp) {
        // this is called from ref, which is null on unmounts
        if (counter) {
            this.listeners[counter.getKey()] = counter;
        }
    }

    public getActivity(): IActivity {
        if (this.simulation) {
            return this.simulation;
        }
        return this.activity;
    }

    public getActiveCount(nodeUUID: string): number {
        var activity = this.getActivity();
        if (activity) {
            var count = activity.nodes[nodeUUID];
            if (count !== undefined) {
                return count;
            }
        }
        return 0;
    }

    public getPathCount(exit: IExit): number {
        var activity = this.getActivity();
        if (activity) {
            if (exit.destination_node_uuid) {
                var count = activity.segments[exit.uuid + ':' + exit.destination_node_uuid];
                if (count !== undefined) {
                    return count;
                }
            }
        }
        return 0;
    }
}

export default ActivityManager;
