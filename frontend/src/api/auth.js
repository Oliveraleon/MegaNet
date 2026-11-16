const API_URL = "http://localhost:3000/user";
const BASE_URL = "http://localhost:3000";

async function enviar(ruta, datos) {
  const res = await fetch(BASE_URL + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error en el servidor");
  return data;
}

export async function registrar({ username, email, password }) {

  const data = await enviar("/auth/register", { username, email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function iniciarSesion({ email, password }) {
  const data = await enviar("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function estaLogueado() {
  return !!localStorage.getItem("token");
}

export function getUsuario() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

export async function obtenerPerfil() {
  try {
    const token = localStorage.getItem('token');
    if(!token) throw new Error("No se encontro un token valido");
    const res = await fetch("http://localhost:3000/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    if (!res.ok) {
      const textoError = await res.text();
      console.error("Error del servidor:", textoError);
      throw new Error("El servidor respondió con error " + res.status);
    }

    const datos = await res.json();
    return datos;
  } catch (error) {
    console.log("Error en la peticion", error);
    throw error;
  }
}

export async function getUserPosts(){
  try{
    const token = localStorage.getItem("token");
    if(!token){ 
      throw new Error("No se proporciono un token valido");
    }
    const res = await fetch("http://localhost:3000/posts/getUserPosts", {
      method: "GET",
      headers:{
        "Authorization": `Bearer ${token}`
      }
    });
    const datos = await res.json();
    if(!res.ok) {
      throw new Error(
        datos.message || "Error al obtener publicaciones"
      );
    }
    return datos;
  }catch(error){
    console.log("Error en la peticion", error)
    throw error;
  }
}

export async function actualizarPerfil(datosNuevos) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No se proporcionó un token válido");
    }

    const res = await fetch("http://localhost:3000/user/profile", {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: datosNuevos
    });

    const datos = await res.json();

    if (!res.ok) {
        throw new Error(
            datos.message || "Error al actualizar el perfil"
        );
    }

    if (datos.user) {
        localStorage.setItem("user", JSON.stringify(datos.user));
    }

    return datos;
}

export async function buscarUsuarios(termino){
  try{
    const token = localStorage.getItem("token");
    if(!token){
      throw new Error("No se proporciono un token valido");
    }
    const res = await fetch(`http://localhost:3000/user/buscar?q=${termino}`,{
      method: "GET",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const datos = await res.json();
    if(!res.ok){
      throw new Error(datos.message || "Error al buscar al usuario");
    }
    return datos;
  }catch(error){
    console.log("Error en la peticion de busqueda",error);
    throw error;
  }
}

export async function seguirUsuario(id){
  try{
  const token = localStorage.getItem("token")
  const res = await fetch(`http://localhost:3000/user/seguir/${id}`, {
    method: "POST",
    headers: {"Authorization": `Bearer ${token}`}
  });
  const data = await res.json();
  if(!res.ok){ throw new Error(data.message || "Error al seguir"); }
  return data
  }catch(error){
    console.log("Error en seguir al usuario", error);
    throw error;
  }
}

export async function dejarDeSeguir(id){
  try{
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:3000/user/seguir/${id}`,{
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json()
    if(!res.ok){ throw new Error(data.message || "Error al dejar de seguir"); }
    return data
  }catch(error){
    console.log("Error al dejar de seguir al usuario", error);
    throw error;
  }
}

export async function actualizarContraseña(passwordActual, nuevaPassword){
  try{
    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3000/user/password",{
      method: "PATCH",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ passwordActual, nuevaPassword }) 
    });
    const data = await res.json();
    if(!res.ok){ throw new Error(data.message || "Error al actualizar la contraseña"); }
    return data
  }catch(error){
    console.log("Error al actualizar contraseña",error)
    throw error;
  }
}

export async function eliminarCuenta(){
  try{
    const token = localStorage.getItem("token")
    const res = await fetch("http://localhost:3000/user/eliminar",{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await res.json()
    if(!res.ok){ throw new Error(data.message || "Error al eliminar la cuenta"); }
    return data
  }catch(error){
    console.log("Error al eliminar la cuenta",error)
    throw error;
  }
}

export async function recuperarCuenta(email){
  try{
    const res = await fetch("http://localhost:3000/user/recuperarCuenta",{
      method: "POST",
      headers: { 
        "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) { throw new Error(data.message || "Error al solicitar la recuperación"); }
    return data;
  }catch(error){
    console.log("Error en recuperar contraseña", error);
    throw error;
  }
}

export async function reiniciarContraseña(token, nuevaPassword){
  try{
    const res = await fetch("http://localhost:3000/user/reiniciarContrasena",{
      method: "POST",
      headers: { 
        "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaPassword })
    });
    const data = await res.json();
    if (!res.ok) { throw new Error(data.message || "Error al restablecer la contraseña"); }
    return data;
  }catch(error){
    console.log("Error al reiniciar contraseña", error);
    throw error;
  }
}

export async function darLike(postId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/posts/publicaciones/${postId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al dar like");
  return data;
}

export async function quitarLike(postId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:3000/posts/publicaciones/${postId}/like`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al quitar like");
  return data;
}

export async function obtenerComentarios(postId){
  try{
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se proporcionó un token válido");
    const res = await fetch(`${BASE_URL}/posts/publicaciones/${postId}/comentarios`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener comentarios");
    return data;
  }catch(error){
    console.log("Error al obtener comentarios", error);
    throw error;
  }
}

export async function crearComentario(postId, text){
  try{
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se proporcionó un token válido");
    const res = await fetch(`${BASE_URL}/posts/publicaciones/${postId}/comentarios`,{
      method: "POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al crear comentario");
    return data;
  }catch(error){
    console.log("Error al crear comentario", error);
    throw error;
  }
}

export async function eliminarComentario(postId, comentarioId){
  try{
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No se proporcionó un token válido");
    const res = await fetch(`${BASE_URL}/posts/publicaciones/${postId}/comentarios/${comentarioId}`,{
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al eliminar comentario");
    return data;
  }catch(error){
    console.log("Error al eliminar comentario", error);
    throw error;
  }
}

export const esAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user && user.rol === "admin";
};
