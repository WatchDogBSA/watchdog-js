import { ErrorsService } from './errors.service';
import { BaseService } from './base.service';
import { AjaxBreadcrumb } from '../models/ajax-breadcrumb';
import {parseBodyData, logHttpToErrorService, logResponseToResponseService} from '../utils/watchdog.utils';
import {ResponseService} from "./response.service";

export class HttpErrorService extends BaseService {
    constructor(private errorService: ErrorsService, private responseService: ResponseService) {
        super();
    }

    listenAjax(listenConnectionErrors: boolean, endpoint: string) {
        console.log('Watchdog: Started listening ajax');

        this.listenRequests();
        this.listenResponses(listenConnectionErrors, endpoint);
    }

    private listenRequests() {
        const oldOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            //adding properties to target in send method
            this['sendUrl'] = window.location.href;
            this['method'] = method;

            oldOpen.call(this, method, url);
        };
    }

    private listenResponses(listenConnectionErrors: boolean, endpoint: string) {
        const source = this.eventSource;
        const errorsService = this.errorService;
        const responseService = this.responseService;

        const oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (body?: Document | BodyInit) {
            let responseStart;
            let responseTotal;

            this.onloadstart = () => {
                responseStart = new Date().getTime();
            }

            this.onprogress = () => {
                responseTotal = new Date().getTime() - responseStart;
            }

            this.onloadend = (ev: ProgressEvent<EventTarget>) => {
                const current = ev.currentTarget as XMLHttpRequest;
                logResponseToResponseService(current, responseTotal, responseService);
            }

            this.onload = function (ev: ProgressEvent<EventTarget>) {
                const current = ev.currentTarget as XMLHttpRequest;
                const parsedBody = parseBodyData(body);
                const parsedResponse = parseBodyData(current.responseText);

                //remove breadcrumbs from sending issue to collector
                if (!current.responseURL.includes(endpoint)) {
                    source.next(new AjaxBreadcrumb(current.responseURL, current['method'], parsedBody, current.status, parsedResponse));
                }

                //checking error response status
                if (current.status >= 400 && !current.responseURL.includes(endpoint)) {
                    logHttpToErrorService(current, errorsService);
                }
            };

            //listen to CORS and connection errors
            if (listenConnectionErrors) {
                this.onerror = function (ev: ProgressEvent<EventTarget>) {
                    const current = ev.currentTarget as XMLHttpRequest;
                    logHttpToErrorService(current, errorsService);
                };
            }
            oldSend.call(this, body);
        };
    }
}
