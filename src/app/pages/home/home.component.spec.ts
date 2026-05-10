import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ShowService } from '../../services/show.service';
import { Show } from '../../models/show.model';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let service: jasmine.SpyObj<ShowService>;

  function createMockShows(): Show[] {
    return [
      {
        id: 1,
        contratante: 'Prefeitura',
        local: 'Praça Central',
        data: '2026-06-15',
        hora: '20:00',
        duracao: '3h',
        valorCobrado: 5000,
        pago: true,
        dataPagamento: '2026-06-10',
        formaPagamento: 'Pix',
        estilosSolicitados: ['Samba', 'Pagode'],
        createdAt: new Date('2026-05-01').toISOString(),
      },
      {
        id: 2,
        contratante: 'Clube ABC',
        local: 'Salão de Festas',
        data: '2026-07-20',
        hora: '22:00',
        duracao: '4h',
        valorCobrado: 8000,
        pago: false,
        formaPagamento: '',
        estilosSolicitados: ['MPB'],
        createdAt: new Date('2026-05-10').toISOString(),
      },
    ];
  }

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ShowService', [
      'list',
      'togglePago',
      'delete',
    ]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: ShowService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ShowService) as jasmine.SpyObj<ShowService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load shows on init', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    expect(component.shows.length).toBe(2);
    expect(component.stats?.total).toBe(2);
    expect(component.stats?.pagos).toBe(1);
    expect(component.stats?.pendentes).toBe(1);
    expect(component.stats?.receita).toBe(5000);
  });

  it('should sort shows by createdAt descending', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    expect(component.shows[0].id).toBe(2);
    expect(component.shows[1].id).toBe(1);
  });

  it('should build showsByDate map', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    expect(component.showsByDate.has('2026-06-15')).toBeTrue();
    expect(component.showsByDate.has('2026-07-20')).toBeTrue();
    expect(component.showsByDate.get('2026-06-15')!.length).toBe(1);
  });

  it('should build calendar days grid', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    expect(component.calendarDays.length).toBeGreaterThan(28);
  });

  it('should navigate to next month', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    const initialMonth = component.currentMonth;
    component.goToNextMonth();
    expect(component.currentMonth).toBe((initialMonth + 1) % 12);
  });

  it('should navigate to previous month', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    const initialMonth = component.currentMonth;
    component.goToPrevMonth();
    expect(component.currentMonth).toBe((initialMonth + 11) % 12);
  });

  it('should select a day and show its shows', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    component.selectDay('2026-06-15');
    expect(component.selectedDate).toBe('2026-06-15');
    expect(component.selectedDayShows.length).toBe(1);
    expect(component.selectedDayShows[0].contratante).toBe('Prefeitura');
  });

  it('should handle empty showsByDate for selected day', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    component.ngOnInit();
    component.selectDay('2026-06-16');
    expect(component.selectedDate).toBe('2026-06-16');
    expect(component.selectedDayShows.length).toBe(0);
  });

  it('should toggle pago status', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    service.togglePago.and.returnValue(of(shows[0]));
    component.ngOnInit();
    component.togglePago(1);
    expect(service.togglePago).toHaveBeenCalledWith(1);
  });

  it('should delete show', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    service.delete.and.returnValue(of(undefined));
    spyOn(window, 'confirm').and.returnValue(true);
    component.ngOnInit();
    component.deleteShow(1);
    expect(window.confirm).toHaveBeenCalled();
    expect(service.delete).toHaveBeenCalledWith(1);
  });

  it('should not delete if confirm is cancelled', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    spyOn(window, 'confirm').and.returnValue(false);
    component.ngOnInit();
    component.deleteShow(1);
    expect(service.delete).not.toHaveBeenCalled();
  });

  it('should render empty state when no shows', () => {
    service.list.and.returnValue(of([]));
    fixture.detectChanges();
    const emptyText = fixture.nativeElement.querySelector('.empty__text');
    expect(emptyText).toBeTruthy();
    expect(emptyText.textContent).toContain('Nenhum show cadastrado ainda');
  });

  it('should render calendar cells', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    fixture.detectChanges();
    const cells = fixture.nativeElement.querySelectorAll('.calendar__cell');
    expect(cells.length).toBeGreaterThan(28);
  });

  it('should render day detail when a day with shows is selected', () => {
    const shows = createMockShows();
    service.list.and.returnValue(of(shows));
    fixture.detectChanges();
    const dayDetail = fixture.nativeElement.querySelector('.day-detail');
    expect(dayDetail).toBeTruthy();
    expect(dayDetail.textContent).toContain('Clube ABC');
    expect(dayDetail.textContent).toContain('1 show');
  });
});
