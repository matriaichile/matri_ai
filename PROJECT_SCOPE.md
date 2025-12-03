# Matri.AI - Documento de Alcance del Proyecto (MVP)

## Índice

1. [Introducción](#1-introducción)
2. [Landing Page](#2-landing-page)
3. [Flujos de Registro (Wizard)](#3-flujos-de-registro-wizard)
4. [Sistema de Matchmaking por Categoría](#4-sistema-de-matchmaking-por-categoría)
5. [Dashboards](#5-dashboards)
6. [Mini Cuestionarios por Categoría](#6-mini-cuestionarios-por-categoría)
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
- **Generación de matches POR CATEGORÍA** basados en criterios específicos de cada servicio
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

Este wizard recopila información **GENERAL** del evento. **NO genera matchmaking inmediatamente**.

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
| 8 | Categorías prioritarias | Multi-select | Lista de 8 categorías |
| 9 | Nivel de vinculación | Select | 100%, 80%, 60%, 40%, 20%, 0% |
| 10 | Expectativas | Textarea | Texto libre para IA |

**Al finalizar:** 
- Se crea el perfil del usuario
- Se genera el User Dashboard con las 8 categorías disponibles
- **NO se genera matchmaking todavía** - el usuario debe completar las mini-encuestas por categoría

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
- **El proveedor debe completar encuestas detalladas POR CADA CATEGORÍA que ofrece**
- El administrador debe aprobar o rechazar la cuenta

---

## 4. Sistema de Matchmaking por Categoría

### 4.1 Concepto Fundamental ⚠️ IMPORTANTE

El matchmaking **NO es global** después del wizard inicial. El sistema funciona así:

1. **Usuario completa wizard inicial** → Se crea perfil con información general
2. **Usuario ve dashboard** → Aparecen las 8 categorías disponibles
3. **Usuario selecciona categoría** → Completa mini-encuesta específica de esa categoría
4. **Al terminar mini-encuesta** → Se genera matchmaking SOLO para esa categoría
5. **Se muestran 3 proveedores** → Los mejores matches para esa categoría específica

### 4.2 Las 8 Categorías del Sistema

| ID | Categoría | Descripción |
|----|-----------|-------------|
| `photography` | Fotografía | Servicio de fotografía para el evento |
| `video` | Videografía | Grabación y edición de video |
| `dj` | DJ/VJ | Música, iluminación y animación |
| `catering` | Banquetería | Servicio de comida y bebidas |
| `venue` | Centro de Eventos | Lugar para la celebración |
| `decoration` | Decoración | Decoración floral y ambientación |
| `wedding_planner` | Wedding Planner | Coordinación y planificación |
| `makeup` | Maquillaje & Peinado | Servicios de belleza |

### 4.3 Flujo de Matchmaking por Categoría

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO COMPLETA WIZARD                       │
│                    (Información general)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD USUARIO                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 📷      │ │ 🎬      │ │ 🎵      │ │ 🍽️      │               │
│  │ Foto    │ │ Video   │ │ DJ/VJ   │ │ Banquet │               │
│  │ Cotizar │ │ Cotizar │ │ Cotizar │ │ Cotizar │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 🏛️      │ │ 💐      │ │ 📋      │ │ 💄      │               │
│  │ Venue   │ │ Decor   │ │ Planner │ │ Makeup  │               │
│  │ Cotizar │ │ Cotizar │ │ Cotizar │ │ Cotizar │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Usuario selecciona "Fotografía"
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              MINI-ENCUESTA DE FOTOGRAFÍA                         │
│  • ¿Qué estilo fotográfico prefieres?                           │
│  • ¿Cuántas horas de cobertura?                                 │
│  • ¿Necesitas sesión pre-boda?                                  │
│  • ¿Formato de entrega preferido?                               │
│  • ... (10-15 preguntas específicas)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Usuario completa encuesta
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              MATCHMAKING DE FOTOGRAFÍA                           │
│  Se generan 3 matches con fotógrafos:                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🥇 Fotógrafo A - 95% match                              │   │
│  │ 🥈 Fotógrafo B - 88% match                              │   │
│  │ 🥉 Fotógrafo C - 82% match                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Estructura de Datos del Matchmaking

Cada categoría tiene su propia colección de respuestas y matches:

```typescript
// Respuestas de encuesta del usuario por categoría
interface UserCategorySurvey {
  id: string;
  userId: string;
  category: string; // 'photography', 'video', etc.
  responses: Record<string, any>; // Respuestas específicas de la categoría
  completedAt: Timestamp;
  matchesGenerated: boolean;
}

// Respuestas de encuesta del proveedor por categoría
interface ProviderCategorySurvey {
  id: string;
  providerId: string;
  category: string;
  responses: Record<string, any>; // Respuestas específicas de la categoría
  completedAt: Timestamp;
}

// Lead/Match generado POR CATEGORÍA
interface CategoryLead {
  id: string;
  userId: string;
  providerId: string;
  category: string; // Categoría específica del match
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  userSurveyId: string; // Referencia a la encuesta del usuario
  providerSurveyId: string; // Referencia a la encuesta del proveedor
  matchCriteria: { // Desglose del score
    styleMatch: number;
    budgetMatch: number;
    locationMatch: number;
    availabilityMatch: number;
    specificCriteriaMatch: number;
  };
  createdAt: Timestamp;
}
```

### 4.5 Límite de Leads por Categoría

Cada proveedor tiene un límite de leads **POR CATEGORÍA**:

| Campo | Descripción |
|-------|-------------|
| `categoryLeadLimits` | Objeto con límite por categoría |
| `categoryLeadsUsed` | Objeto con leads consumidos por categoría |

```typescript
// Ejemplo en documento de proveedor
{
  categories: ['photography', 'video'],
  categoryLeadLimits: {
    photography: 10,
    video: 10
  },
  categoryLeadsUsed: {
    photography: 3,
    video: 1
  }
}
```

---

## 5. Dashboards

### 5.1 Dashboard del Usuario

#### Vista Principal - Categorías

Al entrar al dashboard, el usuario ve las 8 categorías con su estado:

| Estado | Visual | Descripción |
|--------|--------|-------------|
| `not_started` | Gris | No ha completado la encuesta |
| `survey_completed` | Amarillo | Encuesta completada, generando matches |
| `matches_ready` | Verde | Tiene matches disponibles para revisar |
| `all_decided` | Azul | Ya aprobó/rechazó todos los matches |

#### Componentes:
- Grid de 8 categorías con estado visual
- Contador de matches pendientes por categoría
- Acceso a mini-encuesta de cada categoría
- Vista de matches por categoría

#### Acciones sobre matches:
- **Aprobar**: Genera lead confirmado (proveedor puede contactar)
- **Rechazar**: Descarta el match
- **Ver más**: Detalles del proveedor

### 5.2 Dashboard del Proveedor

#### Vista Principal

- Banner de estado (si está pendiente de aprobación)
- **Encuestas pendientes por categoría** (si ofrece múltiples servicios)
- Estadísticas por categoría:
  - Leads totales por categoría
  - Leads aprobados por categoría
  - Tasa de match por categoría

#### Lista de Leads (por categoría)

| Campo | Descripción |
|-------|-------------|
| Nombre del usuario | Pareja que busca el servicio |
| Fecha del evento | Cuándo es la boda |
| Presupuesto | Rango de presupuesto |
| Email y teléfono | Datos de contacto |
| Estado del lead | pending/approved/contacted |
| Match score | Porcentaje de coincidencia |
| **Categoría** | Para qué servicio es el lead |

---

## 6. Mini Cuestionarios por Categoría

> ⚠️ **IMPORTANTE**: Existe un documento separado `CATEGORY_SURVEYS.md` con el detalle completo de todas las preguntas y respuestas para cada categoría, tanto para usuarios como para proveedores.

### 6.1 Principio de Diseño

Las encuestas de usuarios y proveedores **apuntan a los mismos criterios** pero están formuladas de manera diferente:

| Usuario pregunta | Proveedor responde |
|------------------|-------------------|
| "¿Qué estilo prefieres?" (selecciona 1) | "¿Qué estilos ofreces?" (selecciona varios) |
| "¿Cuánto quieres gastar?" (rango) | "¿Cuál es tu rango de precios?" (rango) |
| "¿Qué géneros musicales te gustan?" (varios) | "¿Qué géneros musicales tocas?" (varios) |

### 6.2 Categorías y sus Encuestas

| Categoría | # Preguntas Usuario | # Preguntas Proveedor |
|-----------|--------------------|-----------------------|
| Fotografía | 12 | 15 |
| Videografía | 12 | 15 |
| DJ/VJ | 14 | 18 |
| Banquetería | 15 | 20 |
| Centro de Eventos | 12 | 18 |
| Decoración | 10 | 14 |
| Wedding Planner | 10 | 12 |
| Maquillaje & Peinado | 8 | 12 |

### 6.3 Criterios de Match por Categoría

Cada categoría tiene criterios específicos para calcular el match score:

#### Fotografía
- Estilo fotográfico (30%)
- Presupuesto (25%)
- Horas de cobertura (15%)
- Ubicación (15%)
- Entregables (15%)

#### DJ/VJ
- Géneros musicales (25%)
- Equipamiento (20%)
- Presupuesto (20%)
- Estilo de animación (15%)
- Ubicación (10%)
- Disponibilidad (10%)

*(Ver documento completo en CATEGORY_SURVEYS.md)*

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
| Ver leads **por categoría** | Lista de matches filtrable por categoría |
| Asignar leads | Vincular usuarios a proveedores manualmente |
| Gestionar límites | Ajustar límite de leads por categoría por proveedor |

### 7.3 Estadísticas del Dashboard Admin

- Total de usuarios
- Total de proveedores (por categoría)
- Proveedores pendientes/activos/cerrados
- **Total de leads por categoría**
- **Encuestas completadas por categoría**
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
│   │   ├── category/    # Vista de categoría específica
│   │   │   └── [categoryId]/
│   │   │       ├── survey/    # Mini-encuesta
│   │   │       └── matches/   # Matches de la categoría
│   │   └── provider/    # Dashboard proveedores
│   ├── login/           # Login general
│   ├── register/
│   │   ├── user/        # Wizard usuarios
│   │   └── provider/    # Wizard proveedores
│   └── ...
├── components/
│   ├── landing/         # Componentes landing
│   ├── wizard/          # Componentes wizard
│   ├── surveys/         # Componentes de encuestas por categoría
│   └── providers/       # Context providers
├── lib/
│   └── firebase/
│       ├── config.ts    # Config cliente
│       ├── auth.ts      # Funciones auth
│       ├── firestore.ts # Funciones Firestore
│       ├── surveys.ts   # Funciones de encuestas por categoría
│       ├── matchmaking.ts # Lógica de matchmaking
│       ├── admin-config.ts    # Config admin SDK
│       └── admin-firestore.ts # Funciones admin
└── store/
    ├── authStore.ts     # Estado autenticación
    ├── wizardStore.ts   # Estado wizard
    ├── surveyStore.ts   # Estado encuestas por categoría
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
  // Estado de encuestas por categoría
  categorySurveyStatus: {
    photography: 'not_started' | 'completed' | 'matches_generated';
    video: 'not_started' | 'completed' | 'matches_generated';
    dj: 'not_started' | 'completed' | 'matches_generated';
    catering: 'not_started' | 'completed' | 'matches_generated';
    venue: 'not_started' | 'completed' | 'matches_generated';
    decoration: 'not_started' | 'completed' | 'matches_generated';
    wedding_planner: 'not_started' | 'completed' | 'matches_generated';
    makeup: 'not_started' | 'completed' | 'matches_generated';
  };
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
  categories: string[]; // Categorías que ofrece
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
  // Sistema de leads POR CATEGORÍA
  categoryLeadLimits: {
    [categoryId: string]: number; // Límite por categoría (default: 10)
  };
  categoryLeadsUsed: {
    [categoryId: string]: number; // Leads consumidos por categoría
  };
  // Estado de encuestas por categoría
  categorySurveyStatus: {
    [categoryId: string]: 'not_started' | 'completed';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `userCategorySurveys` (Respuestas de usuarios)
```typescript
{
  id: string;
  userId: string;
  category: string;
  responses: {
    // Respuestas específicas según la categoría
    // Ver CATEGORY_SURVEYS.md para estructura completa
    [questionId: string]: string | string[] | number | boolean;
  };
  completedAt: Timestamp;
  matchesGenerated: boolean;
}
```

#### `providerCategorySurveys` (Respuestas de proveedores)
```typescript
{
  id: string;
  providerId: string;
  category: string;
  responses: {
    // Respuestas específicas según la categoría
    // Ver CATEGORY_SURVEYS.md para estructura completa
    [questionId: string]: string | string[] | number | boolean;
  };
  completedAt: Timestamp;
}
```

#### `leads` (Matches por categoría)
```typescript
{
  id: string;
  userId: string;
  providerId: string;
  category: string; // Categoría específica del match
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  userSurveyId: string; // Referencia a userCategorySurveys
  providerSurveyId: string; // Referencia a providerCategorySurveys
  matchCriteria: {
    styleMatch: number;
    budgetMatch: number;
    locationMatch: number;
    availabilityMatch: number;
    specificCriteriaMatch: number;
  };
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
- **UserCategorySurveys**: Solo el usuario propietario o admin
- **ProviderCategorySurveys**: Lectura pública (para matchmaking), escritura solo propietario
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
| surveys:read | ✓ | ✓ | ✓ |
| surveys:manage | ✓ | ✓ | ✗ |
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

## Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| `CATEGORY_SURVEYS.md` | Detalle completo de todas las preguntas y respuestas por categoría |
| `DEPLOY.md` | Instrucciones de despliegue |
| `README.md` | Guía de inicio rápido |

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
*Versión: MVP 1.1 - Sistema de Matchmaking por Categoría*

