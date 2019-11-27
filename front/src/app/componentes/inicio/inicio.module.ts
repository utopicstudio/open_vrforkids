import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { HttpClientModule, HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import {NgbModule, NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { ReactiveFormsModule} from '@angular/forms';
// register 'es' locale
registerLocaleData(localeEs);


//COMPONENTES
import { LoginInicioComponent } from './login-inicio/login-inicio.component';
import { HeaderInicioComponent } from './header-inicio/header-inicio.component';
import { FooterInicioComponent } from './footer-inicio/footer-inicio.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
//SERVICIOS
const routes: Routes = [
    { path: '', component: LoginInicioComponent },
];

@NgModule({
    imports: [
        ChartsModule,
        NgbModule,
        NgbPaginationModule,
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ChartsModule,
        NgbModule,
        NgxLoadingModule.forRoot({
            animationType: ngxLoadingAnimationTypes.wanderingCubes,
            backdropBackgroundColour: 'rgba(0,0,0,0.1)', 
            backdropBorderRadius: '4px',
            primaryColour: '#ffffff', 
            secondaryColour: '#ffffff', 
            tertiaryColour: '#ffffff'
        })
    ],
    declarations: [
        LoginInicioComponent,
        HeaderInicioComponent,
        FooterInicioComponent,
    ],
    exports: [
        RouterModule
    ],
    providers:[]
})
export class InicioModule { }