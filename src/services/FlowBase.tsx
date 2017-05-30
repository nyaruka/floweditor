import axios from 'axios';
import {AxiosResponse} from 'axios';
import {FlowDefinition} from '../interfaces';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
}

/**
 * RapidPro API Accessor. Depends on goflow legacy migration.
 */
export class FlowBase {
    
    private token: string;
    
    constructor(token: string) {
        this.token = token;
    }

    /**
     * Gets a list of flows for the account
     */
    public getFlows(): Promise<FlowDetails[]> {
        
        var url = "/api/v1/flows.json";
        var headers = {
            // Authorization: "Token " + this.token
        }

        return new Promise<FlowDetails[]>((resolve,reject) => {
            axios.get(url, {headers: headers}).then((response: AxiosResponse) => {
                resolve(response.data.results as FlowDetails[])
            });
        });
    }
}