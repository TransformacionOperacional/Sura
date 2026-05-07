'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Shield, 
  Calendar,
  Send,
  Save,
  CheckCircle,
  Copy,
  ExternalLink,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import {
  createDocumentRequest,
  sendEmail,
  generateEmailPreview,
  DOCUMENT_TYPES,
  PRODUCTS,
  CLAIM_TYPES,
  REQUIRED_DOCUMENTS_OPTIONS,
} from '@/lib/api'
import type { ClientData, ProductType, ClaimType, DocumentRequest, EmailPreview } from '@/lib/types'

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const { operator } = useAuth()

  // Form state
  const [clientData, setClientData] = useState<ClientData>({
    fullName: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
  })
  const [product, setProduct] = useState<ProductType>('vida')
  const [claimType, setClaimType] = useState<ClaimType>('fallecimiento')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [customDocument, setCustomDocument] = useState('')
  const [expirationDays, setExpirationDays] = useState(7)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [createdRequest, setCreatedRequest] = useState<DocumentRequest | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDocumentToggle = (docValue: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docValue)
        ? prev.filter(d => d !== docValue)
        : [...prev, docValue]
    )
  }

  const isFormValid = () => {
    return (
      clientData.fullName.trim() &&
      clientData.documentNumber.trim() &&
      clientData.email.trim() &&
      selectedDocuments.length > 0
    )
  }

  const handleGenerateRequest = async () => {
    if (!isFormValid() || !operator) return

    setIsLoading(true)

    try {
      const documentLabels = selectedDocuments.map(value => {
        const doc = REQUIRED_DOCUMENTS_OPTIONS.find(d => d.value === value)
        return doc?.label || value
      })

      const result = await createDocumentRequest(
        clientData,
        product,
        claimType,
        documentLabels,
        selectedDocuments.includes('otro_documento') ? customDocument : undefined,
        expirationDays,
        operator.id
      )

      if (result.success && result.request) {
        setCreatedRequest(result.request)
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error creating request:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowEmailPreview = () => {
    if (!createdRequest) return
    const preview = generateEmailPreview(createdRequest)
    setEmailPreview(preview)
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    if (!createdRequest) return

    setIsSending(true)

    try {
      await sendEmail(createdRequest)
      setShowEmailModal(false)
      router.push('/operaciones/solicitudes')
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = async () => {
    if (!createdRequest) return
    await navigator.clipboard.writeText(createdRequest.secureUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Generación de Solicitud Documental
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete el formulario para generar una nueva solicitud de documentos para el cliente.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section A - Datos del cliente */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Datos del Cliente</CardTitle>
                <CardDescription>Información del beneficiario o reclamante</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Nombre completo *</FieldLabel>
                <Input
                  id="fullName"
                  placeholder="Ingrese el nombre completo"
                  value={clientData.fullName}
                  onChange={(e) => setClientData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="documentType">Tipo de documento *</FieldLabel>
                  <Select
                    value={clientData.documentType}
                    onValueChange={(value) => setClientData(prev => ({ ...prev, documentType: value as ClientData['documentType'] }))}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="documentNumber">Número de documento *</FieldLabel>
                  <Input
                    id="documentNumber"
                    placeholder="Ingrese el número"
                    value={clientData.documentNumber}
                    onChange={(e) => setClientData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico *</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="pl-10"
                      value={clientData.email}
                      onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Celular (opcional)</FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="300 123 4567"
                      className="pl-10"
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section B & C - Producto y Tipo de Reclamación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Producto / Cobertura</CardTitle>
              <CardDescription>Seleccione el producto contratado</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={product} onValueChange={(value) => setProduct(value as ProductType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tipo de Reclamación</CardTitle>
              <CardDescription>Motivo de la reclamación</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={claimType} onValueChange={(value) => setClaimType(value as ClaimType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAIM_TYPES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Section D - Documentos Requeridos */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Documentos Requeridos</CardTitle>
                <CardDescription>Seleccione los documentos que debe aportar el cliente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REQUIRED_DOCUMENTS_OPTIONS.map(doc => (
                <div
                  key={doc.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={doc.value}
                    checked={selectedDocuments.includes(doc.value)}
                    onCheckedChange={() => handleDocumentToggle(doc.value)}
                  />
                  <label htmlFor={doc.value} className="text-sm cursor-pointer flex-1">
                    {doc.label}
                  </label>
                </div>
              ))}
            </div>

            {selectedDocuments.includes('otro_documento') && (
              <div className="mt-4">
                <Field>
                  <FieldLabel htmlFor="customDocument">Describa el documento requerido</FieldLabel>
                  <Textarea
                    id="customDocument"
                    placeholder="Especifique el documento adicional requerido..."
                    value={customDocument}
                    onChange={(e) => setCustomDocument(e.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section E - Seguridad */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Configuración de Seguridad</CardTitle>
                <CardDescription>El sistema generará automáticamente un token único y código de seguridad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel htmlFor="expiration">Días hasta expiración</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="expiration"
                    type="number"
                    min={1}
                    max={30}
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value) || 7)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Expira: {new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </Field>

            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Al generar la solicitud, el sistema creará automáticamente:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Token único irrepetible para el enlace seguro</li>
                <li>• Código de seguridad de 6 dígitos</li>
                <li>• URL segura de un solo uso</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Guardar borrador
          </Button>
          <Button
            className="gap-2"
            disabled={!isFormValid() || isLoading}
            onClick={handleGenerateRequest}
          >
            {isLoading ? (
              <>
                <Spinner className="size-8" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generar solicitud
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-center">Solicitud Generada Exitosamente</DialogTitle>
            <DialogDescription className="text-center">
              Se ha creado la solicitud documental para el cliente.
            </DialogDescription>
          </DialogHeader>

          {createdRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Solicitud:</span>
                  <span className="text-sm font-medium">{createdRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm font-medium">{createdRequest.client.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código de Seguridad:</span>
                  <span className="text-sm font-mono font-bold text-primary">{createdRequest.securityCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expira:</span>
                  <span className="text-sm font-medium">
                    {createdRequest.expirationDate.toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-2">Enlace seguro:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                    {createdRequest.secureUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowSuccessModal(false)}>
              <X className="w-4 h-4" />
              Cerrar
            </Button>
            <Button className="gap-2" onClick={handleShowEmailPreview}>
              <Send className="w-4 h-4" />
              Enviar correo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Correo</DialogTitle>
            <DialogDescription>
              Revise el contenido antes de enviar
            </DialogDescription>
          </DialogHeader>

          {emailPreview && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Para:</p>
                  <p className="text-sm font-medium">{emailPreview.to}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Asunto:</p>
                  <p className="text-sm font-medium">{emailPreview.subject}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <pre className="text-sm whitespace-pre-wrap font-sans">{emailPreview.body}</pre>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancelar
            </Button>
            <Button className="gap-2" onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Spinner className="size-8" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar y enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
