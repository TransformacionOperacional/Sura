'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle,
  FolderOpen,
  Calendar,
  User,
  Clock,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { uploadToSharePoint, createSharePointFolders, closeRequest, ALLOWED_FILE_TYPES } from '@/lib/api'
import type { DocumentRequest, RequiredDocument, UploadedFile, SharePointDestination } from '@/lib/types'

interface DocumentUploadPortalProps {
  request: DocumentRequest
  onComplete: (confirmationNumber: string) => void
}

const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export function DocumentUploadPortal({ request, onComplete }: DocumentUploadPortalProps) {
  const [documents, setDocuments] = useState<RequiredDocument[]>(request.requiredDocuments)
  const [sharePointInfo, setSharePointInfo] = useState<SharePointDestination | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_TIMEOUT)
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const lastActivityRef = useRef(Date.now())

  // Load SharePoint info
  useEffect(() => {
    createSharePointFolders(request.client.fullName, request.id).then(setSharePointInfo)
  }, [request.client.fullName, request.id])

  // Session timeout countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed)
      setSessionTimeLeft(remaining)

      if (remaining === 0) {
        // Session expired - reload page
        window.location.reload()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Track activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, updateActivity))

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
    }
  }, [])

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleFileSelect = useCallback(async (docId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    
    // Validate file types
    const blockedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz']
    for (const file of fileArray) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (blockedExtensions.includes(extension)) {
        alert(`El archivo "${file.name}" no está permitido. Los archivos comprimidos no se aceptan.`)
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(extension)) {
        alert(`El archivo "${file.name}" tiene un formato no permitido.`)
        return
      }
    }

    setUploadingDocId(docId)
    setUploadProgress(0)

    try {
      const result = await uploadToSharePoint(request.id, docId, fileArray, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success) {
        setDocuments(prev => prev.map(doc => {
          if (doc.id === docId) {
            const newFiles: UploadedFile[] = fileArray.map((file, index) => ({
              id: `${docId}-${Date.now()}-${index}`,
              name: file.name,
              size: file.size,
              type: file.type,
              progress: 100,
              status: 'success',
              file
            }))
            return {
              ...doc,
              uploaded: true,
              files: [...doc.files, ...newFiles]
            }
          }
          return doc
        }))
      } else {
        alert(result.message)
      }
    } catch {
      alert('Error al cargar el archivo. Por favor intente nuevamente.')
    } finally {
      setUploadingDocId(null)
      setUploadProgress(0)
    }
  }, [request.id])

  const handleRemoveFile = (docId: string, fileId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newFiles = doc.files.filter(f => f.id !== fileId)
        return {
          ...doc,
          uploaded: newFiles.length > 0,
          files: newFiles
        }
      }
      return doc
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (docId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(docId, e.dataTransfer.files)
  }

  const allDocumentsUploaded = documents.every(doc => doc.uploaded)
  const uploadedCount = documents.filter(doc => doc.uploaded).length

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await closeRequest(request.token)
      if (result.success) {
        onComplete(result.confirmationNumber)
      } else {
        alert(result.message)
      }
    } catch {
      alert('Error al enviar los documentos. Por favor intente nuevamente.')
    } finally {
      setIsSubmitting(false)
      setShowConfirmModal(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo-sura-white.svg"
                alt="SURA"
                width={110}
                height={36}
                className="h-9 w-auto"
              />
              <p className="text-xs text-sidebar-foreground/70">Portal Seguro</p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground gap-1">
                <Clock className="w-3 h-3" />
                Sesión: {formatTimeLeft(sessionTimeLeft)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Request Info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cargue de Documentos</h1>
              <p className="text-muted-foreground mt-1">
                Solicitud <span className="font-mono font-medium">{request.id}</span>
              </p>
            </div>
            <Badge className="w-fit gap-2 px-3 py-1.5 text-sm bg-success text-success-foreground">
              <CheckCircle className="w-4 h-4" />
              Acceso Activo
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Documents */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Documentos Requeridos</CardTitle>
                    <CardDescription>
                      {uploadedCount} de {documents.length} documentos cargados
                    </CardDescription>
                  </div>
                  <Progress value={(uploadedCount / documents.length) * 100} className="w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
                      doc.uploaded 
                        ? 'border-success/50 bg-success/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(doc.id, e)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        doc.uploaded ? 'bg-success/10' : 'bg-muted'
                      }`}>
                        {doc.uploaded ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${doc.uploaded ? 'text-success' : 'text-foreground'}`}>
                          {doc.name}
                        </p>

                        {doc.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {doc.files.map(file => (
                              <div
                                key={file.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border"
                              >
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveFile(doc.id, file.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {uploadingDocId === doc.id && (
                          <div className="mt-3">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">Cargando... {uploadProgress}%</p>
                          </div>
                        )}

                        <div className="mt-3">
                          <label
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            {doc.files.length > 0 ? 'Agregar más archivos' : 'Seleccionar archivos'}
                            <input
                              type="file"
                              multiple
                              accept={ALLOWED_FILE_TYPES.join(',')}
                              className="sr-only"
                              onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                              disabled={uploadingDocId !== null}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full h-14 text-lg gap-2"
              disabled={!allDocumentsUploaded || isSubmitting}
              onClick={() => setShowConfirmModal(true)}
            >
              <Send className="w-5 h-5" />
              Enviar documentos
            </Button>

            {!allDocumentsUploaded && (
              <p className="text-sm text-muted-foreground text-center">
                Debe cargar todos los documentos requeridos para continuar.
              </p>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-4">
            {/* Client Info */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre:</p>
                  <p className="font-medium">{request.client.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documento:</p>
                  <p className="font-medium">{request.client.documentType} {request.client.documentNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Correo:</p>
                  <p className="font-medium">{request.client.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* SharePoint Info */}
            {sharePointInfo && (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Destino de Archivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Biblioteca:</p>
                    <p className="font-medium font-mono text-xs">{sharePointInfo.library}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carpeta Cliente:</p>
                    <p className="font-medium font-mono text-xs">{sharePointInfo.folder}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carpeta Solicitud:</p>
                    <p className="font-medium font-mono text-xs">{sharePointInfo.subfolder}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Allowed Formats */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Formatos Permitidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {ALLOWED_FILE_TYPES.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  No se permiten archivos comprimidos (.zip, .rar, .7z)
                </p>
              </CardContent>
            </Card>

            {/* Expiration */}
            <Card className="border-0 shadow-md bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Fecha límite</p>
                    <p className="text-xs text-amber-600">
                      {request.expirationDate.toLocaleDateString('es-CO', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Envío</DialogTitle>
            <DialogDescription>
              Está a punto de enviar {documents.length} documento(s). Una vez enviados, no podrá acceder nuevamente a este enlace.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{doc.name}</span>
                <span className="text-muted-foreground">({doc.files.length} archivo{doc.files.length !== 1 ? 's' : ''})</span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Spinner className="size-8" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmar envío
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
