import { Breadcrumb, BreadcrumbModel } from '../models/breadcrumb';

export class BreadcrumbService {
    private static breadcrumbs = [] as Breadcrumb[];

    addBreadcrumb(item: Breadcrumb) {
        BreadcrumbService.breadcrumbs = BreadcrumbService.breadcrumbs.concat(item);
    }

    getBreadcrumbs(): BreadcrumbModel[] {
        return BreadcrumbService.breadcrumbs.map(b => b.toModel());
    }

    getBreadcrumbsAndClear(): BreadcrumbModel[] {
        const { breadcrumbs } = BreadcrumbService;
        BreadcrumbService.breadcrumbs = [];
        return breadcrumbs.map(b => b.toModel());
    }

    clear() {
        BreadcrumbService.breadcrumbs = [];
    }
}
