import "./Chat.css"

import { useEffect, useState } from "react"
import { entrarALaLlamada, salirDeLaLlamada, actualizarParticipantes, silenciar } from "../api/voz"
import ConfigAudio from "./ConfigAudio"

function CanalVoz({ canal, yo, onCambio, acciones }) {
    const [enLlamada, setEnLlamada] = useState(false)
    const [silenciado, setSilenciado] = useState(false)
    const [conectando, setConectando] = useState(false)
    const [verConfig, setVerConfig] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (enLlamada) {
            actualizarParticipantes(canal.conectados, yo.id)
        }
    }, [canal, enLlamada])

    useEffect(() => {
        return () => {
            salirDeLaLlamada()
        }
    }, [canal.id])

    const entrar = async () => {
        try {
            setError("")
            setConectando(true)
            await entrarALaLlamada(canal.id)
            setEnLlamada(true)
            setSilenciado(false)
            onCambio()
        } catch {
            setError("No se pudo usar el micrófono. Revisá los permisos del navegador o la configuración de audio.")
        } finally {
            setConectando(false)
        }
    }

    const salir = async () => {
        await salirDeLaLlamada()
        setEnLlamada(false)
        onCambio()
    }

    return (
        <div className="voz">
            <div className="ventana-cabecera">
                <div className="avatar-chat icono-voz">🔊</div>
                <div className="cabecera-texto">
                    <h3>{canal.name}</h3>
                    <span className="texto-suave">
                        {enLlamada ? "🟢 Conectado al canal de voz" : "Canal de voz · " + canal.conectados.length + " conectados"}
                    </span>
                </div>
                {acciones && <div className="cabecera-acciones">{acciones}</div>}
            </div>

            <div className="voz-participantes">
                {canal.conectados.length === 0 && (
                    <div className="vacio">
                        <span className="vacio-icono">🎙️</span>
                        <p>No hay nadie en el canal. ¡Entrá y esperá a tus amigos!</p>
                    </div>
                )}

                {canal.conectados.map((u) => (
                    <div key={u.id} className={u.id === yo.id && enLlamada ? "participante yo" : "participante"}>
                        <div className="participante-avatar">{u.username[0].toUpperCase()}</div>
                        <strong>@{u.username}</strong>
                        {u.id === yo.id && <span className="texto-suave">{silenciado ? "🔇 Silenciado" : "Vos"}</span>}
                    </div>
                ))}
            </div>

            {error && <p className="aviso-error">{error}</p>}

            <div className="voz-controles">
                {!enLlamada && (
                    <button className="boton boton-verde" onClick={entrar} disabled={conectando}>
                        {conectando ? "Conectando..." : "📞 Entrar al canal"}
                    </button>
                )}

                {enLlamada && (
                    <>
                        <button
                            className={silenciado ? "boton-redondo apagado" : "boton-redondo"}
                            onClick={() => setSilenciado(silenciar())}
                            title={silenciado ? "Activar micrófono" : "Silenciar micrófono"}
                        >
                            {silenciado ? "🔇" : "🎤"}
                        </button>
                        <button className="boton boton-rojo" onClick={salir}>Salir del canal</button>
                    </>
                )}

                <button className="boton-redondo" onClick={() => setVerConfig(true)} title="Configuración de audio">⚙️</button>
            </div>

            {verConfig && <ConfigAudio onCerrar={() => setVerConfig(false)} />}
        </div>
    )
}

export default CanalVoz