# OCR TIME — Setup completo

Sistema oficial de cronometración OCR · UIPM · World Obstacle

## Stack
- **Frontend:** Next.js 14 (React)
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Emails:** Resend
- **Hosting:** Vercel (recomendado) o Hostinger

---

## Setup en 4 pasos

### 1. Clonar y configurar

```bash
# Crear carpeta y copiar archivos del proyecto
cd ocrtime
npm install
```

### 2. Variables de entorno

Crear archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://juemqgqxzxmihxoicmxj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_tu_api_key_aqui
NEXT_PUBLIC_APP_URL=https://ocrtime.com
SUPER_ADMIN_EMAIL=info@ocrtime.com
```

### 3. Deploy en Vercel (recomendado)

**Opción A — desde GitHub (mejor para producción):**
1. Crear cuenta en github.com
2. Crear repositorio nuevo → "ocrtime"
3. Subir los archivos de este proyecto
4. Ir a vercel.com → "Add new project"
5. Conectar con GitHub → seleccionar "ocrtime"
6. Agregar las variables de entorno en Vercel dashboard
7. Deploy → ¡listo!

**Opción B — Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4. Conectar dominio ocrtime.com

En Vercel → tu proyecto → Settings → Domains → Add Domain → `ocrtime.com`

Vercel te da 2 registros DNS. En Hostinger → Dominios → ocrtime.com → DNS Zone, agregar:
- Registro A: `@` → IP de Vercel
- Registro CNAME: `www` → cname.vercel-dns.com

---

## Estructura del proyecto

```
src/
  pages/
    index.jsx          → Landing page
    auth.jsx           → Login / Signup
    dashboard.jsx      → Panel de organizador (timing)
    events/            → Lista y creación de eventos
    athletes/          → Lista de atletas
    results/           → Resultados públicos
    pricing.jsx        → Página de precios
    api/               → API routes (emails, etc.)
  components/
    Navbar.jsx
    ui/index.jsx       → Shared UI components
    timing/
      WaveTiming.jsx   → Cronometración por oleadas (Short/Standard)
      SprintTiming.jsx → Clasificación + brackets (100m/400m)
      PentathlonTiming.jsx → Sorteo + clasificación + brackets UIPM
  lib/
    supabase.js        → Supabase client
    constants.js       → Disciplines, AGE_GROUPS, COUNTRIES, helpers
    emails.js          → Resend email functions
  styles/
    globals.css
```

---

## Módulos de cronometración

### OCR 100m / 400m
1. Tabla de clasificación — 2 pasadas por atleta, mejor tiempo auto-calculado
2. Bracket automático — agrupa por Elite/AgeGroup × Género
3. Eliminación directa cara a cara — hasta la final

### Short Course / Standard
- **Modo oleadas:** START → botón FINISH por atleta
- **Modo ingreso de dorsal:** el juez tipea el dorsal al llegar
- Validación de pulseras: 3 pulseras start (5 adaptive), DNC si <3 al finish
- Penalty loops: recuperan 1 pulsera (máx 2)
- Status automático: OK / DNC / DNF

### Pentatlón UIPM
1. Sorteo de obstáculos: 6 fijos + 2 del pool al azar
2. Clasificación: 2 pasadas, mejor tiempo
3. Brackets: Elite top 16, Age Group top 8

### Team Relay
- Equipos de 4 atletas
- 5 vueltas (4 individuales + 1 cooperativa)
- Tiempo total por equipo

---

## Categorías

**Elite:** sin grupo etario, compite en categoría abierta por género

**Age Group:** 15 grupos desde Youth 10/11 hasta Veterans 65+

**Open:** sin restricciones de categoría

**Adaptive/Para:** 5 pulseras en vez de 3

---

## Emails automáticos (Resend)

| Trigger | Email |
|---|---|
| Atleta crea perfil | Bienvenida + dorsal |
| Atleta se inscribe en evento | Inscripción confirmada |
| Organizador crea evento | Evento creado + próximos pasos |
| Resultados publicados | Resultado individual con tiempo + pulseras + posición |

Dominio verificado: `ocrtime.com` · Remitente: `info@ocrtime.com`
