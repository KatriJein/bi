import {
  Component,
  ComponentRef,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { DashboardStateService } from '../../services/dashboards-state.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  combineLatest,
  filter,
  map,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { DashboardDto } from '../../core/store/dashboards';
import { WidgetComponent } from '../../components/widget';
import {
  GridStack,
  GridStackOptions,
  GridStackNode,
  GridItemHTMLElement,
} from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { Widget, WidgetType } from '../../core/api/graphql/types';
import { debounceTime, take } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { EditWidgetModalComponent } from '../../components/widget/edit-widget/edit-widget.component';
import { CreateWidgetModalComponent } from '../../components/widget/create-widget/create-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('gridStackContainer', { static: true })
  gridStackContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('widgetHost', { read: ViewContainerRef, static: true })
  widgetHost!: ViewContainerRef;

  private stateService = inject(DashboardStateService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);

  activeInterface$ = this.stateService.activeInterface$;
  dashboards$ = this.stateService.dashboards$;
  widgets$ = this.stateService.widgets$;

  activeDashboardId$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => !!id),
    tap((id) => this.stateService.setActiveDashboard(id))
  );

  activeDashboard$ = this.stateService.activeDashboard$;

  private grid?: GridStack;
  private widgetsSub?: Subscription;
  widgetComponentRefs: Map<string, ComponentRef<WidgetComponent>> = new Map();

  private updatePositions$ = new Subject<GridStackNode[]>();
  private updatePositionsSub?: Subscription;
  private isUpdatingWidgets = false;

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      const options: GridStackOptions = {
        column: 20,
        cellHeight: 60,
        minRow: 10,
        float: true,
        resizable: {
          handles: '',
        },
        draggable: {
          handle: '.grid-stack-item-content',
        },
        margin: 5,

        staticGrid: false,
      };
      this.grid = GridStack.init(
        options,
        this.gridStackContainer.nativeElement
      );

      this.grid.on('change', (event, items: GridStackNode[]) => {
        if (this.isUpdatingWidgets) return;

        this.ngZone.run(() => {
          this.updatePositions$.next(items);
        });
      });
    });

    this.updatePositionsSub = this.updatePositions$.subscribe((items) => {
      this.stateService.activeDashboard$
        .pipe(take(1))
        .subscribe((dashboard) => {
          const dashboardId = dashboard?.id;
          if (!dashboardId) return;

          this.widgets$.pipe(take(1)).subscribe((widgets) => {
            const widgetMap = new Map(widgets.map((w) => [w.id, w]));

            items.forEach((item) => {
              if (!item.id) return;

              const widget = widgetMap.get(item.id.toString());
              if (!widget) return;

              const pos = widget.position ?? {
                x: 0,
                y: 0,
                width: 1,
                height: 1,
              };

              if (
                pos.x !== item.x ||
                pos.y !== item.y ||
                pos.width !== item.w ||
                pos.height !== item.h
              ) {
                this.stateService
                  .updateWidget(item.id.toString(), {
                    dashboardId,
                    position: {
                      x: item.x ?? 0,
                      y: item.y ?? 0,
                      width: item.w ?? 1,
                      height: item.h ?? 1,
                    },
                  })
                  .subscribe({
                    error: (err) =>
                      console.error('Error updating widget position', err),
                  });
              }
            });
          });
        });
    });

    this.widgetsSub = this.widgets$.subscribe((widgets) => {
      if (!this.grid) return;

      this.isUpdatingWidgets = true;

      const existingIds = new Set(
        this.grid.engine.nodes?.map((n) => n.id?.toString()) ?? []
      );
      const incomingIds = new Set(widgets.map((w) => w.id));

      const widgetsToAdd = widgets.filter((w) => !existingIds.has(w.id));

      const widgetsToUpdate = widgets.filter((w) => existingIds.has(w.id));
      const widgetsToRemove = [...existingIds].filter(
        (id) => !incomingIds.has(id as string)
      );

      widgetsToRemove.forEach((id) => {
        const el = this.grid!.el.querySelector(
          `.grid-stack-item[gs-id="${id}"]`
        );
        if (el) {
          this.grid?.removeWidget(el as GridItemHTMLElement);
        }
        const compRef = this.widgetComponentRefs.get(id as string);
        if (compRef) {
          compRef.destroy();
          this.widgetComponentRefs.delete(id as string);
        }
      });

      widgetsToUpdate.forEach((widget) => {
        const el = this.grid!.el.querySelector(
          `.grid-stack-item[gs-id="${widget.id}"]`
        );
        if (el) {
          this.grid!.update(el as GridItemHTMLElement, {
            x: widget.position?.x ?? 0,
            y: widget.position?.y ?? 0,
            w: widget.position?.width ?? 1,
            h: widget.position?.height ?? 1,
          });
        }
        const compRef = this.widgetComponentRefs.get(widget.id);
        if (compRef) {
          compRef.instance.widget = widget;
          compRef.changeDetectorRef.detectChanges();
        }
      });

      widgetsToAdd.forEach((widget) => {
        this.createWidget(widget);
      });

      this.isUpdatingWidgets = false;
    });

    this.activeDashboardId$.subscribe(() => {
      if (!this.grid) return;

      this.grid.removeAll(false);

      this.widgetComponentRefs.forEach((compRef) => compRef.destroy());
      this.widgetComponentRefs.clear();

      while (this.grid!.el.firstChild) {
        this.grid!.el.removeChild(this.grid!.el.firstChild);
      }
    });
  }

  private createWidget(widget: Widget) {
    const el = document.createElement('div');
    el.classList.add('grid-stack-item');
    el.setAttribute('gs-id', widget.id);
    el.setAttribute('gs-x', widget.position?.x?.toString() ?? '0');
    el.setAttribute('gs-y', widget.position?.y?.toString() ?? '0');
    el.setAttribute('gs-w', widget.position?.width?.toString() ?? '1');
    el.setAttribute('gs-h', widget.position?.height?.toString() ?? '1');

    const content = document.createElement('div');
    content.classList.add('grid-stack-item-content');
    el.appendChild(content);

    this.grid!.el.appendChild(el);
    this.grid!.makeWidget(el);

    const componentRef = this.widgetHost.createComponent(WidgetComponent);
    componentRef.instance.widget = widget;
    componentRef.instance.onEditWidget = (w) => this.openEditWidgetDialog(w);
    content.appendChild(componentRef.location.nativeElement);
    this.widgetComponentRefs.set(widget.id, componentRef);
  }

  ngOnDestroy() {
    this.widgetsSub?.unsubscribe();
    this.updatePositionsSub?.unsubscribe();
    if (this.grid) {
      this.grid.destroy();
    }
  }

  openEditWidgetDialog(widget: Widget) {
    this.dialog.open(EditWidgetModalComponent, {
      data: widget,
      width: '600px',
    });
  }

  openWidgetDialog(type: WidgetType) {
    this.dialog
      .open(CreateWidgetModalComponent, {
        data: { type },
      })
      .afterClosed()
      .pipe(
        filter(
          (result): result is { name: string; chartId?: string } =>
            !!result?.name
        ),
        switchMap((formValue) =>
          combineLatest([
            this.stateService.activeDashboard$.pipe(
              filter((dashboard): dashboard is DashboardDto => !!dashboard?.id),
              take(1)
            ),
            this.widgets$.pipe(take(1)),
          ]).pipe(
            map(([dashboard, widgets]) => {
              const maxBottom = widgets.reduce((max, w) => {
                const bottom = (w.position.y ?? 0) + (w.position.height ?? 1);
                return Math.max(max, bottom);
              }, 0);

              const base = {
                dashboardId: dashboard.id,
                title: formValue.name,
                position: {
                  width: 8,
                  height: type === 'text' ? 1 : 6,
                  x: 0,
                  y: maxBottom,
                },
                type,
              };

              return type === 'chart' || type === 'table'
                ? { ...base, chartId: formValue.chartId }
                : base;
            }),
            switchMap((widgetData) =>
              this.stateService.createWidget(widgetData)
            )
          )
        )
      )
      .subscribe();
  }

  onRefreshWidgets() {
    this.activeDashboardId$.pipe(take(1)).subscribe((dashboardId) => {
      if (dashboardId) {
        this.stateService.loadWidgets(dashboardId);
      }
    });
  }

  constructor() {}
}
