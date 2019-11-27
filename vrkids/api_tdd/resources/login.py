from flask import Flask, Blueprint, jsonify, request
from models.alumno import Alumno
from models.administrador import Administrador
from models.profesor import Profesor
from flask_restful import Api, Resource, url_for
from libs.to_dict import mongo_to_dict
import json

def init_module(api):
    api.add_resource(Login, '/login')
    api.add_resource(Logout, '/logout')


class Login(Resource):
    def post(self):
        data = request.data.decode()
        data = json.loads(data)
        
        if(data['tipo'] == 'ADMINISTRADOR'):
            administrador = Administrador.objects(email = data['email'], password = data['password']).first()
            if(administrador == None):
                return {'respuesta': 'no_existe'}
            else:
                return {'respuesta': json.loads(administrador.to_json()), 'tipo': 'ADMINISTRADOR'}

class Logout(Resource):
    def post(self):
        return {'respuesta': True}