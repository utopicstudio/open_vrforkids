from flask import Flask, Blueprint, jsonify, request, send_file, current_app
from models.curso import Curso
from models.alumno import Alumno
from models.profesor import Profesor
from models.administrador import Administrador
from models.evaluacion import Evaluacion
from models.respuesta import Respuesta, RespuestaOpcion
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
from libs.auth import token_required
from functools import wraps
from bson.objectid import ObjectId
from flask_restful import reqparse
import json
from libs.auth import token_required
from PIL import Image
import os

def init_module(api):
    api.add_resource(CursoCargar, '/recursos/<id_recurso>')
    api.add_resource(CursoEvalaucionAlumno, '/recursos/<id_recurso>/respuestas')
    api.add_resource(PreguntaImagen, '/preguntas/<_id>')

class CursoEvalaucionAlumno(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        # self.reqparse.add_argument('respuestas', type=json, required=True, location='json')
        super(CursoEvalaucionAlumno, self).__init__()
    
    #@token_required("Administrador", "Profesor")
    def get(self,id_recurso):
        args = self.reqparse.parse_args()
        token = args.get('auth-token')
        userAdmin = Administrador.load_from_token(token)
        userProf = Profesor.load_from_token(token)
        if userAdmin == None and userProf == None:
            return {'response': 'user_invalid'}, 401
        recurso = Curso.objects(id=id_recurso).first()
        if recurso == None:
            return {'response': 'resorce_invalid'},404
        response = []
        for evaluacion in Evaluacion.objects(curso=recurso.id).all():
            response.append(evaluacion.to_dict())
        return response

    def put(self,id_recurso):
        args = self.reqparse.parse_args()
        user = None
        token = args.get('auth-token')
        data = request.data.decode()
        data = json.loads(data)
        user = Alumno.load_from_token(token)
        if user == None:
            return {'response': 'user_invalid'},401
        curso = Curso.objects(id=id_recurso).first()
        if curso==None:
            return {'response': 'resource_invalid'},404
        alumno = user
        if len(data) == 0:
            return {'response': 'no answers'}, 404
        respuestas = data
        evaluacion = Evaluacion.objects(alumno=user, curso=curso).first()
        if evaluacion != None:
            evaluacion.respuestas = []
            evaluacion.acierto = 0
            evaluacion.save()
        if not evaluacion:
            evaluacion = Evaluacion()

        evaluacion.alumno = alumno.id
        evaluacion.curso = curso.id
        cantidad_correcta = 0
        acierto = 0
        
        #DETERMINAR LA VARIABLE QUE ALMACENARA LAS OPCIONES DE CADA PREGUNTA VALIDA
        respuestas_ordenadas = []
        for contenido in curso.contenidos:
            for pregunta in contenido.preguntas:
                if pregunta.tipo_pregunta != "TEXTO":
                    respuestas_ordenadas.append({
                        "indice_pregunta":pregunta.indice,
                        "indice_contenido": contenido.identificador,
                        "respuestas_enviadas":[]
                    })

        #GUARDO LAS RESPUESTAS ENVIADAS PARA CADA PREGUNTA A PARTIR DE SU INDICE
        for respuesta in respuestas:
            for respuesta_ordenada in respuestas_ordenadas:
                if (int(respuesta['id_contenido']) == int(respuesta_ordenada['indice_contenido'])) and ( int(respuesta['indice_pregunta']) == int(respuesta_ordenada['indice_pregunta'])):
                    respuesta_ordenada['respuestas_enviadas'].append(respuesta)

        #ASEGURARSE DE QUE SE ENVIARON RESPUESTAS PARA TODAS LAS PREGUNTAS EN CASO CONTRARIO RESPONDER FALLO
        for respuesta_ordenada in respuestas_ordenadas:
            for contenido in curso.contenidos:
                if contenido.identificador == respuesta_ordenada['indice_contenido']:
                    for pregunta in contenido.preguntas:
                        if pregunta.indice == respuesta_ordenada['indice_pregunta']:
                            if pregunta.tipo_pregunta != "TEXTO":
                                if len(respuesta_ordenada['respuestas_enviadas']) == 0:
                                    return {'response': 'answers invalid'}, 404

        for respuestas_pregunta in respuestas_ordenadas:
            #EN ESTE PUNTO ESTAMOS VIENDO UNA PREGUNTA EN PARTICULAR
            # VARIABLE QUE CERTIFICA QUE LA PREGUNTA ES CORRECTA, POR DEFECTO SI ES CORRECTA
            correcta= True

            # SE CREA LA RESPUESTA QUE SERA ANNADIDA A LA EVALUACION
            respuesta_aux = Respuesta()

            for contenido in curso.contenidos:
                if int(respuestas_pregunta['indice_contenido']) == int(contenido.identificador):
                    respuesta_aux.indice_contenido = int(respuestas_pregunta['indice_contenido'])
                    for pregunta in contenido.preguntas:
                        #ACCEDIMOS A LA PREGUNTA
                        if int(respuestas_pregunta['indice_pregunta']) == int(pregunta.indice):

                            #CASO PREGUNTAS DE TIPO TEXTO
                            if pregunta.tipo_pregunta == "TEXTO":
                                respuesta_aux.indice_pregunta = pregunta.indice
                                respuesta_aux.opciones = []
                                evaluacion.respuestas.append(respuesta_aux)

                            #CASO PREGUNTAS DE TIPO ALTERNATIVA
                            if pregunta.tipo_pregunta == "ALTERNATIVA":
                                #RECORRER LAS OPCIONES ENVIADAS
                                for respuesta_enviada in respuestas_pregunta['respuestas_enviadas']:
                                    if respuesta_enviada['respuesta'] == "True":
                                        #VERIFICAR QUE ES LA CORRECTA O NO
                                        for alternativa in pregunta.alternativas:
                                            if alternativa.correcta:
                                                #SI LA ALTERNATIVA ES CORRECTA VER SI COINCIDE CON LO SE MANDO
                                                if int(respuesta_enviada['indice_opcion']) != int(alternativa.numero_alternativa):
                                                    correcta = False
                                                # SE TIENE QUE GUARDAR LA OPCION DE LA RESPUESTA
                                                respuesta_opcion = RespuestaOpcion()
                                                respuesta_opcion.numero_opcion = int(respuesta_enviada['indice_opcion'])
                                                respuesta_opcion.correcta = correcta
                                                respuesta_opcion.data = str(respuesta_enviada['respuesta'])
                                                respuesta_aux.opciones.append(respuesta_opcion) 
                                respuesta_aux.indice_pregunta = pregunta.indice
                                respuesta_aux.correcta = correcta
                                # SE GUARDA LA RESPUESTA A LA PREGUNTA EN LA EVALUACION
                                evaluacion.respuestas.append(respuesta_aux)

                            #CASO PREGUNTA VERDADERO Y FALSO
                            if pregunta.tipo_pregunta == "VERDADERO_FALSO":
                                #RECORRER LAS OPCIONES ENVIADAS
                                for respuesta_enviada in respuestas_pregunta['respuestas_enviadas']:
                                    #POR CADA OPCION SE TIENE QUE CREAR UNA RESPUESTAOPCION Y VERIFICAR SI SE FALLÓ
                                    #SETEAR CORECTA A FALSO
                                    #RECORRER LAS ALTERNATIVAS
                                    respuesta_opcion = RespuestaOpcion()
                                    correcta_opcion = False
                                    for alternativa in pregunta.alternativas:
                                        if alternativa.numero_alternativa == int(respuesta_enviada['indice_opcion']):
                                            if str(alternativa.correcta) == str(respuesta_enviada['respuesta']):
                                                correcta_opcion = True
                                            else:
                                                correcta_opcion = False
                                                correcta = False
                                    respuesta_opcion.numero_opcion = int(respuesta_enviada['indice_opcion'])
                                    respuesta_opcion.data = str(respuesta_enviada['respuesta'])
                                    respuesta_opcion.correcta = correcta_opcion
                                    respuesta_aux.opciones.append(respuesta_opcion)
                                
                                respuesta_aux.indice_pregunta = pregunta.indice
                                respuesta_aux.correcta = correcta
                                # SE GUARDA LA RESPUESTA A LA PREGUNTA EN LA EVALUACION
                                evaluacion.respuestas.append(respuesta_aux)
                            
                            #CASO UNIR PARES
                            if pregunta.tipo_pregunta == "UNIR_IMAGENES" or pregunta.tipo_pregunta == "UNIR_TEXTOS" or pregunta.tipo_pregunta == "UNIR_IMAGEN_TEXTO":
                                for respuesta_enviada in respuestas_pregunta['respuestas_enviadas']:
                                    respuesta_opcion = RespuestaOpcion()
                                    if int(respuesta_enviada['respuesta']) == int(respuesta_enviada['indice_opcion']):
                                        correcta = True
                                    else:
                                        correcta = False
                                    respuesta_opcion.numero_opcion = respuesta_enviada['indice_opcion']
                                    respuesta_opcion.data = str(respuesta_enviada['respuesta'])
                                    respuesta_opcion.correcta = correcta
                                    respuesta_aux.opciones.append(respuesta_opcion)
                                respuesta_aux.indice_pregunta = pregunta.indice
                                respuesta_aux.correcta = correcta
                                evaluacion.respuestas.append(respuesta_aux)
            # ACTUALIZAR CONTADOR DE LAS RESPUESTAS CORRECTAS
            if correcta:
                cantidad_correcta = cantidad_correcta + 1


        if len(respuestas_ordenadas)>0:
            cantidad_preguntas = 0
            for contenido in curso.contenidos:
                for pregunta in contenido.preguntas:
                    if pregunta.tipo_pregunta != "TEXTO":
                        cantidad_preguntas = cantidad_preguntas +1
            if cantidad_preguntas == 0:
                acierto = 0
            else:
                acierto = int((cantidad_correcta/cantidad_preguntas)*100)
        evaluacion.acierto = acierto
        evaluacion.json = json.dumps(data)
        evaluacion.save()

        #ACTUALIZAR LA APROBACION DEL RECURSO
        curso.actualizar_aprobacion()
        curso.save()
        #return {"Response": 200}
        return {"Response":respuestas_ordenadas}

class CursoCargar(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('auth-token', type = str, required=True, location='headers')
        super(CursoCargar, self).__init__()

    def get(self, id_recurso):
        args = self.reqparse.parse_args()
        user = None
        token = args.get('auth-token')
        user = Alumno.load_from_token(token)
        user_prof = Profesor.load_from_token(token)
        user_admin = Administrador.load_from_token(token)
        if user == None and user_admin == None and user_prof == None:
            return {'response': 'user_invalid'},401
    
        if len(id_recurso.encode('utf-8')) != 24:
            return {'response': 'bad_request'},400
        curso = Curso.objects(id=id_recurso).first()
        if curso==None:
            return {'response': 'resource_invalid'},404
        response = {}
        response['id'] = str(curso.id)
        response['nombre'] = curso.nombre
        response['fecha_creacion'] = str(curso.fecha_creacion)
        response['asignatura'] = curso.asignatura.to_dict()
        response['profesor'] = curso.profesor.to_dict()

        contenidos = []
        for contenido in curso.contenidos:
            preguntas = []
            for pregunta in contenido.preguntas:
                if pregunta.tipo_pregunta == "ALTERNATIVA" or pregunta.tipo_pregunta == "VERDADERO_FALSO":
                    opciones = []
                    for opcion in pregunta.alternativas:
                        opciones.append(opcion.to_dict())
                    preguntas.append({
                        "tipo": pregunta.tipo_pregunta,
                        "indice": pregunta.indice,
                        "texto": pregunta.texto,
                        "habilidad": pregunta.habilidad.to_dict(),
                        "opciones": opciones
                    })
                if pregunta.tipo_pregunta == "TEXTO":
                    preguntas.append({
                        "tipo": pregunta.tipo_pregunta,
                        "indice": pregunta.indice,
                        "texto": pregunta.texto
                    })
                if pregunta.tipo_pregunta == "UNIR_IMAGENES" or pregunta.tipo_pregunta == "UNIR_TEXTOS" or pregunta.tipo_pregunta == "UNIR_IMAGEN_TEXTO":
                    opciones = []
                    for opcion in pregunta.alternativas:
                        opciones.append(opcion.to_dict())
                    preguntas.append({
                        "tipo": pregunta.tipo_pregunta,
                        "indice": pregunta.indice,
                        "texto": pregunta.texto,
                        "habilidad": pregunta.habilidad.to_dict(),
                        "opciones": opciones
                    })
            contenidos.append({
                "identificador" : contenido.identificador,
                "preguntas" : preguntas
            })
        response['contenidos'] = contenidos
        return response

class PreguntaImagen(Resource):    
    def get(self, _id):
        if '.jpg' in _id:
            _id = _id[:-4]
        path = 'uploads/preguntas/' + _id + '_thumbnail.jpg'
        if not  os.path.exists(path):
            path = 'uploads/preguntas/' + _id + '.jpg'
        return send_file(path)
            

    def post(self, _id):
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        upload_folder = os.path.join(upload_folder, 'preguntas')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        imagen = Image.open(request.files['imagen'].stream).convert("RGB")
        imagen.save(os.path.join(upload_folder, str(_id)+".jpg"))
        imagen.thumbnail((500, 500))
        imagen.save(os.path.join(upload_folder, str(_id)+'_thumbnail.jpg'))
        return {'Response': '200'},404