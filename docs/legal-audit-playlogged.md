# Auditoría Legal — Playlogged

**Fecha:** 2026-07-12  
**App:** Playlogged v1.5.1  
**Desarrollador:** Neryad (neryadg@gmail.com)  
**Plataformas:** iOS (com.neryad.playlogged), Android (com.neryad.playlogged)  
**Sitio web:** https://playlogged.neryad.dev/

---

## Resumen Ejecutivo

| Punto                           | Estado                     | Urgencia    |
| ------------------------------- | -------------------------- | ----------- |
| 1. Claims de IA                 | ✅ No aplica               | Baja        |
| 2. Cláusula de arbitraje        | ❌ No existe               | **ALTA**    |
| 3. Privacidad y etiquetas       | ⚠️ Política desactualizada | **CRÍTICA** |
| 4. DMCA                         | ❌ No implementado         | **ALTA**    |
| Placeholders `[DEVELOPER NAME]` | ❌ 3 ocurrencias           | Media       |

---

## 1. Claims de IA — ✅ No hay riesgo

**Hallazgo:** La app no hace ninguna afirmación sobre IA, machine learning, redes neuronales, precisión, predicción, ni nada similar. Cero menciones en README, onboarding, AboutModal, CHANGELOG, ni documentación.

**Acción:** Ninguna.

---

## 2. Cláusula de Arbitraje — ❌ NO EXISTE

**Hallazgo:** Los Términos de Servicio (`TERMS_OF_SERVICE.md`, 100 líneas) no contienen una cláusula de arbitraje individual ni renuncia a demandas colectivas. Esto expone a la aplicación a litigios colectivos en EE.UU.

**Archivo a modificar:** `TERMS_OF_SERVICE.md`

**Agregar** después de la sección 7 (Limitation of Liability) y antes de la sección 8 (Changes to Terms):

```markdown
---

## 8. Dispute Resolution — Binding Arbitration

### 8.1 Informal Resolution First

Before initiating any formal dispute, you agree to first contact us at neryadg@gmail.com to attempt an informal resolution. Both parties will negotiate in good faith for at least 30 days before pursuing arbitration.

### 8.2 Binding Arbitration

If the dispute cannot be resolved informally, **you and Playlogged agree to resolve any claims through binding individual arbitration**, not in court. This includes all claims arising out of or relating to these Terms, the app, or your use of it.

The arbitration will be administered by the **American Arbitration Association (AAA)** under its Consumer Arbitration Rules. The arbitrator's decision is final and binding.

### 8.3 Class Action Waiver

**You and Playlogged agree that each party may bring disputes only on an individual basis. Neither party may bring a class, consolidated, or representative action. The arbitrator may not consolidate claims or preside over any class proceeding.**

If this class action waiver is found unenforceable, this entire arbitration clause is null and void.

### 8.4 Location and Costs

Arbitration will take place in the county of your residence, or remotely via video conference. We will pay all AAA filing fees for claims under $10,000.

### 8.5 Opt-Out

You may opt out of this arbitration clause by emailing neryadg@gmail.com within 30 days of first using the app. Include your name and a statement that you opt out of the arbitration clause. Opting out does not affect the rest of these Terms.

---

## 9. Governing Law

These Terms shall be governed by the laws of **Spain**, without regard to its conflict of law principles. This does not affect your statutory rights as a consumer in your country of residence.
```

### Renumerar secciones existentes

Las secciones 8 (Changes to Terms) y 9 (Contact) pasan a ser 10 y 11.

---

## 3. Privacidad y Etiquetas — ⚠️ RIESGO CRÍTICO

### 3.1 La Privacy Policy es materialmente incorrecta

La `PRIVACY_POLICY.md` actual describe la app como **offline-first sin envío de datos al servidor** (escrita para v1.0), pero la app a partir de v1.1 (junio 2025) implementó:

