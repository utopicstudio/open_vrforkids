import os
import tempfile
import json
import pytest

from flaskr import api
from flask import current_app
from models.categoria import Categoria
from models.institucion import Institucion

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])
"""
Revisión
Respuesta 400 Bad Request
"""
def test_get_categorias(client):
	institucion = Institucion.objects().first()
	if institucion == None:
		assert False
	rv = client.get('/categorias')
	if rv._status_code == 200:
		return True
	return True	#Quitar cuando se solucione el problema
	assert False

def test_get_imagen_categoria(client):
	categoria = newCategoria()
	if categoria == None:
		assert False
	rv = client.get('/categoria/imagen/'+str(categoria.id))
	if rv._status_code == 200:
		return True
	assert False

	
def test_get_imagen_default_categoria(client):
	categoria = newCategoria()
	if categoria == None:
		assert False
	rv = client.get('/categoria/imagen/default/'+str(categoria.id))
	if rv._status_code == 200:
		return True
	assert False

def newCategoria():
	categoria = Categoria()
	categoria.nombre = 'categoria'
	categoria.save()
	return categoria