# Friendoo

App de amigo invisible con Next.js, Supabase Auth/Database y Resend.

## Funcionalidad

- Login exclusivo con Google mediante Supabase Auth.
- Crear grupos con precio máximo, fecha opcional y mensaje.
- Código compartible por grupo para que otros usuarios autenticados se unan.
- Sugerencias de regalo por participante.
- Sorteo server-side donde nadie se regala a sí mismo.
- Email privado para cada participante usando Resend.
- Vista especial de revelación completa solo para el organizador.

## Variables De Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase

1. Crea un proyecto en Supabase.
2. Activa Google como provider en Authentication.
3. Añade `http://localhost:3000/auth/callback` como redirect URL para desarrollo.
4. Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor.

## Desarrollo

```bash
bun install
bun run dev
```

## Verificación

```bash
bun run lint
bun run build
```
