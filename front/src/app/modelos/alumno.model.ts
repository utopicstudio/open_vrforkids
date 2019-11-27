import { Grado } from './grado.model';
import { Institucion } from './institucion.model';
export class Alumno{
    id: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    telefono: string
    nombre_usuario: string
    password: string
    matricula: string
    grado: Grado
    imagen: string
    institucion: Institucion
}