import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir siempre a la pantalla de login cuando se visita la raíz "/"
  redirect("/login");
  
  return null;
}
