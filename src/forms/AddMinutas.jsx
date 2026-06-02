import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
//import BulletList from "@tiptap/extension-bullet-list";
//import OrderedList from "@tiptap/extension-ordered-list";
//import ListItem from "@tiptap/extension-list-item";

function AddMinutaForm({ onClose, onSave }) {
  const [participantes, setParticipantes] =
    useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: "",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validación participantes
  if (!participantes.trim()) {
    alert("Debés completar participantes.");
    return;
  }

  // Validación temas tratados
  const contenidoTexto =
    editor?.getText().trim();

  if (!contenidoTexto) {
    alert(
      "Debés completar temas tratados."
    );
    return;
  }

  const nuevaMinuta = {
    fecha: new Date()
      .toISOString()
      .split("T")[0],

    participantes,

    temasTratados:
      editor?.getHTML(),

    autor: "Sebastian",

    createdAt: new Date().toISOString(),

    updateAt: new Date().toISOString()
  };

try {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbwcoAh5FGqo7Xe_tg0SvrRt5Y7MEMXQRUYXeNyT4yV4oj5ZBaHtKc6BNX-lQZxVL4HtTA/exec",
    {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(nuevaMinuta),
    }
  );

  console.log(response);

  alert("POST enviado");
  if (onClose) {
    onClose();
  }

  setTimeout(() => {
    window.location.reload();
  }, 100);
} catch (error) {
  console.error(error);
}}
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-3">
            <h2 className="text-2xl font-bold">
              Agregar minuta
            </h2>

            <button
              onClick={onClose}
              className="text-xl hover:text-red-500"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Fecha */}
            <div>
              <label className="font-semibold block mb-2">
                Fecha
              </label>

              <input
                type="text"
                disabled
                value={new Date()
                  .toISOString()
                  .split("T")[0]}
                className="w-full border rounded-lg p-3 bg-gray-100"
              />
            </div>

            {/* Participantes */}
            <div>
              <label className="font-semibold block mb-2">
                Participantes
              </label>

              <textarea
                value={participantes}
                onChange={(e) =>
                  setParticipantes(
                    e.target.value
                  )
                }
                placeholder="Ej: Flor, Sebastián, Sofía..."
                className="w-full border rounded-lg p-3 min-h-[100px]"
                required
              />
            </div>

            {/* Temas tratados */}
            <div>
              <label className="font-semibold block mb-2">
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
            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <button
                type="button"
                onClick={onClose}
                className="border px-5 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800"
              >
                Guardar minuta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMinutaForm;