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
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosNuevos)
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
