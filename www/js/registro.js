window.onload= function (){
    console.log("página lista");

    document.getElementById("contraseña2").addEventListener("blur",function(){
        
        if (document.getElementById("contraseña").value!=document.getElementById("contraseña2").value){

            document.getElementById("mensajes").setAttribute("style","display:block");
            document.getElementById("mensajes").innerHTML="Las contraseñas deben ser iguales";
        }else{
            console.log("iguales");
            document.getElementById("registrarse").disabled=false;
        }
    })
   
    document.getElementById("contraseña2").addEventListener("focus",function(){
     document.getElementById("mensajes").setAttribute("style","display:none")
    })
    


      




}