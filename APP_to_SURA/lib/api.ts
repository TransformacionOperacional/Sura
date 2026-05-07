import type {
  Operator,
  LoginResult,
  DocumentRequest,
  CreateRequestResult,
  ValidateTokenResult,
  ClientData,
  ProductType,
  ClaimType,
  RequiredDocument,
  RequestStatus,
  SharePointDestination,
  EmailPreview,
} from './types'

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique token
function generateToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`
}

// Generate 6-digit security code
function generateSecurityCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate request ID
function generateRequestId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `SOL-${year}-${random}`
}

// === MOCK DATABASE ===
const OPERATORS: Record<string, { password: string; operator: Operator }> = {
  'operador1': {
    password: 'Konecta2024',
    operator: {
      id: 'OP-001',
      username: 'operador1',
      name: 'Ana María López',
      role: 'Analista de Operaciones',
      department: 'Reclamaciones Vida'
    }
  },
  'admin': {
    password: 'admin123',
    operator: {
      id: 'OP-002',
      username: 'admin',
      name: 'Carlos Rodríguez',
      role: 'Supervisor',
      department: 'Operaciones'
    }
  },
  'demo': {
    password: 'demo',
    operator: {
      id: 'OP-003',
      username: 'demo',
      name: 'Usuario Demo',
      role: 'Operador',
      department: 'Demo'
    }
  }
}

// In-memory request storage
const requests: Map<string, DocumentRequest> = new Map()

// === OPERATOR AUTHENTICATION ===
export async function loginOperator(username: string, password: string): Promise<LoginResult> {
  await delay(1200)
  
  const user = OPERATORS[username.toLowerCase()]
  
  if (!user) {
    return {
      success: false,
      message: 'Usuario no encontrado en el sistema.'
    }
  }
  
  if (user.password !== password) {
    return {
      success: false,
      message: 'Contraseña incorrecta.'
    }
  }
  
  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    operator: user.operator
  }
}

export async function logoutOperator(): Promise<void> {
  await delay(300)
}

// === DOCUMENT REQUEST MANAGEMENT ===
export async function createDocumentRequest(
  client: ClientData,
  product: ProductType,
  claimType: ClaimType,
  requiredDocuments: string[],
  customDocumentDescription: string | undefined,
  expirationDays: number,
  createdBy: string
): Promise<CreateRequestResult> {
  await delay(1500)
  
  const token = generateToken()
  const securityCode = generateSecurityCode()
  const id = generateRequestId()
  
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + expirationDays)
  
  const documents: RequiredDocument[] = requiredDocuments.map((doc, index) => ({
    id: `DOC-${index + 1}`,
    name: doc,
    uploaded: false,
    files: []
  }))
  
  const request: DocumentRequest = {
    id,
    token,
    securityCode,
    client,
    product,
    claimType,
    requiredDocuments: documents,
    customDocumentDescription,
    expirationDate,
    createdAt: new Date(),
    createdBy,
    status: 'pendiente',
    secureUrl: `https://portalempresa.com/carga/${token}`,
    attempts: 0
  }
  
  requests.set(token, request)
  
  return {
    success: true,
    message: 'Solicitud creada exitosamente.',
    request
  }
}

export async function getRequestByToken(token: string): Promise<DocumentRequest | null> {
  await delay(300)
  return requests.get(token) || null
}

export async function getAllRequests(): Promise<DocumentRequest[]> {
  await delay(500)
  return Array.from(requests.values()).sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  )
}

export async function updateRequestStatus(token: string, status: RequestStatus): Promise<boolean> {
  await delay(300)
  const request = requests.get(token)
  if (request) {
    request.status = status
    if (status === 'enviado') {
      // Mark as sent
    } else if (status === 'completado') {
      request.completedAt = new Date()
      request.usedAt = new Date()
    }
    return true
  }
  return false
}

// === EMAIL ===
export function generateEmailPreview(request: DocumentRequest): EmailPreview {
  const formattedExpiration = request.expirationDate.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return {
    to: request.client.email,
    subject: 'Solicitud de documentos para su reclamación',
    body: `Estimado(a) ${request.client.fullName},

Hemos habilitado un acceso seguro para que pueda cargar los documentos requeridos para su reclamación.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📎 Enlace de acceso:
${request.secureUrl}

🔐 Código de seguridad:
${request.securityCode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANTE:
• Este acceso es personal e intransferible.
• El enlace es de un solo uso.
• El acceso expirará el ${formattedExpiration}.
• Tiene un máximo de 3 intentos para ingresar el código.

Documentos requeridos:
${request.requiredDocuments.map(doc => `• ${doc.name}`).join('\n')}

Si tiene alguna duda, comuníquese con nuestra línea de atención.

Atentamente,
Equipo de Reclamaciones
SURA`
  }
}

export async function sendEmail(request: DocumentRequest): Promise<{ success: boolean; message: string }> {
  await delay(2000)
  
  await updateRequestStatus(request.token, 'enviado')
  
  return {
    success: true,
    message: `Correo enviado exitosamente a ${request.client.email}`
  }
}

// === CUSTOMER PORTAL ===
export async function validateToken(token: string): Promise<ValidateTokenResult> {
  await delay(800)
  
  const request = requests.get(token)
  
  if (!request) {
    return {
      success: false,
      message: 'El enlace no es válido o no existe.',
      blocked: true
    }
  }
  
  if (request.status === 'completado' || request.usedAt) {
    return {
      success: false,
      message: 'Este enlace ya fue utilizado y no puede ser accedido nuevamente.',
      used: true,
      blocked: true
    }
  }
  
  if (new Date() > request.expirationDate) {
    request.status = 'expirado'
    return {
      success: false,
      message: 'Este enlace ha expirado.',
      expired: true,
      blocked: true
    }
  }
  
  return {
    success: true,
    message: 'Token válido.',
    request
  }
}

