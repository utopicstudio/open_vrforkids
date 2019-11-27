import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class GradoService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }

  getGrados():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/cursos`,options).pipe(map(res => res))
  }
  
  getGradosDetalle():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/cursos/detalle`,options).pipe(map(res => res))
  }
  
  getGrado(id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/cursos/${id}`,options).pipe(map(res => res))
  }
  getGradosProfesor(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/cursos/profesor/${id}`,options).pipe(map(res => res))
  }

  deleteGrado(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/cursos/${id}`, options).pipe(map(res => res))
  }

  postGrado(data:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/cursos`, JSON.stringify(data), options).pipe(map(res => res))
  }
}