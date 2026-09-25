// Entrega la sesión de Firebase (la misma del login con MFA del hub) a db.js, que es un script
// clásico y no puede importar módulos. db.js espera window.TIBOX_SGC_AUTH_READY antes de
// cada consulta a Supabase; acá se resuelve con la instancia de Auth ya lista.
import { auth } from '../../auth/auth-core.js';

await auth.authStateReady();
window.TIBOX_SGC_RESOLVE_AUTH(auth);
