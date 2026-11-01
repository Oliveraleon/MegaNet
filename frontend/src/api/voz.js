import axios from "axios"

// Lógica del audio de los canales de voz.
// Usa WebRTC, que es lo que traen los navegadores para mandar audio de uno a otro.
// El backend solo pasa los datos para conectarse ("oferta" y "respuesta").

const API = "http://localhost:3000/chat/canales/"

// Variables comunes de JS: viven mientras la página está abierta
let miMicrofono = null   // el audio de mi micrófono
let conexiones = {}      // una conexión por cada persona: { pc, audio, creada }
let canalActual = null   // id del canal de voz en el que estoy
let intervalo = null     // para revisar las señales cada 1 segundo

// Servidor público de Google que ayuda a que dos computadoras se encuentren
const configuracionRTC = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }

const config = () => {
    return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
}

// Manda el sonido a los auriculares elegidos en la configuración
export function aplicarSalida(audio) {
    const salida = localStorage.getItem("auriculares")
    if (salida && audio.setSinkId) {
        audio.setSinkId(salida).catch(() => {})
    }
}

// Pide el micrófono elegido en la configuración (o el predeterminado)
export async function pedirMicrofono() {
    const elegido = localStorage.getItem("microfono")
    if (elegido) {
        try {
            return await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: elegido } } })
        } catch {
            // Si ese micrófono ya no está conectado, usamos el predeterminado
        }
    }
    return await navigator.mediaDevices.getUserMedia({ audio: true })
}

// Espera a que el navegador junte las formas posibles de conectarse (máximo 3 segundos)
function esperarConexion(pc) {
    return new Promise((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve()
        pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === "complete") resolve()
        }
        setTimeout(resolve, 3000)
    })
}

// Crea la conexión con otra persona: le manda mi micrófono y reproduce su audio
function crearConexion(otroId) {
    const pc = new RTCPeerConnection(configuracionRTC)
    for (const pista of miMicrofono.getTracks()) {
        pc.addTrack(pista, miMicrofono)
    }

    const audio = new Audio()
    pc.ontrack = (e) => {
        audio.srcObject = e.streams[0]
        aplicarSalida(audio)
        audio.play().catch(() => {})
    }

    conexiones[otroId] = { pc: pc, audio: audio, creada: Date.now() }
    return pc
}

function cerrarConexion(otroId) {
    const conexion = conexiones[otroId]
    if (!conexion) return
    conexion.pc.close()
    conexion.audio.srcObject = null
    delete conexiones[otroId]
}

async function enviarSenal(para, tipo, datos) {
    await axios.post(API + canalActual + "/senales", { para: para, tipo: tipo, datos: datos }, config())
}

// Yo llamo a la otra persona: creo la "oferta" y se la mando
async function llamar(otroId) {
    const pc = crearConexion(otroId)
    await pc.setLocalDescription(await pc.createOffer())
    await esperarConexion(pc)
    await enviarSenal(otroId, "oferta", pc.localDescription)
}

// Reviso si alguien me mandó una oferta o una respuesta
async function revisarSenales() {
    if (canalActual === null) return
    try {
        const res = await axios.get(API + canalActual + "/senales", config())
        for (const senal of res.data.senales) {
            try {
                if (senal.tipo === "oferta") {
                    // Me llamaron: contesto con una "respuesta"
                    cerrarConexion(senal.de)
                    const pc = crearConexion(senal.de)
                    await pc.setRemoteDescription(senal.datos)
                    await pc.setLocalDescription(await pc.createAnswer())
                    await esperarConexion(pc)
                    await enviarSenal(senal.de, "respuesta", pc.localDescription)
                }
                if (senal.tipo === "respuesta" && conexiones[senal.de]) {
                    await conexiones[senal.de].pc.setRemoteDescription(senal.datos)
                }
            } catch (error) {
                console.log("Señal de voz ignorada", error)
            }
        }
    } catch (error) {
        console.log("No se pudieron revisar las señales", error)
    }
}

export async function entrarALaLlamada(canalId) {
    miMicrofono = await pedirMicrofono()
    canalActual = canalId
    await axios.post(API + canalId + "/voz", {}, config())
    await axios.get(API + canalId + "/senales", config()) // descarta señales viejas
    intervalo = setInterval(revisarSenales, 1000)
}

// Se llama cada vez que cambia la lista de conectados del canal.
// Para no llamarse los dos a la vez, siempre llama el que tiene el id más chico.
export function actualizarParticipantes(conectados, miId) {
    if (miMicrofono === null) return

    const ids = []
    for (const u of conectados) {
        ids.push(u.id)
        if (u.id !== miId && !conexiones[u.id] && miId < u.id) {
            llamar(u.id)
        }
    }

    for (const id in conexiones) {
        const tiempo = Date.now() - conexiones[id].creada
        const conectada = conexiones[id].pc.connectionState === "connected"

        // Si alguien se fue del canal, cortamos su audio
        if (!ids.includes(Number(id)) && tiempo > 6000) {
            cerrarConexion(id)
        }
        // Si después de 15 segundos no se pudo conectar, la cerramos para reintentar
        else if (!conectada && tiempo > 15000) {
            cerrarConexion(id)
        }
    }
}

export async function salirDeLaLlamada() {
    if (canalActual === null) return
    const canal = canalActual
    canalActual = null
    clearInterval(intervalo)

    for (const id in conexiones) {
        cerrarConexion(id)
    }
    if (miMicrofono) {
        for (const pista of miMicrofono.getTracks()) {
            pista.stop()
        }
        miMicrofono = null
    }
    await axios.delete(API + canal + "/voz", config()).catch(() => {})
}

// Apaga o prende mi micrófono. Devuelve true si quedó silenciado.
export function silenciar() {
    if (miMicrofono === null) return false
    const pista = miMicrofono.getAudioTracks()[0]
    pista.enabled = !pista.enabled
    return !pista.enabled
}