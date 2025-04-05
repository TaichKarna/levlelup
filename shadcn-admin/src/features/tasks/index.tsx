import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toast } from '@/components/ui/toast'
import { Loader2, Upload, File, Trash2, Eye, X } from 'lucide-react'

export default function Tasks() {
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [deletingDocId, setDeletingDocId] = useState(null)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/university/docs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      Toast({
        title: 'Error fetching documents',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('documents', file)
      })

      const response = await fetch('http://localhost:5000/api/university/upload-documents', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to upload documents')
      }

      const result = await response.json()
      
      // Add new documents to the state
      setDocuments(prev => [...prev, ...result.files])
      setSelectedFiles([])
      setOpenUploadDialog(false)
      
      Toast({
        title: 'Upload successful',
        description: `Uploaded ${result.files.length} document(s) successfully.`
      })
    } catch (error) {
      console.error('Error uploading documents:', error)
      Toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
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
      const response = await fetch(`/api/university/docs/${deletingDocId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      // Remove the deleted document from the state
      setDocuments(prev => prev.filter(doc => doc._id !== deletingDocId))
      
      Toast({
        title: 'Document deleted',
        description: 'The document has been deleted successfully.'
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      Toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive'
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
            <h2 className='text-2xl font-bold tracking-tight'>University Documents</h2>
            <p className='text-muted-foreground'>
              Manage your university documentation and official records
            </p>
          </div>
          <Button onClick={() => setOpenUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents Library</CardTitle>
            <CardDescription>
              View, preview and manage all your university documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <File className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No documents uploaded</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  Upload your university documents to get started. You can upload official records, policies, and more.
                </p>
                <Button 
                  className="mt-4" 
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc._id || doc.url}>
                      <TableCell className="font-medium">{doc.filename}</TableCell>
                      <TableCell>
                        {doc.uploadedAt 
                          ? new Date(doc.uploadedAt).toLocaleDateString() 
                          : 'Unknown date'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePreview(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => confirmDelete(doc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload official university documents to your library
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="files">Documents</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="max-h-32 overflow-auto rounded border p-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles(prev => 
                            prev.filter((_, i) => i !== index)
                          )
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
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
              This action cannot be undone. This will permanently delete the document from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDocument}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Preview Dialog */}
      <Dialog open={openPreviewDialog} onOpenChange={setOpenPreviewDialog}>
        <DialogContent className="sm:max-w-4xl h-3/4">
          <DialogHeader>
            <DialogTitle>{previewDocument?.filename}</DialogTitle>
            <DialogDescription>
              Document preview
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {previewDocument && (
              <iframe
                src={previewDocument.url}
                className="w-full h-96 border rounded"
                title={previewDocument.filename}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button asChild variant="outline">
              <a 
                href={previewDocument?.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open in New Tab
              </a>
            </Button>
            <Button onClick={() => setOpenPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}