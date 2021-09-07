import { AffectedUser } from "./issue/affected-user";
import { ErrorsService } from './services/errors.service';
import { HttpErrorService } from './services/http-error.service';
import { Breadcrumb } from './models/breadcrumb';
import { BaseService } from './services/base.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { ClickService } from './services/click.service';
import { ConsoleService } from './services/console.service';
import { TraceService } from './services/trace.service';
import {CountriesService} from "./services/countries.service";
import {CountryInfo} from "./models/country.info";
import {ResponseService} from "./services/response.service";

const traceService = new TraceService();
const consoleService = new ConsoleService();
const clickService = new ClickService();
const breadcrumbService = new BreadcrumbService();
const errorsService = new ErrorsService(breadcrumbService);
const responseService = new ResponseService();
const httpErrorService = new HttpErrorService(errorsService, responseService);
const countriesService = new CountriesService();

export const init = (
    apiKey: string,
    listenConnectionErrors: boolean = false,
    endpoint: string = 'https://bsa-watchdog.westeurope.cloudapp.azure.com/collector/',
    listenEndpoint: string = 'https://bsa-watchdog.westeurope.cloudapp.azure.com/api/'
) => {
    // countriesService.setApiKeyWithEndpoint(apiKey, endpoint);
    // countriesService.subscribeOnWindowLoad();

    fetch("https://ipinfo.io/json?token=ad78e7c286c74c").then((response) =>
        response.json()
    ).then((jsonResponse) => {
                const countryInfo: CountryInfo = {
                    sessionId: sessionStorage.getItem('watchDogSessionId'),
                    apiKey,
                    country: jsonResponse.country
                }

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${endpoint}analytics/countriesInfo`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(countryInfo));
            }
    )

    responseService.setApiKeyWithEndpoint(apiKey, endpoint);
    errorsService.setApiKeyWithEndpoint(apiKey, endpoint, listenEndpoint);
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

export const setUserInfo = (userOptions: AffectedUser) => {
    errorsService.setUser(userOptions);
}

