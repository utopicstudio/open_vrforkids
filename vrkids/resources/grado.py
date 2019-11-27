from flask import Flask, Blueprint, jsonify, request
from models.grado import Grado
from models.curso import Curso
from models.alumno import Alumno
from models.profesor import Profesor
from models.administrador import Administrador
from models.institucion import Institucion
from models.evaluacion import Evaluacion
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from flask_restful import reqparse
import json

def init_module(api):
    api.add_resource(GradoItem, '/cursos/<id>')
    api.add_resource(Grados, '/cursos')
    api.add_resource(GradosColegio, '/cursos/colegio')
    api.add_resource(GradosProfesor, '/cursos/profesor/<id>')
    api.add_resource(GradosProfesorToken, '/cursos/profesor/token')
    api.add_resource(GradosDetalle, '/cursos/detalle')
    api.add_resource(GradosDetalleColegio, '/cursos/detalle/colegio')


class GradosProfesorToken(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GradosProfesorToken, self).__init__()
    
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userAlum = Alumno.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userAlum == None and userProf == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if userAlum != None:
            institucion = Institucion.objects(id=userAlum.institucion.id).first()
        if userProf != None:
            institucion = Institucion.objects(id=userProf.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        response = []
        profesor = userProf
        grados = Grado.objects(profesor=profesor.id).all()
        for grado in grados:
            if grado.activo:
                alumnos = []
                cantidad_alumnos = Alumno.objects(grado=grado.id).count()
                suma_evaluaciones = 0
                for alumno in Alumno.objects(grado=grado.id).all():                 
                    alumnos.append(alumno.to_dict(full=False))
                    for evaluacion in Evaluacion.objects(alumno=alumno.id):
                        suma_evaluaciones = suma_evaluaciones + evaluacion.acierto
                grado = grado.to_dict()
                grado['alumnos'] = alumnos
                if cantidad_alumnos == 0:
                    grado['progreso'] = 0
                else:
                    grado['progreso'] = int(suma_evaluaciones/cantidad_alumnos)
                response.append(grado)
        return response

class GradosColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GradosColegio, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        user = Administrador.load_from_token(token)
        if user == None:
            return {'response': 'user_invalid'},401
        institucion = Institucion.objects(id=user.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        response = []
        grados = Grado.objects(institucion=institucion.id).all()
        for grado in grados:
            if grado.activo:
                response.append(grado.to_dict())
        return response

class GradosProfesor(Resource):
    def get(self,id):
        response = []
        profesor = Profesor.objects(id = id).first()
        grados = Grado.objects(profesor=profesor.id).all()
        for grado in grados:
            if grado.activo:
                alumnos = []
                cantidad_alumnos = Alumno.objects(grado=grado.id).count()
                suma_evaluaciones = 0
                for alumno in Alumno.objects(grado=grado.id).all():                 
                    alumnos.append(alumno.to_dict())
                    for evaluacion in Evaluacion.objects(alumno=alumno.id):
                        suma_evaluaciones = suma_evaluaciones + evaluacion.acierto
                grado = grado.to_dict()
                grado['alumnos'] = alumnos
                if cantidad_alumnos == 0:
                    grado['progreso'] = 0
                else:
                    grado['progreso'] = int(suma_evaluaciones/cantidad_alumnos)
                response.append(grado)
        return response

class GradoItem(Resource):
    def get(self, id):
        response = []
        grado = Grado.objects(id=id).first()
        if grado != None:
            response = grado.to_dict()
        return response

    def delete(self, id):
        grado = Grado.objects(id=id).first()
        grado.activo = False
        grado.save()
        return{'Response':'borrado'}


class Grados(Resource):
    def get(self):
        response = []
        for grado in Grado.objects().all():
            if grado.activo:
                response.append(grado.to_dict())
        return response
    
    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        grado = Grado()
        profesor = Profesor.objects(id=data['profesor']).first()
        grado.profesor = profesor.id
        grado.nivel = data['nivel']
        grado.identificador = data['identificador']
        grado.save()
        return {'Response': 'exito'}

class GradosDetalle(Resource):
    def get(self):
        response = []
        grados = Grado.objects().all()
        for grado in grados:
            if grado.activo:
                alumnosGrados = 0
                alumnos = [] 
                for alumno in Alumno.objects(grado = grado.id).all():
                    if alumno.activo:
                        alumnos.append(alumno.to_dict())
                        alumnosGrados = alumnosGrados +1
                profesor = ""
                if grado.profesor != None:
                    profesor = grado.profesor.to_dict()

                response.append({
                    'id': str(grado.id),
                    'nivel': grado.nivel,
                    'identificador': grado.identificador,
                    'cant_alumnos': alumnosGrados,
                    'alumnos': alumnos,
                    'profesor': profesor
                })
        return response

class GradosDetalleColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GradosDetalleColegio, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userAlum = Alumno.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userAlum == None and userProf == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if userAlum != None:
            institucion = Institucion.objects(id=userAlum.institucion.id).first()
        if userProf != None:
            institucion = Institucion.objects(id=userProf.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        response = []
        grados = Grado.objects(institucion = institucion.id).all()
        for grado in grados:
            if grado.activo:
                alumnosGrados = Alumno.objects(grado = grado.id, activo = True).count()
                alumnos = []
                for alumno in Alumno.objects(grado = grado.id, activo = True).all():
                    alumnos.append(alumno.to_dict())
                response.append({
                    'id': str(grado.id),
                    'nivel': grado.nivel,
                    'identificador': grado.identificador,
                    'cant_alumnos': alumnosGrados,
                    'profesor': grado.profesor.to_dict(),
                    'alumnos': alumnos
                })
        return response
    
    def post(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userAlum = Alumno.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userAlum == None and userProf == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if userAlum != None:
            institucion = Institucion.objects(id=userAlum.institucion.id).first()
        if userProf != None:
            institucion = Institucion.objects(id=userProf.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        data = request.data.decode()
        data = json.loads(data)
        grado = Grado()
        grado.nivel = data['nivel']
        grado.identificador = data['identificador']
        grado.institucion = institucion.id
        profesor = Profesor.objects(id=data['profesor']).first()
        grado.profesor = profesor.id
        grado.save()
        return {'Response': 'exito'}
