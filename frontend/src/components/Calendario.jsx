import "./Chat.css"

import { useEffect, useState } from "react"
import { getUsuario } from "../api/auth"
import axios from "axios"

const API = "http://localhost:3000/chat/"
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DIAS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
const HORAS_RAPIDAS = ["09:00", "12:00", "15:00", "18:00", "21:00"]

// "sábado 15 de noviembre" con la primera letra en mayúscula
const textoDia = (fecha) => {
    const texto = fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
    return texto[0].toUpperCase() + texto.slice(1)
}

const textoHora = (fecha) => new Date(fecha).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })

const mismoDia = (a, b) => a.toDateString() === b.toDateString()

function Calendario({ rutaEventos, puedeModerar }) {
    const hoy = new Date()
    const inicioDeHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

    const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
    const [dia, setDia] = useState(inicioDeHoy)
    const [eventos, setEventos] = useState([])
    const [verFormulario, setVerFormulario] = useState(false)
    const [titulo, setTitulo] = useState("")
    const [hora, setHora] = useState("18:00")
    const [descripcion, setDescripcion] = useState("")
    const [error, setError] = useState("")

    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: "Bearer " + token } }
    const yo = getUsuario()

    const cargar = async () => {
        try {
            const res = await axios.get(API + rutaEventos, config)
            setEventos(res.data.eventos)
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cargar el calendario")
        }
    }

    useEffect(() => {
        cargar()
    }, [rutaEventos])

    const eventosDel = (d) => eventos.filter((ev) => mismoDia(new Date(ev.fecha), d))

    // Grilla del mes: primero espacios vacíos hasta el día de la semana en que empieza (lunes = 0)
    const celdas = []
    const primerDia = (mes.getDay() + 6) % 7
    for (let i = 0; i < primerDia; i++) {
        celdas.push(null)
    }
    const cantidadDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
    for (let d = 1; d <= cantidadDias; d++) {
        celdas.push(new Date(mes.getFullYear(), mes.getMonth(), d))
    }

    const cambiarMes = (cantidad) => {
        setMes(new Date(mes.getFullYear(), mes.getMonth() + cantidad, 1))
    }

    const elegirDia = (d) => {
        setDia(d)
        setError("")
        setVerFormulario(false)
    }

    const irAHoy = () => {
        setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
        elegirDia(inicioDeHoy)
    }

    const crearEvento = async (e) => {
        e.preventDefault()
        const partes = hora.split(":")
        const fecha = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Number(partes[0]), Number(partes[1]))
        if (titulo.trim() === "") {
            setError("Escribí qué evento es")
            return
        }
        if (fecha < new Date()) {
            setError("Ese horario ya pasó, elegí uno más adelante")
            return
        }
        try {
            await axios.post(API + rutaEventos, { titulo, descripcion, fecha: fecha.toISOString() }, config)
            setTitulo("")
            setDescripcion("")
            setError("")
            setVerFormulario(false)
            cargar()
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo crear el evento")
        }
    }

    const borrarEvento = async (id) => {
        if (!confirm("¿Borrar este evento?")) return
        try {
            await axios.delete(API + "eventos/" + id, config)
            cargar()
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo borrar")
        }
    }

    const verEvento = (ev) => {
        const fecha = new Date(ev.fecha)
        setMes(new Date(fecha.getFullYear(), fecha.getMonth(), 1))
        elegirDia(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()))
    }

    const delDia = eventosDel(dia)
    const proximos = eventos.filter((ev) => new Date(ev.fecha) >= hoy).slice(0, 3)
    const diaPasado = dia < inicioDeHoy

    return (
        <div className="calendario">
            <div className="cal-cabecera">
                <button type="button" className="boton-icono" onClick={() => cambiarMes(-1)} title="Mes anterior">‹</button>
                <strong>{MESES[mes.getMonth()]} {mes.getFullYear()}</strong>
                <button type="button" className="boton-icono" onClick={() => cambiarMes(1)} title="Mes siguiente">›</button>
                <button type="button" className="cal-hoy" onClick={irAHoy}>Hoy</button>
            </div>

            <div className="cal-grilla">
                {DIAS.map((d) => <span key={d} className="cal-nombre-dia">{d}</span>)}
                {celdas.map((d, i) => {
                    if (d === null) return <span key={"vacio" + i} />
                    let clase = "cal-dia"
                    if (mismoDia(d, hoy)) clase += " hoy"
                    if (mismoDia(d, dia)) clase += " elegido"
                    if (d < inicioDeHoy) clase += " pasado"
                    const cantidad = eventosDel(d).length
                    return (
                        <button type="button" key={i} className={clase} onClick={() => elegirDia(d)}>
                            {d.getDate()}
                            {cantidad > 0 && <span className="cal-punto">{cantidad > 1 ? cantidad : ""}</span>}
                        </button>
                    )
                })}
            </div>

            <div className="cal-detalle">
                <div className="cal-detalle-titulo">
                    <h4>{mismoDia(dia, hoy) ? "Hoy" : textoDia(dia)}</h4>
                    {!diaPasado && (
                        <button type="button" className="boton-chico" onClick={() => { setVerFormulario(!verFormulario); setError("") }}>
                            {verFormulario ? "Cancelar" : "+ Evento"}
                        </button>
                    )}
                </div>

                {verFormulario && (
                    <form className="cal-form" onSubmit={crearEvento}>
                        <input
                            type="text"
                            placeholder="¿Qué van a hacer? Ej: Reunión del TP"
                            value={titulo}
                            maxLength={100}
                            onChange={(e) => setTitulo(e.target.value)}
                        />

                        <span className="cal-etiqueta">🕒 ¿A qué hora?</span>
                        <div className="cal-horas">
                            {HORAS_RAPIDAS.map((h) => (
                                <button type="button" key={h} className={hora === h ? "chip marcado" : "chip"} onClick={() => setHora(h)}>{h}</button>
                            ))}
                        </div>
                        <label className="cal-otra-hora">
                            Otra hora:
                            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                        </label>

                        <textarea
                            placeholder="Detalles (opcional): dónde, qué llevar..."
                            value={descripcion}
                            maxLength={255}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />

                        <div className="cal-resumen">📅 {textoDia(dia)} a las <strong>{hora} hs</strong></div>
                        {error && <p className="aviso-error">{error}</p>}
                        <button type="submit" className="boton">Agendar y avisar al grupo</button>
                    </form>
                )}

                {!verFormulario && error && <p className="aviso-error">{error}</p>}

                {delDia.length === 0 && !verFormulario && (
                    <p className="texto-suave cal-sin-eventos">{diaPasado ? "No hubo eventos este día." : "No hay eventos. ¡Agendá uno!"}</p>
                )}

                {delDia.map((ev) => (
                    <div key={ev.id} className="cal-evento">
                        <span className="cal-evento-hora">{textoHora(ev.fecha)}</span>
                        <div className="cal-evento-info">
                            <strong>{ev.titulo}</strong>
                            {ev.descripcion && <span>{ev.descripcion}</span>}
                            <span className="texto-suave">por @{ev.creador?.username}</span>
                        </div>
                        {(ev.creadorId === yo?.id || puedeModerar) && (
                            <button type="button" className="boton-icono" onClick={() => borrarEvento(ev.id)} title="Borrar evento">🗑</button>
                        )}
                    </div>
                ))}
            </div>

            {proximos.length > 0 && (
                <div className="cal-proximos">
                    <span className="seccion">Próximos eventos</span>
                    {proximos.map((ev) => (
                        <button type="button" key={ev.id} className="cal-proximo" onClick={() => verEvento(ev)}>
                            <span className="cal-fecha-chica">
                                <strong>{new Date(ev.fecha).getDate()}</strong>
                                {MESES[new Date(ev.fecha).getMonth()].slice(0, 3)}
                            </span>
                            <span className="cal-proximo-texto">
                                <strong>{ev.titulo}</strong>
                                <span className="texto-suave">{textoHora(ev.fecha)} hs</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Calendario
