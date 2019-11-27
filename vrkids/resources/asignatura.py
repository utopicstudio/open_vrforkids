from flask import Flask, Blueprint, jsonify, request
from models.asignatura import Asignatura
from models.curso import Curso
from models.institucion import Institucion
from models.administrador import Administrador
from models.alumno import Alumno
from models.profesor import Profesor
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from bson import ObjectId
import json
from flask_restful import reqparse

def init_module(api):
    api.add_resource(AsignaturaItem, '/asignaturas/<id>')
    api.add_resource(Asignaturas, '/asignaturas')
    api.add_resource(AsignaturasDetalle, '/asignaturas/detalle')
    api.add_resource(AsignaturasColegio, '/asignaturas/colegio')


class AsignaturasColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(AsignaturasColegio, self).__init__()

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
        asignaturas = Asignatura.objects(institucion=institucion).all()
        for asignatura in asignaturas:
            if asignatura.activo:
                cursos_lista = []
                cursos = Curso.objects(asignatura = asignatura.id,clon_padre=None).all()
                for curso in cursos:
                    cursos_lista.append({
                        'nombre': curso.nombre
                    })
                response.append({
                    'id': str(asignatura.id),
                    'nombre': asignatura.nombre,
                    'cursos': cursos_lista
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
        asignatura = Asignatura()
        asignatura.nombre = data['nombre']
        asignatura.institucion = institucion
        asignatura.save()
        return {'Response': 'exito'}

class AsignaturaItem(Resource):
    def get(self, id):
        return json.loads(Asignatura.objects(id=id).first().to_json())
    
    def put(self, id):
        asignatura = Asignatura.objects(id=id).first()
        cursos = Curso.objects(asignatura = asignatura.id,clon_padre=None).all()
        for curso in cursos:
            curso.asignatura = None
            curso.save()
        data = request.data.decode()
        data = json.loads(data)
        
        asignatura.nombre = data['nombre']
        asignatura.save()
        return {'Response': 'exito'}
    
    def delete(self, id):
        asignatura = Asignatura.objects(id=id).first()
        asignatura.activo = False
        asignatura.save()
        return{'Response':'borrado'}

class Asignaturas(Resource):
    def get(self):
        asignaturas = Asignatura.objects().all()
        response = []
        for asignatura in asignaturas:
            if asignatura.activo:
                response.append(asignatura.to_dict())
        return response

    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        asignatura = Asignatura()
        asignatura.nombre = data['nombre']
        asignatura.save()
        return {'Response': 'exito'}

class AsignaturasDetalle(Resource):
    def get(self):
        response = []
        asignaturas = Asignatura.objects().all()
        for asignatura in asignaturas:
            if asignatura.activo:
                cursos_lista = []
                cursos = Curso.objects(asignatura = asignatura.id, activo=True, clon_padre= None).all()
                for curso in cursos:
                    cursos_lista.append({
                        'nombre': curso.nombre
                    })
                response.append({
                    'id': str(asignatura.id),
                    'nombre': asignatura.nombre,
                    'cursos': cursos_lista
                })
        return response