export async function validateSecurityCode(
  token: string,
  code: string
): Promise<ValidateTokenResult> {
  await delay(1000)
  
  const request = requests.get(token)
  
  if (!request) {
    return {
      success: false,
      message: 'Solicitud no encontrada.',
      blocked: true
    }
  }
  
  // Check attempts
  if (request.attempts >= 3) {
    return {
      success: false,
      message: 'Ha excedido el número máximo de intentos. El acceso ha sido bloqueado.',
      blocked: true,
      attemptsRemaining: 0
    }
  }
  
  if (request.securityCode !== code) {
    request.attempts++
    const remaining = 3 - request.attempts
    
    if (remaining === 0) {
      return {
        success: false,
        message: 'Código incorrecto. Ha excedido el número máximo de intentos.',
        blocked: true,
        attemptsRemaining: 0
      }
    }
    
    return {
      success: false,
      message: `Código de seguridad incorrecto. Le quedan ${remaining} intento(s).`,
      attemptsRemaining: remaining
    }
  }
  
  return {
    success: true,
    message: 'Código validado correctamente.',
    request,
    attemptsRemaining: 3 - request.attempts
  }
}

// === FILE UPLOAD ===
export async function uploadToSharePoint(
  requestId: string,
  documentId: string,
  files: File[],
  onProgress: (progress: number) => void
): Promise<{ success: boolean; message: string }> {
  // Validate file types
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.tiff', '.bmp']
  const blockedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz']
  
  for (const file of files) {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (blockedExtensions.includes(extension)) {
      return {
        success: false,
        message: `El archivo "${file.name}" no está permitido. Los archivos comprimidos no se aceptan.`
      }
    }
    
    if (!allowedExtensions.includes(extension)) {
      return {
        success: false,
        message: `El archivo "${file.name}" tiene un formato no permitido.`
      }
    }
  }
  
  // Simulate upload
  for (let progress = 0; progress <= 100; progress += 5) {
    await delay(50)
    onProgress(progress)
  }
  
  return {
    success: true,
    message: 'Archivos cargados exitosamente.'
  }
}

export async function createSharePointFolders(clientName: string, requestId: string): Promise<SharePointDestination> {
  await delay(500)
  
  const now = new Date()
  const formattedDate = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return {
    library: 'Documentos_Reclamaciones',
    folder: clientName.replace(/\s+/g, '_'),
    subfolder: requestId,
    uploadDate: formattedDate
  }
}

export async function closeRequest(token: string): Promise<{ success: boolean; message: string; confirmationNumber: string }> {
  await delay(1500)
  
  const request = requests.get(token)
  
  if (!request) {
    return {
      success: false,
      message: 'Solicitud no encontrada.',
      confirmationNumber: ''
    }
  }
  
  request.status = 'completado'
  request.completedAt = new Date()
  request.usedAt = new Date()
  
  const confirmationNumber = `CONF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  return {
    success: true,
    message: 'Documentos enviados exitosamente.',
    confirmationNumber
  }
}

// === CONSTANTS ===
export const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'NIT', label: 'NIT' },
]

export const PRODUCTS = [
  { value: 'vida', label: 'Vida' },
  { value: 'rentas', label: 'Rentas' },
  { value: 'enfermedades_graves', label: 'Enfermedades Graves' },
  { value: 'invalidez', label: 'Invalidez' },
  { value: 'accidentes', label: 'Accidentes' },
  { value: 'otro', label: 'Otro' },
]

export const CLAIM_TYPES = [
  { value: 'fallecimiento', label: 'Fallecimiento' },
  { value: 'incapacidad', label: 'Incapacidad' },
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'invalidez', label: 'Invalidez' },
  { value: 'reembolso', label: 'Reembolso' },
  { value: 'otro', label: 'Otro' },
]

export const REQUIRED_DOCUMENTS_OPTIONS = [
  { value: 'historia_clinica', label: 'Historia clínica' },
  { value: 'incapacidad_medica', label: 'Incapacidad médica' },
  { value: 'calificacion_invalidez', label: 'Calificación de invalidez' },
  { value: 'certificado_defuncion', label: 'Certificado de defunción' },
  { value: 'certificado_nacimiento', label: 'Certificado de nacimiento' },
  { value: 'documento_identidad', label: 'Documento de identidad' },
  { value: 'examenes_medicos', label: 'Exámenes médicos' },
  { value: 'epicrisis', label: 'Epicrisis' },
  { value: 'otro_documento', label: 'Otro documento' },
]

export const ALLOWED_FILE_TYPES = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
  '.tiff',
  '.bmp'
]

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'image/bmp'
]

// Pre-populate some demo requests
const demoToken = 'demo-token-123'
requests.set(demoToken, {
  id: 'SOL-2024-00001',
  token: demoToken,
  securityCode: '123456',
  client: {
    fullName: 'María Elena González',
    documentType: 'CC',
    documentNumber: '1234567890',
    email: 'maria.gonzalez@email.com',
    phone: '3001234567'
  },
  product: 'vida',
  claimType: 'fallecimiento',
  requiredDocuments: [
    { id: 'DOC-1', name: 'Historia clínica', uploaded: false, files: [] },
    { id: 'DOC-2', name: 'Certificado de defunción', uploaded: false, files: [] },
    { id: 'DOC-3', name: 'Documento de identidad', uploaded: false, files: [] },
  ],
  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  createdBy: 'OP-001',
  status: 'enviado',
  secureUrl: `https://portalempresa.com/carga/${demoToken}`,
  attempts: 0
})
