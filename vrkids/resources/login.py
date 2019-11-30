from flask import Flask, Blueprint, jsonify, request, abort
from models.alumno import Alumno
from models.administrador import Administrador
from models.profesor import Profesor
from models.institucion import Institucion
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from models.curso import Curso
import json
from flask_restful import reqparse

def init_module(api):
    api.add_resource(Login, '/login')
    api.add_resource(Logout, '/logout')
    api.add_resource(LoginColegio, '/login/colegio/<id>')
    api.add_resource(LoginColegioVersionNueva, '/login/colegio')
    api.add_resource(LoginApp, '/login/app')

class LoginColegioVersionNueva(Resource):
    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        administrador = None
        profesor = None
        alumno = None
        if(data['email'].find('@')!=-1):
            administrador = Administrador.objects(email = data['email']).first()
            profesor = Profesor.objects(email = data['email']).first()
            alumno = Alumno.objects(email = data['email']).first()
        else:
            administrador = Administrador.objects(nombre_usuario = data['email']).first()
            profesor = Profesor.objects(nombre_usuario = data['email']).first()
            alumno = Alumno.objects(nombre_usuario = data['email']).first()
        if administrador != None :
            if(administrador.check_password(data['password']) or administrador.activo==False ):
                if administrador.institucion == None:
                    return {'respuesta': 'no_existe'},401
                else:
                    token = administrador.get_token()
                    return {'respuesta':{'id':str(administrador.id)},
                            'tipo': 'ADMINISTRADOR', 
                            'token': str(token)
                            }
            else:
                return {'respuesta': 'no_existe'},401
        
        if profesor != None :
            if(profesor.check_password(data['password']) or profesor.activo==False):
                if profesor.institucion == None:
                    return {'respuesta': 'no_existe'},401
                else:
                    token = profesor.get_token()
                    return {'respuesta':{'id':str(profesor.id)},
                            'tipo': 'PROFESOR', 
                            'token': str(token)
                            }
            else:
                return {'respuesta': 'no_existe'},401

        if alumno != None :
            if(alumno.check_password(data['password']) or alumno.activo==False):
                if alumno.institucion == None:
                    return {'respuesta': 'no_existe'},401
                else:
                    token = alumno.get_token()
                    return {'respuesta':{'id':str(alumno.id)},
                            'tipo': 'ALUMNO', 
                            'token': str(token)
                            }
            else:
                return {'respuesta': 'no_existe'},401
        
        else:
            return {'respuesta': 'no_existe'},404
class LoginColegio(Resource):
    def post(self,id):
        data = request.data.decode()
        data = json.loads(data)
        institucion = Institucion.objects(id=id).first()
        administrador = None
        profesor = None
        alumno = None
        if(data['email'].find('@')!=-1):
            administrador = Administrador.objects(email = data['email'],institucion=institucion.id).first()
            profesor = Profesor.objects(email = data['email'],institucion=institucion.id).first()
            alumno = Alumno.objects(email = data['email'],institucion=institucion.id).first()
        else:
            administrador = Administrador.objects(nombre_usuario = data['email'],institucion=institucion.id).first()
            profesor = Profesor.objects(nombre_usuario = data['email'],institucion=institucion.id).first()
            alumno = Alumno.objects(nombre_usuario = data['email'],institucion=institucion.id).first()
        if administrador != None :
            if(administrador.check_password(data['password']) or administrador.activo==False ):
                token = administrador.get_token()
                return {'respuesta':{'id':str(administrador.id)},
                            'tipo': 'ADMINISTRADOR', 
                            'token': str(token)
                        }
            else:
                return {'respuesta': 'no_existe'},401
        
        if profesor != None :
            if(profesor.check_password(data['password']) or profesor.activo==False):
                token = profesor.get_token()
                return {'respuesta':{'id':str(profesor.id)},
                            'tipo': 'PROFESOR', 
                            'token': str(token)
                        }
            else:
                return {'respuesta': 'no_existe'},401

        if alumno != None :
            if(alumno.check_password(data['password']) or alumno.activo==False):
                token = alumno.get_token()
                return {'respuesta':{'id':str(alumno.id)},
                            'tipo': 'ALUMNO', 
                            'token': str(token)
                        }
            else:
                return {'respuesta': 'no_existe'},401
        
        else:
            return {'respuesta': 'no_existe'},404
            

class Login(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('email', type=str, required=True, location='json')
        self.reqparse.add_argument('password', type = str, required=True, location='json')
        self.reqparse.add_argument('tipo', type = str, default="ALUMNO", location='json')
        super(Login, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        email = args.get("email")
        tipo = args.get("tipo")
        
        user = None
        if tipo == 'ALUMNO':
            if (email.find('@')!=-1):
                user = Alumno.objects(email=email).first()
            else:
                user = Alumno.objects(nombre_usuario=email).first()
        elif tipo == 'ADMINISTRADOR':
            if (email.find('@')!=-1):
                user = Administrador.objects(email=email).first()
            else:
                user = Administrador.objects(nombre_usuario=email).first()
        elif tipo == 'PROFESOR':
            if (email.find('@')!=-1):
                user = Profesor.objects(email=email).first()
            else:
                user = Profesor.objects(nombre_usuario=email).first()
        if user and user.activo and user.check_password(args.get("password")):
            recursos = []
            if tipo == 'ALUMNO':
                for recurso in Curso.objects(alumnos__in=[user], clon_padre=None).all():
                    recursos.append(recurso.to_dict())
            elif tipo == 'PROFESOR':
                for recurso in Curso.objects(profesor=user, clon_padre=None).all():
                    recursos.append(recurso.to_dict())
            return {'respuesta':
                        {'id': str(user.id)},
                         'tipo': tipo,
                         'token': str(user.get_token()),
                         'recursos': recursos
                        }    
        return {'respuesta': 'no_existe'}, 401

class LoginApp(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('email', type=str, required=True, location='json')
        self.reqparse.add_argument('password', type = str, required=True, location='json')
        self.reqparse.add_argument('tipo', type = str, default="ALUMNO", location='json')
        super(LoginApp, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        email = args.get("email")
        passwd = args.get("password")
        tipo = args.get("tipo")

        user = None
        if tipo == 'ALUMNO':
            if (email.find('@')!=-1):
                user = Alumno.objects(email=email).first()
            else:
                user = Alumno.objects(nombre_usuario=email).first()
        
        elif tipo == 'ADMINISTRADOR':
            if (email.find('@')!=-1):
                user = Administrador.objects(email=email).first()
            else:
                user = Administrador.objects(nombre_usuario=email).first()

        elif tipo == 'PROFESOR':
            if (email.find('@')!=-1):
                user = Profesor.objects(email=email).first()
            else:
                user = Profesor.objects(nombre_usuario=email).first()
        
        if user != None and user.activo and user.check_password(passwd):
                res = []
                if tipo == "ALUMNO":
                    res_bd = Curso.objects(alumnos__in=[user], clon_padre=None,activo=True, publicado=True).all()
                else:
                    res_bd = Curso.objects(profesor=user, clon_padre=None,activo=True).all()
                for resource in res_bd:
                    res.append({
                        "id": str(resource.id),
                        "nombre": resource.nombre,
                        "fecha_creacion": resource.fecha_creacion.isoformat(),
                        "activo": resource.activo,
                        "version": resource.version,
                        "id_base": str(resource.curso_base.id),
                    })
                return {'respuesta': user.to_dict(),
                        'tipo': tipo, 
                        'token': str(user.get_token()),
                        'recursos': res
                       }
        return abort(403)
        

class Logout(Resource):
    def post(self):
        return {'respuesta': True}
