window.onload = function () {

    actualizartabla();
    //     var tareas=[
    //     //     {
    //     //         titulo:"dfe",
    //     //         descripcion:"ll",
    //     //         autor:"df",
    //     //         ejecutor:"dfdf",
    //     //         fecha:"2/2/2018",
    //     //         estado:0
    //     // },{
    //     //     titulo:"dfffe",
    //     //         descripcion:"lrrl",
    //     //         autor:"drrf",
    //     //         ejecutor:"drrfdf",
    //     //         fecha:"2/7/2018",
    //     //         estado:0
    //     // }
    // ];

    // llenarTablaTareas(tareas);



    // document.getElementById("peticion").onclick=function(){
    //     var req= new XMLHttpRequest();
    //     req.open("GET","/peticion",true);
    //     req.addEventListener("load",function(){
    //         if(req.status >= 200 && req.status < 400) {
    //             document.getElementById("datos").innerHTML = req.responseText;
    //         }else{
    //             console.error(req.status +" " +req.statusText);
    //         }
    //     });
    //     req.addEventListener("error",function(){
    //         console.error("Error de red");
    //     })
    //     req.send(null);
    //     console.log("peticion enviada");


    this.document.getElementById("user").onclick = function () {
        if (document.getElementById("userOptions").getAttribute("class") == "dropdown") {

            document.getElementById("userOptions").setAttribute("class", "dropdownver");
        } else {
            document.getElementById("userOptions").setAttribute("class", "dropdown");
        }
    }

    this.document.getElementById("datosUser").onclick = function (event) {
        event.preventDefault();
        if (document.getElementById("datosUsuario").getAttribute("class") != "mostrar") {
            document.getElementById("loader").setAttribute("class", "loader mostrar");

            var req = new XMLHttpRequest();
            req.open("GET", "/datosuser", true);

            req.addEventListener("load", function () {
                if (req.status >= 200 && req.status < 400) {
                    console.log(req.response);
                    var datosUser = JSON.parse(req.response);
                    document.getElementById("nombre").value = datosUser.nombre;
                    document.getElementById("correo").value = datosUser.correo;
                    document.getElementById("usuario").value = datosUser.usuario;
                    document.getElementById("listarTareas").setAttribute("class", "ocultar");
                    document.getElementById("datosUsuario").setAttribute("class", "mostrar");
                    document.getElementById("loader").setAttribute("class", "loader ocultar");
                } else {
                    console.error(req.status + " " + req.statusText);
                }
            });
            req.addEventListener("error", function () {
                console.error("Error de red");
            })
            req.send(null);


        } else {
            document.getElementById("listarTareas").setAttribute("class", "mostrar");
            document.getElementById("datosUsuario").setAttribute("class", "ocultar");
        }
    }

    this.document.getElementById("guardar").onclick = function (event) {
        event.preventDefault();
        console.log("Enviando datos por post");
        var req = new XMLHttpRequest();
        req.open("POST", "/datosuser", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            var result = JSON.parse(req.response);
            if (result.resultado == "ok") {
                console.log(result);
                alert("Datos actualizados correctamente");
                document.getElementById("avatarT").src = result.imagen;
                document.getElementById("listarTareas").setAttribute("class", "mostrar");
                document.getElementById("datosUsuario").setAttribute("class", "ocultar");
                document.getElementById("userOptions").setAttribute("class", "ocultar");
            } else {
                alert("Error al actualizar los datos");
            }
        });
        req.addEventListener("error", function () {


        });

        var datos = {
            nombre: document.getElementById("nombre").value,
            usuario: document.getElementById("usuario").value,
            correo: document.getElementById("correo").value,
            contraseña: document.getElementById("contraseña").value,
            avatar: document.getElementById("imgTemp").src
        }
        req.send(JSON.stringify(datos));
    }

    this.document.getElementById("añadirTarea").onclick = function (ev) {
        ev.preventDefault();
        var req = new XMLHttpRequest();
        req.open("POST", "/nuevatarea", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            console.log(JSON.parse(req.response));
            var respuesta = JSON.parse(req.response);
            if (respuesta.estado == 1) {
                alert("Tarea creada correctamente idtarea: " + respuesta.idtarea);
                document.getElementById("formTarea").reset();
            } else {
                alert("Error al crear la tarea");
            }
            document.getElementById("crearTarea").setAttribute("class", "ocultar")
            llenarTablaTareas(respuesta.tareas);
        });
        req.addEventListener("error", function () {


        });

        var datos = {
            titulo: document.getElementById("titulo").value,
            descripcion: document.getElementById("descripcion").value,
            ejecutor: document.getElementById("ejecutor").value,
            fecha: document.getElementById("fecha").value,
        }
        req.send(JSON.stringify(datos));
    }


    this.document.getElementById("addTarea").onclick = function () {
        if (document.getElementById("crearTarea").getAttribute("class") == "ocultar") {
            document.getElementById("crearTarea").setAttribute("class", "mostrar");
            document.getElementById("datosUsuario").setAttribute("class","ocultar");
           
        } else {
            document.getElementById("crearTarea").setAttribute("class", "ocultar")
        }
    }


    this.document.getElementById("act_Tarea").onclick = function (ev) {
        ev.preventDefault();
        var req = new XMLHttpRequest();
        req.open("POST", "/actualizartarea", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            console.log(JSON.parse(req.response));
            var respuesta = JSON.parse(req.response);
            if (respuesta.estado == 1) {
                alert("Tarea actualizada correctamente idtarea: " + respuesta.idtarea);
                document.getElementById("formActualizarTarea").reset();
            } else {
                alert("Error al actualizar la tarea");
            }
            document.getElementById("actualizarTarea").setAttribute("class", "ocultar")
            llenarTablaTareas(respuesta.tareas);
        });
        req.addEventListener("error", function () {


        });

        var datos = {
            id: document.getElementById("idtarea").value,
            titulo: document.getElementById("act_titulo").value,
            descripcion: document.getElementById("act_descripcion").value,
            ejecutor: document.getElementById("ejecutor2").value,
            fecha: document.getElementById("act_fecha").value,
        }
        console.log(datos)
        req.send(JSON.stringify(datos));
    }

    document.getElementById('avatar').addEventListener('change', archivo, false);
}


