import { Institucion } from 'src/app/modelos/institucion.model';
export class Administrador{
    id: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    telefono: string
    nombre_usuario: string
    password: string
    primera_vez: boolean
    institucion: Institucion
}