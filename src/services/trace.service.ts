import { TraceBreadcrumb } from '../models/trace-breadcrumb';
import { BaseService } from './base.service';

export class TraceService extends BaseService {
    listenRouting() {
        console.log('Watchdog: Started listening redirects');
        const source = this.eventSource;

        var oldHref = document.location.href;
        window.onload = function () {
            const bodyList = document.querySelector("body");
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                    if (oldHref != document.location.href) {
                        const newRef = document.location.href;
                        source.next(new TraceBreadcrumb(oldHref, newRef));

                        oldHref = document.location.href;
                    }
                });
            });

            var config = {
                childList: true,
                subtree: true
            };

            observer.observe(bodyList, config);
        };
    }
}
