import "./Chat.css"

import { useEffect, useState } from "react"
import { aplicarSalida, pedirMicrofono } from "../api/voz"

function ConfigAudio({ onCerrar }) {
    const [microfonos, setMicrofonos] = useState([])
    const [salidas, setSalidas] = useState([])
    const [microfono, setMicrofono] = useState(localStorage.getItem("microfono") || "")
    const [auriculares, setAuriculares] = useState(localStorage.getItem("auriculares") || "")
    const [estado, setEstado] = useState("")
    const [nivel, setNivel] = useState(0)
    const [probando, setProbando] = useState(false)

    const cargarDispositivos = async () => {
        try {
            const permiso = await navigator.mediaDevices.getUserMedia({ audio: true })
            permiso.getTracks().forEach((pista) => pista.stop())
            setDispositivos(await navigator.mediaDevices.enumerateDevices())
        } catch {
            setEstado("No se pudo acceder al micrófono. Revisá los permisos del navegador.")
        }
    }

    useEffect(() => {
        cargarDispositivos()
    }, [])

    useEffect(() => {
        localStorage.setItem("microfono", microfono)
        localStorage.setItem("auriculares", auriculares)
    }, [microfono, auriculares])

    const probarMicrofono = async () => {
        guardar()
        try {
            setProbando(true)
            const stream = await pedirMicrofono()

            // Medidor de volumen
            const contexto = new AudioContext()
            const analizador = contexto.createAnalyser()
            contexto.createMediaStreamSource(stream).connect(analizador)
            const datos = new Uint8Array(analizador.frequencyBinCount)
            const medidor = setInterval(() => {
                analizador.getByteFrequencyData(datos)
                let suma = 0
                for (let i = 0; i < datos.length; i++) {
                    suma += datos[i]
                }
                setNivel(Math.min(100, Math.round((suma / datos.length) * 2)))
            }, 100)

            // Grabación
            const grabador = new MediaRecorder(stream)
            const partes = []
            grabador.ondataavailable = (e) => partes.push(e.data)
            grabador.onstop = () => {
                clearInterval(medidor)
                setNivel(0)
                contexto.close()
                for (const pista of stream.getTracks()) {
                    pista.stop()
                }
                const audio = new Audio(URL.createObjectURL(new Blob(partes)))
                aplicarSalida(audio)
                audio.play()
                setEstado("▶ Reproduciendo lo que grabaste. ¿Te escuchás bien?")
                audio.onended = () => setProbando(false)
            }

            grabador.start()
            setEstado("🔴 Grabando 3 segundos... ¡hablá ahora!")
            setTimeout(() => grabador.stop(), 3000)
        } catch {
            setProbando(false)
            setEstado("No se pudo usar el micrófono elegido.")
        }
    }

    const probarSonido = async () => {
        guardar()
        const contexto = new AudioContext()
        const tono = contexto.createOscillator()
        const destino = contexto.createMediaStreamDestination()
        tono.frequency.value = 440
        tono.connect(destino)

        const audio = new Audio()
        audio.srcObject = destino.stream
        aplicarSalida(audio)
        await audio.play()
        tono.start()
        setEstado("🔊 Sonando un tono de prueba...")
        setTimeout(() => {
            tono.stop()
            contexto.close()
            setEstado("¿Escuchaste el tono? Si no, elegí otra salida.")
        }, 1000)
    }
    const puedeElegirSalida = "setSinkId" in HTMLMediaElement.prototype

    const opciones = (tipo, nombre) => {
        return dispositivos
            .filter((d) => d.kind === tipo)
            .map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || nombre}</option>)
    }
    return (
        <div className="modal-fondo" onClick={onCerrar}>
            <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
                <div className="modal-titulo">
                    <h3>🎧 Configuración de audio</h3>
                    <button className="boton-icono" onClick={onCerrar}>✕</button>
                </div>

                <label className="campo">
                    <span>🎤 Micrófono (entrada)</span>
                    <select value={microfono} onChange={(e) => setMicrofono(e.target.value)}>
                        <option value="">Predeterminado</option>
                        {opciones("audioinput", "Micrófono")}
                    </select>
                </label>

                <div className="medidor">
                    <div className="medidor-barra" style={{ width: nivel + "%" }}></div>
                </div>

                <button className="boton boton-secundario" onClick={probarMicrofono} disabled={probando}>
                    {probando ? "Probando..." : "Probar micrófono (graba 3 segundos)"}
                </button>

                <label className="campo">
                    <span>🎧 Auriculares / parlantes (salida)</span>
                    <select value={auriculares} onChange={(e) => setAuriculares(e.target.value)} disabled={!puedeElegirSalida}>
                        <option value="">Predeterminado</option>
                        {opciones("audiooutput", "Salida de audio")}
                    </select>
                </label>
                {!puedeElegirSalida && (
                    <p className="texto-suave">Tu navegador usa siempre la salida predeterminada (probá con Chrome o Edge).</p>
                )}

                <button className="boton boton-secundario" onClick={probarSonido}>Probar sonido</button>

                {estado && <p className="estado-audio">{estado}</p>}

                <button className="boton" onClick={onCerrar}>Guardar y cerrar</button>
            </div>
        </div>
    )
}

export default ConfigAudio