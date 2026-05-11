import { Component, Inject, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DIALOG_DATA, DialogRef, Dialog } from '@angular/cdk/dialog';
import { ShowService } from '../../services/show.service';
import { Show } from '../../models/show.model';
import { ShowModalComponent, ModalData, ModalResult } from '../show-modal/show-modal.component';
import { Subject, takeUntil } from 'rxjs';

export interface DayDetailData {
  date: string;
  shows: Show[];
}

@Component({
  selector: 'app-day-detail-dialog',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="day-detail">
      <div class="day-detail__header">
        <div class="day-detail__header-left">
          <h3 class="day-detail__title">{{ dayHeader }}</h3>
          <span class="day-detail__count">{{ data.shows.length }} show{{ data.shows.length > 1 ? 's' : '' }}</span>
        </div>
        <button (click)="openAddShow()" class="day-detail__add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Show
        </button>
      </div>

      <div class="day-detail__groups">
        @for (group of dayGroups; track group.period) {
          <div class="period-group">
            <div class="period-group__header">
              <span class="period-group__label">{{ group.label }}</span>
            </div>
            <div class="period-group__list">
              @for (show of group.shows; track show.id) {
                <div class="show-card" [class.show-card--paid]="show.pago">
                  <div class="show-card__status">
                    <span class="status-badge" [class.status-badge--paid]="show.pago" [class.status-badge--pending]="!show.pago">
                      {{ show.pago ? 'Pago' : 'Agendado' }}
                    </span>
                  </div>
                  <div class="show-card__header" (click)="openViewShow(show)" style="cursor: pointer;">
                    <h4 class="show-card__title">{{ show.contratanteNome }}</h4>
                  </div>
                  <div class="show-card__body" (click)="openViewShow(show)" style="cursor: pointer;">
                    <div class="show-card__info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>{{ show.localNome }}</span>
                    </div>
                    <div class="show-card__info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>{{ show.hora }} · {{ show.duracao }}</span>
                    </div>
                    <div class="show-card__info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      <span>{{ show.valorCobrado | currency:'BRL' }}</span>
                    </div>
                    @if (show.localEndereco) {
                      <div class="show-card__info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        <span>{{ show.localEndereco }}</span>
                      </div>
                    }
                    @if (show.contratanteTelefone) {
                      <div class="show-card__info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span>{{ show.contratanteTelefone }}</span>
                      </div>
                    }
                  </div>
                  @if (show.estilosSolicitados.length > 0) {
                    <div class="show-card__styles">
                      @for (estilo of show.estilosSolicitados; track estilo) {
                        <span class="tag">{{ estilo }}</span>
                      }
                    </div>
                  }
                  <div class="show-card__actions">
                    <button class="action-btn action-btn--toggle" [class.action-btn--paid]="show.pago" (click)="togglePago(show.id)" title="Marcar como {{ show.pago ? 'pendente' : 'pago' }}">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="action-btn action-btn--edit" (click)="openViewShow(show)" title="Editar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-btn--delete" (click)="deleteShow(show.id)" title="Excluir">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .day-detail {
      background: #0f1236;
      border-radius: 16px;
      padding: 24px;
      min-width: 340px;
      max-width: 520px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .day-detail__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .day-detail__header-left { display: flex; flex-direction: column; gap: 4px; }
    .day-detail__title { font-size: 1rem; font-weight: 600; color: #e2e8f0; margin: 0; text-transform: capitalize; }
    .day-detail__count { font-size: 0.8rem; color: rgba(255,255,255,0.45); }
    .day-detail__add-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
      border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
      background: rgba(255,255,255,0.06); color: #94a3b8;
      cursor: pointer; font-size: 0.85rem; white-space: nowrap;
    }
    .day-detail__add-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
    .period-group { margin-bottom: 16px; }
    .period-group__header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px; font-size: 0.8rem; font-weight: 600;
      color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;
    }
    .show-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; padding: 14px 16px; margin-bottom: 8px;
    }
    .show-card--paid { border-color: rgba(74,222,128,0.15); }
    .show-card__status { margin-bottom: 8px; }
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 600;
    }
    .status-badge--paid { background: rgba(74,222,128,0.15); color: #4ade80; }
    .status-badge--pending { background: rgba(74,222,128,0.15); color: #4ade80; }
    .show-card__title { font-size: 0.95rem; font-weight: 600; color: #e2e8f0; margin: 0 0 8px; }
    .show-card__info { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
    .show-card__info svg { flex-shrink: 0; opacity: 0.5; }
    .show-card__styles { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .tag {
      display: inline-block; padding: 2px 8px; border-radius: 6px;
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
      font-size: 0.7rem; font-weight: 500;
    }
    .show-card__actions { display: flex; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); }
    .action-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45);
      cursor: pointer; transition: 0.15s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
    .action-btn--paid { color: #4ade80; }
  `],
})
export class DayDetailDialogComponent implements OnDestroy {
  dayGroups: { period: string; label: string; shows: Show[] }[] = [];
  private destroy$ = new Subject<void>();

  private readonly weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  private readonly periods = [
    { key: 'manha', label: 'Manhã', min: 6, max: 11 },
    { key: 'tarde', label: 'Tarde', min: 12, max: 17 },
    { key: 'noite', label: 'Noite', min: 18, max: 23 },
  ];

  get dayHeader(): string {
    const d = new Date(this.data.date + 'T12:00:00');
    const dayName = this.weekDays[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${dayName} - ${day}/${month}/${year}`;
  }

  constructor(
    @Inject(DIALOG_DATA) public data: DayDetailData,
    private dialogRef: DialogRef<{ updated?: boolean; deleted?: boolean }>,
    private dialog: Dialog,
    private showService: ShowService,
  ) {
    this.buildGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildGroups(): void {
    const groups = this.periods.map(p => ({ period: p.key, label: p.label, shows: [] as Show[] }));
    for (const show of this.data.shows) {
      const h = parseInt(show.hora.split(':')[0], 10);
      const period = (!isNaN(h) && h >= 6 && h <= 11) ? 'manha'
        : (!isNaN(h) && h >= 12 && h <= 17) ? 'tarde' : 'noite';
      const group = groups.find(g => g.period === period);
      if (group) group.shows.push(show);
    }
    this.dayGroups = groups.filter(g => g.shows.length > 0);
  }

  openAddShow(): void {
    const ref = this.dialog.open<ModalResult>(ShowModalComponent, {
      data: { mode: 'add', date: this.data.date } as ModalData,
    });
    ref.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result?.created) {
        this.dialogRef.close({ updated: true });
      }
    });
  }

  openViewShow(show: Show): void {
    const ref = this.dialog.open<ModalResult>(ShowModalComponent, {
      data: { mode: 'view', show } as ModalData,
    });
    ref.closed.pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result?.updated || result?.deleted) {
        this.dialogRef.close({ updated: true });
      }
    });
  }

  togglePago(id: number): void {
    this.showService.togglePago(id).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogRef.close({ updated: true });
    });
  }

  deleteShow(id: number): void {
    if (confirm('Tem certeza que deseja excluir este show?')) {
      this.showService.delete(id).pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.dialogRef.close({ deleted: true });
      });
    }
  }
}
