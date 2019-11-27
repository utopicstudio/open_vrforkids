import { Component, OnInit, AfterViewInit} from '@angular/core';
import { AlumnoService } from 'src/app/servicios/alumno.service';
import { ProfesorService } from 'src/app/servicios/profesor.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { CursoService } from 'src/app/servicios/curso.service';
import { AdministradorService } from 'src/app/servicios/administrador.service';
import { Router } from '@angular/router'
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import swal from'sweetalert2';
import { TourService, IStepOption } from 'ngx-tour-md-menu';
import { LocalService } from 'src/app/servicios/local.service';
@Component({
  selector: 'app-home-administrador',
  templateUrl: './home-administrador.component.html',
  styleUrls: ['./home-administrador.component.css']
})
export class HomeAdministradorComponent implements OnInit {
  administrador:any;
  cant_estudiantes:number;
  cant_profesores:number;
  cant_cursos:number;
  loadedBarras:boolean = false
  loadedTorta:boolean = false
  contadorLoading = 0
  token:string
  id:string
  loading = true;
  loadingPantalla = false
  barChartLabels: String[] = [];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  }
  public barChartPlugins = [pluginDataLabels];
  public barChartData: ChartDataSets[] = [];

  public polarAreaChartLabels: String[] = [];
  public polarAreaChartData: number[] = []
  public polarAreaLegend = true;

  public polarAreaChartType: ChartType = 'polarArea';

  constructor(private _alumnoService: AlumnoService, 
    private _profesorService: ProfesorService,
    private _storageService: StorageService,
    private localService: LocalService,
    private _cursoService: CursoService,
    private _router: Router,
    private _administradorService: AdministradorService,
    public tourService: TourService
  ) 
  {
    this.tourService.enableHotkeys()

    this.tourService.initialize([
      {
        anchorId: 'menu',
        content: 'Este es el menú de navegación. En el podrás accedes a las distintas funcionalidades de la plataforma.',
        placement: 'auto',
        title: 'Menu de Navegación',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'menu.home',
        content: 'En la sección de "Home" encontrarás graficós que resumen la información sobre los recursos activos.',
        placement: 'auto',
        title: 'Sección Home',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'home.graph1',
        content: 'En este gráfico podrás observar la aprobación y la desaprobación de los recursos que se encuentran activos en la plataforma.',
        placement: 'auto',
        title: 'Aprobación y Desaprobación de Recursos',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        anchorId: 'home.graph2',
        content: 'En este gráfico se resumen la cantidad de recursos activos por asignaturas.',
        placement: 'auto',
        title: 'Cursos activos en asignaturas',
        enableBackdrop: false,
        nextBtnTitle: 'Sig',
        prevBtnTitle	: 'Ant',
        endBtnTitle : 'Terminar',
      },
      {
        route:'admin/perfiles'
      }
    ])

    this.administrador = []
    this.cant_cursos=0;
    this.cant_estudiantes=0;
    this.cant_profesores=0;
  }


  ngOnInit() {
    this.loadingPantalla = false;
    this.loading = true;
    if(this._storageService.getCurrentToken()==null || this._storageService.getCurrentUser().id==null){
      this.token = this.localService.getToken()
      this.id = this.localService.getId()
    }
    else{
      this.token = this._storageService.getCurrentToken()
      this.id = this._storageService.getCurrentUser().id
    }
    this.getAdministrador();
    this.getCursos();
    this.getAlumnos();
    this.getProfesores();
    this.getCursosAprobacionGrafico()
    this.getCursosAsignaturaGrafico()
    this.tutorial();
    this.loadingPantalla = true;
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
  
        })
      }
    })

  }

  public getCursosAprobacionGrafico(){
    this.loading = true
    this._cursoService.getCursosAprobacionGrafico(this.administrador.id).subscribe((data:any)=>{
      this.barChartData = data['data']
      this.barChartLabels = data['labels']
      this.loadedBarras = true
      this.loading = false;
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public getCursosAsignaturaGrafico(){
    this.loading = true
    this._cursoService.getCursosAsignaturaGrafico().subscribe((data:any)=>{
      this.polarAreaChartLabels = data['labels']
      this.polarAreaChartData = data['data']
      this.loadedTorta = true
      this.loading = false
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public getCursos(){
    this.loading = true
    this._cursoService.getCursos().subscribe((data:any)=>{
      this.cant_cursos = data.lengt
      this.loading = false
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public getAlumnos(){
    this.loading = true
    this._alumnoService.getAlumnos().subscribe((data:any)=>{
      this.cant_estudiantes = data.length
      this.loading = false
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public getProfesores(){
    this.loading = true
    this._profesorService.getProfesores().subscribe((data:any)=>{
      this.cant_profesores = data.length
      this.loading = false
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

  public getAdministrador(){
    this.loading = true
    this._administradorService.getAdministrador(this.id).subscribe((data:any)=>{
      this.administrador = data
      this.loading = false
      if(this.contadorLoading<6){
        this.contadorLoading = this.contadorLoading +1
      }
    })
  }

}
