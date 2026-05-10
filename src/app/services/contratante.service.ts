import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contratante } from '../models/contratante.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContratanteService {
  private readonly baseUrl = `${environment.apiUrl}/api/contratantes`;

  constructor(private http: HttpClient) {}

  list(): Observable<Contratante[]> {
    return this.http.get<Contratante[]>(this.baseUrl);
  }

  search(term: string): Observable<Contratante[]> {
    return this.http.get<Contratante[]>(`${this.baseUrl}?search=${encodeURIComponent(term)}`);
  }

  getById(id: number): Observable<Contratante> {
    return this.http.get<Contratante>(`${this.baseUrl}/${id}`);
  }

  create(data: Omit<Contratante, 'id' | 'createdAt'>): Observable<Contratante> {
    return this.http.post<Contratante>(this.baseUrl, data);
  }

  update(data: Contratante): Observable<Contratante> {
    return this.http.put<Contratante>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
