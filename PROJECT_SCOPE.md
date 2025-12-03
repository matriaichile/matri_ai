# Matri.AI - Documento de Alcance del Proyecto (MVP)

## Índice

1. [Introducción](#1-introducción)
2. [Landing Page](#2-landing-page)
3. [Flujos de Registro (Wizard)](#3-flujos-de-registro-wizard)
4. [Dashboards](#4-dashboards)
5. [Mini Cuestionarios por Categoría](#5-mini-cuestionarios-por-categoría)
6. [Sistema de Matchmaking](#6-sistema-de-matchmaking)
7. [Panel de Administración](#7-panel-de-administración)
8. [Arquitectura Técnica](#8-arquitectura-técnica)
9. [Modelo de Datos](#9-modelo-de-datos)
10. [Seguridad](#10-seguridad)

---

## 1. Introducción

**Matri.AI** es una plataforma de matchmaking inteligente que conecta parejas (usuarios) con proveedores de servicios para matrimonios. El sistema utiliza cuestionarios detallados para generar recomendaciones personalizadas basadas en preferencias, presupuesto, ubicación y disponibilidad.

### Objetivo del MVP

Desarrollar una plataforma funcional que permita:
- Registro de usuarios (novios) y proveedores
- Generación de matches basados en criterios definidos
- Gestión de leads por parte de administradores
- Dashboard diferenciados por tipo de usuario

---

## 2. Landing Page

### 2.1 Estructura Visual

La landing debe ser **moderna, limpia y tecnológica** con una paleta de colores **negro + dorado** que transmita servicio premium.

#### Secciones (en orden):

1. **Portada**
   - Título principal: "El match perfecto para tu matrimonio"
   - Texto introductorio
   - Imagen de fondo con efecto deslizante

2. **Sección de Matchmaking** (formato 4 pasos)
   - Crea tu usuario
   - Responde el cuestionario
   - Recibe recomendaciones
   - Conecta y celebra

3. **Beneficios**
   - Para novios
   - Para proveedores

4. **Testimonios de novios**
   - Opiniones reales recomendando la app

5. **Call to Action final**
   - "Crea tu usuario" / "Empieza esta aventura"

6. **Frase Romántica**
   - Sección de relleno para mantener estética

### 2.2 Botones Principales

| Botón | Acción |
|-------|--------|
| "Soy Usuario" | Redirige al wizard de creación de perfil del usuario |
| "Soy Proveedor" | Redirige al wizard de creación de cuenta del proveedor |

---

## 3. Flujos de Registro (Wizard)

El registro se realiza mediante un **wizard dinámico**, con una pregunta por pantalla y animaciones suaves.

### 3.1 Wizard para Usuarios (Novios)

| Paso | Campo | Tipo | Opciones |
|------|-------|------|----------|
| 1 | Nombre de la pareja | Texto | - |
| 1 | Email | Email | - |
| 1 | Teléfono | Tel | - |
| 1 | Contraseña | Password | - |
| 2 | Fecha del evento | Date | Fecha tentativa o real |
| 3 | Presupuesto aproximado | Select | Rangos definidos |
| 3 | Número de invitados | Select | Rangos definidos |
| 4 | Región/Ciudad | Select | Regiones de Chile |
| 5 | Tipo de ceremonia | Multi-select | Civil, Religiosa, Simbólica |
| 6 | Estilo del evento | Select | Clásico, Rústico, Moderno, etc. |
| 7 | Nivel de avance | Select | Nada, Poco, Mitad, Mucho, Casi listo |
| 7.1 | Items ya listos | Multi-select | DJ, Foto, Video, Lugar, Banquetería |
| 8 | Categorías prioritarias | Multi-select | Lista de categorías |
| 9 | Nivel de vinculación | Select | 100%, 80%, 60%, 40%, 20%, 0% |
| 10 | Expectativas | Textarea | Texto libre para IA |

**Al finalizar:** Se genera el User Dashboard automáticamente.

### 3.2 Wizard para Proveedores

| Paso | Campo | Tipo | Opciones |
|------|-------|------|----------|
| 1 | Email | Email | - |
| 1 | Contraseña | Password | - |
| 1 | Nombre del proveedor | Texto | - |
| 1 | Teléfono | Tel | - |
| 2 | Categorías | Multi-select | Fotografía, Video, DJ, etc. |
| 3 | Estilo del servicio | Select | Tradicional, Moderno, etc. |
| 4 | Rango de precios | Select | Económico, Medio, Premium, Lujo |
| 4 | Región de trabajo | Select | Regiones de Chile |
| 4 | Acepta fuera de zona | Boolean | Sí/No |
| 5 | Descripción | Textarea | - |
| 6 | Redes sociales | URLs | Instagram, Facebook, TikTok, Web |
| 6 | Fotos portfolio | File upload | Múltiples imágenes |

**Estados de cuenta:** `pending` | `active` | `closed`

**Al finalizar:** 
- Se crea el Provider Dashboard
- El administrador debe aprobar o rechazar la cuenta

---

## 4. Dashboards

### 4.1 Dashboard del Usuario

#### Componentes:
- Resumen de información del perfil
- Botón "Buscar proveedores"
- Lista de categorías disponibles
- Matches recomendados con tarjetas visuales

#### Acciones sobre matches:
- **Aprobar**: Genera lead confirmado
- **Rechazar**: Descarta el match
- **Ver más**: Detalles del proveedor

### 4.2 Dashboard del Proveedor

#### Componentes:
- Banner de estado (si está pendiente de aprobación)
- Estadísticas:
  - Leads totales
  - Leads aprobados
  - Tasa de match
- Perfil editable
- Lista de leads con información:
  - Nombre del usuario
  - Fecha del evento
  - Presupuesto
  - Email y teléfono
  - Estado del lead
  - Match score

#### Campos editables:
- Precios
- Estilo
- Disponibilidad
- Descripción
- Fotos

---

## 5. Mini Cuestionarios por Categoría

Cada categoría tiene su propio cuestionario para refinar preferencias.

### 5.1 Fotografía

| Sección | Campos |
|---------|--------|
| Disponibilidad | Calendario editable |
| Ubicación | Región principal, costos traslado |
| Experiencia | Años, estilo fotográfico |
| Descripción | Diferenciador, frase de estilo |
| Equipo | Asistentes |
| Cobertura | Regiones, recargos |
| Duración | Horas, full day |
| Entregables | Cantidad fotos, tiempo, formatos |
| Backup | Disco, Nube, Ambos |
| Paquetes | Básico, Intermedio, Full |
| Extras | Pre/post boda, descuentos |

### 5.2 Videografía

Similar a fotografía con variaciones:
- Estilos: Documental, Cinemático, Narrativo
- Tipos: Resumen, Highlight, Larga duración, Reel
- Segundo camarógrafo opcional

### 5.3 Banquetería

- Tipo de evento
- Capacidad (mín-max)
- Presupuesto por persona
- Tipo de comida
- Opciones especiales (vegano, celiaco)
- Degustación previa
- Bebestibles
- Tiempos de servicio
- Personal y montaje
- Menú/dossier adjunto

### 5.4 Centros de Eventos

- Espacios disponibles
- Pista de baile
- Iluminación y mobiliario
- Sonido
- Servicios adicionales
- Horarios y exclusividad
- Cocina/espacio de apoyo
- Restricciones
- Estilo del lugar

### 5.5 DJ/VJ

| Sección | Campos |
|---------|--------|
| Especialidad | DJ matrimonios, corporativo, fiestas, etc. |
| Estilo musical | 3 palabras, géneros, solicitudes |
| Portafolio | Links, Instagram |
| Sonido | Parlantes, subwoofers, mixer, micrófonos |
| Iluminación | Cabezas móviles, láser, humo, LED |
| Visuales | VJ, pantallas LED, proyector |
| Logística | Horas, hora máxima, hora extra |
| Requerimientos | Electricidad, escenario, montaje |

---

## 6. Sistema de Matchmaking

### 6.1 Criterios de Match

El sistema genera 3 proveedores recomendados basándose en:

1. **Fechas** - Disponibilidad del proveedor vs fecha del evento
2. **Presupuesto** - Rango de precios compatible
3. **Ubicación** - Región del evento vs zona de trabajo
4. **Preferencias específicas** - Según categoría
5. **Tipo de evento** - Ceremonia + Cóctel + Cena + Fiesta
6. **Estilo** - Coincidencia de estilos

### 6.2 Match Score

- Siempre debe haber un porcentaje de probabilidad de match
- **NUNCA** debe aparecer que NO hay match
- Mínimo 3 opciones si existen

### 6.3 Notificaciones

- Email al proveedor cuando recibe un lead
- Notificación en dashboard (deseable ambas)

---

## 7. Panel de Administración

### 7.1 Acceso

- URL: `/admin`
- Login exclusivo: `/admin/login`
- Verificación mediante **Firebase Custom Claims**
- Roles: `super_admin` | `admin` | `moderator`

### 7.2 Funcionalidades

| Función | Descripción |
|---------|-------------|
| Ver usuarios | Lista completa con filtros |
| Ver proveedores | Lista con estados y categorías |
| Editar perfiles | Modificar datos de usuarios/proveedores |
| Desactivar cuentas | Cambiar estado a `closed` |
| Aprobar proveedores | Cambiar de `pending` a `active` |
| Ver leads | Lista completa de matches generados |
| Asignar leads | Vincular usuarios a proveedores manualmente |
| Gestionar leads | Ajustar cantidad de leads por proveedor |

### 7.3 Estadísticas del Dashboard Admin

- Total de usuarios
- Total de proveedores
- Proveedores pendientes/activos/cerrados
- Total de leads
- Leads aprobados/rechazados/pendientes

---

## 8. Arquitectura Técnica

### 8.1 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16 (App Router) |
| Estilos | CSS Modules |
| Estado Global | Zustand |
| Autenticación | Firebase Auth |
| Base de Datos | Cloud Firestore |
| Storage | Firebase Storage |
| Backend Admin | Firebase Admin SDK |
| Hosting | Vercel (recomendado) |

### 8.2 Estructura de Carpetas

```
src/
├── app/
│   ├── admin/           # Dashboard admin
│   │   ├── login/       # Login admin
│   │   └── page.tsx     # Dashboard principal
│   ├── api/
│   │   └── admin/       # API routes admin
│   ├── dashboard/       # Dashboard usuarios
│   │   └── provider/    # Dashboard proveedores
│   ├── login/           # Login general
│   ├── register/
│   │   ├── user/        # Wizard usuarios
│   │   └── provider/    # Wizard proveedores
│   └── ...
├── components/
│   ├── landing/         # Componentes landing
│   ├── wizard/          # Componentes wizard
│   └── providers/       # Context providers
├── lib/
│   └── firebase/
│       ├── config.ts    # Config cliente
│       ├── auth.ts      # Funciones auth
│       ├── firestore.ts # Funciones Firestore
│       ├── admin-config.ts    # Config admin SDK
│       └── admin-firestore.ts # Funciones admin
└── store/
    ├── authStore.ts     # Estado autenticación
    ├── wizardStore.ts   # Estado wizard
    └── adminStore.ts    # Estado admin
```

---

## 9. Modelo de Datos

### 9.1 Colecciones Firestore

#### `users` (Novios)
```typescript
{
  id: string;
  email: string;
  coupleNames: string;
  phone: string;
  eventDate: string;
  isDateTentative: boolean;
  budget: string;
  guestCount: string;
  region: string;
  ceremonyTypes: string[];
  eventStyle: string;
  planningProgress: string;
  completedItems: string[];
  priorityCategories: string[];
  involvementLevel: string;
  expectations: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `providers`
```typescript
{
  id: string;
  email: string;
  providerName: string;
  phone: string;
  categories: string[];
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  description: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  portfolioImages: string[];
  status: 'pending' | 'active' | 'closed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `leads`
```typescript
{
  id: string;
  userId: string;
  providerId: string;
  category: string;
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  userInfo: {
    coupleNames: string;
    eventDate: string;
    budget: string;
    region: string;
    email: string;
    phone: string;
  };
  providerInfo: {
    providerName: string;
    categories: string[];
    priceRange: string;
  };
  assignedByAdmin?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `admins`
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 10. Seguridad

### 10.1 Firebase Security Rules

Las reglas de Firestore implementan:

- **Usuarios**: Solo pueden leer/escribir su propio perfil
- **Proveedores**: Lectura pública, escritura solo propietario o admin
- **Leads**: Acceso para usuario, proveedor involucrado, o admin
- **Admins**: Solo super_admin puede gestionar

### 10.2 Custom Claims

Los administradores se identifican mediante Firebase Custom Claims:

```typescript
{
  admin: true,        // Usuario es admin
  super_admin: true   // Usuario es super admin
}
```

### 10.3 Permisos por Rol

| Permiso | Super Admin | Admin | Moderator |
|---------|:-----------:|:-----:|:---------:|
| users:read | ✓ | ✓ | ✓ |
| users:write | ✓ | ✓ | ✗ |
| users:delete | ✓ | ✗ | ✗ |
| providers:read | ✓ | ✓ | ✓ |
| providers:write | ✓ | ✓ | ✗ |
| providers:approve | ✓ | ✓ | ✓ |
| providers:delete | ✓ | ✗ | ✗ |
| leads:read | ✓ | ✓ | ✓ |
| leads:write | ✓ | ✓ | ✗ |
| leads:assign | ✓ | ✓ | ✗ |
| leads:delete | ✓ | ✗ | ✗ |
| admins:manage | ✓ | ✗ | ✗ |
| stats:read | ✓ | ✓ | ✓ |

---

## Variables de Entorno Requeridas

```env
# Firebase Client (públicas)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side) - Service Account en Base64
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=
```

### Cómo obtener FIREBASE_SERVICE_ACCOUNT_KEY_BASE64

1. Ve a **Firebase Console** → Project Settings → Service Accounts
2. Click en **"Generate new private key"**
3. Descarga el archivo JSON
4. Convierte a base64:
   - **Mac/Linux:** `base64 -i service-account.json`
   - **Windows (PowerShell):** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))`
5. Pega el resultado en la variable de entorno

### Cómo crear un Admin

1. Crea un usuario normal en Firebase Auth (puede ser desde la app o Firebase Console)
2. Ejecuta el script desde la raíz del proyecto:

```bash
# Super Admin (todos los permisos)
node scripts/create-admin.mjs admin@matri.ai --super

# Admin normal
node scripts/create-admin.mjs moderador@matri.ai
```

3. El usuario debe cerrar sesión y volver a entrar
4. Ahora puede acceder a `/admin/login`

> **Requisito:** Necesitas `service-account.json` en la raíz o la variable `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`

---

## Próximos Pasos (Post-MVP)

1. **Integración con IA** para matchmaking más preciso
2. **Calendario de disponibilidad** para proveedores
3. **Sistema de mensajería** entre usuarios y proveedores
4. **Notificaciones push** y emails automáticos
5. **Panel de analytics** avanzado
6. **Pasarela de pagos** para suscripciones de proveedores
7. **App móvil** (React Native / Flutter)

---

*Documento actualizado: Diciembre 2025*
*Versión: MVP 1.0*

