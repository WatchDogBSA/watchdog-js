import { StackFrame } from './stack-frame';
import { HttpResponseErrorMessage } from './http-response.message';
import { IssueEnvironment } from './issue-environment';
import { BreadcrumbModel } from '../models/breadcrumb';

export interface IssueDetails {
    url: string,
    errorMessage: string,
    className: string,
    stackTrace?: StackFrame[],
    responseErrorMessage?: HttpResponseErrorMessage,
    environmentMessage: IssueEnvironment,
    breadcrumbs: BreadcrumbModel[],
}
