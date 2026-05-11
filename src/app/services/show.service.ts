import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Show } from '../models/show.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShowService {
  private readonly baseUrl = `${environment.apiUrl}/api/shows`;

  constructor(private http: HttpClient) {}

  list(mes?: number, ano?: number): Observable<Show[]> {
    const params: any = {};
    if (mes !== undefined) params.mes = mes;
    if (ano !== undefined) params.ano = ano;
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      map(shows => shows.map(s => this.fromApi(s))),
    );
  }

  getById(id: number): Observable<Show> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(s => this.fromApi(s)),
    );
  }

  create(show: Omit<Show, 'id' | 'createdAt'>): Observable<Show> {
    return this.http.post<any>(this.baseUrl, this.toApi(show)).pipe(
      map(s => this.fromApi(s)),
    );
  }

  update(show: Show): Observable<Show> {
    return this.http.put<any>(`${this.baseUrl}/${show.id}`, this.toApi(show)).pipe(
      map(s => this.fromApi(s)),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  togglePago(id: number): Observable<Show> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/toggle-pago`, {}).pipe(
      map(s => this.fromApi(s)),
    );
  }

  private toApi(show: Partial<Show>): any {
    return {
      ...show,
      estilosSolicitados: show.estilosSolicitados || [],
    };
  }

  private fromApi(data: any): Show {
    return {
      id: data.id,
      contratanteId: data.contratante?.id ?? data.contratanteId,
      contratanteNome: data.contratante?.nome || '',
      contratanteTelefone: data.contratante?.telefone || undefined,
      localId: data.local?.id ?? data.localId,
      localNome: data.local?.nome || '',
      localEndereco: data.local?.endereco || undefined,
      data: data.data ? data.data.split('T')[0] : data.data,
      hora: data.hora,
      duracao: data.duracao,
      valorCobrado: Number(data.valorCobrado),
      pago: data.pago,
      dataPagamento: data.dataPagamento ? data.dataPagamento.split('T')[0] : data.dataPagamento,
      formaPagamento: data.formaPagamento,
      estilosSolicitados:
        typeof data.estilosSolicitados === 'string'
          ? JSON.parse(data.estilosSolicitados || '[]')
          : data.estilosSolicitados,
      necessitaNotaFiscal: data.necessitaNotaFiscal ?? false,
      notaEmitida: data.notaEmitida ?? false,
      createdAt: data.createdAt,
    };
  }
}
