const API_URL = "http://localhost:3000/users";

async function enviar(ruta, datos) {
  const res = await fetch(API_URL + ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error en el servidor");
  return data;
}

export async function registrar({ username, email, password }) {
  const data = await enviar("/register", { username, email, password });
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function iniciarSesion({ email, password }) {
  const data = await enviar("/login", { email, password });
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