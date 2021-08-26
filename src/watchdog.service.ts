import { ErrorsService } from './services/errors.service';
import { HttpErrorService } from './services/http-error.service';
import { Breadcrumb } from './models/breadcrumb';
import { BaseService } from './services/base.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { ClickService } from './services/click.service';
import { ConsoleService } from './services/console.service';
import { TraceService } from './services/trace.service';

const traceService = new TraceService();
const consoleService = new ConsoleService();
const clickService = new ClickService();
const breadcrumbService = new BreadcrumbService();
const errorsService = new ErrorsService(breadcrumbService);
const httpErrorService = new HttpErrorService(errorsService);

export const init = (
    apiKey: string,
    listenConnectionErrors: boolean = false,
    endpoint: string = 'https://bsa-watchdog.westeurope.cloudapp.azure.com/collector/issues'
) => {
    errorsService.setApiKeyWithEndpoint(apiKey, endpoint);

    httpErrorService.listenAjax(listenConnectionErrors, endpoint);
    clickService.listenClicks();
    traceService.listenRouting();
    consoleService.listenConsole();

    const subscribeFunc: (breadcrumb: Breadcrumb) => void = breadcrumb => {
        breadcrumbService.addBreadcrumb(breadcrumb);
    };

    BaseService.event$.subscribe(subscribeFunc);
}

export const handleError = (error: any) => {
    errorsService.log(error);
}

export const enableErrorHandling = () => {
    console.log('Listening errors from app');
    window.addEventListener('error', function (err) {
        errorsService.log(err);
    });
}