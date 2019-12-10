import { Component, OnInit} from '@angular/core';
import { CursoService } from 'src/app/servicios/curso.service';
import { InscripcionService } from 'src/app/servicios/inscripcion.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'src/app/servicios/storage.service';
import { GradoService } from 'src/app/servicios/grado.service';
import Swal from 'sweetalert2';
import { Config } from 'src/app/config';
import { Curso } from 'src/app/modelos/curso.model';
import { Grado } from 'src/app/modelos/grado.model';
import { CursoBase } from 'src/app/modelos/curso_base.model';
import { Pregunta } from 'src/app/modelos/pregunta.model';
import { Contenido } from 'src/app/modelos/contenido.model';

@Component({
  selector: 'app-detalle-curso-administrador',
  templateUrl: './detalle-curso-administrador.component.html',
  styleUrls: ['./detalle-curso-administrador.component.css']
})
export class DetalleCursoAdministradorComponent implements OnInit {
  curso: Curso;
  activo_curso:boolean;
  alumnos: any[];
  solicitudes: any[];
  preguntas: any[];
  grado: Grado;
  cursoBase: CursoBase;
  contenidos: Contenido[]
  pageAlumnos: number;
  pageSizeAlumnos: number;
  collectionSizeAlumnos: number;
  pageSolicitudes: number;
  pageSizeSolicitudes: number;
  collectionSizeSolicitudes: number;
  pagePreguntas: number;
  pageSizePreguntas: number;
  collectionSizePreguntas: number;
  pageContenidos: number;
  pageSizeContenidos: number;
  collectionSizeContenidos: number;
  id_detalle:string;
  verTablaPreguntas: boolean
  contadorLoading=0
  constructor(private _cursoService: CursoService, 
    private _router: Router, 
    private _activatedRoute: ActivatedRoute,
    private _inscripcionService: InscripcionService,
    private _alumnoService: AlumnoService,
    private _storageService: StorageService,
    private _gradoService: GradoService
  ) 
  {
    this.curso= new Curso();
    this.grado = new Grado();
    this.cursoBase = new CursoBase();
    this.alumnos=[];
    this.solicitudes=[];
    this.preguntas =[];
    this.contenidos = []
    this.pageAlumnos = 1;
    this.pageSizeAlumnos = 4;
    this.pageSolicitudes = 1;
    this.pageSizeSolicitudes = 4;
    this.pagePreguntas = 1;
    this.pageSizePreguntas = 4;
    this.pageContenidos = 1;
    this.pageSizeContenidos = 4;
    this.verTablaPreguntas = false;
  }

  ngOnInit() {
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.getCursoDetalle();
    this.getSolicitudes();
    this.getActivoCurso();
  }

  getCursoDetalle(){
    this._cursoService.getCursoDetalle(this.id_detalle).subscribe((data:any)=>{
      this.curso = data.curso;
      for(let contenido of this.curso.contenidos){
        contenido.identificador = contenido.identificador +1
        for(let pregunta of contenido.preguntas){
          pregunta.indice = pregunta.indice +1 
          for(let alternativa of pregunta.alternativas){
            alternativa.numero_alternativa = alternativa.numero_alternativa+1
          }
        }
      }
      this.contenidos = this.curso.contenidos;
      for(let contenido of this.contenidos){
        contenido.imagen = Config.API_SERVER_URL+"/contenidos/imagen/"+contenido.imagen
      }
      this.collectionSizeContenidos = data.curso.contenidos.length
      this.grado = data.curso.grado;
      this.cursoBase = data.curso.curso_base;

      if (this.cursoBase.imagen == ""){
        this.cursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.cursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.cursoBase.imagen
      }

      if (this.curso.imagen == ""){
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.curso.imagen
      }
      this.alumnos = data.alumnos;
      this.collectionSizeAlumnos = this.alumnos.length;
      if(this.contadorLoading<3){
        this.contadorLoading= this.contadorLoading+1
      }
    })
  }

  getActivoCurso(){
    this._cursoService.getCurso(this.id_detalle).subscribe((data:any)=>{
      this.activo_curso= data.activo
      if(this.contadorLoading<3){
        this.contadorLoading= this.contadorLoading+1
      }
    })
  }

  getSolicitudes(){
    this._inscripcionService.getInscripcionesCurso(this.id_detalle).subscribe((data:any)=>{
      this.solicitudes = data
      this.collectionSizeSolicitudes = this.solicitudes.length;
      for (let solicitud of this.solicitudes){
        if(solicitud.alumno != null){
          this._alumnoService.getAlumno(solicitud.alumno).subscribe((alumno:any)=>{
            solicitud.alumno = alumno.nombre_usuario
          })
        }
      }
      if(this.contadorLoading<3){
        this.contadorLoading= this.contadorLoading+1
      }
    })
  }

