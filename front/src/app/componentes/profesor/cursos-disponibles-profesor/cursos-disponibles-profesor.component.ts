import {Component,OnInit,Output,EventEmitter} from '@angular/core';
//SERVICIOS
import {CursoService} from '../../../servicios/curso.service';
import {AsignaturaService} from '../../../servicios/asignatura.service';
import { ProfesorService } from '../../../servicios/profesor.service';
import {StorageService} from '../../../servicios/storage.service';
import {GradoService} from '../../../servicios/grado.service';
//MODELOS
import {  Asignatura } from 'src/app/modelos/asignatura.model';
import {  Grado } from 'src/app/modelos/grado.model';
import { CursoBase } from 'src/app/modelos/curso_base.model';
import {Router} from '@angular/router';
import {Config} from 'src/app/config'
import swal from 'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-cursos-disponibles-profesor',
  templateUrl: './cursos-disponibles-profesor.component.html',
  styleUrls: ['./cursos-disponibles-profesor.component.css']
})
export class CursosDisponiblesProfesorComponent implements OnInit {
	cursos: CursoBase[]
	asignaturas: Asignatura[];
	grados: Grado[];
	pageCursos:number;
	pageSizeCursos:number;
	collectionSizeCursos:number;
	token:string
	id:string
	loading=false
	contadorLoading=0
  @Output()
  curso_nuevo = new EventEmitter < any > ();

