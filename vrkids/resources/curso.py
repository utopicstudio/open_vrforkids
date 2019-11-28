from flask import Flask, Blueprint, jsonify, request,current_app, send_file
from models.curso import Curso
from models.grado import Grado
from models.curso_base import CursoBase
from models.contenido import Contenido
from models.evaluacion import Evaluacion
from models.asignatura import Asignatura
from models.institucion import Institucion
from models.profesor import Profesor
from models.alumno import Alumno
from models.administrador import Administrador
from models.pregunta import Pregunta
from models.alternativa import Alternativa
from models.inscripcion import Inscripcion
from models.categoria import Categoria
from models.habilidad import Habilidad
from models.respuesta import Respuesta
from models.inscripcion import TIPOS_ESTADO_INSCRIPCION as TEI
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from pprint import pprint
import json
from PIL import Image
import os
from flask_restful import reqparse
from io import BytesIO
import base64
import re

def init_module(api):

    api.add_resource(RecursosDisponiblesAlumno, '/recursos/disponibles/alumno')
    api.add_resource(RecursoEvaluaciones, '/recurso/<id>/evaluaciones')
    api.add_resource(RecursoRendimientoHabilidades, '/recurso/<id>/rendimiento/habilidades')
    api.add_resource(RecursoRendimiento, '/recurso/<id>/rendimiento')
    api.add_resource(RecursoRendimientoPreguntas, '/recurso/<id>/rendimiento/preguntas')
    api.add_resource(Habilidades, '/habilidades')
    api.add_resource(CursoItem, '/recurso/<id>')
    api.add_resource(RecursoItem, '/recurso/<id>/token')
    api.add_resource(Cursos, '/recursos')
    api.add_resource(RecursoVersiones, '/recurso/<id>/versiones')
    api.add_resource(RecursoPublicar, '/recurso/<id>/publicar')
    api.add_resource(RecursoDespublicar, '/recurso/<id>/despublicar')
    api.add_resource(CursosAdmin, '/recursos/admin')
    api.add_resource(CursoDetallePut, '/recurso/detalle/put')
    api.add_resource(CursosActivos, '/recursos/activos/<id>')
    api.add_resource(CursosCerrados, '/recursos/desactivados/<id>')
    api.add_resource(CursosBase, '/recursosbase')
    api.add_resource(CursoBaseItem, '/recursobase/<id>')
    api.add_resource(CursoDetalle, '/recurso/detalle/<id>')
    api.add_resource(CursoAlumnos, '/recursos/alumnos')
    api.add_resource(CursoAlumno, '/sacar/alumno/recurso')
    api.add_resource(RecursoAlumnosCurso, '/agregar/alumnos/recurso/<id_recurso>/curso/<id_curso>')
    api.add_resource(RecursoAlumnoCurso, '/agregar/alumno/<id_alumno>/recurso/<id_recurso>/curso')
    api.add_resource(CursoImagenItem, '/recurso/imagen/<id>')
    api.add_resource(CursoImagenDefaultItem, '/recurso/imagen/default/<id>')
    api.add_resource(CursosAdminColegio , '/recursos/admin/colegio') 
    api.add_resource(CursosBaseColegio, '/recursos/base/colegio')
    api.add_resource(CursosActivosProfesorColegio, '/recursos/activos/profesor/colegio')
    api.add_resource(CursosDesactivadosProfesorColegio, '/recursos/desactivados/profesor/colegio')
    api.add_resource(CursosAprobacionGrafico, '/recursos/aprobacion/graficos/<id>')
    api.add_resource(CursosAsignaturaGrafico, '/recursos/asignatura/grafico')
    api.add_resource(CursoDetalleAlumno, '/recurso/detalle/alumno/<id_curso>/<id_alumno>')
    api.add_resource(CursoDisponiblesAlumno, '/recursos/disponibles/alumno/<id_alumno>')
    api.add_resource(ContenidoImagenItem, '/contenidos/imagen/<nombre>')
    api.add_resource(RecursosColegio, '/recursos/colegio')
    api.add_resource(clontest, '/recursos/clon')

class RecursoAlumnoCurso(Resource):
    def post(self,id_recurso,id_alumno):
        alumno = Alumno.objects(id=id_alumno).first()
        recurso = Curso.objects(id=id_recurso).first()
        if not(alumno in recurso.alumnos):
            recurso.alumnos.append(alumno)
            recurso.save()
            return {'Response':'exito'}
        else:
            recurso.save()
            return {'Response':'alumno_en_curso'}
        

class clontest(Resource):
    def get(self):
        cb = CursoBase.objects.first()
        c = Curso.objects.first()
        0/0
        

class RecursoAlumnosCurso(Resource):
    def post(self,id_recurso,id_curso):
        curso = Grado.objects(id=id_curso).first()
        recurso = Curso.objects(id=id_recurso).first()
        for alumno in Alumno.objects(grado=curso.id).all():
            if not(alumno in recurso.alumnos):
                recurso.alumnos.append(alumno)
        recurso.save()
        return {'Response':'exito'}        

