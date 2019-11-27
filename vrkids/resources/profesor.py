from flask import Flask, Blueprint, jsonify, request,current_app, send_file
from models.profesor import Profesor
from models.administrador import Administrador
from models.alumno import Alumno
from models.curso import Curso
from models.institucion import Institucion
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
import json
from PIL import Image
from flask_restful import reqparse
import os
from unipath import Path

def init_module(api):
    api.add_resource(ProfesorItem, '/profesores/<id>')
    api.add_resource(ProfesorToken, '/profesor')
    api.add_resource(Profesores, '/profesores')
    api.add_resource(ProfesorCursos, '/profesor/recursos/<id>')
    api.add_resource(ProfesorImagenItem, '/profesor/imagen/<id>')
    api.add_resource(ProfesorImagenDefaultItem, '/profesor/imagen/default/<id>')
    api.add_resource(ProfesoresColegio, '/profesores/colegio')
    api.add_resource(ProfesoresToken, '/profesores/token/<token>')
    api.add_resource(ProfesorFinalizarTutorial, '/profesor/finalizar/tutorial/<id>')
    api.add_resource(ProfesorFinalizarTutorialToken, '/profesor/finalizar/tutorial')


class ProfesorFinalizarTutorialToken(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(ProfesorFinalizarTutorialToken, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userProf = Profesor.load_from_token(token)
        if userProf == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userProf != None:
            institucion = Institucion.objects(id=userProf.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        userProf.primera_vez = False
        userProf.save()
        return{'Response':'exito'}

class ProfesorToken(Resource):
    def get(self):
        token = request.headers.get('auth-token')
        user = Profesor.load_from_token(token)
        if user == None:
            return []
        else:
            return user.to_dict()
            
class ProfesorFinalizarTutorial(Resource):
    def get(self,id):
        profesor = Profesor.objects(id=id).first()
        profesor.primera_vez = False
        profesor.save()
        return{'Response':'exito'}

class ProfesoresColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(ProfesoresColegio, self).__init__()
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
        profesores = []
        for profesor in Profesor.objects(institucion = institucion.id, activo = True).all():
            profesores.append(profesor.to_dict())
        return profesores

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
        profesor = Profesor()
        profesor.nombres = data['nombres']
        profesor.apellido_paterno = data['apellido_paterno']
        profesor.apellido_materno = data['apellido_materno']
        profesor.telefono = data['telefono']
        profesor.email = data['email']
        profesor.nombre_usuario = data['nombre_usuario']
        profesor.encrypt_password(data['nombre_usuario'])
        profesor.institucion = institucion.id
        profesor.save()
        return {'Response': 'exito' , 'id': str(profesor.id)}

class ProfesorItem(Resource):
    def get(self, id):
        return json.loads(Profesor.objects(id=id).first().to_json())
    
    def delete(self, id):
        profesor = Profesor.objects(id=id).first()
        profesor.activo = False
        profesor.save()
        return{'Response':'borrado'}

    def put(self, id):        
        data = request.data.decode()
        data = json.loads(data)
        profesor = Profesor.objects(id=id).first()
        profesor.nombres = data['nombres']
        profesor.apellido_paterno = data['apellido_paterno']
        profesor.apellido_materno = data['apellido_materno']
        profesor.telefono = data['telefono']
        profesor.email = data['email']
        profesor.nombre_usuario = data['nombre_usuario']
        profesor.save()
        return{'Response':'exito'}


class ProfesorCursos(Resource):
    def get(self, id):
        return json.loads(Curso.objects(profesor=id,clon_padre=None).all().to_json())



class Profesores(Resource):
    def get(self):
        profesores = []
        for profesor in Profesor.objects().all():
            if profesor.activo:
                profesores.append(profesor.to_dict())
        return profesores


class ProfesoresToken(Resource):
    def post(self,token):
        data = request.data.decode()
        data = json.loads(data)
        token = token
        if Administrador.load_from_token(token) != None:
            profesor = Profesor()
            profesor.nombres = data['nombres']
            profesor.apellido_paterno = data['apellido_paterno']
            profesor.apellido_materno = data['apellido_materno']
            profesor.telefono = data['telefono']
            profesor.email = data['email']
            profesor.nombre_usuario = data['nombre_usuario']
            profesor.encrypt_password(data['nombre_usuario'])
            profesor.save()
            return {'Response': 'exito' , 'id': str(profesor.id)}
        else:
            return {'Response': 'fracaso'}
        

class ProfesorImagenItem(Resource):
    def post(self,id):
        imagen = Image.open(request.files['imagen'].stream).convert("RGB")
        imagen.save(os.path.join("./uploads/profesores", str(id)+".jpg"))
        imagen.thumbnail((200, 100))
        imagen.save(os.path.join("./uploads/profesores", str(id)+'_thumbnail.jpg'))
        profesor = Profesor.objects(id=id).first()
        profesor.imagen = str(id)
        profesor.save()
        return {'Response': 'exito'}
    
    def get(self,id):
        upload_directory = os.path.join(current_app.config.get("UPLOAD_FOLDER", "uploads"), 
                        "profesores")

        f = Path(os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id)))
        if(f.exists()== False):
            return send_file('uploads/profesores/default_thumbnail.jpg')

        image_path = os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id))
        return send_file(image_path)

class ProfesorImagenDefaultItem(Resource):
    def get(self,id):
        profesor = Profesor.objects(id=id).first()
        profesor.imagen = "default"
        profesor.save()
        return {'Response':'exito'}