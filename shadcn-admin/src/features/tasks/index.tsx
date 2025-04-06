import { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader2, Upload, File, Trash2, Eye, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Toast } from '@/components/ui/toast'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function Docs() {
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [deletingDocId, setDeletingDocId] = useState(null)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/api/university/docs`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      )

      setDocuments(response.data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      Toast({
        title: 'Error fetching documents',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return Toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive',
      })
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('documents', file))

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/university/upload-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          withCredentials: true,
        }
      )

      console.log(localStorage.getItem('accessToken'))

      setDocuments((prev) => [...prev, ...response.data.files])
      setSelectedFiles([])
      setOpenUploadDialog(false)

      Toast({
        title: 'Upload successful',
        description: `Uploaded ${response.data.files.length} document(s) successfully.`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      Toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const confirmDelete = (docId) => {
    setDeletingDocId(docId)
    setOpenDeleteDialog(true)
  }

  const handleDeleteDocument = async () => {
    if (!deletingDocId) return

    try {
      await axios.delete(`/api/university/docs/${deletingDocId}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      })

      setDocuments((prev) => prev.filter((doc) => doc._id !== deletingDocId))
      Toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.',
      })
    } catch (error) {
      console.error('Delete error:', error)
      Toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeletingDocId(null)
      setOpenDeleteDialog(false)
    }
  }

  const handlePreview = (doc) => {
    setPreviewDocument(doc)
    setOpenPreviewDialog(true)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              University Documents
            </h2>
            <p className='text-muted-foreground'>
              Manage your university documentation and official records
            </p>
          </div>
          <Button onClick={() => setOpenUploadDialog(true)}>
            <Upload className='mr-2 h-4 w-4' />
            Upload Documents
          </Button>
        </div>

        {/* Preview Dialog */}
        <Dialog open={openPreviewDialog} onOpenChange={setOpenPreviewDialog}>
          <DialogContent className='sm:max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Preview Document</DialogTitle>
              <DialogDescription>{previewDocument?.filename}</DialogDescription>
            </DialogHeader>

            <div className='h-[75vh] overflow-auto'>
              {previewDocument?.url ? (
                previewDocument.filename?.toLowerCase().endsWith('.pdf') ? (
                  // Direct PDF preview
                  <iframe
                    src={previewDocument.url}
                    title={previewDocument.filename}
                    className='h-full w-full rounded border'
                    allowFullScreen
                    loading='lazy'
                  />
                ) : (
                  // Use Google Docs Viewer for non-PDF files like DOCX
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDocument.url)}&embedded=true`}
                    title={previewDocument.filename}
                    className='h-full w-full rounded border'
                    allowFullScreen
                    loading='lazy'
                  />
                )
              ) : (
                <p className='mt-4 text-center text-sm text-muted-foreground'>
                  No document available for preview.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Documents Library</CardTitle>
            <CardDescription>
              View, preview and manage all your university documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex justify-center p-6'>
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              </div>
            ) : documents.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
                <File className='mb-4 h-10 w-10 text-muted-foreground' />
                <h3 className='text-lg font-semibold'>No documents uploaded</h3>
                <p className='mt-2 max-w-md text-muted-foreground'>
                  Upload your university documents to get started. You can
                  upload official records, policies, and more.
                </p>
                <Button
                  className='mt-4'
                  onClick={() => setOpenUploadDialog(true)}
                >
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id || doc.url}>
                      <TableCell className='font-medium'>
                        {doc.filename}
                      </TableCell>
                      <TableCell>
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : 'Unknown'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handlePreview(doc)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-red-500 hover:text-red-700'
                            onClick={() => confirmDelete(doc._id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload official university documents to your library
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='files'>Documents</Label>
              <Input
                id='files'
                type='file'
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className='mt-2 space-y-2'>
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className='max-h-32 overflow-auto rounded border p-2'>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between py-1'
                    >
                      <span className='truncate text-sm'>{file.name}</span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setOpenUploadDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the document from your
              library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
