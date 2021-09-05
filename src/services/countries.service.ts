import {createUUID} from "../utils/watchdog.utils";
import {CountryInfo} from "../models/country.info";

export class CountriesService {
    readonly routePrefix: string = 'countriesInfo';
    readonly sessionName: string = 'watchDogSessionId';
    private apiKey: string;
    private endPoint: string;
    private countryInfoEndpoint: string = 'https://ipinfo.io/';

    constructor() {
        if(!sessionStorage.getItem(this.sessionName)) {
            sessionStorage.setItem(this.sessionName, createUUID());
        }
    }

    setApiKeyWithEndpoint(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endPoint = endpoint;
    }

    subscribeOnWindowLoad() {
        const country = this.getCounty();
        const sessionId = sessionStorage.getItem(this.sessionName);
        const apiKey = this.apiKey;
        const endPoint = this.endPoint;
        const routePrefix = this.routePrefix;

        window.onload = function() {
            const countryInfo: CountryInfo = {
                sessionId,
                apiKey,
                country
            }

            console.log('window loaded');

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${endPoint}/${routePrefix}`);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(countryInfo));
        }
    }

    getCounty(): string {
        let country: string;

        fetch("https://ipinfo.io/json?token=ad78e7c286c74c").then((response) =>
            response.json()
        ).then((jsonResponse) => {
                country = jsonResponse.country;
                console.log(`country in service: ${country}`);
            }
        )

        return country;
    }
}