  constructor(
		private _gradoService: GradoService, 
		private _cursoService: CursoService, 
		private _asignaturaService:AsignaturaService, 
		private _storageService: StorageService,
		private _profesorService: ProfesorService,
		private localService: LocalService,
		public tourService: TourService,
		private _router:Router)
		{
			this.pageCursos =1;
			this.pageSizeCursos = 4;
			this.asignaturas = []
			this.grados = []
			this.cursos = []
			this.tourService.enableHotkeys()
    		this.tourService.initialize([
				{
					anchorId: 'menu_profesor',
					content: 'Este es el menú de navegación. En el podrás accedes a las distintas funcionalidades de la plataforma.',
					placement: 'auto',
					title: 'Menu de Navegación',
					enableBackdrop: false,
					nextBtnTitle: 'Sig',
					prevBtnTitle	: 'Ant',
					endBtnTitle : 'Terminar',
				},
				{
					anchorId: 'menu_profesor.recursos_disponibles',
					content: 'En esta sección podras acceder a los recursos bases que pueden ser clonados para crear nuevos recursos.',
					placement: 'auto',
					title: 'Recursos Disponibles',
					enableBackdrop: false,
					nextBtnTitle: 'Sig',
					prevBtnTitle	: 'Ant',
					endBtnTitle : 'Terminar',
				},
				{
					anchorId: 'recursos_disponibles',
					content: 'Para clonar un recurso debes hacer click en el botón Agregar Recurso y completar los campos solicitados.',
					placement: 'auto',
					title: 'Recursos Disponibles',
					enableBackdrop: false,
					nextBtnTitle: 'Sig',
					prevBtnTitle	: 'Ant',
					endBtnTitle : 'Terminar',
				},
				{
					route:'profesor/cursos_activos'
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
		this.getAsignaturas();
		this.getCursosBase();
		this.tutorial();
  }
  public terminarTutorial(){
    this.tourService.end()
    this._profesorService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
    this._profesorService.getProfesor(this.id).subscribe((data:any)=>{
		if(data['primera_vez']){
        swal.fire({
          type:'question',
          title:'Tutorial Bienvenida!',
          text: 'Desea un recorrido dentro de la plataforma?',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'No mostrar',
          showCancelButton: true,
          confirmButtonColor: '#2dce89',
          cancelButtonColor: '#fb6340',
          allowEscapeKey: false,
          allowOutsideClick: false
  
        }).then((result)=>{
          if(result.dismiss ==null){
            this.tourService.start()
          }
  
          else{
            this._profesorService.finalizarTutorial(this.id).subscribe((data:any)=>{
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
  
        })
      }
    })

  }

  getCursosBase() {
    this._cursoService.getCursosBase().subscribe((data: CursoBase[] ) => {
		this.cursos = data;
		this.collectionSizeCursos = this.cursos.length
		for(let curso of this.cursos){
			if (curso.imagen == ""){
				curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/default"
			  }
			  else{
				curso.imagen = Config.API_SERVER_URL+"/recurso/imagen/"+curso.imagen
			  }
		}
		if(this.contadorLoading<1){
			this.contadorLoading= this.contadorLoading+1
		}
    });
  }

	getAsignaturas(){
		this._asignaturaService.getAsignaturas().subscribe((data:Asignatura[])=>{
			this.asignaturas = data;
		})
	}

	getGrados(){
		this._gradoService.getGrados().subscribe((data:Grado[])=>{
			this.grados = data;
		})
	}

	nuevoCurso(cursoBase:CursoBase){
		var asignaturas = {}
		asignaturas[""] = "Seleccione asignatura"
		for(let asignatura of this.asignaturas){
			asignaturas[asignatura.id]=asignatura.nombre
		}
		swal.fire({
			title:'Nombre del Recurso',text: 'Ingrese el nombre para el Recurso',
			input: 'text',
			cancelButtonText: 'Cancelar',
			confirmButtonColor: '#2dce89',
			cancelButtonColor: '#fb6340',
			confirmButtonText: 'Siguiente',
			showCancelButton: true,
			onOpen: function (){
				swal.disableConfirmButton();
				swal.getInput().addEventListener('keyup', function(e) {
				  if((<HTMLInputElement>event.target).value === '') {
					swal.disableConfirmButton();
				  } 
				  else {
					swal.enableConfirmButton();
				  }
				  })
			}

		}).then((result)=>{
			if(result.dismiss==null){
				var nombre = result.value
				swal.fire({
					type: 'question',
					title: 'Descripción del Recurso',
					text: 'Desea utilizar la misma descripción del recurso base?',
					cancelButtonText: 'No',
					confirmButtonColor: '#2dce89',
					cancelButtonColor: '#fb6340',
					confirmButtonText: 'Si',
					showCancelButton: true,
				}).then((result)=>{
					var descripcion
					if(result.value){
						if(cursoBase.descripcion==""||cursoBase.descripcion==null){
							descripcion = "sin descripcion"
						}
						else{
							descripcion = cursoBase.descripcion
						}
						swal.fire({
							title: 'Asignatura del Recurso',
							text: 'Seleccione Asignatura para el recurso',
							input: 'select',
							inputOptions: asignaturas,
							showCancelButton: true,
							cancelButtonText: 'Cancelar',
							confirmButtonColor: '#2dce89',
							cancelButtonColor: '#fb6340',
							confirmButtonText: 'Aceptar',
							inputValidator: function (value) {
								return new Promise(function (resolve, reject) {
								  if (value === "") {
									resolve('Debes seleccionar una asignatura')
								  } else {
									resolve()
								  }
								})
							  }
						}).then((result)=>{
							var asignatura
							if(result.dismiss==null){
								asignatura = result.value
								if(
									nombre =="" ||
									asignatura == "" ||
									descripcion == ""
								){
								swal.fire({
									type: 'error',
									title: 'Error en el registro',
									text: 'Debe completar todos los campos para clonar un curso',
									confirmButtonColor: '#2dce89',
									confirmButtonText: 'Aceptar',
								}).then((result)=>{
									this.nuevoCurso(cursoBase)
								})
								}
								else{
									this.loading=true
									this._cursoService.postCurso({"nombre":nombre, "descripcion": descripcion, "asignatura":asignatura, "curso_base": cursoBase.id}, this.token).subscribe(
										(data:any)=>{
											this.loading=false
											if(data['Response']=="exito"){
												this.guardarImagen(data['id'])
											}
										},
										(error)=>{console.log("error")}
									)
								}
							}
						})
					}
					else{
						if(result.dismiss.toString()=="cancel"){
							swal.fire({
								title: 'Descripción del Recurso',
								text: 'Escriba la descripción para el recurso',
								input: 'textarea',
								cancelButtonText: 'Cancelar',
								confirmButtonColor: '#2dce89',
								cancelButtonColor: '#fb6340',
								confirmButtonText: 'Aceptar',
								showCancelButton: true,
								onOpen: function (){
									swal.disableConfirmButton();
									swal.getInput().addEventListener('keyup', function(e) {
									  if((<HTMLInputElement>event.target).value === '') {
										swal.disableConfirmButton();
									  } 
									  else {
										swal.enableConfirmButton();
									  }
									  })
								  }
							}).then((result)=>{
								if(result.dismiss==null){
									descripcion = result.value
									swal.fire({
										title: 'Asignatura del Recurso',
										text: 'Seleccione Asignatura para el recurso',
										input: 'select',
										inputOptions: asignaturas,
										showCancelButton: true,
										cancelButtonText: 'Cancelar',
										confirmButtonColor: '#2dce89',
										cancelButtonColor: '#fb6340',
										confirmButtonText: 'Aceptar',
										inputValidator: function (value) {
											return new Promise(function (resolve, reject) {
											  if (value === "") {
												resolve('Debes seleccionar un tipo de pregunta')
											  } else {
												resolve()
											  }
											})
										  }
									}).then((result)=>{
										var asignatura
										if(result.dismiss==null){
											asignatura = result.value
											if(result.dismiss==null){
												if(
														nombre =="" ||
														asignatura == "" ||
														descripcion == ""
												)
												{
													swal.fire({
														type: 'error',
														title: 'Error en el registro',
														text: 'Debe completar todos los campos para clonar un curso',
														confirmButtonColor: '#2dce89',
														confirmButtonText: 'Aceptar',
													}).then((result)=>{
														this.nuevoCurso(cursoBase)
													})
												}
												else{
													this.loading=true
													this._cursoService.postCurso({"nombre":nombre, "descripcion": descripcion, "asignatura":asignatura, "curso_base": cursoBase.id},this.token).subscribe(
														(data:any)=>{
															this.loading=false
															if(data['Response']=="exito"){
																this.guardarImagen(data['id'])
															}
														},
														(error)=>{console.log("error")}
														)
												}
											}
										}
									})
								}
							})
						}
					}
				})
			}
		})
	}


  clonarCursoComponente(cursoBase:CursoBase) {
		swal.fire({
			title: 'Quiere clonar este recurso?',
			text: 'Se creará una copia con las mismas preguntas',
			type: 'question',
			showCancelButton: true,
			cancelButtonText: 'Cancelar',
			confirmButtonColor: '#2dce89',
			cancelButtonColor: '#fb6340',
			confirmButtonText: 'Aceptar'
			}).then((result) => {
				if(result.value){
					this.nuevoCurso(cursoBase)
				}
			})
	}

	guardarImagen(id:string){
		swal.fire({
			title: 'Imagen Recurso',
			text: 'Desea utilizar una nueva imagen distinta del recurso base?',
			type: 'question',
			showCancelButton: true,
			cancelButtonText: 'No',
			confirmButtonColor: '#2dce89',
			cancelButtonColor: '#fb6340',
			confirmButtonText: 'Si'
			}).then((result) => {
				if(result.value){
					swal.fire({
						text: 'Seleccione imagen de perfil',
						title: 'Imagen de Perfil',
						input: 'file',
						inputAttributes: {
							'accept': 'image/*',
							'aria-label': 'Upload your profile picture'
						},
						cancelButtonText: 'Cancelar',
						confirmButtonColor: '#2dce89',
						cancelButtonColor: '#fb6340',
						confirmButtonText: 'Aceptar'
					}).then((result)=>{
						if(result.value){
							var file = result.value
							if(file != null){
								var formData = new FormData()
								formData.append('imagen',file)
								this._cursoService.uploadImage(formData, id).subscribe((data:any)=>{
									if(data['Response']=="exito"){
										swal.fire({
											title: 'Registro exitoso',
											text: 'Se ha agregado la imagen exitosamente!',
											type: 'success',
											confirmButtonColor: '#2dce89',
										}).then((result)=>{
											this._router.navigateByUrl("profesor/detalle_recurso/"+id)
										})
									}
								},
								(error)=>{console.log("error")})
							}
							else{
								this._cursoService.uploadImageDefault(id).subscribe((data:any)=>{
									if(data['Response']=="exito"){
										swal.fire({
											title: 'Registro exitoso',
											text: 'Se ha agregado la imagen exitosamente',
											type: 'success',
											confirmButtonColor: '#2dce89',
										}).then((result)=>{
											this._router.navigateByUrl("profesor/detalle_recurso/"+id)
										})
									}
								})
							}
						}
						else{
							this._cursoService.uploadImageDefault(id).subscribe(
								(data:any)=>{
									if(data['Response']=="exito"){
										swal.fire({
											type: 'success',
											title: 'Registro exitoso',
											text: 'Se ha clonado el recurso exitosamente',
											confirmButtonColor: '#2dce89',
											confirmButtonText: 'Aceptar'
										}).then((result)=>{
											this._router.navigateByUrl("profesor/detalle_recurso/"+id)
										})
									}
								}
							)
						}
					})
				}
				else{
					this._cursoService.uploadImageDefault(id).subscribe(
						(data:any)=>{
							if(data['Response']=="exito"){
								swal.fire({
									type: 'success',
									title: 'Registro exitoso',
									text: 'Se ha clonado el recurso exitosamente',
									confirmButtonColor: '#2dce89',
									confirmButtonText: 'Aceptar'
								}).then((result)=>{
									this._router.navigateByUrl("profesor/detalle_recurso/"+id)
								})
							}
						}
					)
				}
		})
	}

	get cursos_tabla(): any[] {
		return this.cursos
		  .map((profesor, i) => ({id: i + 1, ...profesor}))
		  .slice((this.pageCursos - 1) * this.pageSizeCursos, (this.pageCursos- 1) * this.pageSizeCursos + this.pageSizeCursos);
	}

	previewRecursoBase(id:string){
		this._router.navigateByUrl('profesor/recurso_disponible/'+id+'/detalle');
	}
}