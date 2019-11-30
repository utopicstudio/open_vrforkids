from flask import Flask, Blueprint, jsonify, request, current_app, send_file
from models.seccion import Seccion
from models.institucion import Institucion
from models.administrador import Administrador
from models.profesor import Profesor
from models.alumno import Alumno
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from libs.auth import token_required
import json
from PIL import Image
from os.path import dirname, abspath
import os
from flask_restful import reqparse
from unipath import Path
def init_module(api):
  api.add_resource(Secciones,'/secciones/<id>')
  api.add_resource(SeccionesColegio,'/colegio/secciones')
  api.add_resource(SeccionesColegioInicio,'/colegio/secciones/<id>')
  api.add_resource(SeccionSubir,'/seccion/subir/<id>')
  api.add_resource(SeccionBajar,'/seccion/bajar/<id>')
  api.add_resource(SeccionImagenItem,'/seccion/imagen/<id>')
  api.add_resource(SeccionImagenOriginal,'/seccion/imagen/original/<id>')
  api.add_resource(SeccionImagenDefaultItem,'/seccion/imagen/default/<id>')

class SeccionSubir(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(SeccionSubir, self).__init__()
    def put(self,id):
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
        
        seccion = Seccion.objects(id=id).first()
        posicion = seccion.posicion
        seccion_anterior = Seccion.objects(institucion=institucion, activo=True, posicion=posicion-1).first()
        seccion.posicion = posicion-1
        seccion_anterior.posicion = posicion
        seccion.save()
        seccion_anterior.save()
        return {'Response':'exito'}

class SeccionBajar(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(SeccionBajar, self).__init__()

    def put(self,id):
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
        seccion = Seccion.objects(id=id).first()
        print(seccion.to_dict())
        posicion = seccion.posicion
        seccion_siguiente = Seccion.objects(institucion=institucion, activo=True, posicion=posicion+1).first()
        seccion.posicion = posicion+1
        seccion_siguiente.posicion = posicion
        seccion.save()
        seccion_siguiente.save()
        return {'Response':'exito'}

class Secciones(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(Secciones, self).__init__()

    def delete(self,id):
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
        seccion = Seccion.objects(id=id).first()
        posicion = seccion.posicion
        seccion.activo = False
        seccion.save()
        secciones = Seccion.objects(institucion=institucion).all()
        for sec in secciones:
            if sec.activo and sec.posicion>posicion:
                sec.posicion = sec.posicion -1
                sec.save()
        return {'Response':'borrado'}
        
class SeccionesColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(SeccionesColegio, self).__init__()

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
        secciones = []
        cant_secciones = Seccion.objects(institucion = institucion.id, activo=True).count()
        posicion = 1
        for pos in range (0,cant_secciones) :
            seccion = Seccion.objects(institucion = institucion.id, posicion = pos+1, activo=True).first()
            if seccion != None and seccion.activo:
                secciones.append(seccion.to_dict())
        return secciones
    
    def put(self):
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
        seccion = Seccion.objects(id=data['id']).first()
        seccion.titulo = data['titulo']
        seccion.data = data['data']
        seccion.tipo = data['tipo']
        seccion.save()
        return{'Response':'exito'}
    
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
        posicion = Seccion.objects(institucion=institucion.id, activo=True).count()+1
        seccion = Seccion()
        seccion.institucion = institucion.id
        seccion.titulo = data['titulo']
        seccion.data = data['data']
        seccion.tipo = data['tipo']
        seccion.posicion = posicion
        seccion.save()
        return{'Response':'exito', 'id':str(seccion.id)}

class SeccionImagenItem(Resource):
    def post(self,id):
        directory_root = dirname(dirname(abspath(__file__)))
        imagen = Image.open(request.files['imagen'].stream).convert("RGB")
        image_path = os.path.join(str(directory_root),"flaskr",
                    "uploads","secciones", str(id)+".jpg")
        imagen.save(image_path)
        imagen.thumbnail((800, 800))

        image_path = os.path.join(str(directory_root),"flaskr",
                    "uploads","secciones", "%s_thumbnail.jpg" % str(id))
        imagen.save(image_path)
        seccion = Seccion.objects(id=id).first()
        seccion.imagen = str(id)
        seccion.save()
        return {'Response': 'exito'}
    
    def get(self,id):
        directory_root = dirname(dirname(abspath(__file__)))
        upload_directory = os.path.join(str(directory_root),"flaskr",
                    "uploads","secciones")
        f = Path(os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id)))
        if(f.exists() == False):
            return send_file(os.path.join(str(directory_root),"flaskr",
                    "uploads","secciones", "default_thumbnail.jpg"))
        image_path = os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id))
        return send_file(image_path)

class SeccionImagenOriginal(Resource):
    def get(self,id):
        upload_directory = os.path.join(current_app.config.get("UPLOAD_FOLDER", "uploads"), 
                        "secciones")
        f = Path(os.path.join(upload_directory, "%s.jpg" % str(id)))
        if(f.exists() == False):
            return send_file('uploads/secciones/default.jpg')

        image_path = os.path.join(upload_directory, "%s.jpg" % str(id))
        return send_file(image_path)

class SeccionImagenDefaultItem(Resource):
    def get(self,id):
        seccion = Seccion.objects(id=id).first()
        seccion.imagen = "default"
        seccion.save()
        return {'Response':'exito'}

class SeccionesColegioInicio(Resource):
    def get(self, id):
        institucion = Institucion.objects(id=id).first()   
        secciones = []
        cant_secciones = Seccion.objects(institucion = institucion.id, activo=True).count()
        for pos in range (0,cant_secciones) :
            seccion = Seccion.objects(institucion = institucion.id, posicion = pos+1, activo=True).first()
            if seccion != None and seccion.activo:
                secciones.append(seccion.to_dict())
        return secciones
