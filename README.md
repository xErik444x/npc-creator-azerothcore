# NPC Creator — AzerothCore

Aplicación web para armar **SQL listo para importar** en servidores [AzerothCore](https://www.azerothcore.org/): vendedores con inventario, duplicado de NPCs existentes y plantillas de criaturas. Todo corre en el navegador; los borradores se pueden guardar en **almacenamiento local** para retomarlos después.

## Qué hace

- **Vendor**: definís entry, nombre, apariencia, flags, facción, stats y lista de items (ID, stock, tiempo de reaparición, costo extendido, slot).
- **Duplicate**: copiás un `creature_template` desde un entry de origen a uno nuevo, con nombre opcional.
- **NPC**: generás inserts para `creature_template` y tablas relacionadas según el formulario (expansión, rango, tipo, clases, flags, etc.).
- **Salida SQL** copiable y pestaña de **comandos in-game** de referencia.
- **Vendedores guardados** en `localStorage` (solo en tu máquina, no se sube a ningún servidor).

Revisá siempre el SQL antes de ejecutarlo en producción. Los valores por defecto son puntos de partida, no reglas del core.

## Stack

- React 19, TypeScript, Vite 6
- Tailwind CSS 4, Radix UI, react-hook-form + Zod
- Wouter (routing mínimo), TanStack Query, Framer Motion

## Requisitos

- [Node.js](https://nodejs.org/) 20 LTS o superior
- [pnpm](https://pnpm.io/) 9+ (recomendado 11; el repo incluye `pnpm-workspace.yaml` con permisos de build para `esbuild`)

## Uso local

```bash
pnpm install
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) (o el puerto que muestre la consola).

Otros comandos:

| Comando        | Descripción                          |
|----------------|--------------------------------------|
| `pnpm build`   | Build de producción en `dist/public` |
| `pnpm serve`   | Vista previa del build (Vite)        |
| `pnpm typecheck` | `tsc` sin emitir archivos          |

### Variables de entorno (opcional)

| Variable    | Efecto                                      | Default |
|-------------|---------------------------------------------|---------|
| `PORT`      | Puerto del dev server y de `vite preview`   | `3000`  |
| `BASE_PATH` | Base URL si servís la app bajo un subpath   | `/`     |

En PowerShell, por ejemplo: `$env:PORT=5173; pnpm dev`.

## Despliegue

El artefacto es estático: subí el contenido de `dist/public` a cualquier hosting de archivos estáticos (GitHub Pages, Cloudflare Pages, nginx, etc.). Ajustá `BASE_PATH` en el build si la app no vive en la raíz del dominio.

## Licencia

El repositorio no define licencia en el manifiesto del proyecto. Si querés distribuirlo o bifurcarlo, conviene agregar un archivo `LICENSE` explícito.
