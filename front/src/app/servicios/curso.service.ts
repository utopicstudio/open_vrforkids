import { HttpClient, HttpRequest, HttpHeaders, HttpHeaderResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Config } from '../config';

@Injectable()
export class CursoService {
  API_URL = Config.API_SERVER_URL;
  constructor(private httpClient: HttpClient) { }
  //Servicios Curso Base

  getCursoDetalleAlumno(id_curso:string,id_alumno:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recurso/detalle/alumno/${id_curso}/${id_alumno}`,options).pipe(map(res => res))
  }

  getCursosDisponiblesAlumnos(id_alumno:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/disponibles/alumno/`+id_alumno, options).pipe(map(res => res))    
  }

  getCursoBase(id:any):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursobase/`+id, options).pipe(map(res => res))
  }
  getCursosAprobacionGrafico(id:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/aprobacion/graficos/`+id, options).pipe(map(res => res)) 
  }

  getCursosAsignaturaGrafico(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/asignatura/grafico`, options).pipe(map(res => res)) 
  }

  getCursosBase():any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursosbase`,options).pipe(map(res => res))
  }

  getCursoDetalle(id:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recurso/detalle/`+id, options).pipe(map(res => res))
  }

  getCurso(id:any):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recurso/`+id, options).pipe(map(res => res))
  }

  getCursos():any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos`,options).pipe(map(res => res))
  }

  getCursosAdmin():any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/admin`,options).pipe(map(res => res))
  }

  getCursosProfesor(id :string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/profesor/recursos/${id}`,options).pipe(map(res => res))
  }

  getCursosAlumno(id :string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/alumno/recursos/${id}`,options).pipe(map(res => res))
  }

  postCurso(data:any, token:string):any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'auth-token':token });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/recursos`, JSON.stringify(data), options).pipe(map(res => res))
  }

  getCursoActivos(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/activos/${id}`, options).pipe(map(res => res))
  }

  getCursoDesactivados(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/desactivados/${id}`, options).pipe(map(res => res))
  }

  getCursosGrado(id_grado:string, id_alumno:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/curso/${id_grado}/${id_alumno}`, options).pipe(map(res => res))
  }

  getCursosDeGrado(id_grado:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/cursos_de_grado/${id_grado}`, options).pipe(map(res => res))
  }

  getAlumnosCursoActivo():any{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.get(`${this.API_URL}/recursos/alumnos`, options).pipe(map(res => res))  
  }

  deleteAlumno(data:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/sacar/alumno/recurso`, JSON.stringify(data), options).pipe(map(res => res))
  }

  deleteCurso(id:any){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/recurso/${id}`, options).pipe(map(res => res))
  }

  deleteRecursoPermanente(id:string,token:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json','auth-token':token});
    const options = {
      headers:headers
    }
    return this.httpClient.delete(`${this.API_URL}/recurso/${id}/token`, options).pipe(map(res => res))
  }

  desactivarCurso(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.delete(`${this.API_URL}/recurso/${id}`,options).pipe(map(res => res))
  }

  addAlumnos(id:string){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers
    }
    return this.httpClient.post(`${this.API_URL}/agregar/alumnos/recurso/${id}`, options).pipe(map(res => res))
  }

  uploadImage(data:FormData, id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.post(`${this.API_URL}/recurso/imagen/${id}`,data).pipe(map(res => res)) 
  }

  uploadImageDefault(id:string){
    const headers = new HttpHeaders({ 'Content-type':'application/json'});
    const options = {
      headers:headers
    }
    return this.httpClient.get(`${this.API_URL}/recurso/imagen/default/${id}`, options).pipe(map(res => res))
  }

}