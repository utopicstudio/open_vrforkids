from flask import Flask, Blueprint, jsonify, request, current_app, send_file
from models.alumno import Alumno
from models.administrador import Administrador
from models.curso import Curso
from models.asignatura import Asignatura
from models.profesor import Profesor
from models.grado import Grado
from models.institucion import Institucion
from models.evaluacion import Evaluacion
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from libs.auth import token_required
from flask_restful import reqparse
from bson import ObjectId
import json
from PIL import Image
import os
from unipath import Path
from os.path import dirname, abspath

def init_module(api):
    api.add_resource(AlumnoToken, '/alumno')
    api.add_resource(AlumnoItem, '/alumnos/<id>')
    api.add_resource(Alumnos, '/alumnos')
    api.add_resource(AlumnosColegio, '/alumnos/colegio')
    api.add_resource(AlumnoCursos, '/alumno/recursos/<id>')
    api.add_resource(AlumnosCurso, '/alumnos/recurso/<id_curso>')
    api.add_resource(AlumnoCurso, '/alumno/recurso/<nombre_usuario>/<id_curso>')
    api.add_resource(AlumnoCursoColegio, '/alumno/<nombre_usuario>/recurso/<id_curso>')
    api.add_resource(AlumnoImagenItem, '/alumno/imagen/<id>')
    api.add_resource(AlumnoImagenDefaultItem, '/alumno/imagen/default/<id>')
    api.add_resource(AlumnosGrado, '/alumnos/curso/<id>')
    api.add_resource(AlumnoImagenZoom, '/imagen/zoom/<id>')
    api.add_resource(AlumnoFinalizarTutorial, '/alumno/finalizar/tutorial/<id>')
    api.add_resource(AlumnoFinalizarTutorialToken, '/alumno/finalizar/tutorial')
    api.add_resource(AlumnoEvaluaciones, '/alumno/evaluaciones/<id>')

