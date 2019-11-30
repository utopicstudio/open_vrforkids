import os
import tempfile
import json
import pytest

from flaskr import api
from models.evaluacion import Evaluacion

@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_evaluaciones(client):
	rv = client.get('/evaluaciones')
	if rv._status_code == 200:
		return True	
	assert False

def test_get_evaluacion_id(client):
	evaluacion = newEvaluacion()
	if evaluacion == None:
		assert False
	rv = client.get('/evaluaciones/'+str(evaluacion.id))
	if rv._status_code == 200:
		return True
	assert False

def newEvaluacion():
	evaluacion = Evaluacion()
	evaluacion.acierto = 1
	evaluacion.save()
	return evaluacion

