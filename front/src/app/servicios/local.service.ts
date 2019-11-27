import { Injectable } from '@angular/core';

@Injectable()
export class LocalService {
    token:string
    id:string
    constructor() { }
    getToken(){
        return this.token
    }
    setToken(token_nuevo:string){
        this.token = token_nuevo
    }
    getId(){
        return this.id
    }
    setId(id_nuevo:string){
        this.id = id_nuevo
    }
}