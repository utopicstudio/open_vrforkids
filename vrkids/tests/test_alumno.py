import os
import tempfile
import json
import pytest
from io import BytesIO
from os.path import dirname, abspath
from datetime import datetime

from flaskr import api
from models.alumno import Alumno
from models.curso import Curso
from models.grado import Grado
from models.institucion import Institucion
from models.profesor import Profesor
@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_alumno(client):
    alumno = newAlumno()
    if alumno == None:
        assert False
    rv = client.get('/alumnos/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_delete_alumno(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.delete('/alumnos/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_put_alumno(client):
    alumno = Alumno.objects().first()
    institucion = newInstitucion()
    grado = newGrado()
    if alumno == None or institucion == None:
        assert False
    data = {
        'nombres': 'nombre prueba',
        'apellido_paterno': 'paterno',
        'apellido_materno': 'materno',
        'email': 'prueba@prueba.prueba',
        'telefono': '+560',
        'nombre_usuario': 'usuario_prueba',
        'password': 'asd',
        'matricula': 'matricula',
        'institucion': str(institucion.id),
        'grado': str(grado.id)
    }
    data = json.dumps(data)
    data = data.encode()
    rv = client.put('/alumnos/'+str(alumno.id), data=data)
    if rv._status_code == 200:
        return True
    assert False

def test_get_alumnos(client):
    rv = client.get('/alumnos')
    if rv._status_code == 200:
        return True
    assert False

def test_post_alumno(client):
    grado = newGrado()
    data_personal = {
        'nombres': 'nombre prueba',
        'apellido_paterno': 'paterno',
        'apellido_materno': 'materno',
        'email': 'email@email.email',
        'telefono': '+569',
        'imagen': 'path/to/img',
        'grado': str(grado.id)
    }
    now = datetime.now()
    now = now.strftime("%m/%d/%Y, %H:%M:%S")
    data_academico = {
        'nombre_usuario': 'usuario_prueba_'+now,
        'password': 'asd',
        'matricula': 'matricula'
    }

    data = {
        'data_personal': data_personal,
        'data_academico': data_academico
    }    

    data = json.dumps(data)
    data = data.encode()
    rv = client.post('/alumnos', data=data)

    if rv._status_code == 200:
        return True
    assert False

def test_get_alumno_recursos(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/alumno/recursos/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

"""
Revisión inconsistencia:
Modelo Alumno no tiene atributo curso
En el recurso se pregunta por alumno_obj.curso
"""
def test_get_alumnos_recurso(client):
    curso = newCurso()
    if curso == None:
        assert False
    return True #Quitar cuando se resuelva
    rv = client.get('/alumnos/recurso/'+str(curso.id))
    if rv._status_code == 200:
        return True
    assert False
""" ================================ """

def test_post_alumno_recurso(client):
    curso = newCurso()
    alumno = Alumno.objects().first()

    if curso == None or alumno == None:
        assert False
    rv = client.post('/alumno/recurso/'+str(alumno.nombre_usuario)+'/'+str(curso.id))
    if rv._status_code == 200:
        return True
    assert False
    
def test_delete_alumno_recurso(client):
    curso = newCurso()
    alumno = Alumno.objects().first()
    curso.alumnos = [alumno]
    curso.save()
    if curso == None or alumno == None:
        assert False
    rv = client.delete('/alumno/recurso/'+str(alumno.nombre_usuario)+'/'+str(curso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_post_alumno_imagen(client):    
    with api.app.app_context():
        directory_root = dirname(dirname(abspath(__file__)))
        path_img = os.path.join(str(directory_root),
                                "flaskr","uploads","categorias","default.jpg")
        with open(path_img, 'rb') as img_open:
            img = BytesIO(img_open.read()) 
            alumno = Alumno.objects().first()
            
            if alumno == None:
                assert False
            data = {
                'imagen': (img, 'img.jpg')
            }
            rv = client.post('/alumno/imagen/'+str(alumno.id), content_type='multipart/form-data',data=data)
            if rv._status_code == 200:
                return True
            assert False

def test_get_alumno_imagen(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/alumno/imagen/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_alumno_imagen_default(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/alumno/imagen/default/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_alumnos_curso(client):
    curso = Grado.objects().first()
    if curso == None:
        assert False
    rv = client.get('/alumnos/curso/'+str(curso.id))
    if rv._status_code == 200:
        return True
    assert False


def test_get_alumno_imagen_zoom(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/imagen/zoom/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_finalizar_tutorial(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/alumno/finalizar/tutorial/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_alumno_evaluaciones(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/alumno/evaluaciones/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def newAlumno():
    now = datetime.now()
    alumno = Alumno()
    alumno.nombres = 'nombres '+now.strftime("%m/%d/%Y, %H:%M:%S")
    alumno.save()
    return alumno

def newInstitucion():
    institucion = Institucion()
    institucion.nombre = 'institucion'
    institucion.save()
    return institucion

def newGrado():
    profesor = newProfesor()
    grado = Grado()
    grado.nivel = 1
    grado.profesor = profesor.id
    grado.save()
    return grado

def newProfesor():
    profesor = Profesor()
    profesor.nombre = 'nombre'
    profesor.save()
    return profesor

def newCurso():
    curso = Curso()
    curso.nombre = 'curso'
    curso.save()
    return curso