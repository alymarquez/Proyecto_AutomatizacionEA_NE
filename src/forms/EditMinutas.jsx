import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useApp } from "../context/AppContext";
import { X, Users } from "lucide-react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";


function EditMinuta({ minuta, onClose, onSave }) {
  /*const [seleccionados, setSeleccionados] = useState(
        minuta.participantes
        ? minuta.participantes.split(";").map(Number)
        : []
    );*/

  const [seleccionados, setSeleccionados] = useState(
    Array.isArray(minuta.participantes)
      ? minuta.participantes.map(Number)
      : minuta.participantes
        ? String(minuta.participantes).split(";").map(Number)
        : []
  );
  const [guardando, setGuardando] = useState(false);
  const { usuarios } = useApp();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: minuta.temasTratados || "",
  });

  const toggleAsistente = (id) => {
  setSeleccionados(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
  };

  const asistentes = usuarios.filter(
    u => u.rol === "asistente"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (seleccionados.length === 0) {
      alert("Debés seleccionar al menos un participante.");
      return;
    }

    // Validación temas tratados
    const contenidoTexto = editor?.getText().trim();

    if (!contenidoTexto) {
      alert(
        "Debés completar temas tratados."
      );
      return;
    }

    const minutaActualizada = {
        ...minuta,
        participantes: seleccionados.join(";"),
        temasTratados: editor.getHTML(),
        updatedAt: new Date().toISOString(),
    };

    setGuardando(true);

    try {
      await onSave(minutaActualizada);
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        
          {/* Header */}
          <div className="bg-gray-50 rounded-t-2xl flex justify-between items-center px-6 py-5">
          {/*<div className="bg-gray-50 flex justify-between items-center px-6 py-5 border-b border-gray-200 p-6">*/}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ClipboardList size={20} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Editar minuta
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-xl hover:text-red-500"
            >
              ✕
            </button>
          </div>
          
          <form
            onSubmit={handleSubmit}
            className="space-y-5 border-t border-gray-200 pt-6 flex-1 overflow-y-auto"
          >
            {/* Fecha */}
            <div className="px-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                Fecha
              </label>

              <input
                type="text"
                disabled
                value={minuta.fecha}
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            {/* Participantes */}
            {/* LISTA */}

        <div className="px-6">

          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
            Gestionar estudiantes asistentes
          </label>

          <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 ">

            <div className="flex flex-wrap gap-2">

              {asistentes.map((a) => {

                const activo = seleccionados.includes(Number(a.id_usuarios));

                return (

                  <button
                    type="button"
                    key={a.id_usuarios}
                    onClick={() => toggleAsistente(Number(a.id_usuarios))}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition active:scale-95
                           ${
                            activo
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                        }
                    `}
                  >
                    {a.nombre}
                  </button>

                );
              })}

            </div>

          </div>

        </div>

            {/* Temas tratados */}
            <div className="px-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                Temas tratados
              </label>

              {/* Toolbar */}
              <div className="border rounded-t-lg p-2 flex gap-2 bg-gray-100 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleBold()
                      .run()
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  <b>B</b>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleItalic()
                      .run()
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  <i>I</i>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleBulletList()
                      .run()
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  • Lista
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editor
                      ?.chain()
                      .focus()
                      .toggleOrderedList()
                      .run()
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  1. Lista
                </button>
              </div>

              {/* Editor */}
              <div className="border border-t-0 rounded-b-lg min-h-[180px] max-h-[250px] overflow-y-auto p-4">
                <EditorContent
                  editor={editor}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="bg-gray-50 flex justify-end gap-3 px-6 py-4 border-t mt-5 border-gray-200">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 active:scale-[0.98] px-5 py-2 rounded-xl bg-red-50 text-red-600 text-xs hover:bg-red-100 font-bold transition"
            >
              <X size={16}/>
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex justify-center items-center gap-1.5 active:scale-[0.98]"
            >
              <CheckCircle2 size={16}/>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            </div>
          </form>
        </div>
      
    </div>
  );
}

export default EditMinuta;