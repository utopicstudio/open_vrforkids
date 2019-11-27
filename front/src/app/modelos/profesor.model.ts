import { Institucion } from './institucion.model';

export interface Profesor{
    id: string,
    nombres: string,
    apellido_paterno: string,
    apellido_materno: string,
    email: string,
    telefono: string,
    nombre_usuario: string,
    password: string,
    imagen: string
    institucion: Institucion
}