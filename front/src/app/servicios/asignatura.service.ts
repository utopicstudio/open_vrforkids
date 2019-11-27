import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class AsignaturaService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }

  getAsignaturas():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/asignaturas`,options).pipe(map(res => res))
  }

  getAsignaturasDetalle():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/asignaturas/detalle`,options).pipe(map(res => res))
  }
  
  getAsignatura(id:string){
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/asignaturas/${id}`,options).pipe(map(res => res))
  }

	postAsignatura(data:any):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/asignaturas`, JSON.stringify(data), options).pipe(map(res => res))
  }

  putAsignatura(data:any,id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.put(`${this.API_URL}/asignaturas/${id}`, JSON.stringify(data), options).pipe(map(res=>res))
  }
  
  deleteAsignatura(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/asignaturas/${id}`, options).pipe(map(res => res))
  }
}