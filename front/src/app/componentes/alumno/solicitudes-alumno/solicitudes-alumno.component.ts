import { Component, OnInit } from '@angular/core';
import { CursoService } from 'src/app/servicios/curso.service';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { InscripcionService } from 'src/app/servicios/inscripcion.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { Config } from 'src/app/config';
import swal from 'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { Alumno } from 'src/app/modelos/alumno.model';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-solicitudes-alumno',
  templateUrl: './solicitudes-alumno.component.html',
  styleUrls: ['./solicitudes-alumno.component.css']
})
export class SolicitudesAlumnoComponent implements OnInit {
	cursos: any[];

  inscripciones: any[];
  pageInscripcion: number;
  pageSizeInscripcion: number;
  collectionSizeInscripcion: number;
  pageRecurso: number;
  pageSizeRecurso: number;
  collectionSizeRecurso: number;
	grado: string;
  alumno: any;
  token:string
  id:string
  contadorLoading=0
  constructor(private _cursoService: CursoService,
  						private _alumnoService: AlumnoService,
              private _storageService: StorageService,
              public tourService: TourService,
              private localService: LocalService,
  						private _inscripcionService: InscripcionService) { 
  	
  	this.cursos = [];
    this.inscripciones = [];
    this.pageInscripcion = 1;
    this.pageSizeInscripcion = 4;
    this.pageRecurso = 1;
    this.pageSizeRecurso = 4;
    this.alumno = '';
    this.tourService.enableHotkeys()

    this.tourService.initialize([
      {
        anchorId: 'menu.mis_solicitudes',
        content: 'Para poder ver y realizar solicitudes a recursos debes hacer click aqui',
        placement: 'auto',
        title: 'Mis Solicitudes',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'solicitudes',
        content: 'En esta sección aparecerán los recursos que puedes solicitar inscripción y el estado de tus solicitudes.',
        placement: 'auto',
        title: 'Solicitudes',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'recursos_disponibles',
        content: 'Para poder solicitar inscripción a un recurso debes hacer click aquí y luego solicitar la inscripción al recurso que quieras',
        placement: 'auto',
        title: 'Recursos Disponibles',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'solicitudes_realizadas',
        content: 'Si deseas ver el estado de tus solicitudes realizadas, debes hacer click aquí y podrás ver el historial de tu petición',
        placement: 'auto',
        title: 'Mis Solicitudes',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'cerrar_sesion',
        content: 'Para poder finalizar tu sesión debes hacer click aquí',
        placement: 'auto',
        title: 'Cerrar Sesión',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      }
    ])
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
  	this.getAlumno();
    this.getInscripciones();
    this.tutorial();
  }

  public terminarTutorial(){
    this.tourService.end()
    this._alumnoService.finalizarTutorial(this.id).subscribe((data:any)=>{
      if(data['Response']=="exito"){
        const Toast = swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        
        Toast.fire({
          type: 'success',
          title: 'Tutorial finalizado'
        })
        this._storageService.setFalsePrimeraVez()
      }
    })
  }
  public tutorial(){
    this._alumnoService.getAlumno(this.id).subscribe((data:any)=>{
      if(data['primera_vez']){
        this.tourService.start()
      }
    })
  }

  public getCursosDisponiblesAlumnos(id_alumno: any): void{
  	this._cursoService.getCursosDisponiblesAlumnos(id_alumno).subscribe((data: Array<any>) => {
      this.cursos = data;
      this.collectionSizeRecurso = this.cursos.length
      for(let curso of this.cursos){
        if (curso.imagen == ""){
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
        }
        else{
          curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
        } 
      }
      if(this.contadorLoading<3){
        this.contadorLoading=this.contadorLoading+1
      }
    });
  }

  public getInscripciones(): void{
    this._inscripcionService.getInscripcionesAlumno(this.id).subscribe((data: any) => {
      this.inscripciones = data;
      for(let inscripcion of this.inscripciones){
        if (inscripcion.curso.imagen == ""){
          inscripcion.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
        }
        else{
          inscripcion.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+inscripcion.curso.imagen
        }  
      }
      this.collectionSizeInscripcion = this.inscripciones.length;
      if(this.contadorLoading<3){
        this.contadorLoading=this.contadorLoading+1
      }
    });
  }

  public getAlumno():void {
  	this._alumnoService.getAlumno(this.id).subscribe((data: any) => {
  		this.alumno = data;
      this.getCursosDisponiblesAlumnos(data.id);
      if(this.contadorLoading<3){
        this.contadorLoading=this.contadorLoading+1
      }
    });
  }

  get inscripciones_tabla(): any[] {
    return this.inscripciones
      .map((inscripcion, i) => ({id: i + 1, ...inscripcion}))
      .slice((this.pageInscripcion - 1) * this.pageSizeInscripcion, (this.pageInscripcion - 1) * this.pageSizeInscripcion + this.pageSizeInscripcion);
  }

  get recursos_tabla(): any[] {
    return this.cursos
      .map((recurso, i) => ({id: i + 1, ...recurso}))
      .slice((this.pageRecurso - 1) * this.pageSizeRecurso, (this.pageRecurso - 1) * this.pageSizeRecurso + this.pageSizeRecurso);
  }

  public mostrarHistorialInscripcion(historial:any):void {
    let data = '';
    for(var i = 0; i < historial.length; i++){
      data = data+'<tr><td>'+historial[i].fecha+'</td><td>'+historial[i].data+'</td></tr>';
    }
    swal.fire({
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2dce89',
      title: 'Historial Solicitud',
      html:
        '<div class="table-responsive">'+
          '<table class="table table-striped">'+
            '<thead>'+
              '<tr>'+
                '<th scope="col">Fecha'+
                '</th>'+
                '<th scope="col">Historial'+
                '</th>'+
              '</tr>'+
            '</thead>'+

            '<tbody>'+data+'</tbody>'+
          '</table>'+
        '</div>'
    });
  }

  public formularioSolicitud(id_curso:string, nombre_curso: string): void {
  	swal.fire({
      title: 'Solicitud de Inscripción',
      text: 'Desea inscribirse en el recurso '+nombre_curso+'?',
  		type: 'question',
  		showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
  		cancelButtonText: 'Cancelar',
  		confirmButtonText: 'Enviar Solicitud'
  	}).then((result) => {
  		if(result.value) {

  			const data = {
  				'id_alumno': this.alumno.id
  			}

  			this._inscripcionService.postInscripcionesCurso(id_curso, data).subscribe((data: any) => {
		  		if(data['response']=='exito') {
		  			swal.fire({
              title: 'Solicitud exitosa',
              text: 'Se ha enviado la solicitud. Debe esperar aprobación del profesor',
		  				type: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2dce89',
		  			}).then((result) => {
              this.getAlumno();
              this.getInscripciones();
            });

		  		}
		    });
  		}

  	});
  }
}
