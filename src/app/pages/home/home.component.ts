import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ShowService } from '../../services/show.service';
import { Show } from '../../models/show.model';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ShowModalComponent, ModalData, ModalResult } from '../../components/show-modal/show-modal.component';
import { Subject, takeUntil } from 'rxjs';

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  shows: Show[];
}

interface PeriodGroup {
  period: string;
  label: string;
  icon: string;
  shows: Show[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  shows: Show[] = [];
  stats: {
    total: number;
    pagos: number;
    pendentes: number;
    receita: number;
  } | null = null;

  monthStats: {
    receitaTotal: number;
    receitaRecebida: number;
    receitaPrevista: number;
  } | null = null;

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  selectedDate: string | null = null;
  calendarDays: CalendarDay[] = [];
  showsByDate: Map<string, Show[]> = new Map();
  selectedDayShows: Show[] = [];
  dayGroups: PeriodGroup[] = [];

  readonly monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  readonly weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  private readonly periods: { key: string; label: string; icon: string; min: number; max: number }[] = [
    { key: 'manha', label: 'Manhã', icon: '🌅', min: 6, max: 11 },
    { key: 'tarde', label: 'Tarde', icon: '☀️', min: 12, max: 17 },
    { key: 'noite', label: 'Noite', icon: '🌙', min: 18, max: 23 },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private showService: ShowService,
    private dialog: Dialog,
  ) {}

  ngOnInit(): void {
    this.load(this.currentMonth + 1, this.currentYear);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    this.load(this.currentMonth + 1, this.currentYear);
  }

  private load(mes?: number, ano?: number): void {
    this.showService
      .list(mes, ano)
      .pipe(takeUntil(this.destroy$))
      .subscribe(shows => {
        this.shows = shows.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const pagos = this.shows.filter(s => s.pago);
        this.stats = {
          total: this.shows.length,
          pagos: pagos.length,
          pendentes: this.shows.length - pagos.length,
          receita: pagos.reduce((acc, s) => acc + s.valorCobrado, 0),
        };
        this.buildShowsByDate();
        this.buildCalendar();
      });
  }

  private buildShowsByDate(): void {
    const map = new Map<string, Show[]>();
    for (const show of this.shows) {
      const key = show.data;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(show);
    }
    this.showsByDate = map;
  }

  buildCalendar(): void {
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const month = this.currentMonth - 1;
      const year = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      const m = month < 0 ? 11 : month;
      const y = month < 0 ? this.currentYear - 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        month: m,
        year: y,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        shows: this.showsByDate.get(dateStr) || [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        month: this.currentMonth,
        year: this.currentYear,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        shows: this.showsByDate.get(dateStr) || [],
      });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const month = this.currentMonth + 1;
        const year = month > 11 ? this.currentYear + 1 : this.currentYear;
        const m = month > 11 ? 0 : month;
        const y = month > 11 ? this.currentYear + 1 : this.currentYear;
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        days.push({
          day,
          month: m,
          year: y,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          shows: this.showsByDate.get(dateStr) || [],
        });
      }
    }

    this.calendarDays = days;
    this.calcMonthStats();

    if (!this.selectedDate || !this.showsByDate.has(this.selectedDate)) {
      this.selectDay(todayStr);
    } else {
      this.selectDay(this.selectedDate);
    }
  }

  get yearRange(): number[] {
    const year = new Date().getFullYear();
    const range: number[] = [];
    for (let y = year - 10; y <= year + 10; y++) {
      range.push(y);
    }
    return range;
  }

  onMonthChange(event: Event): void {
    this.currentMonth = Number((event.target as HTMLSelectElement).value);
    this.reload();
  }

  onYearChange(event: Event): void {
    this.currentYear = Number((event.target as HTMLSelectElement).value);
    this.reload();
  }

  goToPrevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.reload();
  }

  goToNextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.reload();
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.buildCalendar();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.selectDay(todayStr);
  }

  selectDay(dateStr: string): void {
    this.selectedDate = dateStr;
    this.selectedDayShows = this.showsByDate.get(dateStr) || [];
    this.buildDayGroups();
  }

  private calcMonthStats(): void {
    const monthShows = this.shows.filter(s => {
      const parts = s.data.split('-');
      if (parts.length !== 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      return year === this.currentYear && month === this.currentMonth;
    });

    const total = monthShows.reduce((acc, s) => acc + s.valorCobrado, 0);
    const recebida = monthShows.filter(s => s.pago).reduce((acc, s) => acc + s.valorCobrado, 0);
    const prevista = monthShows.filter(s => !s.pago).reduce((acc, s) => acc + s.valorCobrado, 0);

    this.monthStats = { receitaTotal: total, receitaRecebida: recebida, receitaPrevista: prevista };
  }

  formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  getPeriod(hora: string): string {
    const h = parseInt(hora.split(':')[0], 10);
    if (isNaN(h)) return 'noite';
    if (h >= 6 && h <= 11) return 'manha';
    if (h >= 12 && h <= 17) return 'tarde';
    return 'noite';
  }

  private buildDayGroups(): void {
    const groups: PeriodGroup[] = this.periods.map(p => ({
      period: p.key,
      label: p.label,
      icon: p.icon,
      shows: [],
    }));

    for (const show of this.selectedDayShows) {
      const period = this.getPeriod(show.hora);
      const group = groups.find(g => g.period === period);
      if (group) {
        group.shows.push(show);
      }
    }

    for (const group of groups) {
      group.shows.sort((a, b) => a.hora.localeCompare(b.hora));
    }

    this.dayGroups = groups.filter(g => g.shows.length > 0);
  }

  openAddShow(dateStr: string): void {
    const dialogRef = this.dialog.open(ShowModalComponent, {
      data: { mode: 'add', date: dateStr } as ModalData,
    });
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result?.created) {
        this.reload();
      }
    });
  }

  openViewShow(show: Show): void {
    const dialogRef = this.dialog.open(ShowModalComponent, {
      data: { mode: 'view', show } as ModalData,
    });
    dialogRef.closed.pipe(takeUntil(this.destroy$)).subscribe((result: any) => {
      if (result?.updated || result?.deleted) {
        this.reload();
      }
    });
  }

  togglePago(id: number): void {
    this.showService
      .togglePago(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reload());
  }

  deleteShow(id: number): void {
    if (confirm('Tem certeza que deseja excluir este show?')) {
      this.showService
        .delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.reload());
    }
  }
}
