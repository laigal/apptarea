var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var cookieSession = require('cookie-session')
var app = express();

app.use(cookieSession({
  name: 'session',
  keys: ["SID"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
  // maxAge:   60 * 1000 // 24 hours

}))
const SELECTTAREAS = "select tarea.id,titulo,descripcion,usr1.nombre as autor,usr2.nombre as ejecutor,fecha,estado from tarea,usuario as usr1, usuario as usr2 where autor=usr1.id and ejecutor=usr2.id"
const SELECTTAREASID = "select tarea.id,titulo,descripcion,usr1.nombre as autor,usr1.id as autorid,usr2.nombre as ejecutor,usr2.id as ejecutorid,fecha,estado from tarea,usuario as usr1, usuario as usr2 where autor=usr1.id and ejecutor=usr2.id"


var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(jsonParser);
app.use(urlencodedParser);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'apptareas'
});

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log('Conexion correcta con el servidor.');
  }
});

// Puntos de entrada de mi servidor

app.get('/registro', function (req, res) {
  fs.readFile("./www/registro.html", "utf8", function (err, texto) {
    res.send(texto);
  })
});

app.post('/registro', function (req, res) {
  var nombre = req.body.nombre;
  var correo = req.body.correo;
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  connection.query("insert into usuario (nombre,usuario,password,email) values (?,?,?,?)", [nombre, usuario, contraseña, correo], function (err, result) {

    // alert("Usuario introducido correctamente " + nombre);
    res.redirect('/login');
  });


})

app.get('/login', function (req, res) {
  if (req.session.user != undefined) {
    res.redirect('/tarea');
  } else {
    fs.readFile("./www/login.html", "utf8", function (err, texto) {
      res.send(texto);
    })
  }
});

app.post('/login', function (req, res) {
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  connection.query("select * FROM usuario where usuario=? AND password=?", [usuario, contraseña], function (err, result) {
    if (err) {
      throw err
    } else {
      if (result.length > 0) {
        req.session.user = usuario;
        req.session.idUser = result[0].id;
        res.redirect('/tarea');
      } else {
        fs.readFile("./www/login.html", "utf8", function (err, texto) {
          texto = texto.replace('class="ocultar">[error]', 'class="mostrar">Usuario o contraseña incorrectas');
          res.send(texto);
        })
      }
    }
  })
});

app.get('/tarea', function (req, res) {
  if (req.session.user == undefined) {
    res.redirect('/login');
  } else {
    fs.readFile("www/tareas.html", "utf8", function (err, texto) {
      texto = texto.replace("[usuario]", req.session.user);
      connection.query("select * from usuario", function (err, result) {
        let options = "";
        if (err) {
          throw err;
        } else {
          for (const usuario of result) {
            options += `<option value='${usuario.id}'>${usuario.nombre}</option>`;

            //cargamos avatar usuario logeado;
            if(usuario.id==req.session.idUser){
              if(usuario.avatar!=""){
                let imgAvatar=`<img src="${usuario.avatar}"  id="avatarT">`;
                texto=texto.replace('<span class="fas fa-user" id="icono"></span>',imgAvatar);
              }
            }
          }
        }
        texto = texto.split("[ejecutores]").join(options);
        res.send(texto);
      })

    })

  }
});

app.get('/cerrar', function (req, res) {
  req.session = null;
  res.redirect('/login')
})

app.get("/peticion", function (req, res) {
  console.log(req.session.user);
})

app.get("/datosuser", function (req, res) {
  connection.query("select* from usuario where id=?", [req.session.idUser], function (err, result) {
    if (err) {
      throw err;
    } else {
      var datos = {
        id: result[0].id,
        nombre: result[0].nombre,
        usuario: result[0].usuario,
        correo: result[0].email
      }

      setTimeout(function () {
        res.send(JSON.stringify(datos));
      }, 500)

    }
  });
})

app.post("/datosuser", function (req, res) {
   //Guardar la imagen como fichero en el servidor
   let image=req.body.avatar
   console.log(image);
   var base64data=image.replace(/^data:image\/jpeg;base64,/,"");
   var name="avatar"+req.body.usuario+".jpg";
   fs.writeFile(name, base64data,'base64',function(err){
     console.log(err);
   });
  if (req.body.contraseña == "") {
    res.send("noOk")
  } else {
    connection.query("UPDATE usuario SET nombre = ?, email = ?, password=?,avatar=? WHERE id = ?", [req.body.nombre, req.body.correo, req.body.contraseña, req.body.avatar, req.session.idUser], function (err, result) {
     var datos={
       respuesta:"",
       avatar:""
     }
      if (result.affectedRows > 0) {
        var datos={
          resultado:"ok",
          imagen:req.body.avatar
        };

        res.send(JSON.stringify(datos));
      } else {
        var datos={
          resultado:"noOk",
          imagen:""
        };
        res.send(JSON.stringify(datos));
      }
    })
  }
});

app.post("/nuevatarea", function (req, res) {
  var result;
  // console.log(req.body);
  connection.query("insert into tarea (titulo,descripcion,fecha,autor,ejecutor) values (?,?,?,?,?)", [req.body.titulo, req.body.descripcion, req.body.fecha, req.session.idUser, req.body.ejecutor],
    function (err, result) {
      connection.query(SELECTTAREASID, function (error, resultado) {
        resultado.forEach(element => {
          if (req.session.idUser == element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 0;
          }
          if (req.session.idUser == element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 1;
          }
          if (req.session.idUser != element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 2;
          }
          if (req.session.idUser != element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 3;
          }
        });
        if (error) {
          throw error;
        } else {
          resultado = formatearFecha(resultado);
          if (err) {
            console.log(err)
            result = {
              estado: 0,
              idtarea: null,
              tareas: resultado
            }
          } else {
            console.log(result)
            result = {
              estado: 1,
              idtarea: result.insertId,
              tareas: resultado
            }

          }
          console.log(result)
          res.send(JSON.stringify(result));
        }

      });
    })
});


