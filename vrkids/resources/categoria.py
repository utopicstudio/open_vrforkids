from flask import Flask, Blueprint, jsonify, request,current_app, send_file
from models.categoria import Categoria
from models.curso import Curso
from models.curso_base import CursoBase
from models.institucion import Institucion
from models.administrador import Administrador
from models.alumno import Alumno
from models.profesor import Profesor
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
import json
from flask_restful import reqparse
from unipath import Path
import os
def init_module(api):
    api.add_resource(Categorias, '/categorias')
    api.add_resource(CategoriaImagenItem, '/categoria/imagen/<id>')
    api.add_resource(CategoriaImagenDefaultItem, '/categoria/imagen/default/<id>')

class Categorias(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(Categorias, self).__init__()

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
        for categoria in Categoria.objects().all():
            if categoria.activo:
                cursos = Curso.objects(categoria=categoria.id, institucion=institucion.id).count()
                cursosCerrados = Curso.objects(activo = False, categoria=categoria.id, institucion=institucion.id).count()
                categoria = categoria.to_dict()
                categoria['cursos']=cursos
                categoria['cursosCerrados']=cursosCerrados
                response.append(categoria)
        return response

class CategoriaImagenItem(Resource):
    def get(self,id):
        upload_directory = os.path.join(current_app.config.get("UPLOAD_FOLDER", "uploads"), 
                        "categorias")

        f = Path(os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id)))
        if(f.exists()== False):
            return send_file('uploads/categorias/default_thumbnail.jpg')

        image_path = os.path.join(upload_directory, "%s_thumbnail.jpg" % str(id))
        return send_file(image_path)

class CategoriaImagenDefaultItem(Resource):
    def get(self,id):
        categoria = Categoria.objects(id=id).first()
        categoria.imagen = "default"
        categoria.save()
        return {'Response': 'exito'}