import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local } from '../models/local.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly baseUrl = `${environment.apiUrl}/api/locais`;

  constructor(private http: HttpClient) {}

  list(): Observable<Local[]> {
    return this.http.get<Local[]>(this.baseUrl);
  }

  search(term: string): Observable<Local[]> {
    return this.http.get<Local[]>(`${this.baseUrl}?search=${encodeURIComponent(term)}`);
  }

  getById(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.baseUrl}/${id}`);
  }

  create(data: Omit<Local, 'id' | 'createdAt'>): Observable<Local> {
    return this.http.post<Local>(this.baseUrl, data);
  }

  update(data: Local): Observable<Local> {
    return this.http.put<Local>(`${this.baseUrl}/${data.id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
