import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ShowService } from './show.service';
import { Show } from '../models/show.model';
import { environment } from '../../environments/environment';

describe('ShowService', () => {
  let service: ShowService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ShowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list all shows', () => {
    const apiResponse = [
      {
        id: 1,
        contratante: 'Teste',
        local: 'Local',
        data: '2026-01-01T00:00:00',
        hora: '20:00',
        duracao: '3h',
        valorCobrado: 5000,
        pago: true,
        dataPagamento: '2026-01-02T00:00:00',
        formaPagamento: 'Pix',
        estilosSolicitados: '["Samba"]',
        createdAt: '2026-01-01T00:00:00',
      },
    ];

    service.list().subscribe(shows => {
      expect(shows.length).toBe(1);
      expect(shows[0].id).toBe(1);
      expect(shows[0].estilosSolicitados).toEqual(['Samba']);
      expect(shows[0].data).toBe('2026-01-01');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows`);
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);
  });

  it('should get show by id', () => {
    const apiResponse = {
      id: 5,
      contratante: 'ByID',
      local: 'Local',
      data: '2026-02-15T00:00:00',
      hora: '21:00',
      duracao: '2h',
      valorCobrado: 3000,
      pago: false,
      formaPagamento: '',
      estilosSolicitados: '[]',
      createdAt: '2026-02-01T00:00:00',
    };

    service.getById(5).subscribe(show => {
      expect(show.contratante).toBe('ByID');
      expect(show.id).toBe(5);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows/5`);
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);
  });

  it('should create a show', () => {
    const newShow = {
      contratante: 'Novo',
      local: 'Local',
      data: '2026-03-01',
      hora: '19:00',
      duracao: '4h',
      valorCobrado: 10000,
      pago: false,
      formaPagamento: '',
      estilosSolicitados: ['Rock', 'MPB'],
    };

    const apiResponse = {
      id: 10,
      ...newShow,
      estilosSolicitados: '["Rock","MPB"]',
      createdAt: '2026-03-01T00:00:00',
    };

    service.create(newShow).subscribe(show => {
      expect(show.id).toBe(10);
      expect(show.estilosSolicitados).toEqual(['Rock', 'MPB']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.estilosSolicitados).toBe('["Rock","MPB"]');
    req.flush(apiResponse);
  });

  it('should update a show', () => {
    const updatedShow: Show = {
      id: 3,
      contratante: 'Atualizado',
      local: 'Local',
      data: '2026-04-01',
      hora: '20:00',
      duracao: '3h',
      valorCobrado: 7000,
      pago: true,
      dataPagamento: '2026-04-02',
      formaPagamento: 'Cartão',
      estilosSolicitados: ['Samba'],
      createdAt: '2026-03-01T00:00:00',
    };

    service.update(updatedShow).subscribe(show => {
      expect(show.contratante).toBe('Atualizado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...updatedShow, estilosSolicitados: '["Samba"]' });
  });

  it('should delete a show', () => {
    service.delete(7).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should toggle pago status', () => {
    service.togglePago(2).subscribe(show => {
      expect(show.pago).toBeTrue();
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/shows/2/toggle-pago`,
    );
    expect(req.request.method).toBe('PATCH');
    req.flush({
      id: 2,
      pago: true,
      dataPagamento: '2026-05-10T00:00:00',
      estilosSolicitados: '[]',
    });
  });

  it('should handle estilosSolicitados as array when already parsed', () => {
    const apiResponse = [
      {
        id: 1,
        estilosSolicitados: ['Samba', 'Pagode'],
        createdAt: '2026-01-01T00:00:00',
      },
    ];

    service.list().subscribe(shows => {
      expect(shows[0].estilosSolicitados).toEqual(['Samba', 'Pagode']);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/shows`);
    req.flush(apiResponse);
  });
});
