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
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-detalle-curso-alumno',
  templateUrl: './detalle-curso-alumno.component.html',
  styleUrls: ['./detalle-curso-alumno.component.css']
})
export class DetalleCursoAlumnoComponent implements OnInit {
  curso: Curso;
  activo_curso:boolean;
  alumno: any;
  solicitudes: any[];
  respuestas: any[];
  grado: Grado;
  cursoBase: CursoBase;
  pageRespuestas: number;
  pageSizeRespuestas: number;
  collectionSizeRespuestas: number;
  id_detalle:string;
  token:string
  id:string
  contadorLoading=0
  constructor(private _cursoService: CursoService, 
    private _router: Router, 
    private _activatedRoute: ActivatedRoute,
    private _inscripcionService: InscripcionService,
    private _alumnoService: AlumnoService,
    private _storageService: StorageService,
    private localService: LocalService,
    private _gradoService: GradoService) { 
      this.curso= new Curso();
      this.grado = new Grado();
      this.cursoBase = new CursoBase();
      this.alumno=[];
      this.solicitudes=[];
      this.respuestas =[];
      this.pageRespuestas = 1;
      this.pageSizeRespuestas = 4;
      this.collectionSizeRespuestas = 0;
  }

  ngOnInit() {
    if(this._storageService.getCurrentToken()==null || this._storageService.getCurrentUser().id==null){
      this.token = this.localService.getToken()
      this.id = this.localService.getId()
    }
    else{
      this.token = this._storageService.getCurrentToken()
      this.id = this._storageService.getCurrentUser().id
    }
    this.id_detalle = this._activatedRoute.snapshot.paramMap.get('id')
    this.getCursoDetalle();
    this.getActivoCurso();
  }

  
  getCursoDetalle(){
    this._cursoService.getCursoDetalleAlumno(this.id_detalle, this.id).subscribe((data:any)=>{
      this.curso = data.curso;
      this.alumno = data.alumno
      this.grado = data.curso.grado;
      this.cursoBase = data.curso.curso_base;
      if (this.curso.imagen == ""){
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.curso.imagen
      }
      if (this.cursoBase.imagen == ""){
        this.cursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.cursoBase.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.cursoBase.imagen
      }
      var cantidad_preguntas = 0

      if(this.alumno.evaluacion){
        this.respuestas = this.alumno.respuestas_data
        this.collectionSizeRespuestas = this.respuestas.length
      }
      if(this.contadorLoading<2){
        this.contadorLoading= this.contadorLoading+1
      }
     
    })
  }

  getActivoCurso(){
    this._cursoService.getCurso(this.id_detalle).subscribe((data:any)=>{
      this.activo_curso= data.activo
      if(this.contadorLoading<2){
        this.contadorLoading= this.contadorLoading+1
      }
    })
  }

  get respuestas_tabla(): any[] {
    return this.respuestas
      .map((pregunta, i) => ({id: i + 1, ...pregunta}))
      .slice((this.pageRespuestas - 1) * this.pageSizeRespuestas, (this.pageRespuestas - 1) * this.pageSizeRespuestas + this.pageSizeRespuestas);
  }


  public cancelar():void {
  	this._router.navigateByUrl('/alumno/recursos');	
  }

}
