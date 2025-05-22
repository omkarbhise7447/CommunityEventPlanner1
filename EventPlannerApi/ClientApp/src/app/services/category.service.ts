import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { enviroment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = enviroment.apiUrl + '/api/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<{ Success: boolean, Data: Category[], Message: string }>(this.apiUrl).pipe(
      map(response => {
        if (!response.Success) {
          throw new Error(response.Message || 'Failed to fetch categories');
        }
        return response.Data;
      })
    );
  }
}