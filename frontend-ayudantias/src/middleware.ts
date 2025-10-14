import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest)
{
    //lee la nueva cookie que tiene el valor de "token"
    const authToken = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    //si no esta autenticado y quiere ver la ruta de postulante
    if (pathname.startsWith("/postulante") && !authToken)
    {
        //se redirecciona al login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    //control de errores para redireccionar a la ruta al usuario autenticado
    if (authToken && pathname.startsWith("/login"))
    {
        return NextResponse.redirect(new URL("/postulante", request.url));
    }

    return NextResponse.next();
}

//rutas a las que afecta el middleware
export const config = {
    matcher: ["/admin(.*)", "/login"],
};