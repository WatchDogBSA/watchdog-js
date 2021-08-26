import { ClickBreadcrumb } from '../models/click-breadcrumbs';
import { BaseService } from './base.service';

export class ClickService extends BaseService {
    listenClicks() {
        window.onclick = (e) => {
            const event = e as { path: HTMLElement[] };
            if (event.path?.some(el => (el.localName === 'button' || el.localName === 'a' || el.localName === 'input'))
                && event.path.every(el => !el.attributes?.getNamedItem('disabled'))) {
                this.eventSource.next(new ClickBreadcrumb(event.path));
            }
        };
    }
}
