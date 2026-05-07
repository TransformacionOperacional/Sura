'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
//import { Empty } from '@/components/ui/empty'
import {
  Empty,
  EmptyContent,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { getAllRequests, sendEmail, generateEmailPreview } from '@/lib/api'
import type { DocumentRequest, RequestStatus, EmailPreview } from '@/lib/types'

const statusConfig: Record<RequestStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', icon: Clock, variant: 'secondary' },
  enviado: { label: 'Enviado', icon: Send, variant: 'default' },
  completado: { label: 'Completado', icon: CheckCircle, variant: 'outline' },
  expirado: { label: 'Expirado', icon: XCircle, variant: 'destructive' },
}

export default function SolicitudesPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all')
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null)
  const [isSending, setIsSending] = useState(false)

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const data = await getAllRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (request: DocumentRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const handleResendEmail = (request: DocumentRequest) => {
    const preview = generateEmailPreview(request)
    setEmailPreview(preview)
    setSelectedRequest(request)
    setShowEmailModal(true)
  }

  const handleConfirmSendEmail = async () => {
    if (!selectedRequest) return
    setIsSending(true)
    try {
      await sendEmail(selectedRequest)
      await loadRequests()
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes Documentales</h1>
          <p className="text-muted-foreground mt-1">
            Gestione y monitoree todas las solicitudes creadas
          </p>
        </div>
        <Button onClick={loadRequests} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, nombre o correo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {filteredRequests.length} solicitud{filteredRequests.length !== 1 ? 'es' : ''} encontrada{filteredRequests.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyTitle>No hay solicitudes</EmptyTitle>
                <EmptyDescription>
                  {searchTerm || statusFilter !== 'all'
                    ? "No se encontraron solicitudes con los filtros aplicados."
                    : "Cree una nueva solicitud para comenzar."}
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const status = statusConfig[request.status]
                    const StatusIcon = status.icon
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.id}</TableCell>
                        <TableCell className="font-medium">{request.client.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{request.client.email}</TableCell>
                        <TableCell className="capitalize">{request.product.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{request.requiredDocuments.length} docs</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {request.createdAt.toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(request.secureUrl)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar enlace
                              </DropdownMenuItem>
                              {request.status !== 'completado' && request.status !== 'expirado' && (
                                <DropdownMenuItem onClick={() => handleResendEmail(request)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Reenviar correo
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud</DialogTitle>
            <DialogDescription>
              {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                {(() => {
                  const status = statusConfig[selectedRequest.status]
                  const StatusIcon = status.icon
                  return (
                    <Badge variant={status.variant} className="gap-1 text-sm px-3 py-1">
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </Badge>
                  )
                })()}
                {selectedRequest.status === 'expirado' && (
                  <span className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Enlace expirado
                  </span>
                )}
              </div>

              {/* Client Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-medium text-sm text-foreground">Datos del Cliente</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre:</p>
                    <p className="font-medium">{selectedRequest.client.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documento:</p>
                    <p className="font-medium">{selectedRequest.client.documentType} {selectedRequest.client.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Correo:</p>
                    <p className="font-medium">{selectedRequest.client.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Celular:</p>
                    <p className="font-medium">{selectedRequest.client.phone || 'No especificado'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-4 rounded-lg border border-border space-y-3">
                <h4 className="font-medium text-sm text-foreground">Documentos Requeridos</h4>
                <ul className="space-y-2">
                  {selectedRequest.requiredDocuments.map(doc => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm">
                      {doc.uploaded ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={doc.uploaded ? 'text-success' : ''}>{doc.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Link */}
              <div className="p-4 rounded-lg border border-border space-y-2">
                <h4 className="font-medium text-sm text-foreground">Enlace Seguro</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                    {selectedRequest.secureUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(selectedRequest.secureUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/carga/${selectedRequest.token}`} target="_blank" rel="noopener">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Código de seguridad: <span className="font-mono font-bold">{selectedRequest.securityCode}</span>
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Creado:</p>
                  <p className="font-medium">{selectedRequest.createdAt.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expira:</p>
                  <p className="font-medium">{selectedRequest.expirationDate.toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reenviar Correo</DialogTitle>
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

              <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans">{emailPreview.body}</pre>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmSendEmail} disabled={isSending} className="gap-2">
                  {isSending ? (
                    <>
                      <Spinner className="size-8" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