class RecursoItem(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoItem, self).__init__()
    def delete(self,id):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userAlum = Alumno.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userAlum == None and userProf == None:
            return {'response': 'user_invalid'},401
        recurso = Curso.objects(id=id).first()
        recurso.eliminado = True
        recurso.save()
        return{'Response':'exito'}


class RecursosDisponiblesAlumno(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursosDisponiblesAlumno, self).__init__()

    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userAlum = Alumno.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userAlum == None and userProf == None:
            return {'response': 'user_invalid'},401
        alumno = userAlum
        response = []
        if alumno.institucion != None:
            for recurso in Curso.objects(institucion=alumno.institucion.id,clon_padre=None,publicado=True).all():
                if recurso.activo:
                    if recurso.eliminado == False:
                        if not(alumno in recurso.alumnos):
                            if len(Inscripcion.objects(alumno=alumno,curso=recurso).all())>0:
                                bandera = True
                                for inscripcion in Inscripcion.objects(alumno=alumno,curso=recurso).all():
                                    if inscripcion.estado == "ENVIADA" or inscripcion.estado == "ACEPTADA":
                                        bandera = False
                                if bandera:
                                    response.append(recurso.to_dict())
                            else:
                                response.append(recurso.to_dict())
        else:
            for recurso in Curso.objects(institucion=None,clon_padre=None,publicado=True):
                if not(alumno in recurso.alumnos):
                    if Inscripcion.objects(alumno=alumno,curso=recurso, estado="RECHAZADA").first() != None:
                        response.append(recurso.to_dict())
                    else:
                        response.append(recurso.to_dict())
        return response

class RecursoDespublicar(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoDespublicar, self).__init__()
    
    def post(self,id):
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
        recursoPadre = Curso.objects(id=id).first()
        recursoPadre.publicado  = False
        recursoPadre.save()
        return {"Response":"exito"}
class RecursoEvaluaciones(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoEvaluaciones, self).__init__()

    def get(self,id):
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
        recurso  = Curso.objects(id=id).first()
        response = []
        for evaluacion in Evaluacion.objects(curso=recurso.id).all():
            response.append(evaluacion.to_dict())
        return response

class RecursoRendimiento(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoRendimiento, self).__init__()

    def get(self,id):
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

        labels = []
        data = []
        puntuacionesObtenidas = []
        recurso = Curso.objects(id=id).first()
        evaluaciones = Evaluacion.objects(curso=recurso.id).all()
        for evaluacion in evaluaciones:
            if not (evaluacion.acierto in puntuacionesObtenidas):
                puntuacionesObtenidas.append(evaluacion.acierto)
                labels.append(str(evaluacion.acierto)+" porcentaje")
                cantidad = Evaluacion.objects(curso=recurso.id, acierto = evaluacion.acierto).count()
                data.append(cantidad)
        return {
            'labels':labels,
            'data':data
        }

class RecursoRendimientoHabilidades(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoRendimientoHabilidades, self).__init__()
    
    def get(self,id):
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

        labels = []
        data_correcta = []
        data_incorrecta = []
        recurso = Curso.objects(id=id).first()
        evaluaciones = Evaluacion.objects(curso=recurso.id).all()
        for habilidad in recurso.habilidades:
            labels.append(habilidad.nombre)
            correctas_habilidad = 0
            incorrectas_habilidad = 0
            for contenido in recurso.contenidos:
                for pregunta in contenido.preguntas:
                    if pregunta.tipo_pregunta != "TEXTO":
                        if pregunta.habilidad.id == habilidad.id:
                            for evaluacion in evaluaciones:
                                for respuesta in evaluacion.respuestas:
                                    if respuesta.indice_contenido == contenido.identificador:
                                        if respuesta.indice_pregunta == pregunta.indice:
                                            if respuesta.correcta:
                                                correctas_habilidad = correctas_habilidad +1
                                            else:
                                                incorrectas_habilidad = incorrectas_habilidad +1
            data_correcta.append(correctas_habilidad)
            data_incorrecta.append(incorrectas_habilidad)

        return {
            "labels":labels,
            'data':[
                {'data': data_incorrecta, 'label': 'Incorrectas'},
                {'data': data_correcta, 'label': 'Correctas'}
            ]
        }
class RecursoRendimientoPreguntas(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoRendimientoPreguntas, self).__init__()
    
    def get(self,id):
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
        labels = []
        data_correcta = []
        data_incorrecta = []
        recurso = Curso.objects(id=id).first()
        evaluaciones = Evaluacion.objects(curso=recurso.id).all()
        for contenido in recurso.contenidos:
            for pregunta in contenido.preguntas:
                if pregunta.tipo_pregunta != "TEXTO":
                    labels.append("pregunta "+str(pregunta.indice))
                correctas_pregunta = 0
                incorrectas_pregunta = 0
                for evaluacion in evaluaciones:
                    for respuesta in evaluacion.respuestas:
                        if respuesta.indice_pregunta == pregunta.indice:
                            if respuesta.correcta:
                                correctas_pregunta = correctas_pregunta + 1
                            else:
                                incorrectas_pregunta = incorrectas_pregunta + 1
                data_correcta.append(correctas_pregunta)
                data_incorrecta.append(incorrectas_pregunta)
        return {
            'labels': labels,
            'data':[
                {'data': data_incorrecta, 'label': 'Incorrectas'},
                {'data': data_correcta, 'label': 'Correctas'}
                
            ]
        }

