import axios from "axios"

// Usa WebRTC, que es lo que traen los navegadores para mandar audio de uno a otro.

const API = "http://localhost:3000/chat/canales/"

let miMicrofono = null
let conexiones = {}
let canalActual = null
let intervalo = null

const config = () => ({ headers: { Authorization: "Bearer " + localStorage.getItem("token") } })
const configuracionRTC = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }

export function aplicarSalida(audio) {
    const salida = localStorage.getItem("auriculares")
    if (salida && audio.setSinkId) {
        audio.setSinkId(salida).catch(() => {})
    }
}

export async function pedirMicrofono() {
    const elegido = localStorage.getItem("microfono")
    if (elegido) {
        try {
            return await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: elegido } } })
        } catch {
        }
    }
    return await navigator.mediaDevices.getUserMedia({ audio: true })
}

function esperarConexion(pc) {
    return new Promise((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve()
        pc.onicegatheringstatechange = () => pc.iceGatheringState === "complete" && resolve()
        setTimeout(resolve, 3000)
    })
}

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

const enviarSenal = (para, tipo, datos) => {
    return axios.post(API + canalActual + "/senales", { para: para, tipo: tipo, datos: datos }, config())
}

async function llamar(otroId) {
    const pc = crearConexion(otroId)
    await pc.setLocalDescription(await pc.createOffer())
    await esperarConexion(pc)
    await enviarSenal(otroId, "oferta", pc.localDescription)
}

async function revisarSenales() {
    if (canalActual === null) return
    try {
        const res = await axios.get(API + canalActual + "/senales", config())
        for (const senal of res.data.senales) {
            try {
                if (senal.tipo === "oferta") {
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
    await axios.get(API + canalId + "/senales", config()) 
    intervalo = setInterval(revisarSenales, 1000)
}

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
        if (!ids.includes(Number(id)) && tiempo > 6000) {
            cerrarConexion(id)
        }
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

export function silenciar() {
    if (miMicrofono === null) return false
    const pista = miMicrofono.getAudioTracks()[0]
    pista.enabled = !pista.enabled
    return !pista.enabled
}