- Sincronización opcional a Supabase Cloud (auth, game_entries, profiles)
- Perfiles públicos con username, display_name y avatar_url
- Reviews públicas visibles para cualquier usuario (anon)
- Ranking comunitario agregado

**Líneas problemáticas en PRIVACY_POLICY.md:**

| Línea | Texto actual                                                                           | Problema                                                                                     |
| ----- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 19    | "no analytics, no crash reporters, no advertising SDKs, and no tracking of any kind"   | ✅ Cierto, pero incompleto                                                                   |
| 27-28 | "This data never leaves your device. It is not synced to any server or cloud service." | ❌ **FALSO** desde v1.1. Los datos SÍ se sincronizan a Supabase si el usuario inicia sesión. |

### 3.2 Inventario real de datos recolectados

| Dato                 | ¿Se recolecta? | ¿Dónde?                          | ¿Visible públicamente?          |
| -------------------- | -------------- | -------------------------------- | ------------------------------- |
| Email                | **SÍ**         | Supabase Auth                    | No                              |
| Username             | **SÍ**         | `profiles.username`              | **Sí** (en reviews públicas)    |
| Display name         | **SÍ**         | `profiles.display_name`          | **Sí** (en reviews públicas)    |
| Avatar URL           | **SÍ**         | `profiles.avatar_url` (DiceBear) | **Sí**                          |
| Notas de juegos      | **SÍ**         | `game_entries.notes`             | Si `is_public = true`           |
| Ratings              | **SÍ**         | `game_entries.personal_rating`   | Agregado + si es review pública |
| Horas jugadas        | **SÍ**         | `game_entries.hours_played`      | No                              |
| Títulos de juegos    | **SÍ**         | `game_entries.title`             | Agregados en ranking            |
| Conexiones de amigos | **SÍ**         | `friends`, `friend_requests`     | No expuesto aún                 |

### 3.3 Archivo a modificar: `PRIVACY_POLICY.md`

Se debe reescribir para reflejar la realidad actual. Texto propuesto para la sección 2 y 3 (reemplazar completamente):

```markdown
## 2. Information We Collect

Playlogged is designed to work **entirely offline** by default. You are not required to create an account to use the app.

### 2.1 If You Use the App Without an Account (Offline Mode)

All data you create — your game library, statuses, ratings, notes, and hours played — is stored **only on your device** using a local SQLite database. No data ever leaves your device. If you delete the app, all data is permanently removed.

### 2.2 If You Create an Account (Cloud Sync)

When you create an account via Supabase Auth (email/password), the following additional data is collected and stored on our cloud infrastructure (Supabase, hosted in the US/EU region):

- **Email address** (stored in Supabase Auth; used only for authentication)
- **Username and display name** (stored in the `profiles` table; visible publicly if you write reviews)
- **Your game library** (titles, statuses, ratings, notes, hours played) — synced to the cloud to enable cross-device backup and community features
- **Avatar** — auto-generated pixel-art avatar based on your username (DiceBear)

### 2.3 Public Reviews

If you choose to mark a game entry as public, your **username, rating, and written notes** will be visible to anyone browsing the app's community features. You can control this per-entry via the toggle in the game detail screen.

### 2.4 What We Do NOT Collect

We do **not** collect:

- Real names (beyond display name)
- Phone numbers
- Location data
- Contacts or address book
- Device identifiers (IDFA, AAID)
- Usage analytics
- Crash reports
- Advertising identifiers
- Browsing history
- Payment information (donations go through Ko-fi/PayPal directly)
```

Y la sección 3 actual (Data Stored Locally) debe actualizarse:

```markdown
## 3. Data Storage and Security

Your local SQLite database remains your primary data store. Cloud sync is optional and opt-in. Even if you have an account, your data continues to work fully offline.

Cloud data is transmitted over HTTPS and stored in Supabase with Row-Level Security (RLS) enabled. You can delete your account and all associated data at any time via the app's settings (About → Data → Delete Account).
```

