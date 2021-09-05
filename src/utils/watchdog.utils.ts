import { HttpErrorResponse } from '../issue/http-error-response';
import { ErrorsService } from '../services/errors.service';
import { BreadcrumbAttribute, BreadcrumbHtmlElement } from '../models/breadcrumb-html-element';

const handleAttributes = (attributes: NamedNodeMap) => {
    if (attributes) {
        const result: BreadcrumbAttribute[] = [];
        for (let i = 0; i < attributes.length; i += 1) {
            const attribute = attributes[i];
            if (attribute.name !== 'class' && attribute.name !== 'id' && attribute.name[0] !== '_') {
                result.push({ name: attribute.name, value: attribute.value });
            }
        }
        return result;
    }
    return null;
};

const handleClassList = (classList: DOMTokenList) => {
    if (classList) {
        const result = classList.value.split(' ');
        if (result[0] === '') {
            return [];
        }
        return result;
    }
    return null;
};

export const toBreadcrumbHtmlElement = (element: HTMLElement) => ({
    localName: element.localName,
    attributes: handleAttributes(element.attributes),
    id: element.id === '' ? undefined : element.id,
    classList: handleClassList(element.classList)
} as BreadcrumbHtmlElement);

export const parseBodyData = (data: any) => {
    let newData: Object;
    try {
        newData = data ? JSON.parse(data.toString()) : data;
    } catch {
        newData = data;
    }
    return newData;
}

export const logHttpToErrorService = (request: XMLHttpRequest, errorService: ErrorsService) => {
    let error = new HttpErrorResponse();
    error.message = `Http failure response for ${request.responseURL}: ${request.status} ${request.statusText}`,
    error.url = request.responseURL,
    error.status = request.status,
    error.statusText = request.statusText,
    error.name = 'HttpErrorResponse';
    
    errorService.log(error);
}

export const createUUID = () => {
    var s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; 
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  
    s[8] = s[13] = s[18] = s[23] = '-';

    var uuid = s.join('');
    return uuid;
}   