class RecursoPublicar( Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(RecursoPublicar, self).__init__()
    
    def post(self,id):
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
        recursoPadre = Curso.objects(id=id).first()
        recursoPadre.publicado  = True
        recursoPadre.save()
        return {"Response":"exito"}
     
class Habilidades(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(Habilidades, self).__init__()
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
        habilidades = []
        for habilidad in Habilidad.objects.all():
            habilidades.append(habilidad.to_dict())
        return habilidades

class RecursoVersiones(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        #self.reqparse.add_argument('contenidos', type = list, location='json')

        super(RecursoVersiones, self).__init__()
    def put(self,id):
        version = Curso.objects(id=id).first()
        version.version_actual = True
        clon_padre = Curso.objects(id=version.clon_padre.id).first()
        clon_padre.habilidades = version.habilidades
        clon_padre.contenidos = version.contenidos
        for version_aux in Curso.objects(clon_padre=clon_padre.id,activo=True).all():
            if str(version_aux.id)!=str(version.id):
                version_aux.version_actual = False
                version_aux.save()
        version.save()
        clon_padre.save()
        return {'Response':'exito'}

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
        version = Curso.objects(id=id).first()
        version.activo = False
        version.save()
        return {'Response':'exito'}
    def post(self,id):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        contenidos = args.get('contenidos')

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
        recursoPadre = Curso.objects(id=id).first()
        recursoHijo = Curso()
        recursoHijo.nombre = recursoPadre.nombre
        recursoHijo.asignatura = recursoPadre.asignatura
        recursoHijo.institucion = recursoPadre.institucion
        recursoHijo.profesor = recursoPadre.profesor
        recursoHijo.categoria = recursoPadre.categoria
        recursoHijo.curso_base = recursoPadre.curso_base
        recursoHijo.descripcion = recursoPadre.descripcion
        recursoHijo.imagen = recursoPadre.imagen
        recursoHijo.clon_padre = recursoPadre.id
        recursoHijo.version = Curso.objects(clon_padre=recursoPadre.id).count()+1

        data = request.data.decode()
        data = json.loads(data)
        #HABILIDADES
        for habilidad in data['habilidades']:
            recursoHijo.habilidades.append(Habilidad.objects(id=habilidad['id']).first())
        #CONTENIDOS
        for contenido in data['contenidos']:
            contenido_aux = Contenido()
            contenido_aux.texto = contenido['texto']
            for contenido_padre in recursoPadre.contenidos:
                if contenido_padre.identificador == (int(contenido['identificador'])-1):
                    contenido_aux.imagen = contenido_padre.imagen
                    contenido_aux.identificador = contenido_padre.identificador
            for pregunta in contenido['preguntas']:
                pregunta_aux = Pregunta()
                pregunta_aux.tipo_pregunta = pregunta['tipo_pregunta']
                pregunta_aux.texto = pregunta['texto']
                print("contenido dsadsa")
                if(pregunta_aux.tipo_pregunta!='TEXTO'):
                    print("pregunta de contenido")
                    print(pregunta)
                    print(pregunta['habilidad'])
                    pregunta_aux.habilidad = Habilidad.objects(id= pregunta['habilidad']['id']).first()
                pregunta_aux.indice = int(pregunta['indice'])-1
                for alternativa in pregunta['alternativas']:
                    alternativa_aux = Alternativa()

                    if pregunta['tipo_pregunta'] == 'UNIR_IMAGEN_TEXTO':
                        print("PREGUNTA UNIR IMAGEN TEXTO")
                        #CASO QUE LA OPCION SI EXISTA NO SE DEBE GUARDAR LA IMAGEN
                        if alternativa['texto'] != '':
                            alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                            alternativa_aux.texto = alternativa['texto']
                            alternativa_aux.texto_secundario = alternativa['texto_secundario']
                        #CASO QUE LA OPCION NO EXISTE POR LO QUE SE DEBE GUARDAR LA IMAGEN
                        if alternativa['texto'] == '':
                            alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                            imagen_data_primaria = re.sub('^data:image/.+;base64,', '', alternativa['imagen'])
                            imagen_primaria = Image.open(BytesIO(base64.b64decode(imagen_data_primaria))).convert("RGB")
                            #GUARDAR IMAGENES
                            nombre_primaria = "primaria_"+str(recursoPadre.id)+"_"+str(recursoHijo.version)+"_"+str(contenido_padre.identificador)+"_"+str(pregunta_aux.indice)+"_"+str(alternativa_aux.numero_alternativa)
                            alternativa_aux.texto = nombre_primaria
                            alternativa_aux.texto_secundario = alternativa['texto_secundario']
                            imagen_primaria.save(os.path.join("./uploads/preguntas", nombre_primaria+".jpg"))
                            imagen_primaria.thumbnail((500, 500))
                            imagen_primaria.save(os.path.join("./uploads/preguntas", nombre_primaria+'_thumbnail.jpg'))


                    if pregunta['tipo_pregunta'] == 'UNIR_IMAGENES':
                        print("PREGUNTA UNIR IMAGENES")
                        #CASO QUE LA OPCION SI EXISTE
                        if alternativa['texto'] != '' or alternativa['texto_secundario'] != '':
                            alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                            alternativa_aux.texto = alternativa['texto']
                            alternativa_aux.texto_secundario = alternativa['texto_secundario']
                        #CASO DE QUE LA OPCION NO EXISTE
                        if alternativa['texto'] == '' or alternativa['texto_secundario'] == '':
                            alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                            imagen_data_primaria = re.sub('^data:image/.+;base64,', '', alternativa['imagen_primaria'])
                            imagen_data_secundaria = re.sub('^data:image/.+;base64,', '', alternativa['imagen_secundaria'])
                            imagen_primaria = Image.open(BytesIO(base64.b64decode(imagen_data_primaria))).convert("RGB")
                            imagen_secundaria = Image.open(BytesIO(base64.b64decode(imagen_data_secundaria))).convert("RGB")
                            #GUARDAR IMAGENES
                            nombre_primaria = "primaria_"+str(recursoPadre.id)+"_"+str(recursoHijo.version)+"_"+str(contenido_padre.identificador)+"_"+str(pregunta_aux.indice)+"_"+str(alternativa_aux.numero_alternativa)
                            nombre_secundaria = "secundaria_"+str(recursoPadre.id)+"_"+str(recursoHijo.version)+"_"+str(contenido_padre.identificador)+"_"+str(pregunta_aux.indice)+"_"+str(alternativa_aux.numero_alternativa)
                            alternativa_aux.texto = nombre_primaria
                            alternativa_aux.texto_secundario = nombre_secundaria
                            imagen_primaria.save(os.path.join("./uploads/preguntas", nombre_primaria+".jpg"))
                            imagen_secundaria.save(os.path.join("./uploads/preguntas", nombre_secundaria+".jpg"))
                            imagen_primaria.thumbnail((500, 500))
                            imagen_secundaria.thumbnail((500, 500))
                            imagen_primaria.save(os.path.join("./uploads/preguntas", nombre_primaria+'_thumbnail.jpg'))
                            imagen_secundaria.save(os.path.join("./uploads/preguntas", nombre_secundaria+'_thumbnail.jpg'))


                    if pregunta['tipo_pregunta'] == 'UNIR_TEXTOS':
                        print("PREGUNTA UNIR TEXTOS")
                        alternativa_aux.texto = alternativa['texto']
                        alternativa_aux.texto_secundario = alternativa['texto_secundario']
                        alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                    if pregunta['tipo_pregunta'] == 'ALTERNATIVA' or pregunta['tipo_pregunta'] == 'VERDADERO_FALSO':
                        print("PREGUNTA ALTERNATIVA O VF")
                        alternativa_aux.texto = alternativa['texto']
                        print("la alternativa correcta es")
                        print(alternativa['correcta'])
                        alternativa_aux.correcta = alternativa['correcta']
                        alternativa_aux.numero_alternativa = int(alternativa['numero_alternativa'])-1
                    pregunta_aux.alternativas.append(alternativa_aux)
                contenido_aux.preguntas.append(pregunta_aux)
            recursoHijo.contenidos.append(contenido_aux)

        # cambiar la version actual de todos los otros hijos
        for recurso in Curso.objects(clon_padre=recursoPadre.id).all():
            recurso.version_actual = False
            recurso.save()
        recursoHijo.save()
        recursoPadre.habilidades = recursoHijo.habilidades
        recursoPadre.contenidos = recursoHijo.contenidos
        recursoPadre.save()
        return{"Response":"extio"}

    def get(self,id):
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
        curso = Curso.objects(id=id).first()
        versiones = []
        for version in Curso.objects(clon_padre=curso,activo=True).all():
            versiones.append(version.to_dict())
        return versiones

class RecursosColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        self.reqparse.add_argument('nombre', type = str, required=True, location='json')
        self.reqparse.add_argument('asignatura', type = str, required=True, location='json')
        self.reqparse.add_argument('curso_base', type = str, required=True, location='json')
        self.reqparse.add_argument('descripcion', type = str, required=True, location='json')
        super(RecursosColegio, self).__init__()

    def post(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        profesor = Profesor.load_from_token(token)
        if profesor == None:
            return {'response': 'user_invalid'}, 401
        
        institucion = Institucion.objects(id=profesor.institucion.id).first()
        if institucion is None:
            return {'response': 'colegio_invalid'}, 401

        
        asignatura = Asignatura.objects(id= args['asignatura']).first()
        curso_base = CursoBase.objects(id=args['curso_base']).first()

        curso = Curso()
        version = Curso()
        curso.imagen = curso_base.imagen
        version.nombre = args['nombre']
        curso.nombre = args['nombre']
        curso.categoria = curso_base.categoria
        version.categoria = curso_base.categoria
        version.institucion = institucion
        curso.institucion = institucion

        for habilidad_base in curso_base.habilidades:
            curso.habilidades.append(habilidad_base.id)
            version.habilidades.append(habilidad_base.id)

        for contenido_base in curso_base.contenidos:
            contenido = Contenido()
            contenido.identificador = contenido_base.identificador
            contenido.texto = contenido_base['texto']
            for pregunta_base in contenido_base['preguntas']:
                pregunta = Pregunta()
                pregunta.texto = pregunta_base['texto']
                pregunta.indice = pregunta_base['indice']
                if pregunta_base.tipo_pregunta != "TEXTO":
                    pregunta.habilidad = pregunta_base['habilidad']
                pregunta.tipo_pregunta = pregunta_base['tipo_pregunta']
                for alternativa_base in pregunta_base['alternativas']:
                    alternativa = Alternativa()
                    alternativa.texto = alternativa_base['texto']
                    alternativa.texto_secundario = alternativa_base['texto_secundario']
                    alternativa.correcta = alternativa_base['correcta']
                    alternativa.numero_alternativa = alternativa_base['numero_alternativa']
                    pregunta.alternativas.append(alternativa)
                contenido.preguntas.append(pregunta)
            curso.contenidos.append(contenido)
            version.contenidos.append(contenido)
        curso.asignatura = asignatura.id
        curso.profesor = profesor.id
        curso.activo = True
        curso.curso_base = curso_base.id
        if args['descripcion']:
            curso.descripcion = args['descripcion']
        version.asignatura = asignatura.id
        version.profesor = profesor.id
        version.activo = True
        version.curso_base = curso_base.id
        version.descripcion = args['descripcion']
        curso.save()
        version.clon_padre = curso.id
        version.save()
        return {'Response': 'exito', 'id': str(curso.id), 'id_base': str(curso_base.id)}

class CursoDisponiblesAlumno(Resource):
    def get(self,id_alumno):
        response = []
        alumno = Alumno.objects(id=id_alumno).first()
        for recurso in Curso.objects(institucion=None,clon_padre=None,activo=True,eliminado=False):
            if not(alumno in recurso.alumnos):
                if len(Inscripcion.objects(alumno=alumno,curso=recurso).all())>0:
                    bandera = True
                    for inscripcion in Inscripcion.objects(alumno=alumno,curso=recurso).all():
                        if inscripcion.estado == "ENVIADA" or inscripcion.estado == "ACEPTADA":
                            bandera = False
                    if bandera:
                        response.append(recurso.to_dict())
                else:
                    response.append(recurso.to_dict())
        return response


class CursoDetalleAlumno(Resource):
    def get(self,id_curso,id_alumno):
        curso = Curso.objects(id=id_curso, clon_padre=None).first()
        alumno = Alumno.objects(id=id_alumno).first()
        evaluacion = Evaluacion.objects(alumno=alumno.id, curso = curso.id ).first()
        respuesta = []
        alumno = alumno.to_dict()
        respuestas_alumno = []
        if evaluacion!=None:

            for contenido in curso.contenidos:
                for pregunta in contenido.preguntas:
                    for respuesta_aux in evaluacion.respuestas:
                        if respuesta_aux.indice_pregunta == pregunta.indice:
                            respuesta_aux = respuesta_aux.to_dict()
                            respuesta_aux['pregunta'] = pregunta.texto
                            respuesta_aux['tipo_pregunta'] = pregunta.tipo_pregunta
                            respuestas_alumno.append(respuesta_aux)


            for habilidad_respuesta in curso.habilidades:
                preguntas_habilidad = 0
                respuestas_correctas_habilidad = 0
                for contenido in curso.contenidos:
                    for pregunta in contenido.preguntas:
                        if pregunta.tipo_pregunta != "TEXTO":
                            if pregunta['habilidad'].id == habilidad_respuesta.id:
                                preguntas_habilidad = preguntas_habilidad+1
                                for respuesta_aux in evaluacion.respuestas:
                                    if respuesta_aux.indice_pregunta == pregunta.indice:
                                        if respuesta_aux.correcta:
                                            respuestas_correctas_habilidad = respuestas_correctas_habilidad +1

                respuesta.append(
                    {   'respuesta_correctas': respuestas_correctas_habilidad,
                        'cantidad_preguntas': preguntas_habilidad,
                        'habilidad': habilidad_respuesta['nombre']
                    }
                )
            respuestas_alumno = Respuesta.sort_respuestas(respuestas_alumno)
            

            alumno['evaluacion'] = True
            alumno['progreso'] = evaluacion.acierto
            alumno['respuestas_data'] = respuestas_alumno
        else:
            for habilidad_respuesta in curso.habilidades:
                preguntas_habilidad = 0
                for contenido in curso.contenidos:
                    for pregunta in contenido.preguntas:
                        if pregunta['habilidad'] == habilidad_respuesta:
                            preguntas_habilidad = preguntas_habilidad+1
                respuesta.append(
                    { 'respuesta_correctas': 0,
                        'cantidad_preguntas': preguntas_habilidad,
                        'habilidad': habilidad_respuesta['nombre']
                    }
                )
            alumno['evaluacion'] = False
            alumno['progreso'] = 0
        
        alumno['respuestas'] = respuesta
        return {
                "curso": curso.to_dict(),
                "alumno": alumno
            }


class CursosAsignaturaGrafico(Resource):
    def get(self):
        labels = []
        data = []
        for asignatura in Asignatura.objects().all():
            labels.append(asignatura.nombre)
            data.append(Curso.objects(asignatura=asignatura.id,activo=True,clon_padre=None).count())
        return { 'data': data, 'labels':labels}
class CursosAprobacionGrafico(Resource):
    def get(self,id):
        labels = []
        data = [
            { 'data': [], 'label': 'Desaprobación' },
            { 'data': [], 'label': 'Aprobación' }
        ]
        for curso in Curso.objects(activo=True, clon_padre=None).all():
            curso.actualizar_aprobacion()
            labels.append(curso.nombre)
            data[1]['data'].append(curso.aprobacion)
            data[0]['data'].append(100-curso.aprobacion)
        return {'labels':labels, 'data':data }


class CursosActivosProfesorColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(CursosActivosProfesorColegio, self).__init__()

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
        profesor = userProf
        response = []
        for curso in Curso.objects(activo=True, institucion=institucion.id,profesor=profesor.id, clon_padre=None).all():
            if curso.clon_padre == None:
                categoria = Categoria.objects(id=curso.categoria.id).first()
                curso = curso.to_dict()
                print(curso['imagen'])
                curso['categoria'] = categoria.to_dict()
                response.append(curso)
        return response

class CursosDesactivadosProfesorColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(CursosDesactivadosProfesorColegio, self).__init__()

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
        profesor = userProf
        response = []
        for curso in Curso.objects(activo=False, institucion=institucion.id,profesor=profesor.id, clon_padre=None).all():
            if curso.clon_padre == None:
                if curso.eliminado == False:
                    categoria = Categoria.objects(id=curso.categoria.id).first()
                    curso = curso.to_dict()
                    curso['categoria'] = categoria.to_dict()
                    response.append(curso)
        return response


class CursosBaseColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(CursosBaseColegio, self).__init__()
    
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
        cursosBaseInstitucion = []
        cursosBaseDisponibles = []
        for cursoBase in CursoBase.objects().all():
            if cursoBase in institucion.cursos_base:
                cursosBaseInstitucion.append(cursoBase.to_dict())
            else:
                cursosBaseDisponibles.append(cursoBase.to_dict())
        return {
            "cursosBaseColegio":cursosBaseInstitucion,
            "cursosBaseDisponibles":cursosBaseDisponibles
        }

class CursosAdminColegio(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(CursosAdminColegio, self).__init__()

    def get(self):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        user = Administrador.load_from_token(token)
        if user == None:
            return {'response': 'user_invalid'},401
        institucion = Institucion.objects(id=user.institucion.id).first()
        if institucion==None:
            return {'response': 'colegio_invalid'},404
        cursos = []
        for curso in Curso.objects(institucion = institucion.id, clon_padre=None).all():
            if curso.eliminado== False:
                cursos.append(curso.to_dict())
        return cursos

class CursoItem(Resource):
    def put(self, id):
        curso = Curso.objects(id=id).first()
        curso.activo = False
        curso.save()
        return {'Response':'exito'}

    def delete(self, id):
        curso = Curso.objects(id=id).first()
        curso.activo = False
        curso.save()
        return{'Response':'exito'}
    
    def get(self,id):
        return Curso.objects(id=id).first().to_dict()

class CursoDetallePut(Resource):
    def put(self):
        #Cargar datos dinamicos
        data = request.data.decode()
        data = json.loads(data)
        data = data['data']
        curso = Curso.objects(id=data['codigo_curso'], clon_padre=None).first()
        curso.nombre = data['nombre']
        curso.descripcion = data['descripcion']
        #for pregunta in data['preguntas']:
        curso.save()

        return {'test': 'test'}

class CursoDetalle(Resource):
    def get(self, id):
        curso = Curso.objects(id=id,clon_padre=None).first()
        alumnos = []
        for alumno in curso.alumnos:
            if alumno.activo:
                evaluacion = Evaluacion.objects(alumno=alumno.id, curso = curso ).first()
                respuesta = []
                alumno = alumno.to_dict()
                if evaluacion!=None:
                    for habilidad_respuesta in curso.habilidades:
                        preguntas_habilidad = 0
                        respuestas_correctas_habilidad = 0
                        for contenido in curso.contenidos:
                            for pregunta in contenido.preguntas:
                                if pregunta.tipo_pregunta != "TEXTO":
                                    if pregunta['habilidad'] and pregunta['habilidad'].id == habilidad_respuesta.id:
                                        preguntas_habilidad = preguntas_habilidad+1
                                        for respuesta_aux in evaluacion.respuestas:
                                            if respuesta_aux.indice_contenido == contenido.identificador:
                                                if respuesta_aux.indice_pregunta == pregunta.indice:
                                                    if respuesta_aux.correcta:
                                                        respuestas_correctas_habilidad = respuestas_correctas_habilidad +1

                        respuesta.append(
                            { 'respuesta_correctas': respuestas_correctas_habilidad,
                              'cantidad_preguntas': preguntas_habilidad,
                              'habilidad': habilidad_respuesta['nombre']
                            }
                        )                         
                    alumno['evaluacion'] = True
                    alumno['progreso'] = evaluacion.acierto
                else:
                    for habilidad_respuesta in curso.habilidades:
                        preguntas_habilidad = 0
                        for contenido in curso.contenidos:
                            for pregunta in contenido.preguntas:
                                if pregunta['habilidad'] == habilidad_respuesta:
                                    preguntas_habilidad = preguntas_habilidad+1
                        respuesta.append(
                            { 'respuesta_correctas': 0,
                              'cantidad_preguntas': preguntas_habilidad,
                              'habilidad': habilidad_respuesta['nombre']
                            }
                        )
                    alumno['evaluacion'] = False
                    alumno['progreso'] = 0
                alumno['respuestas'] = respuesta
                alumnos.append(alumno)
        return {
                "curso": curso.to_dict(),
                "alumnos": alumnos
            }

class Cursos(Resource):
    def get(self):
        response =[]
        for curso in Curso.objects(clon_padre=None).all():
            response.append(curso.to_dict())
        return response


    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        token = request.headers.get('auth_token')
        profesor = Profesor.load_from_token(token)
        asignatura = Asignatura.objects(id= data['asignatura']).first()
        curso_base = CursoBase.objects(id=data['curso_base']).first()
        curso = Curso()
        curso.nombre = data['nombre']
        curso.categoria = curso_base.categoria

        for habilidad_base in curso_base.habilidades:
            curso.habilidades.append(habilidad_base.id)

        for contenido_base in curso_base.contenidos:
            contenido = Contenido()
            contenido.identificador = contenido_base.identificador
            contenido.texto = contenido_base['texto']
            for pregunta_base in contenido_base['preguntas']:
                pregunta = Pregunta()
                pregunta.texto = pregunta_base['texto']
                pregunta.indice = pregunta_base['indice']
                if pregunta_base.tipo_pregunta != "TEXTO":
                    pregunta.habilidad = pregunta_base['habilidad']
                pregunta.tipo_pregunta = pregunta_base['tipo_pregunta']
                for alternativa_base in pregunta_base['alternativas']:
                    alternativa = Alternativa()
                    alternativa.texto = alternativa_base['texto']
                    alternativa.texto_secundario = alternativa_base['texto_secundario']
                    alternativa.correcta = alternativa_base['correcta']
                    alternativa.numero_alternativa = alternativa_base['numero_alternativa']
                    pregunta.alternativas.append(alternativa)
                contenido.preguntas.append(pregunta)
            curso.contenidos.append(contenido)
        curso.asignatura = asignatura.id
        curso.profesor = profesor.id
        curso.activo = True
        curso.curso_base = curso_base.id
        curso.descripcion = data['descripcion']
        curso.save()
        return {'Response': 'exito', 'id': str(curso.id), 'id_base': str(curso_base.id)}

    def put(self):
        #Cargar datos dinamicos
        data = request.data.decode()
        data = json.loads(data)
        idCurso = data['id']
        data = data['data']

        cursoBase = CursoBase.objects(id=data['curso_base']).first()
        asignatura = Asignatura.objects(id=data['asignatura']).first()
        institucion = Institucion.objects(id=data['institucion']).first()
        profesor = Profesor.objects(id=data['profesor']).first()
        alumnos = Alumno.objects(id=data['alumnos']).first()
        pregunta = Pregunta()

        curso = Curso.objects(id=idCurso, clon_padre=None).first()
        curso.nombre = data['nombre']
        curso.fecha_creacion = '10/06/2012'
        curso.preguntas = [pregunta]
        curso.asignatura = asignatura.id
        curso.institucion = institucion.id
        curso.profesor = profesor.id
        curso.alumnos = [alumnos.id]
        curso.activo = True
        curso.version = data['version']
        curso.curso_base = cursoBase.id
        curso.save()

        return {'test': 'test'}

class CursosAdmin(Resource):
    def get(self):
        resultado = []
        cursos = Curso.objects(clon_padre=None).all()
        for curso in cursos:
            if curso.clon_padre == None and curso.eliminado == False:
                profesor = ""
                asignatura = ""
                if curso.profesor != None:
                    profesor = curso.profesor.nombres+" "+curso.profesor.apellido_paterno
                if curso.asignatura != None:
                    asignatura = curso.asignatura.nombre
                diccionario_aux ={
                    "id": str(curso.id),
                    "nombre": curso.nombre,
                    "cant_estudiantes": len(curso.alumnos),
                    "profesor": profesor,
                    "nombre_asignatura": asignatura,
                    "codigo_curso": str(curso.id),
                    "curso_base": curso.curso_base.nombre,
                    "version": curso.version,
                    "creacion": str(curso.fecha_creacion),
                    "activo": curso.activo,
                    "imagen": curso.imagen
                }
                resultado.append(diccionario_aux)
        return resultado

class CursosActivos(Resource):
    def get(self, id):
        cursos = []
        for curso in Curso.objects(activo=True,profesor=id, clon_padre=None).all():
            cursos.append(curso.to_dict())
        return cursos

class CursosCerrados(Resource):
    def get(self, id):
        cursos = []
        for curso in Curso.objects(activo=False,profesor=id, clon_padre=None, eliminado=False).all():
            if curso.eliminado == False:
                cursos.append(curso.to_dict())
        return cursos

class CursosBase(Resource):
    def get(self):
        cursosBase = []
        for cursoBase in CursoBase.objects().all():
            cursosBase.append(cursoBase.to_dict())
        return cursosBase

class CursoBaseItem(Resource):
    def get(self, id):
        return CursoBase.objects(id=id).first().to_dict()

class CursoAlumnos(Resource):
    def get(self):
        cursos = Curso.objects(clon_padre=None).all()

        results = []
        for curso in cursos:
            if curso.activo:
                for alumno in curso.alumnos:
                    results.append( {'nombres': alumno.nombres, 'apellido_paterno': alumno.apellido_paterno,
                        'apellido_materno': alumno.apellido_materno, 'email': alumno.email, 'nombre_curso': curso.nombre,
                        'asignatura_curso': curso.asignatura.nombre, 'id': str(alumno.id)} )



        return results

class CursoAlumno(Resource):
    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        curso = Curso.objects(id=data['id_curso'],clon_padre=None).first()
        alumno = Alumno.objects(id=data['id_alumno']).first()
        curso.alumnos.remove(alumno)
        curso.save()
        return {'Response': 'exito'}

class CursoImagenItem(Resource):
    def post(self, id): 
        imagen = Image.open(request.files['imagen'].stream).convert("RGB")
        imagen.save(os.path.join("./uploads/cursos", str(id)+".jpg"))
        imagen.thumbnail((500, 500))
        imagen.save(os.path.join("./uploads/cursos", str(id)+'_thumbnail.jpg'))
        curso = Curso.objects(id=id,clon_padre=None).first()
        curso.imagen = str(id)
        curso.save()
        return {'Response': 'exito'}
    
    def get(self, id):
        base_path = 'uploads/cursos/'
        likely = ('%s_thumbnail.jpg' % id,
                  '%s.jpg' % id,
                  id)
        for path in likely:
            if os.path.exists(base_path + path):
                return send_file(base_path + path)
        return send_file('uploads/cursos/default.jpg')

class ContenidoImagenItem(Resource):
    def get(self, nombre):
        '''
            nombre: nombre del archivo a enviar
            comprueba si existe el archivo con sus variantes
        '''
        if os.path.exists('uploads/cursos/' + nombre + '_thumbnail.jpg'):
            return send_file('uploads/cursos/' + nombre + '_thumbnail.jpg')
        if os.path.exists('uploads/cursos/' + nombre + '.jpg'):
            return send_file('uploads/cursos/' + nombre + '.jpg')
        if os.path.exists('uploads/cursos/' + nombre):
            return send_file('uploads/cursos/' + nombre)
        return send_file('uploads/contenidos/default_thumbnail.jpg')

class CursoImagenDefaultItem(Resource):
    def get(self,id):
        curso = Curso.objects(id=id,clon_padre=None).first()
        curso_base = CursoBase.objects(id=curso.curso_base.id).first()
        f = Path('uploads/cursos/'+str(curso_base.imagen))
        if(f.exists()== False):
            curso.imagen = "default_thumbnail.jpg"
        else:
            imagen = Image.open("./uploads/cursos/"+str(curso_base.imagen))
            imagen.save(os.path.join("./uploads/cursos", str(id)+".jpg"))
            imagen.thumbnail((500, 500))
            imagen.save(os.path.join("./uploads/cursos", str(id)+'_thumbnail.jpg'))
        curso.imagen = str(id)+".jpg"
        curso.save()
        return {'Response': 'exito'}