### 3.4 CCPA — "Do Not Sell or Share"

**Matiz importante (del artículo de referencia):** La CCPA aplica solo a negocios que cumplan **al menos uno** de estos umbrales:

- Ingresos anuales > ~$25M
- Datos de 100,000+ consumidores u hogares
- 50%+ de ingresos provienen de vender datos personales

Playlogged como app indie **probablemente no cae bajo CCPA aún**. Sin embargo:

- Las **etiquetas de Apple/Google** aplican desde el día 1 sin importar el tamaño del negocio.
- Es buena práctica agregar el aviso igual, por si la app escala.

**Hallazgo:** La app no vende ni comparte datos personales a terceros (no hay anuncios, no hay brokers de datos).

**Recomendación:** Agregar al final de la Privacy Policy una sección de California Privacy Rights como medida preventiva:

```markdown
## 8. California Privacy Rights (CCPA)

If you are a resident of California, you have the right to:

- **Know** what personal information we collect about you
- **Request deletion** of your personal information
- **Opt out** of the sale or sharing of your personal information

**Playlogged does not sell or share your personal information.** We do not transfer data to third parties for monetary or other valuable consideration. To exercise your rights, contact us at neryadg@gmail.com.

We will not discriminate against you for exercising your CCPA rights.
```

### 3.5 App Store / Google Play Privacy Labels

**Hallazgo:** No hay evidencia de que se hayan configurado las etiquetas de privacidad en App Store Connect ("App Privacy") ni en Google Play Console ("Data Safety").

**Lo que DEBES declarar en ambas plataformas:**

| Tipo de dato                           | ¿Recolectado? | Propósito               |
| -------------------------------------- | ------------- | ----------------------- |
| Email                                  | Sí            | Auth                    |
| Nombre de usuario (username)           | Sí            | Perfil público, reviews |
| ID de usuario                          | Sí (UUID)     | Sync, autenticación     |
| Contenido del usuario (notas, ratings) | Sí            | Funcionalidad core      |
| ID de compras                          | No            | —                       |
| Ubicación                              | No            | —                       |
| Historial de navegación                | No            | —                       |
| Identificadores del dispositivo        | No            | —                       |
| Analytics                              | No            | —                       |
| Datos de salud/financieros             | No            | —                       |

Debes completar el formulario en:

- **App Store Connect:** App → App Privacy → Data Collection
- **Google Play Console:** App → Store Presence → Data Safety

---

## 4. DMCA — ❌ NO IMPLEMENTADO

### 4.1 ¿La app permite subir contenido de usuarios?

**Sí.** A través de las reviews públicas (`community_reviews` view). Los usuarios pueden escribir notas y hacerlas públicas, visibles para cualquier usuario de la app. Esto constituye "user-generated content" (UGC) a efectos de DMCA.

### 4.2 Nota sobre Mass Arbitration

Aunque la cláusula de arbitraje protege contra class actions, existe una contra-medida conocida como **mass arbitration**: demandantes coordinan miles de arbitrajes individuales simultáneos, forzando al demandado a pagar miles de tarifas de presentación. No invalida la cláusula, pero es un riesgo a conocer.

### 4.3 Checklist DMCA

| Requisito                                                       | Estado                           |
| --------------------------------------------------------------- | -------------------------------- |
| Registrar agente DMCA en copyright.gov                          | ❌ No registrado                 |
| Renovar registro cada 3 años                                    | ❌ No aplica (nunca se registró) |
| Incluir política de takedown en ToS                             | ❌ No existe                     |
| Publicar datos de contacto del agente                           | ❌ No existen                    |
| Política de "repeat infringers" (requisito del safe harbor 512) | ❌ No existe                     |

### 4.3 Acciones requeridas

#### a) Registrar agente DMCA en copyright.gov

