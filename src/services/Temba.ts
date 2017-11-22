import axios from 'axios';
import { AxiosResponse } from 'axios';
import { FlowDefinition } from '../flowTypes';

export interface FlowDetails {
    uuid: string;
    name: string;
    type: string;
}

/**
 * RapidPro API Accessor. Depends on goflow legacy migration.
 */
export default class Temba {
    private site: string;
    private token: string;

    constructor(site: string, token: string) {
        this.site = site;
        this.token = token;
    }

    /**
     * Gets a list of flows for the account
     */
    public getFlows(): Promise<FlowDetails[]> {
        const url = `/${this.site}/flows.json`;
        const headers = {
            Authorization: `Token ${this.token}`
        };

        return new Promise<FlowDetails[]>((resolve, reject) =>
            axios
                .get(url, { headers })
                .then((response: AxiosResponse) => resolve(response.data.results as FlowDetails[]))
        );
    }

    /**
     * Gets the given flow and it's dependencies and runs them through the goflow migration.
     * @param uuid the uuid to fetch
     * @param ignoreDependencies to fetch only the flow requested
     */
    public fetchLegacyFlows(
        uuid: string,
        ignoreDependencies: boolean = false
    ): Promise<FlowDefinition[]> {
        const url = `/${this.site}/definitions.json?flow=${uuid}`;
        const headers = {
            Authorization: `Token ${this.token}`
        };

        return new Promise<FlowDefinition[]>((resolve, reject) => {
            axios.get(url, { headers }).then((response: AxiosResponse) => {
                const json = response.data;
                if (json.version >= 10) {
                    let toMigrate: FlowDefinition[] = [];
                    const { data: { flows } } = response;

                    if (ignoreDependencies) {
                        flows.forEach((flowDef: any) => {
                            const { metadata: { uuid: defUUID } } = flowDef;
                            if (defUUID === uuid) {
                                toMigrate.push(flowDef);
                            }
                        });
                    } else {
                        toMigrate = flows as FlowDefinition[];
                    }

                    // console.log(toMigrate);
                    axios
                        .post('/migrate', { flows: toMigrate })
                        .then((response: AxiosResponse) =>
                            resolve(response.data as FlowDefinition[])
                        );
                }
            });
        });
    }
}
