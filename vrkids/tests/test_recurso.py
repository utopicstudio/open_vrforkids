import os
import tempfile
import json
import pytest

from flaskr import api
from models.curso import Curso
from models.curso_base import CursoBase
from models.institucion import Institucion
from models.asignatura import Asignatura
from models.profesor import Profesor
from models.alumno import Alumno
from models.grado import Grado
from io import BytesIO
from os.path import dirname, abspath


@pytest.fixture
def client():
    db_fd, api.app.config['DATABASE'] = tempfile.mkstemp()
    api.app.config['TESTING'] = True
    client = api.app.test_client()

    yield client

    os.close(db_fd)
    os.unlink(api.app.config['DATABASE'])

def test_get_recurso_item(client):
    curso_base = newCursoBase()
    recurso = Curso.objects().first()
    recurso.curso_base = curso_base
    recurso.save()
    if recurso == None:
        assert False
    rv = client.get('/recurso/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_put_recurso_item(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    rv = client.put('/recurso/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_delete_recurso_item(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    rv = client.delete('/recurso/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_cursos(client):
    setCursoBase()
    rv = client.get('/recursos')
    if rv._status_code == 200:
        return True
    assert False

def test_post_cursos(client):
    institucion = Institucion.objects().first()
    asignatura = Asignatura.objects().first()
    profesor = Profesor.objects().first()
    alumnos = Alumno.objects().all()
    grado = Grado.objects().first()
    curso_base = CursoBase.objects().first()

    if((institucion == None) or (asignatura == None) or \
       (profesor == None) or (alumnos == None) or \
       (grado == None) or (curso_base == None)):
        assert False
    alumnos_array = []
    for alumno in alumnos:
        alumnos_array.append(str(alumno.id))
    data = {
        'nombre': 'nombre',
        'fecha_creacion': '01/01/2000',
        'preguntas': [],
        'asignatura': str(asignatura.id),
        'institucion': str(institucion.id),
        'profesor': str(profesor.id),
        'alumnos': alumnos_array,
        'grado': str(grado.id),
        'activo': True,
        'version': '1.0',
        'curso_base': str(curso_base.id),
        'descripcion': 'descripcion del curso'
    }
    with api.app.app_context():
        data = json.dumps(data)
        data = data.encode()
        token = profesor.get_token()
        rv = client.post('/recursos', data=data, headers={'auth-token': token})
        if rv._status_code == 200:
            return True
        assert False

def test_put_recursos(client):
    curso = Curso.objects().first()
    institucion = Institucion.objects().first()
    asignatura = Asignatura.objects().first()
    profesor = Profesor.objects().first()
    alumno = Alumno.objects().first()
    grado = Grado.objects().first()
    curso_base = CursoBase.objects().first()

    if((institucion == None) or (asignatura == None) or \
       (profesor == None) or (alumno == None) or \
       (grado == None) or (curso_base == None) or (curso == None)):
        assert False
    data = {
        'nombre': 'nombre',
        'fecha_creacion': '01/01/2000',
        'preguntas': [],
        'asignatura': str(asignatura.id),
        'institucion': str(institucion.id),
        'profesor': str(profesor.id),
        'alumnos': str(alumno.id),
        'grado': str(grado.id),
        'activo': True,
        'version': 1,
        'curso_base': str(curso_base.id),
        'descripcion': 'descripcion del curso'
    }

    data_put = {
        'id': str(curso.id),
        'data': data
    }
    data_put = json.dumps(data_put)
    data_put = data_put.encode()
    rv = client.put('/recursos', data=data_put)
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_admin(client):
    rv = client.get('/recursos/admin')
    if rv._status_code == 200:
        return True
    assert False

def test_put_recurso_detalle(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    data_put = {
        'codigo_curso': str(recurso.id),
        'nombre': 'nombre_put',
        'descripcion': 'descripcion_put'
    }
    data = {
        'data': data_put
    }
    data = json.dumps(data)
    data = data.encode()
    rv = client.put('/recurso/detalle/put', data=data)
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_activos(client):
    profesor = Profesor.objects().first()
    if profesor == None:
        assert False
    rv = client.get('/recursos/activos/'+str(profesor.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_desactivados(client):
    profesor = Profesor.objects().first()
    if profesor == None:
        assert False
    rv = client.get('/recursos/desactivados/'+str(profesor.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_base(client):
    rv = client.get('/recursosbase')
    if rv._status_code == 200:
        return True
    assert False

def test_get_recurso_base_item(client):
    recurso_base = CursoBase.objects().first()
    if recurso_base == None:
        assert False
    rv = client.get('/recursobase/'+str(recurso_base.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recurso_detalle(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    rv = client.get('/recurso/detalle/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False


def test_get_recurso_alumnos(client):
    rv = client.get('/recursos/alumnos')
    if rv._status_code == 200:
        return True
    assert False

def test_post_alumno_recurso_sacar(client):
    
    recurso = Curso.objects().first()
    alumno = Alumno.objects().first()
    if alumno == None or recurso == None:
        assert False
    data = {
        'id_curso': str(recurso.id),
        'id_alumno': str(alumno.id)
    }
    data = json.dumps(data)
    data = data.encode()
    rv = client.post('/sacar/alumno/recurso', data=data)
    if rv._status_code == 200:
        return True
    assert False

def test_post_recurso_imagen_item(client):
    with api.app.app_context():
        recurso = Curso.objects().first()
        if recurso == None:
            assert False
        directory_root = dirname(dirname(abspath(__file__)))
        path_img = os.path.join(str(directory_root),
                                "flaskr","uploads","categorias","default.jpg")
        with open(path_img, 'rb') as img_open:
            img = BytesIO(img_open.read())
            data = {
                'imagen': (img, 'img.jpg')
            }
            rv = client.post('/recurso/imagen/'+str(recurso.id), data=data)
            if rv._status_code == 200:
                return True
            assert False

def test_get_recurso_imagen_item(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    rv = client.get('/recurso/imagen/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recurso_imagen_default(client):
    recurso = Curso.objects().first()
    if recurso == None:
        assert False
    rv = client.get('/recurso/imagen/default/'+str(recurso.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_aprobacion_grafico(client):
    asignatura = Asignatura.objects().first()
    if asignatura == None:
        assert False
    rv = client.get('/recursos/aprobacion/graficos/'+str(asignatura.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recursos_asignatura_grafico(client):
    rv = client.get('/recursos/asignatura/grafico')
    if rv._status_code == 200:
        return True
    assert False

def test_get_recurso_detalle_alumno(client):
    alumno = Alumno.objects().first()
    recurso = Curso.objects().first()
    if alumno == None or recurso == None:
        assert False
    rv = client.get('/recurso/detalle/alumno/'+str(recurso.id)+'/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def test_get_recurso_disponible(client):
    alumno = Alumno.objects().first()
    if alumno == None:
        assert False
    rv = client.get('/recursos/disponibles/alumno/'+str(alumno.id))
    if rv._status_code == 200:
        return True
    assert False

def newCursoBase():
    curso_base = CursoBase()
    curso_base.nombre = 'base'
    curso_base.save()
    return curso_base

def setCursoBase():
    for curso in Curso.objects().all():
        curso.curso_base = newCursoBase()
        curso.save()