- Ir a: https://www.copyright.gov/dmca-directory/
- Completar el formulario (cuesta ~$6 USD, válido 3 años)
- Datos típicos: nombre del desarrollador, email, dirección postal

#### b) Agregar sección DMCA a `TERMS_OF_SERVICE.md`

Insertar después de la sección de arbitraje propuesta:

```markdown
## 7. DMCA Notice and Takedown Policy

Playlogged respects the intellectual property rights of others. If you believe that any content available through the app infringes your copyright, please notify our designated DMCA Agent.

### DMCA Agent Contact Information

**[Name of DMCA Agent / Developer]**
**Email:** dmca@playlogged.app _(recommended — create this alias)_
**Address:** [Tu dirección postal o apartado de correos]

### Notice Requirements

Your DMCA notice must include:

1. Identification of the copyrighted work claimed to be infringed
2. Identification of the infringing material and its location in the app
3. Your name, address, telephone number, and email address
4. A statement that you have a good faith belief that the use is not authorized
5. A statement, under penalty of perjury, that the information is accurate and that you are the copyright owner or authorized to act on their behalf
6. Your physical or electronic signature

### Counter-Notice

If you believe your content was removed in error, you may submit a counter-notice with:

1. Your name, address, and telephone number
2. Identification of the material removed and its location before removal
3. A statement under penalty of perjury that the material was removed by mistake
4. Your consent to the jurisdiction of the federal court in your district
5. Your physical or electronic signature

We will respond to all valid DMCA notices within 5 business days.
```

#### c) Agregar política de "repeat infringers"

El safe harbor de la DMCA (Sección 512) **requiere** que implementes una política de terminación para infractores reincidentes. Debes agregar esto a la política de takedown:

```markdown
We reserve the right to terminate the accounts of users who are repeat infringers of copyright.
```

#### d) Agregar `is_flagged` como mecanismo de moderación

Actualmente la app permite marcar entries como `is_public`. Considera agregar también un flag `is_flagged` en la tabla de Supabase para poder desactivar contenido DMCA'd sin borrar datos del usuario.

---

## 5. Placeholders `[DEVELOPER NAME]` — ⚠️ 3 ocurrencias

### Archivos a modificar

**TERMS_OF_SERVICE.md:**

| Línea | Texto actual                                | Debería ser                           |
| ----- | ------------------------------------------- | ------------------------------------- |
| 42    | "intellectual property of [DEVELOPER NAME]" | "intellectual property of **Neryad**" |
| 58    | "[DEVELOPER NAME] has no control over"      | "**Neryad** has no control over"      |
| 66    | "[DEVELOPER NAME] does not warrant"         | "**Neryad** does not warrant"         |
| 78    | "[DEVELOPER NAME] shall not be liable"      | "**Neryad** shall not be liable"      |

**PRIVACY_POLICY.md:**

| Línea | Texto actual                | Debería ser           |
| ----- | --------------------------- | --------------------- |
| 11    | "built by [DEVELOPER NAME]" | "built by **Neryad**" |

---

## 6. Hallazgos Adicionales

### 6.1 Sin jurisdicción definida en ToS

Los ToS actuales no especifican qué leyes aplican. El desarrollador está en España. Se recomienda **ley española** como governing law (ya incluido en la sección de arbitraje propuesta arriba).

### 6.2 GDPR Compliance (usuario en España / UE)

| Requisito                | Estado                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Derecho de acceso        | ⚠️ Parcial (el usuario ve su email, username, entries, pero no export estructurado)                                                                          |
| Derecho de supresión     | ✅ Edge Function `delete-account` implementada                                                                                                               |
| Derecho de portabilidad  | ❌ **No implementado.** No hay función de exportar datos                                                                                                     |
| Consentimiento explícito | ⚠️ No hay pantalla de consentimiento para la sincronización a la nube. El usuario crea cuenta pero no se le informa explícitamente qué datos se sincronizan. |
| DPO / contacto           | ✅ Email disponible                                                                                                                                          |

