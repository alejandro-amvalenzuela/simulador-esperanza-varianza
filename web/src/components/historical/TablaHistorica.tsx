"use client";

import { useState, useEffect } from "react";
import {
  fetchHistoricos,
  crearHistorico,
  actualizarHistorico,
  eliminarHistorico,
  subirCSVHistorico,
  obtenerUrlExportarCSV,
  RegistroHistorico
} from "@/lib/api";
import { Upload, Download, Plus, Trash2, Edit2, Check, X, RefreshCw } from "lucide-react";
import { formatearEntero } from "@/lib/formatters";

interface PropsTablaHistorica {
  slug: string;
  registrosIniciales?: RegistroHistorico[];
  totalInicial?: number;
  onDataChanged?: () => void;
}

export function TablaHistorica({
  slug,
  registrosIniciales = [],
  totalInicial = 0,
  onDataChanged
}: PropsTablaHistorica) {
  const [registros, setRegistros] = useState<RegistroHistorico[]>(registrosIniciales);
  const [total, setTotal] = useState<number>(totalInicial);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [origenFiltro, setOrigenFiltro] = useState<string>("todos");
  const [orden, setOrden] = useState<string>("desc");
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados modal nuevo registro
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nuevaLinea, setNuevaLinea] = useState("");
  const [nuevoIntentos, setNuevoIntentos] = useState<number>(20);
  const [nuevoExitos, setNuevoExitos] = useState<number>(1);
  const [nuevaNota, setNuevaNota] = useState("");

  // Estados edición en línea
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editIntentos, setEditIntentos] = useState<number>(0);
  const [editExitos, setEditExitos] = useState<number>(0);
  const [editNota, setEditNota] = useState<string>("");

  const cargarDatos = async (
    p: number = page,
    orig: string = origenFiltro,
    ord: string = orden
  ) => {
    setCargando(true);
    try {
      const res = await fetchHistoricos({
        caso: slug,
        page: p,
        limit,
        origen: orig !== "todos" ? orig : undefined,
        orden: ord
      });
      if (res.success && res.data) {
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.registros)
          ? res.data.registros
          : [];
        setRegistros(items);
        setTotal(res.data.total ?? res.total ?? items.length);
      } else {
        setRegistros([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos(1, origenFiltro, orden);
  }, [slug]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await crearHistorico({
        caso: slug,
        linea: nuevaLinea,
        intentos: nuevoIntentos,
        exitos: nuevoExitos,
        nota: nuevaNota,
        origen: "real"
      });
      if (res.success) {
        setMostrarModalNuevo(false);
        setNuevaLinea("");
        setNuevaNota("");
        await cargarDatos();
        if (onDataChanged) onDataChanged();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Deseas eliminar este registro histórico?")) return;
    try {
      const res = await eliminarHistorico(id);
      if (res.success) {
        await cargarDatos();
        if (onDataChanged) onDataChanged();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGuardarEdicion = async (id: number) => {
    try {
      const res = await actualizarHistorico(id, {
        intentos: editIntentos,
        exitos: editExitos,
        nota: editNota
      });
      if (res.success) {
        setEditandoId(null);
        await cargarDatos();
        if (onDataChanged) onDataChanged();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubirCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await subirCSVHistorico(slug, file);
      if (res.success) {
        alert(`¡Importación exitosa! Se cargaron ${res.insertados} registros.`);
        await cargarDatos(1);
        if (onDataChanged) onDataChanged();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="design-card mt-8 space-y-4">
      {/* Cabecera de la tabla */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-[#0a0a0a]">Registros Históricos</h4>
            <span className="badge-soft text-[11px] font-mono">
              {formatearEntero(total)} muestras
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Datos empíricos utilizados para el cálculo de frecuencias observadas y estimación de p.
          </p>
        </div>

        {/* Acciones de CSV y Agregar */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="btn-outline text-xs !py-1.5 !px-3 cursor-pointer">
            <Upload size={13} />
            <span>Importar CSV</span>
            <input type="file" accept=".csv" onChange={handleSubirCSV} className="hidden" />
          </label>

          <a
            href={obtenerUrlExportarCSV(slug)}
            download
            className="btn-outline text-xs !py-1.5 !px-3"
          >
            <Download size={13} />
            <span>Exportar CSV</span>
          </a>

          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="btn-primary text-xs !py-1.5 !px-3.5"
          >
            <Plus size={13} />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs text-[#737373]">
        <div className="flex flex-wrap items-center gap-3">
          <span>Filtrar origen:</span>
          <select
            value={origenFiltro}
            onChange={(e) => {
              setOrigenFiltro(e.target.value);
              cargarDatos(1, e.target.value, orden);
            }}
            className="design-input !py-1 !px-2.5 text-xs text-[#0a0a0a] cursor-pointer"
          >
            <option value="todos">Todos los orígenes</option>
            <option value="real">Solo Datos Reales</option>
            <option value="sintetico">Solo Datos Sintéticos</option>
          </select>

          <span>Orden:</span>
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              cargarDatos(page, origenFiltro, e.target.value);
            }}
            className="design-input !py-1 !px-2.5 text-xs text-[#0a0a0a] cursor-pointer"
          >
            <option value="desc">Más recientes primero</option>
            <option value="asc">Más antiguos primero</option>
          </select>
        </div>

        <button
          onClick={() => cargarDatos()}
          className="text-[#737373] hover:text-[#0a0a0a] flex items-center gap-1 text-xs"
        >
          <RefreshCw size={12} className={cargando ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Tabla Paginada */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-[#737373] uppercase font-mono tracking-wider text-[11px]">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Fecha</th>
              <th className="py-2.5 px-3">Línea / Canal</th>
              <th className="py-2.5 px-3">Intentos (n)</th>
              <th className="py-2.5 px-3">Éxitos (x)</th>
              <th className="py-2.5 px-3">Origen</th>
              <th className="py-2.5 px-3">Nota</th>
              <th className="py-2.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {!Array.isArray(registros) || registros.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#737373]">
                  No se encontraron registros en este filtro.
                </td>
              </tr>
            ) : (
              registros.map((r) => {
                const esEditando = editandoId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#737373]">#{r.id}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {new Date(r.fecha).toLocaleDateString("es-CL")}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#0a0a0a]">{r.linea || "—"}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {esEditando ? (
                        <input
                          type="number"
                          value={editIntentos}
                          onChange={(e) => setEditIntentos(Number(e.target.value))}
                          className="w-16 design-input !py-0.5 !px-1.5 text-xs font-mono"
                        />
                      ) : (
                        r.intentos
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#0a0a0a]">
                      {esEditando ? (
                        <input
                          type="number"
                          value={editExitos}
                          onChange={(e) => setEditExitos(Number(e.target.value))}
                          className="w-16 design-input !py-0.5 !px-1.5 text-xs font-mono"
                        />
                      ) : (
                        r.exitos
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          r.origen === "real"
                            ? "badge-solid text-[10px] uppercase font-mono"
                            : "badge-soft text-[10px] uppercase font-mono"
                        }
                      >
                        {r.origen}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#737373] max-w-xs truncate">
                      {esEditando ? (
                        <input
                          type="text"
                          value={editNota}
                          onChange={(e) => setEditNota(e.target.value)}
                          className="w-full design-input !py-0.5 !px-1.5 text-xs"
                        />
                      ) : (
                        r.nota || "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {esEditando ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleGuardarEdicion(r.id)}
                            className="p-1 text-[#0a0a0a] hover:opacity-75"
                            title="Guardar"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="p-1 text-[#737373] hover:text-[#0a0a0a]"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditandoId(r.id);
                              setEditIntentos(r.intentos);
                              setEditExitos(r.exitos);
                              setEditNota(r.nota || "");
                            }}
                            className="p-1 text-[#737373] hover:text-[#0a0a0a]"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleEliminar(r.id)}
                            className="p-1 text-[#737373] hover:text-[#e7000b]"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5] text-xs text-[#737373]">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1);
              cargarDatos(page - 1);
            }}
            className="btn-ghost !py-1 !px-3 text-xs disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              cargarDatos(page + 1);
            }}
            className="btn-ghost !py-1 !px-3 text-xs disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Nuevo Registro */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ffffff] p-6 max-w-md w-full design-card shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#e5e5e5]">
              <h5 className="text-base font-semibold text-[#0a0a0a]">Agregar Registro Histórico</h5>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-[#737373] hover:text-[#0a0a0a]"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCrear} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#737373] mb-1 font-mono uppercase text-[11px]">Línea / Canal / Turno:</label>
                <input
                  type="text"
                  value={nuevaLinea}
                  onChange={(e) => setNuevaLinea(e.target.value)}
                  className="design-input w-full text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#737373] mb-1 font-mono uppercase text-[11px]">Intentos (n):</label>
                  <input
                    type="number"
                    value={nuevoIntentos}
                    onChange={(e) => setNuevoIntentos(Number(e.target.value))}
                    className="design-input w-full text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#737373] mb-1 font-mono uppercase text-[11px]">Éxitos observados (x):</label>
                  <input
                    type="number"
                    value={nuevoExitos}
                    onChange={(e) => setNuevoExitos(Number(e.target.value))}
                    className="design-input w-full text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#737373] mb-1 font-mono uppercase text-[11px]">Nota explicativa:</label>
                <textarea
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  className="design-input w-full text-xs !rounded-[14px]"
                  rows={2}
                  placeholder="Detalles de la muestra o turno..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="btn-ghost text-xs !py-1.5 !px-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs !py-1.5 !px-3.5"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
