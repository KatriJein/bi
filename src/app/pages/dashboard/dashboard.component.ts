import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
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
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { startWith, take } from 'rxjs/operators';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  GridStack,
  GridStackOptions,
  GridStackNode,
  GridItemHTMLElement,
} from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import {
  DashboardFilter,
  DateGranularity,
  Widget,
  WidgetType,
} from '../../core/api/graphql/types';
import {
  ChartContainerComponent,
  OnMainButtonComponent,
  SmartIconComponent,
} from '../../components/common';
import { DashboardDto } from '../../core/store/dashboards';
import {
  CreateWidgetModalComponent,
  EditWidgetModalComponent,
  WidgetComponent,
} from '../../components/widget';
import {
  DashboadMenuItemComponent,
  DashboardSelectionModalComponent,
} from '../../components/dashboard';
import { SelectionTypeDashboard } from '../../core/store/charts';
import { formatFilterValue, formatSingle } from '../../utils';
import { SelectionColumnType } from '../../constants';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';

export type FilterTypeExp = {
  field: string;
  operator?: string;
  value: any;
  dateGranularity?: DateGranularity;
};

export type FilterEmitType = {
  chartId: string;
  filters: FilterTypeExp[];
};

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
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule,
    DashboadMenuItemComponent,
    OnMainButtonComponent,
    ChartContainerComponent,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnDestroy, AfterViewInit, OnInit {
  private titleService = inject(Title);

  @ViewChild('gridStackContainer', { static: true })
  gridStackContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('widgetHost', { read: ViewContainerRef, static: true })
  widgetHost!: ViewContainerRef;

  sidenavWidth = 300;
  private isResizing = false;
  private minWidth = 300;
  private maxWidth = 500;

  isSidebarCollapsed = false;
  collapsedWidth = 64;

  private stateService = inject(DashboardStateService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private ngZone = inject(NgZone);

  isDetailMode = signal(false);
  expandedChartId: string | null = null;
  expandedChartName: string | null = null;
  expandedChartFilter: FilterTypeExp[] | null = null;
  isEditMode = signal(false);
  showFilters = false;

  filters$ = this.stateService.filters$.pipe(startWith([]));
  activeInterface$ = this.stateService.activeInterface$;
  dashboards$ = this.stateService.dashboards$;
  widgets$ = this.stateService.widgets$.pipe(startWith([]));
  activeDashboard$ = this.stateService.activeDashboard$;
  multipleFilters$ = this.stateService.multipleFilters$;
  activeMultipleSelections$ = this.stateService.activeMultipleSelections$;

  activeDashboardId$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => !!id),
    tap((id) => this.stateService.setActiveDashboard(id))
  );

  private grid: GridStack | undefined;
  private widgetsSub?: Subscription;
  widgetComponentRefs: Map<string, ComponentRef<WidgetComponent>> = new Map();

  private updatePositions$ = new Subject<GridStackNode[]>();
  private updatePositionsSub?: Subscription;
  private isUpdatingWidgets = false;

  formatFilterValue = formatFilterValue;
  formatOption = (
    option: any,
    fieldType: string,
    dateGranularity?: DateGranularity
  ) => formatSingle(option, fieldType as SelectionColumnType, dateGranularity);

  ngAfterViewInit() {}

  ngOnInit() {
    this.titleService.setTitle('Дашборды');
    this.initGridStack();
    this.setupPositionUpdates();
    this.setupWidgetsSubscription();
    this.setupDashboardChanges();
  }

  ngOnDestroy() {
    this.cleanupSubscriptions();
    this.destroyGridStack();
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = Math.min(
      this.maxWidth,
      Math.max(this.minWidth, event.clientX)
    );
    setTimeout(() => {
      this.sidenavWidth = newWidth;
    });
  }

  @HostListener('document:mouseup')
  stopResize() {
    this.isResizing = false;
  }

  private cleanupSubscriptions() {
    this.widgetsSub?.unsubscribe();
    this.updatePositionsSub?.unsubscribe();
  }

  private destroyGridStack(removeElements = true) {
    if (this.grid) {
      this.grid.off('change');
      this.grid.destroy(removeElements);
      this.grid = undefined;
    }
  }

  private initGridStack() {
    if (!this.gridStackContainer?.nativeElement) {
      console.warn('GridStack container not available');
      return;
    }

    const currentNodes = this.grid?.engine.nodes || [];
    const currentPositions = currentNodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
    }));

    this.destroyGridStack(false);

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
        staticGrid: !this.isEditMode(),
        disableDrag: !this.isEditMode(),
        disableResize: !this.isEditMode(),
      };

      this.grid = GridStack.init(
        options,
        this.gridStackContainer.nativeElement
      );

      this.restoreGridPositions(currentPositions);
      this.setupGridChangeHandler();
    });
  }

  private restoreGridPositions(
    positions: Array<{
      id: string | number | undefined;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }>
  ) {
    if (positions.length > 0) {
      positions.forEach((pos) => {
        const el = this.gridStackContainer.nativeElement.querySelector(
          `[gs-id="${pos.id}"]`
        );
        if (el) {
          this.grid?.update(el as GridItemHTMLElement, {
            x: pos.x,
            y: pos.y,
            w: pos.width,
            h: pos.height,
          });
        }
      });
    }
  }

  private setupGridChangeHandler() {
    this.grid?.on('change', (event, items: GridStackNode[]) => {
      if (this.isUpdatingWidgets) return;
      this.ngZone.run(() => this.updatePositions$.next(items));
    });
  }

  private setupPositionUpdates() {
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
                this.stateService.updateWidget(item.id.toString(), {
                  dashboardId,
                  position: {
                    x: item.x ?? 0,
                    y: item.y ?? 0,
                    width: item.w ?? 1,
                    height: item.h ?? 1,
                  },
                });
              }
            });
          });
        });
    });
  }

  private setupWidgetsSubscription() {
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
  }

  private setupDashboardChanges() {
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
    const existingEl = this.grid!.el.querySelector(
      `.grid-stack-item[gs-id="${widget.id}"]`
    );
    if (existingEl) {
      return;
    }

    const el = document.createElement('div');
    el.classList.add('grid-stack-item');

    el.classList.toggle('grid-stack-edit-mode', this.isEditMode());
    el.classList.toggle('grid-stack-static', !this.isEditMode());

    el.setAttribute('gs-id', widget.id);
    el.setAttribute('gs-x', widget.position?.x?.toString() ?? '0');
    el.setAttribute('gs-y', widget.position?.y?.toString() ?? '0');
    el.setAttribute('gs-w', widget.position?.width?.toString() ?? '1');
    el.setAttribute('gs-h', widget.position?.height?.toString() ?? '1');
    el.setAttribute('gs-no-move', (!this.isEditMode).toString());
    el.setAttribute('gs-no-resize', (!this.isEditMode).toString());

    const content = document.createElement('div');
    content.classList.add('grid-stack-item-content');
    el.appendChild(content);

    this.grid!.el.appendChild(el);
    this.grid!.makeWidget(el);

    const componentRef = this.widgetHost.createComponent(WidgetComponent);
    componentRef.instance.widget = widget;
    componentRef.instance.isEditMode = this.isEditMode();
    componentRef.instance.onEditWidget = (w) => this.openEditWidgetDialog(w.id);
    componentRef.instance.onChartExpClick = (event) =>
      this.handleChartExpanded(event);
    content.appendChild(componentRef.location.nativeElement);
    this.widgetComponentRefs.set(widget.id, componentRef);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidenavWidth = this.isSidebarCollapsed ? this.collapsedWidth : 300;
  }

  toggleEditMode(): void {
    this.isEditMode.update((mode) => !mode);

    this.widgetComponentRefs.forEach((compRef) => {
      compRef.instance.isEditMode = this.isEditMode();
      compRef.changeDetectorRef.detectChanges();
    });

    this.initGridStack();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  openAddFilterDialog(): void {
    const dialogRef = this.dialog.open(DashboardSelectionModalComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: SelectionTypeDashboard) => {
      if (result) {
        this.stateService.addFilter(result);
      }
    });
  }

  onFilterClick(filter: DashboardFilter): void {
    const dialogRef = this.dialog.open(DashboardSelectionModalComponent, {
      width: '600px',
      data: {
        filter: filter,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: SelectionTypeDashboard | undefined) => {
        if (result) {
          this.stateService.updateFilter(filter.id, result);
        }
      });
  }

  onMultipleSelectionClick(filterId: string, value: any) {
    this.stateService.onMultipleSelectionClick(filterId, value);
  }

  onClearMultipleSelection(filterId: string) {
    this.stateService.onClearMultipleSelection(filterId);
  }

  removeFilter(filter: DashboardFilter): void {
    this.stateService.removeFilter(filter);
  }

  openExpandedChart(chartId: string, filters: FilterTypeExp[]): void {
    this.expandedChartId = chartId;
    this.expandedChartFilter = filters;
    this.expandedChartName = this.stateService.getTableName(chartId);
    this.isDetailMode.set(true);
  }

  backToWidgets(): void {
    this.isDetailMode.set(false);
  }

  handleChartExpanded(event: FilterEmitType): void {
    this.openExpandedChart(event.chartId, event.filters);
  }

  openEditWidgetDialog(widgetId: string) {
    this.dialog.open(EditWidgetModalComponent, {
      data: { widgetId },
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
        switchMap((formValue) => {
          const widgetType = formValue.chartId
            ? this.stateService.getWidgetType(formValue.chartId)
            : type;

          return combineLatest([
            this.stateService.activeDashboard$.pipe(
              filter((dashboard): dashboard is DashboardDto => !!dashboard?.id),
              take(1)
            ),
            this.widgets$.pipe(take(1)),
          ]).pipe(
            switchMap(([dashboard, widgets]) => {
              const maxBottom = widgets.reduce((max, w) => {
                const bottom = (w.position.y ?? 0) + (w.position.height ?? 1);
                return Math.max(max, bottom);
              }, 0);

              const widgetData: Omit<Widget, 'id'> = {
                dashboardId: dashboard.id as string,
                title: formValue.name,
                position: {
                  width: 8,
                  height: widgetType === 'text' ? 1 : 6,
                  x: 0,
                  y: maxBottom,
                },
                type: widgetType,
                ...(widgetType === 'chart' || widgetType === 'table'
                  ? { chartId: formValue.chartId }
                  : {}),
              };

              this.stateService.createWidget(widgetData);
              return of(null);
            })
          );
        })
      )
      .subscribe();
  }

  onRefreshWidgets() {
    this.stateService.refreshWidgets();
  }
}