### 6.3 Base legal para tratamiento de datos (GDPR Art. 6)

Actualmente no se declara la base legal en la Privacy Policy. Para usuarios de la UE, se debe agregar:

- **Ejecución de un contrato** (Art. 6(1)(b)) — para el funcionamiento del servicio de sincronización
- **Consentimiento** (Art. 6(1)(a)) — para reviews públicas

---

## Plan de Acción Priorizado

### 🔴 DÍAS 1-7 (Crítico)

| #   | Acción                                                                            | Archivo                                     |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Reescribir Privacy Policy para reflejar Supabase sync y datos reales recolectados | `PRIVACY_POLICY.md`                         |
| 2   | Reemplazar `[DEVELOPER NAME]` por "Neryad" en ambos documentos legales            | `TERMS_OF_SERVICE.md` y `PRIVACY_POLICY.md` |
| 3   | Agregar cláusula de arbitraje + class action waiver + governing law a ToS         | `TERMS_OF_SERVICE.md`                       |
| 4   | Completar formulario App Privacy en App Store Connect                             | App Store Connect                           |
| 5   | Completar formulario Data Safety en Google Play Console                           | Google Play Console                         |

### 🟡 DÍAS 8-14 (Alta)

| #   | Acción                                                                     | Archivo / Plataforma  |
| --- | -------------------------------------------------------------------------- | --------------------- |
| 6   | Registrar DMCA Agent en copyright.gov                                      | copyright.gov (~$6)   |
| 7   | Agregar sección DMCA + datos de contacto del agente a ToS                  | `TERMS_OF_SERVICE.md` |
| 8   | Agregar sección CCPA a Privacy Policy                                      | `PRIVACY_POLICY.md`   |
| 9   | Agregar sección GDPR (base legal, derechos, portabilidad) a Privacy Policy | `PRIVACY_POLICY.md`   |

### 🟢 DÍAS 15-21 (Media)

| #   | Acción                                                                                      | Archivo / Plataforma                                         |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 10  | Implementar pantalla de consentimiento informado al crear cuenta (qué datos se sincronizan) | `app/auth/` (nueva pantalla o modificación del flujo actual) |
| 11  | Implementar exportación de datos (JSON) para portabilidad GDPR                              | `src/lib/backup.ts` o nueva función                          |
| 12  | Agregar mecanismo de moderación DMCA (flag `is_flagged` en Supabase)                        | Base de datos Supabase + migración                           |
| 13  | Crear alias dmca@playlogged.app o designar email para DMCA                                  | Configuración de email                                       |
| 14  | Actualizar "Last updated" en ambos documentos legales                                       | `TERMS_OF_SERVICE.md` y `PRIVACY_POLICY.md`                  |

---

## Resumen de Archivos a Modificar

| Archivo                       | Cambios necesarios                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `TERMS_OF_SERVICE.md`         | Agregar arbitraje + class action waiver + governing law + DMCA; reemplazar `[DEVELOPER NAME]` → Neryad; renumerar secciones |
| `PRIVACY_POLICY.md`           | Reescribir completa para reflejar cloud sync; agregar CCPA + GDPR; reemplazar `[DEVELOPER NAME]` → Neryad                   |
| App Store Connect             | Completar formulario App Privacy                                                                                            |
| Google Play Console           | Completar formulario Data Safety                                                                                            |
| copyright.gov                 | Registrar DMCA Agent                                                                                                        |
| Flujo de registro (app/auth/) | Agregar pantalla de consentimiento informado                                                                                |
| `src/lib/backup.ts` o nueva   | Implementar exportación JSON de datos del usuario                                                                           |

---

_Documento generado con base en el análisis del código fuente y la documentación existente. No constituye asesoría legal. Se recomienda revisión por un abogado especializado antes de implementar los cambios._
