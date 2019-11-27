import { Component, OnInit, QueryList, ViewChildren,Output, EventEmitter} from '@angular/core';
import { AlumnoService } from '../../../servicios/alumno.service';
import { ProfesorService } from '../../../servicios/profesor.service';
import { GradoService } from '../../../servicios/grado.service';
import { StorageService } from '../../../servicios/storage.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { Router } from '@angular/router';
import swal from'sweetalert2';
import * as $ from 'jquery';
import { Config } from '../../../config';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-perfiles-administrador',
  templateUrl: './perfiles-administrador.component.html',
  styleUrls: ['./perfiles-administrador.component.css']
})
export class PerfilesAdministradorComponent implements OnInit {
  pageAlumno: number;
  pageProfesor: number;
  pageSizeAlumno: number;
  pageSizeProfesor: number;
  collectionSizeAlumno: number;
  collectionSizeProfesor: number;
  alumnos:any=[];
  profesores:any=[];
  alumno_editar:any;
  profesor_editar:any;
  tipo_nuevo_perfil:string;
  token:string
  id:string
  loading = true;
  contadorLoading = 0
  loadingPantalla = false
  @Output() nuevo_perfil = new EventEmitter<any>()
  @Output() detalle_perfil = new EventEmitter<any>()

  constructor(private _alumnoService: AlumnoService, 
    private _profesorService: ProfesorService, 
    private _router:Router, 
    private _gradoService: GradoService,
    private _storageService: StorageService,
    private localService: LocalService,
    private _administradorService: AdministradorService,
    public tourService: TourService
    ) { 
    this.pageAlumno = 1;
    this.pageProfesor = 1;
    this.pageSizeAlumno = 4;
    this.pageSizeProfesor = 4;
    this.alumno_editar = [];
    this.tourService.enableHotkeys()

    this.tourService.initialize([
      {
        anchorId: 'menu.perfiles',
        content: 'En esta sección podrás crear, editar y eliminar los perfiles de usuarios de la plataforma.',
        placement: 'rigth',
        title: 'Sección Perfiles',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'perfiles.tabla',
        content: 'En esta sección econtrarás el detalle tanto de los alumnos, como profesores registrados. Además de poder acceder a un detalle de cada perfil.',
        placement: 'rigth',
        title: 'Perfiles de Usuario',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'perfiles.pestana.estudiantes',
        content: 'Por defecto, lo primero que verás será la información de los estudiantes registrados, pudiendo editarlos, eliminarlos y ver el detalle de cada uno.',
        placement: 'rigth',
        title: 'Estudiantes',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'perfiles.pestana.profesores',
        content: 'Si deseas ver los profesores registrados deberás clickear esta pestaña, en donde se listarán cada uno de ellos.',
        placement: 'rigth',
        title: 'Profesores',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'perfiles.boton.nuevo_estudiante',
        content: 'Si deseas crear un nuevo estudiante o profesor deberás clickear este botón, el que dependerá de la pestaña que se enceuntre activa.',
        placement: 'rigth',
        title: 'Nuevo Estudiante/Profesor',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        route:'admin/recursos'
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
    this.loadingPantalla = false;
    this.loading = true;
    this.getAlumnos();
    this.getProfesores();
    this.tutorial();
    this.loadingPantalla = true;
    this.loading = false;
    
  }

  public terminarTutorial(){
    this.tourService.end()
    this._administradorService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
    this._administradorService.getAdministrador(this.id).subscribe((data:any)=>{
      if(data['primera_vez']){
        this.tourService.start()
      }
    })
  }


  public verDetallePerfil(tipo:string,id:string){
    if(tipo=='alumno'){
      this._router.navigateByUrl('/admin/perfiles/detalle_alumno/'+id)
    }
    if(tipo=='profesor'){
      this._router.navigateByUrl('/admin/perfiles/detalle_profesor/'+id)
    }
  }
  get alumnos_tabla(): any[] {
    return this.alumnos
      .map((alumno, i) => ({id: i + 1, ...alumno}))
      .slice((this.pageAlumno - 1) * this.pageSizeAlumno, (this.pageAlumno - 1) * this.pageSizeAlumno + this.pageSizeAlumno);
  }

  get profesores_tabla(): any[] {
    return this.profesores
      .map((profesor, i) => ({id: i + 1, ...profesor}))
      .slice((this.pageProfesor - 1) * this.pageSizeProfesor, (this.pageProfesor - 1) * this.pageSizeProfesor + this.pageSizeProfesor);
  }

  public getAlumnos(){
  	this._alumnoService.getAlumnos().subscribe((data: Array<any>) => {
      this.alumnos = data;
      for(let alumno of this.alumnos){
        if (alumno.imagen == ""){
          alumno.imagen = Config.API_SERVER_URL+"/alumno/imagen/default"
        }
        else{
          alumno.imagen = Config.API_SERVER_URL+"/alumno/imagen/"+alumno.imagen
        }
        
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
      this.collectionSizeAlumno = this.alumnos.length;
    });
  }

  public getProfesores(){
  	this._profesorService.getProfesores().subscribe((data: Array<any>) => {
      this.profesores = data;
      for(let profesor of this.profesores){
        if (profesor.imagen == ""){
          profesor.imagen = Config.API_SERVER_URL+"/profesor/imagen/default"
        }
        else{
          profesor.imagen = Config.API_SERVER_URL+"/profesor/imagen/"+profesor.imagen
        }
      }
      if(this.contadorLoading<2){
        this.contadorLoading = this.contadorLoading +1
      }
      this.collectionSizeProfesor = this.profesores.length;
    });
  }

  public generarVistaNuevoPerfil(tipo:string){
    this._router.navigateByUrl('/admin/perfiles/nuevo_perfil/'+tipo)
  }

  public nuevo_alumno(){
    this._gradoService.getGrados().subscribe((data:any)=>{
      var grados = {}
      grados[""] = "Seleccione curso"
      for(let grado of data){
        grados[grado.id] = grado['nivel'].toString()+"°"+grado['identificador']
      }
      swal.mixin({
        title: 'Nuevo Alumno',
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        progressSteps: ['1', '2', '3', '4'],
        confirmButtonColor: '#2dce89',
        cancelButtonColor: '#fb6340',
      }).queue([
        {
          title: 'Datos Personales',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input1').val() === '' || $('#swal-input2').val() === '' || $('#swal-input3').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
              'nombres': $('#swal-input1').val(),
              'apellido_paterno': $('#swal-input2').val(),
              'apellido_materno':  $('#swal-input3').val() 
            }
          },
          html:
            '<label>Nombres</label>'+
            '<input id="swal-input1" class="swal2-input placeholders="nombres" value ="">' +
            '<label>Apellido Paterno</label>'+
            '<input id="swal-input2" class="swal2-input placeholders="apellido_paterno" value="">'+
            '<label>Apellido Materno</label>'+
            '<input id="swal-input3" class="swal2-input placeholders="apellido_materno" value="">',
        },
        {
          title: 'Datos Contacto',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
                'email':$('#swal-input4').val(),
                'telefono':$('#swal-input5').val()
            }
          },
          html:
            '<label>Email</label>'+
            '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="">' +
            '<label>Telefono</label>'+
            '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="">'
        },
        {
          title: 'Datos Académicos',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
                'nombre_usuario':$('#swal-input4').val(),
                'matricula':$('#swal-input5').val(),
                'grado':$('#swal-input5').val(),
  
            }
          },
          html:
            '<label>Nombre usuario</label>'+
            '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="">' +
            '<label>Matricula</label>'+
            '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="">'
        },
        {
          title: 'Datos Curso',
          text: 'Seleccione curso del alumno',
          input: 'select',
          inputOptions: grados,
          inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
              if (value === "") {
                resolve('Debes seleccionar un curso')
              } else {
                resolve()
              }
            })
          }

        }
      ]).then((result)=> {
        if(result.value){
          if(
            result.value[0].nombres=="" ||
            result.value[0].apellido_paterno=="" ||
            result.value[0].apellido_materno=="" ||
            result.value[1].telefono=="" ||
            (result.value[1].email=="" || this.validarEmail(result.value[1].email)) ||
            result.value[2].nombre_usuario=="" ||
            result.value[2].matricula=="" ||
            result.value[3]==""
            )
          {
            swal.fire({
              type: 'error',
              title: 'Error en el Registro',
              text: 'Campos invalidos para crear un estudiante',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
              this.nuevo_alumno()
            })
          }
          else{
             const data={
              'nombres':result.value[0].nombres,
              'apellido_paterno':result.value[0].apellido_paterno,
              'apellido_materno':result.value[0].apellido_materno,
              'telefono':result.value[1].telefono,
              'email':result.value[1].email,
              'nombre_usuario':result.value[2].nombre_usuario,
              'matricula':result.value[2].matricula,
              'grado': result.value[3]
            }
            this.loading = true;
            this._alumnoService.postAlumno(data).subscribe((data:any)=>{
              if(data['Response']=='exito'){
                this.loading = false;
                swal.fire({
                  type:'question',
                  title: 'Imagen de Perfil',
                  text: 'Desea agregar una foto de perfil?',
                  confirmButtonColor: '#2dce89',
                  cancelButtonColor: '#fb6340',
                  confirmButtonText: 'Si',
                  cancelButtonText: 'No',
                  showCancelButton: true
                }).then((result)=>{
                  if(result.dismiss == null){
                    swal.fire({
                      title: 'Imagen de Perfil',
                      text: 'Seleccione una imagen',
                      input: 'file',
                      inputAttributes: {
                        'accept': 'image/*',
                        'aria-label': 'Seleccione una imagen de perfil'
                      }
                    }).then((result)=>{
                      var file = result.value
                      if(file != null){
                        this.loading = true;
                        var formData = new FormData()
                        formData.append('imagen',file)
                        this._alumnoService.uploadImage(formData, data['id']).subscribe((data:any)=>{
                          if(data['Response']=="exito"){
                            this.loading = false;
                            swal.fire({
                              title: 'Registro exitoso',
                              text: 'Se ha agregado al alumno exitosamente!',
                              type: 'success',
                              confirmButtonColor: '#2dce89',
                            }).then((result)=>{
                              this.getAlumnos()
                            })
                          }
                        },
                        (error)=>{console.log("error")})
                      }
                      else{
                        this.loading = true;
                        this._alumnoService.uploadImageDefault(data['id']).subscribe((data:any)=>{
                          if(data['Response']=="exito"){
                            this.loading = false;
                            swal.fire({
                              title: 'Registro exitoso',
                              text: 'Se ha agregado al alumno exitosamente',
                              type: 'success',
                              confirmButtonColor: '#2dce89',
                            }).then((result)=>{
                              this.getAlumnos()
                            })
                          }
                        })
                      }
                    })
                  }
                  else{
                    this.loading = true;
                    this._alumnoService.uploadImageDefault(data['id']).subscribe((data:any)=>{
                      if(data['Response']=="exito"){
                        this.loading = false;
                        swal.fire({
                          title: 'Registro exitoso',
                          text: 'Se ha agregado al alumno exitosamente',
                          type: 'success',
                          confirmButtonColor: '#2dce89',
                        }).then((result)=>{
                          this.getAlumnos()
                        })
                      }
                    })
                  }
                })
              }
            }) 
          }
        }
      })
    })
  }


  public nuevo_profesor(){
    swal.mixin({
      title: 'Nuevo Profesor',
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      progressSteps: ['1', '2', '3','4'],
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
    }).queue([
      {
        title: 'Datos Personales',
        onOpen: function (){
          swal.disableConfirmButton();
          swal.getContent().addEventListener('keyup',function(e){
            if($('#swal-input1').val() === '' || $('#swal-input2').val() === '' || $('#swal-input3').val() === '') {
              swal.disableConfirmButton();
            } 
            else {
              swal.enableConfirmButton();
            }
          })
        },
        preConfirm: function () {
          return {
            'nombres': $('#swal-input1').val(),
            'apellido_paterno': $('#swal-input2').val(),
            'apellido_materno':  $('#swal-input3').val() 
          }
        },
        html:
          '<label>Nombres</label>'+
          '<input id="swal-input1" class="swal2-input placeholders="nombres" value ="">' +
          '<label>Apellido Paterno</label>'+
          '<input id="swal-input2" class="swal2-input placeholders="apellido_paterno" value="">'+
          '<label>Apellido Materno</label>'+
          '<input id="swal-input3" class="swal2-input placeholders="apellido_materno" value="">',
      },
      {
        title: 'Datos Contacto',
        onOpen: function (){
          swal.disableConfirmButton();
          swal.getContent().addEventListener('keyup',function(e){
            if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
              swal.disableConfirmButton();
            } 
            else {
              swal.enableConfirmButton();
            }
          })
        },
        preConfirm: function () {
          return {
              'email':$('#swal-input4').val(),
              'telefono':$('#swal-input5').val()
          }
        },
        html:
          '<label>Email</label>'+
          '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="">' +
          '<label>Telefono</label>'+
          '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="">'
      },
      {
        title: 'Datos Académicos',
        onOpen: function (){
          swal.disableConfirmButton();
          swal.getContent().addEventListener('keyup',function(e){
            if($('#swal-input4').val() === '') {
              swal.disableConfirmButton();
            } 
            else {
              swal.enableConfirmButton();
            }
          })
        },
        preConfirm: function () {
          return {
              'nombre_usuario':$('#swal-input4').val(),
          }
        },
        html:
          '<label>Nombre usuario</label>'+
          '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="">'
      },
    ]).then((result)=> {
      if(result.value){
        if(
          result.value[0].nombres=="" ||
          result.value[0].apellido_paterno=="" ||
          result.value[0].apellido_materno=="" ||
          result.value[1].telefono=="" ||
          result.value[1].email=="" ||
          result.value[2].nombre_usuario=="" ||
          this.validarEmail(result.value[1].email)
          )
        {
          swal.fire({
            type: 'error',
            title: 'Error en el Registro',
            text: 'Campos invalidos para crear un profesor',
            confirmButtonColor: '#2dce89',
            confirmButtonText: 'Aceptar'
          }).then((result)=>{
            this.nuevo_profesor()
          })
        }
        else{
          const data={
            'nombres':result.value[0].nombres,
            'apellido_paterno':result.value[0].apellido_paterno,
            'apellido_materno':result.value[0].apellido_materno,
            'telefono':result.value[1].telefono,
            'email':result.value[1].email,
            'nombre_usuario':result.value[2].nombre_usuario,
          }
          this.loading = true;
          this._profesorService.postProfesor(data,this.token).subscribe((data:any)=>{
            if(data['Response']=='exito'){
              this.loading = false;
              swal.fire({
                type:'question',
                title: 'Imagen de Perfil',
                text: 'Desea agregar una foto de perfil?',
                confirmButtonColor: '#2dce89',
                cancelButtonColor: '#fb6340',
                confirmButtonText: 'Si',
                cancelButtonText: 'No',
                showCancelButton: true
              }).then((result)=>{
                if(result.dismiss == null){
                  swal.fire({
                    title: 'Imagen de Perfil',
                    text: 'Seleccione una imagen',
                    input: 'file',
                    inputAttributes: {
                      'accept': 'image/*',
                      'aria-label': 'Seleccione una imagen de perfil'
                    }
                  }).then((result)=>{
                    var file = result.value
                    if(file != null){
                      this.loading = true;
                      var formData = new FormData()
                      formData.append('imagen',file)
                      this._profesorService.uploadImage(formData, data['id']).subscribe((data:any)=>{
                        if(data['Response']=="exito"){
                          this.loading = false;
                          swal.fire({
                            title: 'Registro exitoso',
                            text: 'Se ha agregado al profesor exitosamente!',
                            type: 'success',
                            confirmButtonColor: '#2dce89',
                          }).then((result)=>{
                            this.getProfesores()
                          })
                        }
                      },
                      (error)=>{console.log("error")})
                    }
                    else{
                      this.loading = true;
                      this._profesorService.uploadImageDefault(data['id']).subscribe((data:any)=>{
                        if(data['Response']=="exito"){
                          this.loading = false;
                          swal.fire({
                            title: 'Registro exitoso',
                            text: 'Se ha agregado al profesor exitosamente',
                            type: 'success',
                            confirmButtonColor: '#2dce89',
                          }).then((result)=>{
                            this.getProfesores()
                          })
                        }
                      })
                    }
                  })
                }
                else{
                  this.loading = true;
                  this._profesorService.uploadImageDefault(data['id']).subscribe((data:any)=>{
                    if(data['Response']=="exito"){
                      this.loading = false;
                      swal.fire({
                        title: 'Registro exitoso',
                        text: 'Se ha agregado al profesor exitosamente',
                        type: 'success',
                        confirmButtonColor: '#2dce89',
                      }).then((result)=>{
                        this.getProfesores()
                      })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  }

  public deleteAlumno(id:string){
    swal.fire({
      title: 'Desea borrar este perfil?',
      text: "Usted no podrá revertir los cambios!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this._alumnoService.deleteAlumno(id).subscribe((data:any)=>{
          this.loading = true;
          if(data['Response']=='borrado'){
            this.loading = false;
            swal.fire({
              title:'Borrado!',
              text:'Se ha borrado registro exitosamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
            }).then((result)=>{
              if(result.value){
                this.getAlumnos();
              }
            })
          }
          this.loading = false;
        })
      }
    })
  }

  public deleteProfesor(id:string){
    swal.fire({
      title: 'Desea borrar este perfil?',
      text: "Usted no podrá revertir los cambios!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2dce89',
      cancelButtonColor: '#fb6340',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this._profesorService.deleteProfesor(id).subscribe((data:any)=>{
          if(data['Response']=='borrado'){
            this.loading = false;
            swal.fire({
              title:'Borrado!',
              text:'Se ha borrado registro exitosamente.',
              type:'success',
              confirmButtonColor: '#2dce89',
            }).then((result)=>{
              if(result.value){
                this.getProfesores();
              }
            })
          }
        })
        this.loading = false;
      }
    })
  }

  public editarProfesor(id:any){
    this._profesorService.getProfesor(id).subscribe((data:any)=>{
      this.profesor_editar = data
      swal.mixin({
        title: 'Edición Profesor',
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Cancenlar',
        showCancelButton: true,
        progressSteps: ['1', '2', '3'],
        confirmButtonColor: '#2dce89',
        cancelButtonColor: '#fb6340',
      }).queue([
        {
          title: 'Datos Personales',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input1').val() === '' || $('#swal-input2').val() === '' || $('#swal-input3').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
              'nombres': $('#swal-input1').val(),
              'apellido_paterno': $('#swal-input2').val(),
              'apellido_materno':  $('#swal-input3').val() 
            }
          },
          html:
            '<label>Nombres</label>'+
            '<input id="swal-input1" class="swal2-input placeholders="nombres" value ="'+this.profesor_editar.nombres+'">' +
            '<label>Apellido Paterno</label>'+
            '<input id="swal-input2" class="swal2-input placeholders="apellido_paterno" value="'+this.profesor_editar.apellido_paterno+'">'+
            '<label>Apellido Materno</label>'+
            '<input id="swal-input3" class="swal2-input placeholders="apellido_materno" value="'+this.profesor_editar.apellido_materno+'">',
        },
        {
          title: 'Datos Contacto',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
                'email':$('#swal-input4').val(),
                'telefono':$('#swal-input5').val()
            }
          },
          html:
            '<label>Email</label>'+
            '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="'+this.profesor_editar.email+'">' +
            '<label>Telefono</label>'+
            '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="'+this.profesor_editar.telefono+'">'
        },
        {
          title: 'Datos Académicos',
          onOpen: function (){
            swal.disableConfirmButton();
            swal.getContent().addEventListener('keyup',function(e){
              if($('#swal-input4').val() === '') {
                swal.disableConfirmButton();
              } 
              else {
                swal.enableConfirmButton();
              }
            })
          },
          preConfirm: function () {
            return {
                'nombre_usuario':$('#swal-input4').val(),
            }
          },
          html:
            '<label>Nombre usuario</label>'+
            '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="'+this.profesor_editar.nombre_usuario+'">'
        }
      ]).then((result)=> {
        if(result.dismiss==null){
          if(this.validarEmail(result.value[1].email)){
            swal.fire({
              type: 'error',
              title: 'Error en Edición',
              text: 'Email invalido',
              confirmButtonColor: '#2dce89',
              confirmButtonText: 'Aceptar'
            }).then((result)=>{
              this.editarAlumno(id)
            })
          }
          else{
            const data={
              'nombres':result.value[0].nombres,
              'apellido_paterno':result.value[0].apellido_paterno,
              'apellido_materno':result.value[0].apellido_materno,
              'telefono':result.value[1].telefono,
              'email':result.value[1].email,
              'nombre_usuario':result.value[2].nombre_usuario,
            }
            this.loading = true;
            this._profesorService.putProfesor(this.profesor_editar.id,data).subscribe((data:any)=>{
              if(data['Response']=='exito'){
                this.loading = false;
                swal.fire({
                  title: 'Registro exitoso',
                  text: 'Se ha editado al profesor exitosamente!',
                  type: 'success',
                  confirmButtonColor: '#2dce89',
                }).then((result)=>{
                if(result){
                    this.getProfesores()
                }
                })
              }
            })
            this.loading = false;
          }
        }
      })
    })
  }
  public editarAlumno(id:any){
    this._alumnoService.getAlumno(id).subscribe((data:any)=>{
      this.alumno_editar = data
      this._gradoService.getGrados().subscribe((data:any)=>{
        var grados = {}
        var grado_actual = ""
        for(let grado of data){
          if(grado.id == this.alumno_editar.grado){
            grado_actual = grado['nivel'].toString()+"°"+grado['identificador']
          }
          grados[grado.id] = grado['nivel'].toString()+"°"+grado['identificador']
        }
        swal.mixin({
          title: 'Edicion Alumno',
          confirmButtonText: 'Siguiente',
          cancelButtonText: 'Cancenlar',
          showCancelButton: true,
          progressSteps: ['1', '2', '3', '4'],
          confirmButtonColor: '#2dce89',
          cancelButtonColor: '#fb6340',
        }).queue([
          {
            title: 'Datos Personales',
            onOpen: function (){
              swal.disableConfirmButton();
              swal.getContent().addEventListener('keyup',function(e){
                if($('#swal-input1').val() === '' || $('#swal-input2').val() === '' || $('#swal-input3').val() === '') {
                  swal.disableConfirmButton();
                } 
                else {
                  swal.enableConfirmButton();
                }
              })
            },
            preConfirm: function () {
              return {
                'nombres': $('#swal-input1').val(),
                'apellido_paterno': $('#swal-input2').val(),
                'apellido_materno':  $('#swal-input3').val()
              }
            },
            html:
              '<label>Nombres</label>'+
              '<input id="swal-input1" class="swal2-input placeholders="nombres" value ="'+this.alumno_editar.nombres+'">' +
              '<label>Apellido Paterno</label>'+
              '<input id="swal-input2" class="swal2-input placeholders="apellido_paterno" value="'+this.alumno_editar.apellido_paterno+'">'+
              '<label>Apellido Materno</label>'+
              '<input id="swal-input3" class="swal2-input placeholders="apellido_materno" value="'+this.alumno_editar.apellido_materno+'">',
          },
          {
            title: 'Datos Contacto',
            onOpen: function (){
              swal.disableConfirmButton();
              swal.getContent().addEventListener('keyup',function(e){
                if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
                  swal.disableConfirmButton();
                } 
                else {
                  swal.enableConfirmButton();
                }
              })
            },
            preConfirm: function () {
              return {
                  'email':$('#swal-input4').val(),
                  'telefono':$('#swal-input5').val()
              }
            },
            html:
              '<label>Email</label>'+
              '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="'+this.alumno_editar.email+'">' +
              '<label>Telefono</label>'+
              '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="'+this.alumno_editar.telefono+'">'
          },
          {
            title: 'Datos Académicos',
            onOpen: function (){
              swal.disableConfirmButton();
              swal.getContent().addEventListener('keyup',function(e){
                if($('#swal-input4').val() === '' || $('#swal-input5').val() === '') {
                  swal.disableConfirmButton();
                } 
                else {
                  swal.enableConfirmButton();
                }
              })
            },
            preConfirm: function () {
              return {
                  'nombre_usuario':$('#swal-input4').val(),
                  'matricula':$('#swal-input5').val()
              }
            },
            html:
              '<label>Nombre usuario</label>'+
              '<input type="email" id="swal-input4" class="swal2-input placeholders="email" value ="'+this.alumno_editar.nombre_usuario+'">' +
              '<label>Matricula</label>'+
              '<input id="swal-input5" class="swal2-input placeholders="telefono" value ="'+this.alumno_editar.matricula+'">'
          },
          {
            title: 'Datos Curso',
            text: 'Seleccione curso del alumno',
            input: 'select',
            inputOptions: grados,
            inputPlaceholder: grado_actual,
          }
        ]).then((result)=> {
          if(result.value){
            var curso_nuevo = ""
            if(result.value[3]==""){
              curso_nuevo = this.alumno_editar.grado
            }
            else{
              curso_nuevo = result.value[3]
            }
            if(this.validarEmail(result.value[1].email)){
              swal.fire({
                type: 'error',
                title: 'Error en Edición',
                text: 'Email invalido',
                confirmButtonColor: '#2dce89',
                confirmButtonText: 'Aceptar'
              }).then((result)=>{
                this.editarAlumno(id)
              })
            }
            else{
              const data={
                'nombres':result.value[0].nombres,
                'apellido_paterno':result.value[0].apellido_paterno,
                'apellido_materno':result.value[0].apellido_materno,
                'telefono':result.value[1].telefono,
                'email':result.value[1].email,
                'nombre_usuario':result.value[2].nombre_usuario,
                'matricula':result.value[2].matricula,
                'grado': curso_nuevo
              }
              this.loading = true;
              this._alumnoService.putAlumno(data,this.alumno_editar.id).subscribe((data:any)=>{
                if(data['Response']=='exito'){
                  this.loading = false;
                  swal.fire({
                    title: 'Registro exitoso',
                    text: 'Se ha editado al alumno exitosamente!',
                    type: 'success',
                    confirmButtonColor: '#2dce89',
                  }).then((result)=>{
                  if(result){
                      this.getAlumnos()
                  }
                  })
                }
              })
              this.loading = false;
            }
          }
        })
      })
    })
  }

  validarEmail(email:string){
    var bandera = true
    for(let letra of email){
      if(letra == "@"){
        bandera = false
      }
    }
    return bandera
  }


}
