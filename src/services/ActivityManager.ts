import Counter from '~/components/counter/Counter';
import { Exit } from '~/flowTypes';

// tslint:disable:ban-types
// how often we ask the server for new data
const REFRESH_SECONDS = 10;

/**
 * Contains all the activity data for a flow
 */
export interface Activity {
    // exit_uuid:destination_uuid -> count
    segments: { [key: string]: number };

    // node_uuid -> count
    nodes: { [key: string]: number };
}

export default class ActivityManager {
    private static singleton: ActivityManager;

    // our main activity fetch from the external
    private activity: Activity;

    // our simulation activity
    private simulation: Activity;

    private flowUUID: string;

    private getActivityExternal: Function;

    private listeners: { [key: string]: Counter } = {};
    private timer: any;

    constructor(flowUUID: string, getActivity: Function) {
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

    public clearSimulation(): void {
        this.simulation = null;
        this.notifyListeners();
        this.fetchActivity();
    }

    public setSimulation(activity: Activity): void {
        this.simulation = activity;
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        this.notifyListeners();
    }

    private fetchActivity(wait: number = 0): void {
        // if (!this.timer) {
        //     this.timer = window.setTimeout(() => {
        //         this.timer = null;
        //         this.getActivityExternal(this.flowUUID)
        //             .then((activity: Activity) => {
        //                 this.activity = activity;
        //                 this.notifyListeners();
        //             })
        //             .catch(() => {
        //                 // ignore missing activity
        //             });
        //         this.fetchActivity(REFRESH_SECONDS * 1000);
        //     }, wait);
        // }
    }

    public notifyListeners(): void {
        // tslint:disable-next-line:forin
        for (const counter in this.listeners) {
            this.listeners[counter].handleRequestUpdate();
        }
    }

    public deregister(key: string): void {
        delete this.listeners[key];
    }

    public registerListener(counter: Counter): void {
        // this is called from ref, which is null on unmounts
        if (counter) {
            this.listeners[counter.getKey()] = counter;
        }
    }

    public getActivity(): Activity {
        if (this.simulation) {
            return this.simulation;
        }
        return this.activity;
    }

    public getActiveCount(nodeUUID: string): number {
        const activity = this.getActivity();
        if (activity) {
            const count = activity.nodes[nodeUUID];
            if (count !== undefined) {
                return count;
            }
        }
        return 0;
    }

    public getPathCount(exit: Exit): number {
        const activity = this.getActivity();
        if (activity) {
            if (exit.destination_uuid) {
                const count = activity.segments[exit.uuid + ':' + exit.destination_uuid];
                if (count !== undefined) {
                    return count;
                }
            }
        }
        return 0;
    }
}
