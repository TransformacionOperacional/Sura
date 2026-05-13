# Portal de Cargue Documental - Configuración de Microsoft Entra ID

## ✅ Estado Actual - Migración Completada
La migración del sistema de autenticación de operadores a Microsoft Entra ID (Azure AD) ha sido **completada exitosamente**. El sistema mantiene toda la compatibilidad existente mientras prepara la base para un futuro portal de clientes con verificación OTP por email.

### 🎯 Logros Alcanzados
- ✅ **Autenticación migrada**: Operadores ahora usan Entra ID en lugar de login manual
- ✅ **Rutas protegidas**: Sin cambios en URLs existentes (`/operadores`, `/operaciones/*`)
- ✅ **Build exitoso**: Compilación de producción funciona correctamente
- ✅ **SSR compatible**: Resueltos problemas de server-side rendering con MSAL
- ✅ **Separación de contextos**: Preparado para autenticación dual (operadores + clientes)

## 🔧 Configuración de Azure AD

### 1. Crear App Registration en Azure Portal
1. Ve a [Azure Portal](https://portal.azure.com)
2. Navega a **Azure Active Directory** > **App registrations**
3. Haz clic en **New registration**
4. Configura:
   - **Name**: `Portal Cargue Documental`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `http://localhost:3000/auth/callback` (para desarrollo local)

### 2. Configurar Permisos
1. En tu app registration, ve a **API permissions**
2. Agrega el permiso: **Microsoft Graph** > **User.Read**
3. Otorga consentimiento administrativo si es necesario

### 3. Obtener Credenciales
1. Ve a **Overview** y copia el **Application (client) ID**
2. Ve a **Certificates & secrets** y crea un nuevo **Client secret**
3. Copia el **Client secret value** (solo se muestra una vez)
4. Obtén el **Directory (tenant) ID** desde la página principal de Azure AD

### 4. Configurar Variables de Entorno
Actualiza el archivo `.env.local` con tus valores reales:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=tu-client-id-aqui
NEXT_PUBLIC_AZURE_TENANT_ID=tu-tenant-id-aqui
```

## 🔄 Flujo de Autenticación

### Para Operadores (Entra ID)
1. Usuario accede a `/operadores` → redirección automática a `/auth/login/aad`
2. MSAL inicia flujo de autenticación con Azure AD
3. Después de login exitoso → redirección a `/auth/callback`
4. Callback procesa respuesta y redirige a `/operaciones`
5. Operador accede a dashboard protegido

### Para Clientes (Futuro - OTP por Email)
- Componente `ClientLogin` preparado en `components/client-login.tsx`
- Requiere implementación de API para envío de códigos OTP
- Mantendrá sesión separada de operadores

## 🚀 Desarrollo Local

### Iniciar Servidor
```bash
npm run dev
```

### Probar Autenticación
1. Ve a `http://localhost:3000/operadores`
2. Deberías ser redirigido al login de Azure AD
3. Después de autenticarte, llegarás a `/operaciones`

## 📁 Archivos Importantes

### Configuración
- `lib/msal-config.ts`: Configuración MSAL
- `lib/auth-context.tsx`: Contexto dual (operadores + clientes)
- `lib/routes.ts`: Rutas centralizadas

### Páginas de Auth
- `app/auth/login/a-a-d/page.tsx`: Inicia login Entra ID
- `app/auth/callback/page.tsx`: Procesa respuesta auth
- `app/operadores/page.tsx`: Punto entrada operadores

### Providers
- `components/client-providers.tsx`: MSAL + Auth providers (solo cliente)

## ⚠️ Consideraciones Técnicas

### Server-Side Rendering
- MSAL requiere client-side rendering
- Páginas operaciones: `export const dynamic = 'force-dynamic'`
- Hook `useAuth`: Valores por defecto cuando no hay contexto

### Seguridad
- Sesiones operadores: sessionStorage con timeout 15min
- Logout: `instance.logoutRedirect()` de MSAL
- Sesiones clientes: Preparadas para futuro

## 📋 Próximos Pasos

1. **Configurar Azure AD**: Seguir pasos arriba
2. **Probar desarrollo**: Verificar flujo auth
3. **Portal clientes**: Implementar OTP usando `ClientLogin`
4. **Configurar producción**: Redirect URIs para dominio prod

## 🐛 Troubleshooting

### Errores Comunes
- **"useAuth must be used within an AuthProvider"**: Verificar que `ClientProviders` esté en layout
- **MSAL errors**: Revisar credenciales en `.env.local`
- **Redirect URI mismatch**: Verificar URIs en Azure AD app registration

### Logs Útiles
- Consola navegador: Errores MSAL
- Network tab: Requests a Azure AD
- Terminal: Errores de build/compilación

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_AZURE_CLIENT_ID=tu-client-id-aqui
NEXT_PUBLIC_AZURE_TENANT_ID=tu-tenant-id-aqui
```

### 5. Permisos de API

En la app registration → "API permissions":

- Agrega: `Microsoft Graph` → `User.Read` (Delegated)

## 🚀 Flujo de Autenticación

### Operadores
1. Usuario va a `/operadores`
2. Redirección automática a `/auth/login/aad`
3. Login con Microsoft
4. Callback procesa el token
5. Redirección a `/operaciones`
6. Dashboard carga normalmente

### Clientes (Futuro)
1. Usuario va a portal de clientes
2. Ingresa email
3. Recibe OTP por email
4. Ingresa código de 6 dígitos
5. Acceso al portal de carga

## 📁 Archivos Modificados

### Nuevos
- `lib/msal-config.ts` - Configuración MSAL
- `app/auth/login/a-a-d/page.tsx` - Página de login Entra ID
- `app/auth/callback/page.tsx` - Callback de autenticación
- `components/client-login.tsx` - Componente preparado para OTP
- `.env.example` - Variables de entorno

### Modificados
- `lib/routes.ts` - Agregadas rutas de auth
- `lib/auth-context.tsx` - Soporte para Entra ID + clientes
- `app/layout.tsx` - MsalProvider wrapper
- `app/operadores/page.tsx` - Redirección a Entra ID

## 🧪 Testing

### Desarrollo Local
1. Configura las variables de entorno
2. `npm run dev`
3. Ve a `http://localhost:3000/operadores`
4. Deberías ser redirigido a Microsoft login

### Producción
1. Actualiza redirect URIs con dominio de producción
2. Configura variables de entorno en el hosting

## 🔒 Seguridad

- **Tokens**: Almacenados en sessionStorage (no localStorage)
- **Inactividad**: Auto-logout después de 15 minutos
- **Scopes**: Solo `openid`, `profile`, `email`, `User.Read`
- **Redirect URIs**: Configuradas específicamente

## 🚨 Notas Importantes

- **NO** se rompió el dashboard existente
- **NO** hay loops de navegación
- **NO** se modificó lógica de negocio
- Sistema preparado para clientes OTP
- Compatibilidad temporal mantenida

## 🐛 Troubleshooting

### Error: "invalid_client"
- Verifica `NEXT_PUBLIC_AZURE_CLIENT_ID`

### Error: "invalid_tenant"
- Verifica `NEXT_PUBLIC_AZURE_TENANT_ID`

### Error: "redirect_uri_mismatch"
- Verifica redirect URIs en Azure AD app registration

### Usuario no puede acceder
- Verifica que el usuario esté en el tenant correcto
- Verifica permisos de la app registration