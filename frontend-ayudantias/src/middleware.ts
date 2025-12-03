import { NextResponse, NextRequest } from "next/server";

const rutasProtegidas = ["/postulante", "/adminDashboard", "/secretaria-depto", "/coordinador"];


export function middleware(request: NextRequest)
{
    //lee la nueva cookie que tiene el valor de "token"
    const authToken = request.cookies.get("token")?.value;
    const userTipo = request.cookies.get("tipoUser")?.value;
    const { pathname } = request.nextUrl;

    //control de errores para redireccionar a la ruta al usuario autenticado
    if (authToken && pathname.startsWith("/login"))
    {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    //para leer las rutas que estan arriba en el array
    const esRutaProtegida = rutasProtegidas.some(ruta => pathname.startsWith(ruta));

    //si no esta autenticado y quiere ver la ruta de postulante o cualquier otra
    if (!authToken && esRutaProtegida)
    {
        //se redirecciona al login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    //evita la redireccion durante el cambio de vista
    if (!userTipo)
    {
        return NextResponse.next();
    }
    //admin tiene acceso a todas las vistas
    if (userTipo === "admin")
    {
        return NextResponse.next();
    }
    
    if (userTipo === "encargado_ayudantias")
    {
        return NextResponse.next();
    }

    //si no tiene rol admin y quiere ver otras rutas distintas a su rol
    if (pathname.startsWith("/adminDashboard") && (userTipo !== "admin" && userTipo !== "encargado_ayudantias"))
    {
        //se redirige al dashboard para ir a la vista segun el rol del usuario
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/postulante") && userTipo !== "alumno")
    {
        //se redirige al dashboard para ir a la vista segun el rol del usuario
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    


    return NextResponse.next();
}

//rutas a las que afecta el middleware
export const config = {
    matcher: ["/adminDashboard", "/login", "/postulante", "/secretaria-depto", "/coordinador"],
};