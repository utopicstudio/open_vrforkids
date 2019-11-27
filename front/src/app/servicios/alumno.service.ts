import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class AlumnoService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }

  finalizarTutorial(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/alumno/finalizar/tutorial/${id}`,options).pipe(map(res => res))
  }

  getAlumnos():any{
  	const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/alumnos`,options).pipe(map(res => res))
  }

  getAlumnosGrado(id: string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/alumnos/curso/${id}`,options).pipe(map(res => res))
  }
  
  getAlumno(id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.get(`${this.API_URL}/alumnos/${id}`,options).pipe(map(res => res))
  }

  putAlumno(data:any, id:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  	const options = {
  		headers: headers
  	}
    return this.httpClient.put(`${this.API_URL}/alumnos/${id}`,JSON.stringify(data),options).pipe(map(res => res))
  }

	postAlumno(data:any):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/alumnos`, JSON.stringify(data), options).pipe(map(res => res))
  }
  
  deleteAlumno(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/alumnos/${id}`, options).pipe(map(res => res))
  }

  /* Alumnos por Curso */
  getAlumnosCurso(idCurso:string):any{
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.get(`${this.API_URL}/alumnos/recurso/${idCurso}`, options).pipe(map(res => res))
  }
  getAlumnoEvaluaciones(id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.get(`${this.API_URL}/alumno/evaluaciones/${id}`, options).pipe(map(res => res))
  }

  postAlumnoCurso(idCurso:string, idAlumno:string):any{
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.post(`${this.API_URL}/alumno/recurso/${idCurso}/${idAlumno}`, options).pipe(map(res => res)) 
  }

  deleteAlumnoCurso(idCurso:string, idAlumno:string):any{
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/alumno/recurso/${idCurso}/${idAlumno}`, options).pipe(map(res => res)) 
  }

  uploadImage(data:FormData, id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.post(`${this.API_URL}/alumno/imagen/${id}`,data).pipe(map(res => res)) 
  }

  uploadImageDefault(id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.get(`${this.API_URL}/alumno/imagen/default/${id}`, options).pipe(map(res => res))
  }
}