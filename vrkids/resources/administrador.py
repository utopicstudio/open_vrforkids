from flask import Flask, Blueprint, jsonify, request
from models.administrador import Administrador
from models.asignatura import Asignatura
from models.institucion import Institucion
from models.evaluacion import Evaluacion
from models.curso import Curso
from models.grado import Grado

from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
import json
from unipath import Path
from flask_restful import reqparse

def init_module(api):
    api.add_resource(AdministradorItem, '/administradores/<id>')
    api.add_resource(Administradores, '/administradores')
    api.add_resource(AdministradorFinalizarTutorial, '/administrador/finalizar/tutorial/<id>')
    api.add_resource(AdministradorFinalizarTutorialToken, '/administrador/finalizar/tutorial')
    api.add_resource(AdministradorToken, '/administrador')
    api.add_resource(GraficoResumenRecurso, '/administrador/grafico/resumen/recursos')
    api.add_resource(GraficoResumenCurso, '/administrador/grafico/resumen/cursos')
    api.add_resource(GraficoResumenAsignatura, '/administrador/grafico/resumen/asignaturas')



def AdminGenerate():
    administrador = Administrador.objects().all()
    if(len(administrador) == 0):
        admin = Administrador()
        admin.nombres = 'admin'
        admin.apellido_paterno = 'paterno'
        admin.apellido_materno = 'materno'
        admin.email = 'admin@admin.cl'
        admin.telefono = '+56999999999'
        admin.nombre_usuario = 'admin'
        admin.encrypt_password('pass')
        admin.save()
class GraficoResumenAsignatura(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GraficoResumenAsignatura, self).__init__()

    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        if userAdmin == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404

        data = []
        labels = []
        for asignatura in Asignatura.objects(institucion=institucion.id,activo=True).all():
            labels.append(asignatura.nombre)
            aprobacion = 0
            contador = 0
            for evaluacion in Evaluacion.objects().all():
                if evaluacion.curso.asignatura.id == asignatura.id:
                    contador = contador +1
                    aprobacion = aprobacion + evaluacion.acierto
            if contador != 0:
                aprobacion = int(aprobacion/contador)
            data.append(aprobacion)

            aprobacion = 0

        return {
            "data":[{"data":data, "label":"Aprobación"}],
            "labels":labels
        }

class GraficoResumenCurso(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GraficoResumenCurso, self).__init__()


    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        if userAdmin == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404

        data = []
        labels = []
        for curso in Grado.objects(institucion=institucion.id,activo=True).all():
            labels.append(str(curso.nivel)+"º"+curso.identificador)
            aprobacion = 0
            contador = 0
            for evaluacion in Evaluacion.objects().all():
                if evaluacion.alumno.grado.id == curso.id:
                    contador = contador +1
                    aprobacion = aprobacion + evaluacion.acierto
            if contador != 0:
                aprobacion = int(aprobacion/contador)
            data.append(aprobacion)

            aprobacion = 0


        return {
            "data":[{"data":data, "label":"Aprobación"}],
            "labels":labels
        }
class GraficoResumenRecurso(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(GraficoResumenRecurso, self).__init__()


    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        if userAdmin == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404

        data = []
        labels = []
        for recurso in Curso.objects(institucion=institucion.id,activo=True,publicado=True).all():
            labels.append(recurso.nombre)
            aprobacion = 0
            for evaluacion in Evaluacion.objects(curso=recurso.id).all():
                aprobacion = aprobacion + evaluacion.acierto
            if Evaluacion.objects(curso=recurso.id).count() != 0:
                aprobacion = int(aprobacion / Evaluacion.objects(curso=recurso.id).count())
            data.append(aprobacion)

        return {
            "data":[{"data":data, "label":"Aprobación"}],
            "labels":labels
        }
class AdministradorToken(Resource):
    def get(self):
        token = request.headers.get('auth-token')
        user = Administrador.load_from_token(token)
        if user == None:
            return []
        else:
            return user.to_dict()

class AdministradorFinalizarTutorial(Resource):
    def get(self,id):
        administrador = Administrador.objects(id=id).first()
        administrador.primera_vez = False
        administrador.save()
        return{'Response':'exito'}


class AdministradorFinalizarTutorialToken(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(AdministradorFinalizarTutorialToken, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        if userAdmin == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAdmin != None:
            institucion = Institucion.objects(id=userAdmin.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        userAdmin.primera_vez = False
        userAdmin.save()
        return{'Response':'exito'}

class AdministradorItem(Resource):
    def get(self, id):
        return json.loads(Administrador.objects(id=id).first().to_json())

    def put(self,id):
        administrador = Administrador.objects(id=id).first()
        data = request.data.decode()
        data = json.loads(data)
        administrador.nombres = data['nombres']
        administrador.apellido_paterno = data['apellido_paterno']
        administrador.apellido_materno = data['apellido_materno']
        administrador.email = data['email']
        administrador.telefono = data['telefono']
        administrador.nombre_usuario = data['nombre_usuario']
        administrador.password = data['password']
        administrador.save()
        return {'Response': 'exito'}


class Administradores(Resource):
    def get(self):
        print(Administrador.objects().all().to_json())
        return json.loads(Administrador.objects().all().to_json())