import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class AdministradorService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }

  finalizarTutorial(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/administrador/finalizar/tutorial/${id}`,options).pipe(map(res => res))
  }

  getAdministradores():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/administradores`,options).pipe(map(res => res))
  }
  
  getAdministrador(id:string){
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/administradores/${id}`,options).pipe(map(res => res))
  }

	postAdministrador(data:any):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/administradores`, JSON.stringify(data), options).pipe(map(res => res))
  }

  putAdministrador(data:any,id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.put(`${this.API_URL}/administradores/${id}`, JSON.stringify(data), options).pipe(map(res=>res))
  }
  
  deleteAdministrador(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/administradores/${id}`, options).pipe(map(res => res))
  }
}