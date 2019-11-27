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
  selector: 'app-detalle-curso-profesor',
  templateUrl: './detalle-curso-profesor.component.html',
  styleUrls: ['./detalle-curso-profesor.component.css']
})
export class DetalleCursoProfesorComponent implements OnInit {
  curso: Curso;
  activo_curso:boolean;
  alumnos: any[];
  solicitudes: any[];
  preguntas: any[];
  grado: Grado;
  cursoBase: CursoBase;

  pageAlumnos: number;
  pageSizeAlumnos: number;
  collectionSizeAlumnos: number;
  pageSolicitudes: number;
  pageSizeSolicitudes: number;
  collectionSizeSolicitudes: number;
  pagePreguntas: number;
  pageSizePreguntas: number;
  collectionSizePreguntas: number;
  id_detalle:string;
  verTablaPreguntas: boolean
  contenidos: Contenido[]
  pageContenidos: number;
  pageSizeContenidos: number;
  collectionSizeContenidos: number;
  loading=false
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
    this.contenidos = []
    this.curso= new Curso();
    this.grado = new Grado();
    this.cursoBase = new CursoBase();
    this.alumnos=[];
    this.solicitudes=[];
    this.preguntas =[];
    this.pageAlumnos = 1;
    this.pageSizeAlumnos = 4;
    this.pageSolicitudes = 1;
    this.pageSizeSolicitudes = 4;
    this.pagePreguntas = 1;
    this.pageSizePreguntas = 4;
    this.pageContenidos =1;
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
        contenido.identificador = contenido.identificador+1
        for(let pregunta of contenido.preguntas){
          pregunta.indice = pregunta.indice+1
          for(let alternativa of pregunta.alternativas){
            alternativa.numero_alternativa = alternativa.numero_alternativa +1
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
      if (this.curso.imagen == ""){
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
      }
      else{
        this.curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+this.curso.imagen
      }
      this.alumnos = data.alumnos;
      this.collectionSizeAlumnos = this.alumnos.length;
      if(this.contadorLoading<3){
        this.contadorLoading=this.contadorLoading+1
      }
    })
  }

  getActivoCurso(){
    this._cursoService.getCurso(this.id_detalle).subscribe((data:any)=>{
      this.activo_curso= data.activo
      if(this.contadorLoading<3){
        this.contadorLoading=this.contadorLoading+1
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
        this.contadorLoading=this.contadorLoading+1
      }
    })
  }

  get alumnos_tabla(): any[] {
    return this.alumnos
      .map((alumno, i) => ({id: i + 1, ...alumno}))
      .slice((this.pageAlumnos - 1) * this.pageSizeAlumnos, (this.pageAlumnos - 1) * this.pageSizeAlumnos + this.pageSizeAlumnos);
  }

  get solicitudes_tabla(): any[] {
    return this.solicitudes
      .map((solicitud, i) => ({id: i + 1, ...solicitud}))
      .slice((this.pageSolicitudes - 1) * this.pageSizeSolicitudes, (this.pageSolicitudes - 1) * this.pageSizeSolicitudes + this.pageSizeSolicitudes);
  }

  get contenidos_tabla(): any[] {
    return this.contenidos
      .map((contenido, i) => ({id: i + 1, ...contenido}))
      .slice((this.pageContenidos - 1) * this.pageSizeContenidos, (this.pageContenidos - 1) * this.pageSizeContenidos + this.pageSizeContenidos);
  }

  get preguntas_tabla(): any[] {
    return this.preguntas
      .map((pregunta, i) => ({id: i + 1, ...pregunta}))
      .slice((this.pagePreguntas - 1) * this.pageSizePreguntas, (this.pagePreguntas - 1) * this.pageSizePreguntas + this.pageSizePreguntas);
  }

  public cancelar(){
    if(this.activo_curso){
      this._router.navigateByUrl('/profesor/cursos_activos');
    }
    else{
      this._router.navigateByUrl('/profesor/recursos_desactivados');
    }
    
  }

  public aceptarSolicitud(id:string){
    const profesor = "profesor"
    this.loading = true
    this._inscripcionService.putInscripcionEstado(id,{'estado':'ACEPTADA', 'mensaje': 'EL profesor '+profesor+' ha aceptado la solicitud'}).subscribe((data:any)=>{
      this.loading=false
      if(data['Response']=="exito"){
        Swal.fire(
          'Cambios guardados',
          'La solicitud ha sido aceptada.',
          'success'
        ).then((result)=>{
          this.getSolicitudes();
          this.getCursoDetalle();
        })
      }
    })
  }

  public sacarAlumno(id:string){
    Swal.fire({
      title: 'Desea eliminar al alumno del curso?',
      text: 'Estos cambios son irreversibles',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result)=>{
      if(result.value){
        this.loading=true
        this._cursoService.deleteAlumno({'id_curso': this.id_detalle, 'id_alumno':id}).subscribe((data:any)=>{
          this.loading=false
          if(data['Response']=='exito'){
            Swal.fire({
              title:'Cambios guardados',
              text:'Se ha sacado al alumno del curso!',
              type:'success',
              confirmButtonColor: '#2dce89',
            }).then((result)=>{
              if(result || result.dismiss){
                this.getSolicitudes();
                this.getCursoDetalle();
              }
            })
          }
        })
      }
      if(result.dismiss){}
    })
  }
  public rechazarSolicitud(id:string){
    Swal.fire({
      title: 'Desea rechazar la solicitud?',
      text: "Estos cambios son irreversibles!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        const profesor = "profesor"
        this.loading=true
        this._inscripcionService.putInscripcionEstado(id,{'estado':'RECHAZADA', 'mensaje': 'EL profesor '+profesor+' ha rechazado la solicitud'}).subscribe((data:any)=>{
          this.loading=false
          if(data['Response']=="exito"){
            Swal.fire({
              title:'Cambios guardados',
              text:'La solicitud ha sido rechazada correctamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar',
            }).then((result)=>{
              if(result || result.dismiss){
                this.getSolicitudes();
              }
            })
          }
        })
      }
      else if(result.dismiss){}
      
    })
  }

  public aceptarTodasSolicitudes(){
    this.loading=true
    this._inscripcionService.AceptarInscripcionesCurso(this.id_detalle).subscribe((data:any)=>{
      this.loading=false
      if(data['Response']=="exito"){
        Swal.fire({
          type:'success',
          title:'Registro exitoso',
          text: 'Se han aceptado todas las solicitudes correctamente',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2dce89',
        }).then((result)=>{
          if(result.value){
            this.getCursoDetalle();
            this.getSolicitudes();
            this.getActivoCurso();
          }
        })
      }
    })
  }

  public agregarAlumno(){
    Swal.fire({
      input:'text',
      title: 'Ingreso de Nuevo Alumno',
      text: 'Ingrese el nombre de usuario del alumno',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result)=>{
      if(result.dismiss==null){
        if(result.value!=""){
          this.loading=true
          this._alumnoService.postAlumnoCurso(result.value, this.id_detalle).subscribe((data:any)=>{
            this.loading=false
            if(data['Response']=='no_existe'){
              Swal.fire({
                type:'error',
                title:'Ha ocurrido un error',
                text: 'No existe un alumno con ese nombre de usuario',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2dce89',
              }).then((result)=>{
                if(result.value){
                  this.agregarAlumno()
                }
              })
            }
            if(data['Response']=='no_pertenece'){
              Swal.fire({
                type:'error',
                title:'Ha ocurrido un error',
                text: 'El nombre ingresado no pertenece a un alumno del grado del curso',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2dce89',
              }).then((result)=>{
                if(result.value){
                  this.agregarAlumno()
                }
              })
            }
            if(data['Response']=='si_pertenece'){
              Swal.fire({
                type:'warning',
                title:'Advertencia',
                text: 'El alumno ingresado ya se encuentra en el curso',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2dce89',
              }).then((result)=>{
                if(result.value){
                  this.agregarAlumno()
                }
              })
            }
            if(data['Response']=='exito'){
              Swal.fire({
                type:'success',
                title:'Registro exitoso',
                text: 'Se ha registrado correctamente al alumno en el curso',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2dce89',
              }).then((result)=>{
                if(result.value){
                  this.getCursoDetalle();
                  this.getSolicitudes();
                  this.getActivoCurso();
                }
              })
            }
          },
          (error:any)=>{})
        }
        else{
          Swal.fire({
            type:'error',
            title:'Ha ocurrido un error',
            text: 'No existe un alumno con ese nombre de usuario',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2dce89',
            }).then((result)=>{
            if(result.value){
              this.agregarAlumno()
            }
          })
        }
      }
    })
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
      title: 'Alternativas Pregunta '+numero_pregunta,
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