class AlumnoFinalizarTutorialToken(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(AlumnoFinalizarTutorialToken, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAlum = Alumno.load_from_token(token)
        if userAlum == None:
            return {'response': 'user_invalid'},401
        institucion = None
        if userAlum != None:
            institucion = Institucion.objects(id=userAlum.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        userAlum.primera_vez = False
        userAlum.save()
        return{'Response':'exito'}
class AlumnoToken(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(AlumnoToken, self).__init__()

    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        user = Alumno.load_from_token(token)
        if user == None:
            return []
        else:
            return user.to_dict()
class AlumnoEvaluaciones(Resource):
    def get(self,id):
        evaluaciones = []
        alumno = Alumno.objects(id=id).first()
        for evaluacion in Evaluacion.objects(alumno=alumno.id).all():
            evaluaciones.append(evaluacion.to_dict())
        return evaluaciones

class AlumnoFinalizarTutorial(Resource):
    def get(self,id):
        alumno = Alumno.objects(id=id).first()
        alumno.primera_vez = False
        alumno.save()
        return{'Response':'exito'}

class AlumnoItem(Resource):
    def get(self, id):
        return json.loads(Alumno.objects(id=id).first().to_json())
    
    def delete(self, id):
        alumno = Alumno.objects(id=id).first()
        alumno.activo = False
        alumno.save()
        return{'Response':'borrado'}

    def put(self, id):
        data = request.data.decode()
        data = json.loads(data)
        alumno = Alumno.objects(id=id).first()
        alumno.nombres = data['nombres']
        alumno.apellido_paterno = data['apellido_paterno']
        alumno.apellido_materno = data['apellido_materno']
        alumno.telefono = data['telefono']
        alumno.email = data['email']
        alumno.nombre_usuario = data['nombre_usuario']
        alumno.matricula = data['matricula']
        grado = Grado.objects(id = data['grado']).first()
        alumno.grado = grado.id
        alumno.save()
        return{'Response':'exito'}

class AlumnoCursos(Resource):
    def get(self, id):
        cursosRespuesta = []
        alumno = Alumno.objects(id=id).first()
        if alumno.institucion == None:
            for curso in Curso.objects(clon_padre=None,institucion=None,activo=True).all():
                if alumno in curso.alumnos:
                    cursosRespuesta.append(curso.to_dict())
        else:
            for curso in Curso.objects(clon_padre=None,publicado=True,activo=True,institucion=alumno.institucion.id).all():
                if alumno in curso.alumnos:
                    cursosRespuesta.append(curso.to_dict())
        return cursosRespuesta

class AlumnosCurso(Resource):
    def get(self, id_curso):
        alumnos_array = []
        curso = Curso.objects(id=id_curso,clon_padre=None).first()
        for alumno_obj in Alumno.objects().all():
            if alumno_obj.curso == curso:
                alumnos_array.append(alumno_obj.to_dict())
        return alumnos_array

class AlumnosGrado(Resource):
    def get(self,id):
        alumnos = []
        grado = Grado.objects(id=id).first()
        for alumno in Alumno.objects().all():
            if alumno.grado == grado:
                if alumno.activo:
                    alumnos.append(alumno.to_dict())
        return alumnos
class AlumnoCursoColegio(Resource):
    def put(self, nombre_usuario, id_curso):
        curso = Curso.objects(id=id_curso,clon_padre=None).first()
        alumno = Alumno.objects(nombre_usuario= nombre_usuario, institucion=curso.institucion,activo=True).first()
        if alumno == None:
            return {'Response': 'no_existe'}
        if not alumno.activo:
            return {'Response': 'no_existe'}
        for alumno_aux in curso.alumnos:
            if alumno_aux.id == alumno.id:
                return {'Response': 'si_pertenece'}
        curso.alumnos.append(alumno.id)
        curso.save()
        return {'Response': 'exito'}

class AlumnoCurso(Resource):
    def post(self, id_curso, nombre_usuario):
        alumno = Alumno.objects(nombre_usuario= nombre_usuario,activo=True).first()
        alumnos = Alumno.objects().all()
        if alumno == None:
            return {'Response': 'no_existe'}
        curso = Curso.objects(id=id_curso,clon_padre=None).first()
        if not alumno.activo:
            return {'Response': 'no_existe'}

        for alumno_aux in curso.alumnos:
            if alumno_aux.id == alumno.id:
                return {'Response': 'si_pertenece'}
        
        curso.alumnos.append(alumno.id)
        curso.save()
        return {'Response': 'exito'}

    def delete(self, id_curso, nombre_usuario):
        alumno = Alumno.objects(nombre_usuario= nombre_usuario).first()
        print(alumno.to_dict())
        alumnos = []
        curso = Curso.objects(id=id_curso,clon_padre=None).first()
        for alumno_curso in curso.alumnos:
            if(alumno.id != alumno_curso.id):
                alumnos.append(alumno.id)

        response = Curso.objects(id=id_curso,clon_padre=None).update(
            set__alumnos = alumnos
            )
        if(response):
            return {'Response': 'exito'}    

class Alumnos(Resource):

    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        alumno = Alumno()
        alumno.nombres = data['data_personal']['nombres']
        alumno.apellido_paterno = data['data_personal']['apellido_paterno']
        alumno.apellido_materno = data['data_personal']['apellido_materno']
        alumno.telefono = data['data_personal']['telefono']
        alumno.email = data['data_personal']['email']
        alumno.nombre_usuario = data['data_academico']['nombre_usuario']        
        alumno.encrypt_password(data['data_academico']['nombre_usuario'])
        alumno.matricula = data['data_academico']['matricula']
        alumno.institucion = None
        alumno.grado = Grado.objects(id = data['data_personal']['grado']).first()
        alumno.save()
        return {'Response': 'exito', 'id': str(alumno.id)}

    def get(self):
        response = []
        alumnos = Alumno.objects().all()
        for alumno in alumnos:
            if alumno.activo:
                response.append(alumno.to_dict())
        return response

class AlumnosColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(AlumnosColegio, self).__init__()
    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        user = Administrador.load_from_token(token)
        if user == None:
            return {'response': 'user_invalid'},401
        institucion = Institucion.objects(id=user.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        alumnos = []
        for alumno in Alumno.objects(institucion = institucion.id).all():
            if alumno.activo:
                alumnos.append(alumno.to_dict())
        return alumnos

    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        user = Administrador.load_from_token(token)
        if user == None:
            return {'response': 'user_invalid'},401
        institucion = Institucion.objects(id=user.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        alumno = Alumno()
        alumno.nombres = data['nombres']
        alumno.apellido_paterno = data['apellido_paterno']
        alumno.apellido_materno = data['apellido_materno']
        alumno.telefono = data['telefono']
        alumno.email = data['email']
        alumno.nombre_usuario = data['nombre_usuario']        
        alumno.encrypt_password(data['nombre_usuario'])
        alumno.matricula = data['matricula']
        alumno.institucion = institucion.id
        grado = Grado.objects(id=data['grado']).first()
        alumno.grado = grado
        alumno.save()
        return {'Response': 'exito', 'id': str(alumno.id)}

class AlumnoImagenItem(Resource):
    def post(self,id):
        import os.path
        upload_directory = os.path.join("flaskr",
                        current_app.config.get("UPLOAD_FOLDER","uploads") ,
                        "alumnos")        
        imagen = Image.open(request.files['imagen'].stream).convert("RGB")
        image_path = os.path.join(upload_directory, "%s.jpg" % str(id))
        imagen.save(image_path)
        imagen.thumbnail((200, 100))

        image_path = os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id))
        imagen.save(image_path)
        alumno = Alumno.objects(id=id).first()
        alumno.imagen = str(id)
        alumno.save()
        return {'Response': 'exito'}
    
    def get(self,id):
        import os.path
        upload_directory = os.path.join(current_app.config.get("UPLOAD_FOLDER","uploads") ,
                        "alumnos")
        f = Path(os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id)))
        if(f.exists()== False):
            return send_file('uploads/alumnos/default_thumbnail.jpg')

        image_path = os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id))
        return send_file(image_path)

class AlumnoImagenZoom(Resource):
    def get(self,id):
        return send_file('uploads/alumnos/'+id+'.jpg')

class AlumnoImagenDefaultItem(Resource):
    def get(self,id):
        alumno = Alumno.objects(id=id).first()
        #path = os.path.join(current_app.config.get("UPLOAD_FOLDER"), model.carpeta_archivos)
        alumno.imagen = "default"
        alumno.save()
        return {'Response':'exito'}

