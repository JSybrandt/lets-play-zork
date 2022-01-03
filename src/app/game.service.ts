import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { HistItem } from './histitem';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = "https://lets-play-zork-api.sybrandt.com:8080";
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(
   private http: HttpClient
  ) { }

  get_history(): Observable<HistItem[]> {
    let url = `${this.apiUrl}/history`
    return this.http.get<HistItem[]>(url, this.httpOptions);
  }

  send_command(command: string): Observable<HistItem[]> {
    let url = `${this.apiUrl}/command`;
    return this.http.post<HistItem[]>(url, {"command": command}, this.httpOptions);
  }
}
