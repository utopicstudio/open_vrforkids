import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class InscripcionService {
    API_URL = Config.API_SERVER_URL;
    constructor(private httpClient: HttpClient) { }

    getInscripciones():any{
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.get(`${this.API_URL}/inscripciones`,options).pipe(map(res => res))
    }
  
    getInscripcion(id:string):any{
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.get(`${this.API_URL}/inscripciones/${id}`,options).pipe(map(res => res))
    }

    getInscripcionesCurso(id_curso:string){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.get(`${this.API_URL}/inscripciones/recurso/${id_curso}`,options).pipe(map(res => res))
    }

    getInscripcionesAlumno(id_alumno:string){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.get(`${this.API_URL}/inscripciones/alumno/${id_alumno}`,options).pipe(map(res => res))
    }    

    postInscripcionesCurso(id_curso:string, data:any){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.post(`${this.API_URL}/inscripciones/recurso/${id_curso}`, JSON.stringify(data), options).pipe(map(res => res))
    }

    postInscripcion(data:any):any{
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
        headers: headers
        }
        return this.httpClient.post(`${this.API_URL}/inscripciones`, JSON.stringify(data), options).pipe(map(res => res))
    }

    putInscripcionEstado(id:string,data:any){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.put(`${this.API_URL}/inscripciones/${id}`,JSON.stringify(data),options).pipe(map(res => res))
    }
  
    deleteInscripcion(id:any){
        const headers = new HttpHeaders({ 'Content-type':'application/json'});
        const options = {
        headers:headers
        }
        return this.httpClient.delete(`${this.API_URL}/inscripciones/${id}`, options).pipe(map(res => res))
    }

    AceptarInscripcionesCurso(id:string){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const options = {
            headers: headers
        }
        return this.httpClient.post(`${this.API_URL}/aceptar/inscripciones/recurso/${id}`,options).pipe(map(res => res))
    }
}