app.get("/leertareas", function (req, res) {
  connection.query(SELECTTAREASID, function (error, resultado) {
    // console.log(req.session.idUser);
    resultado.forEach(element => {
      if (req.session.idUser == element.autorid && req.session.idUser == element.ejecutorid) {
        element.permiso = 0;
      }
      if (req.session.idUser == element.autorid && req.session.idUser != element.ejecutorid) {
        element.permiso = 1;
      }
      if (req.session.idUser != element.autorid && req.session.idUser == element.ejecutorid) {
        element.permiso = 2;
      }
      if (req.session.idUser != element.autorid && req.session.idUser != element.ejecutorid) {
        element.permiso = 3;
      }
    });
    // console.log(resultado);
    resultado = formatearFecha(resultado);
    res.send(JSON.stringify(resultado));
  });
})

app.get("/eliminartarea/:id?", function (req, res) {
  var respuesta = {};
  console.log("Eliminando tarea " + req.query.id);
  connection.query("DELETE FROM tarea WHERE id = ?", [req.query.id], function (err, result) {
    connection.query(SELECTTAREASID, function (error, resultado) {
      resultado.forEach(element => {
        if (req.session.idUser == element.autorid && req.session.idUser == element.ejecutorid) {
          element.permiso = 0;
        }
        if (req.session.idUser == element.autorid && req.session.idUser != element.ejecutorid) {
          element.permiso = 1;
        }
        if (req.session.idUser != element.autorid && req.session.idUser == element.ejecutorid) {
          element.permiso = 2;
        }
        if (req.session.idUser != element.autorid && req.session.idUser != element.ejecutorid) {
          element.permiso = 3;
        }
      });
      // console.log(resultado);
      resultado = formatearFecha(resultado);


      if (err) {
        throw err;
        respuesta = {
          estado: 0,
          tareas: resultado
        }

      } else {
        respuesta = {
          estado: 1,
          tareas: resultado
        }
      }
      res.send(JSON.stringify(respuesta))
    })

  })

})


app.get("/gettarea/:id?", function (req, res) {
  let datos = {
    usuarios: []
  };
  connection.query("SELECT tarea.id as idtarea,titulo,descripcion,autor as autorid,ejecutor as ejecutorid,fecha,estado,usuario.id as usuarioid,nombre FROM tarea right join usuario on tarea.id=? and autor=usuario.id", [req.query.id], function (err, result) {
    for (const iterator of result) {
      if (iterator.idtarea) {
        datos.tarea = {
          id: iterator.idtarea,
          titulo: iterator.titulo,
          descripcion: iterator.descripcion,
          autor: iterator.autorid,
          ejecutor: iterator.ejecutorid,
          fecha: iterator.fecha,
          estado: iterator.estado
        }
      }

      if (iterator.usuarioid) {
        let user = {
          id: iterator.usuarioid,
          nombre: iterator.nombre
        }
        datos.usuarios.push(user);
      }
    }
    res.send(JSON.stringify(datos));
  })

})

app.post("/actualizartarea", function (req, res) {
  var result;
  // console.log(req.body);
  connection.query("UPDATE tarea SET titulo = ?, descripcion = ?, ejecutor=?  WHERE tarea.id = ?", [req.body.titulo, req.body.descripcion, req.body.ejecutor, req.body.id],
    function (err, result) {
      console.log(result);
      console.log(err);
      connection.query(SELECTTAREASID, function (error, resultado) {
        resultado.forEach(element => {
          if (req.session.idUser == element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 0;
          }
          if (req.session.idUser == element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 1;
          }
          if (req.session.idUser != element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 2;
          }
          if (req.session.idUser != element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 3;
          }
        });
        if (error) {
          throw error;
        } else {
          resultado = formatearFecha(resultado);
          if (err) {
            console.log(err)
            result = {
              estado: 0,
              idtarea: null,
              tareas: resultado
            }
          } else {
            console.log(result)
            result = {
              estado: 1,
              idtarea: result.insertId,
              tareas: resultado
            }

          }
          // console.log(result)
          res.send(JSON.stringify(result));
        }

      });
    })
});

app.get("/cambioestado/:id?", function (req, res) {
  connection.query("UPDATE tarea SET estado = 1 WHERE id = ? ", [req.query.id], function (err, result) {
    if (err) {
      throw err;
    } else {
      connection.query(SELECTTAREASID, function (error, resultado) {
        resultado.forEach(element => {
          if (req.session.idUser == element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 0;
          }
          if (req.session.idUser == element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 1;
          }
          if (req.session.idUser != element.autorid && req.session.idUser == element.ejecutorid) {
            element.permiso = 2;
          }
          if (req.session.idUser != element.autorid && req.session.idUser != element.ejecutorid) {
            element.permiso = 3;
          }
        });
        if (error) {
          throw error;
        } else {
          resultado = formatearFecha(resultado);
          if (err) {
            console.log(err)
            result = {
              estado: 0,
              tareas: resultado
            }
          } else {
            console.log(result)
            result = {
              estado: 1,
              tareas: resultado
            }

          }
          // console.log(result)
          res.send(JSON.stringify(result));
        }
      })
    }})
  })

app.use(express.static('www'));

  // Inicio el servidor
 var server = app.listen(3000, function () {
    console.log('Servidor web iniciado');
  });
function formatearFecha(resultado) {
    for (let i = 0; i < resultado.length; i++) {
      var d = new Date(String(resultado[i].fecha))
      var formatFecha = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('-');
      resultado[i].fecha = formatFecha;
    }
    return resultado;
  }