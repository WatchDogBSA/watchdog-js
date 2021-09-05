import { AffectedUser } from '../issue/affected-user';
import { IssueMessage } from '../issue/issue-message';
import { StackFrame } from '../issue/stack-frame';
import { IssueEnvironment } from '../issue/issue-environment';
import { HttpResponseErrorMessage } from '../issue/http-response.message';
import * as stackTraceParser from 'stacktrace-parser';
import { BreadcrumbService } from './breadcrumb.service';
import { HttpErrorResponse } from '../issue/http-error-response';
import { createUUID } from '../utils/watchdog.utils';

export class ErrorsService {
    private readonly userIndetifier = 'UserIdentifier';
    private apiKey: string;
    private listenEndpoint: string;
    private endpoint: string;
    private userInfo: AffectedUser = {} as AffectedUser;
    private projectListeningState: boolean = false;

    constructor(
        private breadcrumbService: BreadcrumbService,
    ) {  }

    setApiKeyWithEndpoint(apiKey: string, endpoint: string, listenEndpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.listenEndpoint = listenEndpoint;

        this.checkListeningStatus(apiKey);
    }

    setUser(userOptions: AffectedUser) {
        this.userInfo = userOptions;

        if (this.userInfo.isAnonymous) {
            let localUser = localStorage.getItem(this.userIndetifier);
            if (!localUser) { 
                localUser = createUUID();
                localStorage.setItem(this.userIndetifier, localUser);
            }
            this.userInfo = { ...this.userInfo, identifier: localUser };
        }
    }

    log(error: any) {
        if (!this.projectListeningState) {
            this.breadcrumbService.clear();
            return;
        }

        const issueMessage = this.addContextInfo(error);

        if (error instanceof HttpErrorResponse
            && (error.url?.includes(this.endpoint)
                || error.url.includes(window.location.href))) {
            return;
        }

        this.sendIssueToCollector(issueMessage);
    }

    private sendIssueToCollector(issueMessage: IssueMessage) {
        this.sendToCollector(issueMessage);
    }

    private checkListeningStatus(apiKey: string) {
        const url = `${this.listenEndpoint}applications/listening/${apiKey}`;

        fetch(url, {method:'GET'}).then(r => r.text()).then(r => {
            this.projectListeningState = (r === 'true');
            if (!this.projectListeningState) {
                console.error(`Your api key is not valid! Please, check project api key!`);
            }
        });
    }

    private sendToCollector(issueMessage: IssueMessage) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.endpoint}issues/`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(issueMessage));
    }

    private addContextInfo(error: any): IssueMessage {
        return {
            occurredOn: new Date(new Date().toUTCString()),
            issueDetails: {
                url: window.location.href,
                errorMessage: error.message === '' ? 'Script error' : error.message,
                className: error.name,
                stackTrace: error instanceof Error ? this.getStackTrace(error) : null,
                responseErrorMessage: error instanceof HttpErrorResponse ? this.getResponseErrorMessage(error) : null,
                environmentMessage: this.getEnvironment(),
                breadcrumbs: this.breadcrumbService.getBreadcrumbsAndClear()
            },
            apiKey: this.apiKey,
            user: this.userInfo,
        };
    }

    private getStackTrace(error: Error): StackFrame[] {
        const parsedStackTrace = stackTraceParser.parse(error.stack);

        return parsedStackTrace.map(item => ({ ...item }));
    }

    private getResponseErrorMessage(error: HttpErrorResponse): HttpResponseErrorMessage {
        return {
            message: error.message,
            url: error.url,
            status: error.status,
            statusText: error.statusText
        };
    }

    private getEnvironment(): IssueEnvironment {
        return {
            browser: navigator.appCodeName,
            browserName: navigator.appName,
            browserVersion: navigator.appVersion,
            platform: navigator.platform
        };
    }
}