  get alumnos_tabla(): any[] {
    return this.alumnos
      .map((alumno, i) => ({id: i + 1, ...alumno}))
      .slice((this.pageAlumnos - 1) * this.pageSizeAlumnos, (this.pageAlumnos - 1) * this.pageSizeAlumnos + this.pageSizeAlumnos);
  }

  get contenidos_tabla(): any[] {
    return this.contenidos
      .map((contenido, i) => ({id: i + 1, ...contenido}))
      .slice((this.pageContenidos - 1) * this.pageSizeContenidos, (this.pageContenidos - 1) * this.pageSizeContenidos + this.pageSizeContenidos);
  }

  get solicitudes_tabla(): any[] {
    return this.solicitudes
      .map((solicitud, i) => ({id: i + 1, ...solicitud}))
      .slice((this.pageSolicitudes - 1) * this.pageSizeSolicitudes, (this.pageSolicitudes - 1) * this.pageSizeSolicitudes + this.pageSizeSolicitudes);
  }

  get preguntas_tabla(): any[] {
    return this.preguntas
      .map((pregunta, i) => ({id: i + 1, ...pregunta}))
      .slice((this.pagePreguntas - 1) * this.pageSizePreguntas, (this.pagePreguntas - 1) * this.pageSizePreguntas + this.pageSizePreguntas);
  }

  cancelar(){
    this._router.navigateByUrl('/admin/recursos'); 
  }

  verAlternativas(alternativas: any, numero_pregunta: any, tipo:string): void{
    let html = '';
    if(tipo=="ALTERNATIVA" || tipo=="VERDADERO_FALSO"){
      html += '<table class="table table-striped">';
      html += '<thead>';
        html += '<tr>';
          html += '<th scope="col">Alternativa</th>';
          html += '<th scope="col">Texto</th>';
          html += '<th scope="col">Correcta</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
        for(var i = 0; i < alternativas.length; i++) {
           html += '<tr>';
             if(i == 0)
               html += '<th scope="row">A</th>';
             else if(i == 1)
               html += '<th scope="row">B</th>';
             else
               html += '<th scope="row">C</th>';
             html += '<td>'+alternativas[i].texto+'</td>';
             if(alternativas[i].correcta) {
               html += '<td><i class="fas fa-check-circle text-success"></i></td>';
             }
             else {
               html += '<td><i class="fas fa-times text-danger"></i></td>';
             }
           html += '</tr>';
        }
      html += '</tbody>';
     html += '</table>';
    }

    if(tipo=="UNIR_IMAGENES" || tipo=="UNIR_TEXTOS" || tipo=="UNIR_IMAGEN_TEXTO" ){
      html += '<table class="table table-striped">';
      html += '<thead>';
        html += '<tr>';
          html += '<th scope="col">Alternativa</th>';
          html += '<th scope="col">Primera Opción</th>';
          html += '<th scope="col">Segunda Opción</th>';
        html += '</tr>';
      html += '</thead>';
      html += '<tbody>';
        for(var i = 0; i < alternativas.length; i++) {
           html += '<tr>';
             if(i == 0)
               html += '<th scope="row">A</th>';
             else if(i == 1)
               html += '<th scope="row">B</th>';
             else
               html += '<th scope="row">C</th>';
            if(tipo=="UNIR_TEXTOS" ){
              html += '<td>'+alternativas[i].texto+'</td>';
              html += '<td>'+alternativas[i].texto_secundario+'</td>';
            }
            if(tipo=="UNIR_IMAGEN_TEXTO" ){
              html += '<td>'+alternativas[i].texto+'</td>';
              html += '<td><img [src]='+alternativas[i].texto_secundario+' class="mr-2" style="width: 10px"></td>';
            }
            if(tipo=="UNIR_IMAGENES" ){
              html += '<th scope="row"><img [src]='+alternativas[i].texto+' class="mr-2" style="width: 5px"></th>';
              html += '<th scope="row"><img [src]='+alternativas[i].texto_secundario+' class="mr-2" style="width: 5px"></th>';
            }
           html += '</tr>';
        }
      html += '</tbody>';
     html += '</table>';
    }


    Swal.fire({
      title: 'Opciones Pregunta '+numero_pregunta,
      type: 'info',
      html: html,
      confirmButtonColor: '#2dce89',
      confirmButtonText: 'Ok'
    });
  }

  verPreguntas(preguntas:Pregunta[]){
    this.verTablaPreguntas = true
    this.pagePreguntas = 1
    this.pageSizePreguntas = 4
    this.preguntas = preguntas
    this.collectionSizePreguntas = this.preguntas.length
  }

  verContenidos(){
    this.verTablaPreguntas = false
  }

}
