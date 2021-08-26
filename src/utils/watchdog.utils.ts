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
    errorService.log({
        message: `Http failure response for ${request.responseURL}: ${request.status} ${request.statusText}`,
        url: request['sendUrl'],
        status: request.status,
        statusText: request.statusText,
        name: 'HttpErrorResponse'
    } as HttpErrorResponse);
}
