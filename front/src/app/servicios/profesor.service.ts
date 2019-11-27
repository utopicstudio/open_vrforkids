import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class ProfesorService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }

  getProfesores():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/profesores`,options).pipe(map(res => res))
  }
  
  getProfesor(id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/profesores/${id}`,options).pipe(map(res => res))
  }

	postProfesor(data:any, token:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/profesores/token/${token}`, JSON.stringify(data), options).pipe(map(res => res))
  }

  putProfesor(id:string,data:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.put(`${this.API_URL}/profesores/${id}`,JSON.stringify(data),options).pipe(map(res => res))
  }
  
  deleteProfesor(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/profesores/${id}`, options).pipe(map(res => res))
  }

  uploadImage(data:FormData, id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.post(`${this.API_URL}/profesor/imagen/${id}`,data).pipe(map(res => res)) 
  }

  uploadImageDefault(id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.get(`${this.API_URL}/profesor/imagen/default/${id}`, options).pipe(map(res => res))
  }

  finalizarTutorial(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/profesor/finalizar/tutorial/${id}`,options).pipe(map(res => res))
  }
}