function archivo(evt) {
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.onload = function (f) {
        // console.log(f.target.result);
        document.getElementById("imgTemp").src = f.target.result;
    }
    reader.readAsDataURL(file);
}

function peticionEditar(id) {
    var req = new XMLHttpRequest();
    var url = "/gettarea?id=" + id;
    req.open("GET", url, true);

    req.addEventListener("load", function () {
        var datos = JSON.parse(req.response);
        document.getElementById("idtarea").value = datos.tarea.id;
        document.getElementById("act_titulo").value = datos.tarea.titulo;
        document.getElementById("act_descripcion").value = datos.tarea.descripcion;
        document.getElementById("ejecutor2").value = datos.tarea.ejecutor;
        document.getElementById("act_fecha").value = String(datos.tarea.fecha).substr(0, 10);
        document.getElementById("actualizarTarea").setAttribute("class", "mostrar");

    })
    req.addEventListener("error", function () {

    });
    req.send(null);
};


function peticionEliminar(id) {
    let req = new XMLHttpRequest();
    let url = "/eliminartarea?id=" + id
    req.open("GET", url, true);

    req.addEventListener("load", function () {
        var resultado = JSON.parse(req.response);
        if (resultado.estado == 1) {
            alert("Tarea eliminada");
        }
        llenarTablaTareas(resultado.tareas);
    });
    req.send(null);
}

function cambioEstado(id) {
    var req = new XMLHttpRequest();
    var url = "/cambioestado?id=" + id;
    req.open("GET", url, true);

    req.addEventListener("load", function () {
        var datos = JSON.parse(req.response);
        llenarTablaTareas(datos.tareas);
    })
    req.addEventListener("error", function () {

    });
    req.send(null);
}

function actualizartabla() {
    var req = new XMLHttpRequest();
    req.open("GET", "/leertareas", true);

    req.addEventListener("load", function () {

        llenarTablaTareas(JSON.parse(req.response))
    });
    req.addEventListener("error", function (err) {

    })
    req.send(null);
}

function llenarTablaTareas(listaTareas) {
    let contenidoTabla = "";
    for (const tarea of listaTareas) {
        let tdOptions = "";
        switch (tarea.permiso) {
            case 0:
                tdOptions = `<i class="fas fa-edit" onclick="peticionEditar(${tarea.id})"></i> <i class="fas fa-trash-alt" onclick="peticionEliminar(${tarea.id})"></i> <i class="fas fa-clipboard-list" onclick="cambioEstado(${tarea.id})"></i>`
                break;

            case 1:
                tdOptions = `<i class="fas fa-edit" onclick="peticionEditar(${tarea.id})"></i> <i class="fas fa-trash-alt" onclick="peticionEliminar(${tarea.id})"></i>`
                break;

            case 2:
                tdOptions = `<i class="fas fa-clipboard-list" onclick="cambioEstado(${tarea.id})"></i>`
                break;

            case 3:
                tdOptions = "";
                break;

        }

        let fila = ` <tr>
        <td>${tarea.titulo}</td>
        <td>${tarea.descripcion}</td>
        <td>${tarea.autor}</td>
        <td>${tarea.ejecutor}</td>
        <td>${tarea.fecha}</td>
        <td>${tarea.estado}</td>
        <td>${tdOptions}</td>
       </tr>`;
        contenidoTabla += fila;
    }
    document.getElementById("tblTareas").innerHTML = contenidoTabla;
}
