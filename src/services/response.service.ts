import {ResponseInfo} from "../models/response.info";

export class ResponseService {
    private apiKey: string;
    private endpoint: string;

    log(response: ResponseInfo) {
        if(response.url.includes('sockjs-node')) {
            return;
        }

        response.projectKey = this.apiKey;

        this.sendToCollector(response);
    }

    setApiKeyWithEndpoint(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
    }

    private sendToCollector(response: ResponseInfo) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.endpoint}responses/`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(response));
    }
}
