import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";



export function buscarUsuarioAutorizado(usuarioFirebase, usuarios) {
  if (!usuarioFirebase?.email) {
    return null;
  }

  const emailGoogle = usuarioFirebase.email.trim().toLowerCase();

  const usuarioEncontrado = usuarios.find(
    (usuario) =>
      usuario.email?.trim().toLowerCase() === emailGoogle
  );

  if (!usuarioEncontrado) {
    return null;
  }

  if (usuarioEncontrado.activo !== true) {
    return null;
  }

  return usuarioEncontrado;
}

// Iniciar sesión con Google
export async function iniciarSesionConGoogle() {

  const provider = new GoogleAuthProvider();

  const resultado = await signInWithPopup(auth, provider);

  return resultado.user;
}


// Cerrar sesión
export async function cerrarSesion() {

  await signOut(auth);

}