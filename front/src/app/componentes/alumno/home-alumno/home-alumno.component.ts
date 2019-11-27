import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/servicios/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-alumno',
  templateUrl: './home-alumno.component.html',
  styleUrls: ['./home-alumno.component.css']
})
export class HomeAlumnoComponent implements OnInit {

	alumno: string;

  constructor(private _storageService: StorageService,
              private _router: Router) { 
  	this.alumno = "";
  }

  ngOnInit() {
    this._router.navigate(['/alumno'], {
      queryParams: {refresh: new Date().getTime()}})
  }

}
