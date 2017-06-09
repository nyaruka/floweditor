import { Exit } from '../FlowDefinition';
import { External, Activity } from './External';
import { CounterComp } from "../components/Counter";

// how often we ask the server for new data
const REFRESH_SECONDS = 10;

export class ActivityManager {

    private static singleton: ActivityManager;
    private external: External;
    private activity: Activity;
    private listeners: { [key: string]: CounterComp } = {};

    private timer: any;

    static get(): ActivityManager {
        return ActivityManager.singleton;
    }

    static initialize(external: External) {
        this.singleton = new ActivityManager(external);
    }

    constructor(external: External) {
        this.external = external;
        this.fetchActivity();
        this.registerListener = this.registerListener.bind(this);
    }

    private fetchActivity(wait: number = 0) {
        if (!this.timer) {
            this.timer = window.setTimeout(() => {
                this.timer = null;
                this.external.getActivity().then((activity: Activity) => {
                    this.activity = activity;
                    this.notifyListeners();
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

    public getActiveCount(nodeUUID: string): number {
        if (this.activity) {
            var count = this.activity.active[nodeUUID];
            if (count !== undefined) {
                return count;
            }
        }
        return 0;
    }

    public getPathCount(exit: Exit): number {
        if (this.activity) {
            if (exit.destination_node_uuid) {
                var count = this.activity.paths[exit.uuid + ":" + exit.destination_node_uuid];
                if (count !== undefined) {
                    return count;
                }
            }
        }
        return 0;
    }
}
