# 🚀 Configuración de Azure AD - Guía Rápida

## ✅ Estado Actual
La aplicación funciona localmente con configuración por defecto. Para activar la autenticación real, sigue estos pasos.

## 🔧 Configuración para Desarrollo Local

### 1. Actualizar `.env.local`
Reemplaza los valores en `C:\Repos\Sura\Sura\APP_to_SURA\.env.local`:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=tu-client-id-real-aqui
NEXT_PUBLIC_AZURE_TENANT_ID=tu-tenant-id-real-aqui
```

### 2. Reiniciar el servidor
```bash
npm run dev
```

## 🌐 Configuración para Azure Static Web App

### Opción A: Portal de Azure (Recomendado)
1. Ve a tu Static Web App: https://portal.azure.com
2. Busca tu recurso: `ReclamacionesOperaciones`
3. Ve a **Configuration** → **Environment variables**
4. Agrega estas variables:
   - `NEXT_PUBLIC_AZURE_CLIENT_ID`: Tu Client ID real
   - `NEXT_PUBLIC_AZURE_TENANT_ID`: Tu Tenant ID real

### Opción B: Azure CLI
```bash
az staticwebapp environment-variables set \
  --name ReclamacionesOperaciones \
  --resource-group SuraPilotosRG \
  --environment-variables NEXT_PUBLIC_AZURE_CLIENT_ID=tu-client-id NEXT_PUBLIC_AZURE_TENANT_ID=tu-tenant-id
```

## 🔍 Cómo Obtener los Valores de Azure AD

### 1. Crear App Registration
1. Azure Portal → Azure Active Directory → App registrations
2. **New registration**
   - Name: `Portal SURA Operadores`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `https://ashy-meadow-013e6ee0f.7.azurestaticapps.net/auth/callback`

### 2. Obtener IDs
Después de crear la app:
- **Application (client) ID**: Copia este valor
- **Directory (tenant) ID**: Overview → Tenant ID

### 3. Configurar Redirect URIs
En Authentication → Single-page application:
- `https://ashy-meadow-013e6ee0f.7.azurestaticapps.net/auth/callback` (producción)
- `http://localhost:3001/auth/callback` (desarrollo local)

### 4. Agregar Permisos
En API permissions:
- Microsoft Graph → User.Read

## 🧪 Probar la Configuración

### Desarrollo Local
```bash
npm run dev
# Ve a http://localhost:3001/operadores
# Deberías ser redirigido a Azure AD
```

### Producción
Después de configurar variables en Azure:
```bash
# El próximo deploy automático activará la autenticación real
```

## ⚠️ Notas Importantes

- **Desarrollo**: Usa `common` como tenant para testing básico
- **Producción**: Siempre usa tu tenant específico
- **Redirect URIs**: Deben coincidir exactamente
- **Variables**: Se aplican después del próximo deploy en Azure

## 🔄 Próximos Pasos

1. ✅ Configurar Azure AD App Registration
2. ✅ Obtener Client ID y Tenant ID
3. ✅ Configurar variables en desarrollo y producción
4. ✅ Probar flujo de autenticación completo
5. 🔄 Implementar portal de clientes con OTP