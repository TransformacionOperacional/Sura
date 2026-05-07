// === COMMON TYPES ===
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  documentType?: string
  category?: string
  file?: File
}

export interface SharePointDestination {
  library: string
  folder: string
  subfolder: string
  uploadDate: string
}

// === OPERATOR TYPES ===
export interface Operator {
  id: string
  username: string
  name: string
  role: string
  department: string
}

export interface ClientData {
  fullName: string
  documentType: 'CC' | 'CE' | 'PA' | 'TI' | 'NIT'
  documentNumber: string
  email: string
  phone?: string
}

export type ProductType = 'vida' | 'rentas' | 'enfermedades_graves' | 'invalidez' | 'accidentes' | 'otro'
export type ClaimType = 'fallecimiento' | 'incapacidad' | 'diagnostico' | 'invalidez' | 'reembolso' | 'otro'
export type RequestStatus = 'pendiente' | 'enviado' | 'completado' | 'expirado'

export interface RequiredDocument {
  id: string
  name: string
  description?: string
  uploaded: boolean
  files: UploadedFile[]
}

export interface DocumentRequest {
  id: string
  token: string
  securityCode: string
  client: ClientData
  product: ProductType
  claimType: ClaimType
  requiredDocuments: RequiredDocument[]
  customDocumentDescription?: string
  expirationDate: Date
  createdAt: Date
  createdBy: string
  status: RequestStatus
  secureUrl: string
  usedAt?: Date
  completedAt?: Date
  attempts: number
}

export interface LoginResult {
  success: boolean
  message: string
  operator?: Operator
}

export interface CreateRequestResult {
  success: boolean
  message: string
  request?: DocumentRequest
}

export interface ValidateTokenResult {
  success: boolean
  message: string
  request?: DocumentRequest
  blocked?: boolean
  expired?: boolean
  used?: boolean
  attemptsRemaining?: number
}

export interface EmailPreview {
  to: string
  subject: string
  body: string
}

// === FILTER/SEARCH TYPES ===
export interface RequestFilters {
  search: string
  status: RequestStatus | 'all'
  dateFrom?: Date
  dateTo?: Date
}
