# Sistema de Licencias - Local First

## Principio Fundamental

**Yoyaku funciona 100% offline**. El sistema de licencias está diseñado para:

- ✅ No requerir conexión a internet
- ✅ Validar licencias localmente
- ✅ Funcionar en cualquier momento
- ✅ No depender de servidores externos

## Cómo Funciona

### 1. Generación de Licencias (Offline)

Las licencias se generan usando un algoritmo criptográfico local:

```
YOY + AÑO + HASH(SecretKey + Año + Version)
```

Ejemplo: `YOY2025-9AE6-67EA`

- **YOY**: Prefijo identificador
- **2025**: Año de la licencia
- **9AE6-67EA**: Hash SHA-256 truncado (únicos por año)

### 2. Validación (Offline)

Cuando el usuario ingresa una licencia:

1. Se extrae el año del formato `YOY2025-XXXX-XXXX`
2. Se recalcula el hash esperado usando el mismo algoritmo
3. Se compara con la clave ingresada
4. Si coinciden → Licencia válida ✅

**No hay llamadas a servidores externos.**

### 3. Almacenamiento Local

La licencia se guarda en:
- **Base de datos SQLite local** (no en la nube)
- **Archivo local en el sistema de archivos del usuario**

Ubicación: `~/.yoyaku/yoyaku.db`

### 4. Verificación de Estado

Cada vez que inicia la app:
1. Lee la licencia de la base de datos local
2. Compara fechas localmente
3. Calcula días restantes localmente
4. Muestra el estado sin conexión

## Modelo de Licenciamiento

### Características

- **Perpetuo**: Pago único, uso ilimitado
- **Actualizaciones**: 1 año incluido
- **Offline**: Funciona sin internet
- **Sin DRM**: No hay verificaciones remotas

### Estados de Licencia

| Estado | Descripción | Funcionamiento |
|--------|-------------|----------------|
| ✅ Activa | Vigente con actualizaciones | 100% funcional |
| ⚠️ Por expirar | < 30 días para expirar | 100% funcional + advertencia |
| ℹ️ Expirada | Período de actualizaciones finalizado | 100% funcional, sin updates |
| ❌ No configurada | Sin licencia | Requiere activación |

### Qué pasa cuando expira?

**El software sigue funcionando exactamente igual.**

- ✅ Todos los turnos se guardan
- ✅ Todos los pacientes se mantienen
- ✅ Todas las funciones disponibles
- ⚠️ Solo no recibe actualizaciones nuevas

## Seguridad

### Protección de Licencias

1. **Hash criptográfico**: SHA-256 con secret key
2. **Validación local**: No se puede "hackear" sin la secret key
3. **Sin conexión**: No hay endpoints para explotar
4. **Almacenamiento seguro**: Base de datos local encriptada

### Generar Licencias (Solo Nosotros)

```bash
go run cmd/license-generator/main.go -year=2025
```

Output: `YOY2025-9AE6-67EA`

Esta clave solo la podemos generar nosotros con la secret key.

## Flujo de Usuario

### Primera vez (Sin licencia)

1. Usuario abre la app
2. Aparece modal de activación
3. Ingresa clave de licencia
4. Validación local instantánea
5. Licencia guardada localmente
6. App lista para usar

### Uso diario (Con licencia)

1. Usuario abre la app
2. Verificación local de licencia (< 1ms)
3. Muestra estado en configuración
4. App funciona normalmente

### Sin internet

1. Todo funciona igual
2. Validación local continúa
3. Datos se guardan localmente
4. Sin diferencias para el usuario

## Ventajas del Modelo Offline

### Para el Usuario
- ✅ Funciona en cualquier lugar
- ✅ Sin preocupaciones de conectividad
- ✅ Sin latencia
- ✅ Privacidad total (datos nunca salen)
- ✅ Sin dependencias externas

### Para Nosotros
- ✅ Sin costos de servidor
- ✅ Sin mantenimiento de backend
- ✅ Sin preocupaciones de uptime
- ✅ Sin vulnerabilidades de red
- ✅ Escalabilidad infinita

## Preguntas Frecuentes

### ¿Qué pasa si el usuario pierde su licencia?

La licencia está guardada localmente en su computadora. Si reinstala:
- Debe re-ingresar la clave (la tenemos en nuestros registros)
- O puede hacer backup del archivo `~/.yoyaku/yoyaku.db`

### ¿Pueden usar la misma licencia en múltiples computadoras?

Técnicamente sí, pero el modelo de negocio es por instalación. Podemos:
- Rastrear activaciones si lo necesitamos (opcional)
- Ofrecer licencias multi-dispositivo con descuento
- Confiar en el cliente (modelo honesto)

### ¿Es seguro? ¿No pueden piratearlo?

- Sin sistema es 100% pirata-proof
- Pero al ser offline, es más difícil de crackear
- La secret key nunca se distribuye
- El esfuerzo para crackear > costo de licencia

### ¿Y si cambian de computadora?

1. Desinstalan en la vieja (opcional)
2. Instalan en la nueva
3. Ingresan la misma clave de licencia
4. Funciona inmediatamente

La licencia no está atada al hardware.

## Resumen

```
┌─────────────────────────────────────┐
│        SISTEMA OFFLINE-FIRST        │
├─────────────────────────────────────┤
│                                     │
│  1. Validación local (SHA-256)     │
│  2. Almacenamiento SQLite local    │
│  3. Sin servidores externos        │
│  4. Funciona sin internet          │
│  5. Perpetuo + 1 año updates       │
│                                     │
│  Seguridad: ★★★★★                  │
│  UX: ★★★★★                         │
│  Costos: $0 (sin servidores)       │
│                                     │
└─────────────────────────────────────┘
```