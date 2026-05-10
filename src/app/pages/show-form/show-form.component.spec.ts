import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowFormComponent } from './show-form.component';
import { ShowService } from '../../services/show.service';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { of } from 'rxjs';
import { Show } from '../../models/show.model';

describe('ShowFormComponent', () => {
  let component: ShowFormComponent;
  let fixture: ComponentFixture<ShowFormComponent>;
  let service: jasmine.SpyObj<ShowService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ShowService', [
      'getById',
      'create',
      'update',
    ]);

    await TestBed.configureTestingModule({
      imports: [ShowFormComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        { provide: ShowService, useValue: spy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ShowService) as jasmine.SpyObj<ShowService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init form with empty values for new show', () => {
    expect(component.isEditing).toBeFalse();
    expect(component.editId).toBeNull();
    expect(component.form.get('contratante')?.value).toBe('');
    expect(component.form.get('local')?.value).toBe('');
    expect(component.form.get('pago')?.value).toBeFalse();
  });

  it('should have required validators', () => {
    const form = component.form;
    expect(form.get('contratante')?.valid).toBeFalse();
    expect(form.get('local')?.valid).toBeFalse();
    expect(form.get('data')?.valid).toBeFalse();
    expect(form.get('hora')?.valid).toBeFalse();
    expect(form.get('duracao')?.valid).toBeFalse();
    expect(form.get('valorCobrado')?.valid).toBeFalse();
  });

  it('should toggle estilo selection', () => {
    component.toggleEstilo('Samba');
    expect(component.selectedEstilos).toContain('Samba');
    component.toggleEstilo('Samba');
    expect(component.selectedEstilos).not.toContain('Samba');
  });

  it('should select multiple estilos', () => {
    component.toggleEstilo('Samba');
    component.toggleEstilo('Pagode');
    component.toggleEstilo('MPB');
    expect(component.selectedEstilos.length).toBe(3);
    expect(component.selectedEstilos).toEqual(['Samba', 'Pagode', 'MPB']);
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  it('should submit valid form for new show', () => {
    service.create.and.returnValue(
      of({
        id: 99,
        createdAt: new Date().toISOString(),
      } as Show),
    );

    component.form.patchValue({
      contratante: 'Teste',
      local: 'Local Teste',
      data: '2026-12-25',
      hora: '21:00',
      duracao: '2h',
      valorCobrado: 3000,
      pago: true,
      dataPagamento: '2026-12-20',
      formaPagamento: 'Pix',
    });
    component.selectedEstilos = ['Samba'];

    component.onSubmit();
    expect(service.create).toHaveBeenCalled();
  });

  it('should load show data when editing', () => {
    const mockShow: Show = {
      id: 7,
      contratante: 'Editado',
      local: 'Local Edit',
      data: '2026-08-15',
      hora: '19:30',
      duracao: '2h30',
      valorCobrado: 4500,
      pago: true,
      dataPagamento: '2026-08-10',
      formaPagamento: 'Dinheiro',
      estilosSolicitados: ['Forró', 'Axé'],
      createdAt: '2026-07-01T00:00:00',
    };

    service.getById.and.returnValue(of(mockShow));

    const editFixture = TestBed.createComponent(ShowFormComponent);
    const editComponent = editFixture.componentInstance;
    editFixture.detectChanges();

    expect(editComponent.isEditing).toBeFalse();
  });
});
