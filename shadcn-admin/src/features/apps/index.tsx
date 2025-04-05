import { useRef, useState } from 'react'
import { Camera, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export default function Apps() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setImages(Array.from(e.target.files))
    setReport(null) // reset report when new images are added
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    setLoading(true)

    // Mock uploading images and generating report
    setTimeout(() => {
      setReport(
        `🧾 Infrastructure Report:
- Total images received: ${images.length}
- Issues detected: 2
- Suggestions: Fix broken fencing near gate & add signage at entrance.`
      )
      setLoading(false)
    }, 1500)
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='px-2 pb-32'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Infrastructure Assessment
          </h1>
          <p className='text-muted-foreground'>
            Upload photos from the site to get an AI-generated report.
          </p>
        </div>

        <div className='my-6 flex flex-col gap-4 sm:flex-row sm:items-center'>
          <Button
            variant='outline'
            className='gap-2'
            onClick={triggerFileInput}
          >
            <Camera size={18} />
            Upload or Capture Images
          </Button>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            capture='environment'
            multiple
            onChange={handleImageSelect}
            className='hidden'
          />

          {images.length > 0 && (
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Images'}
            </Button>
          )}
        </div>

        {images.length > 0 && (
          <div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
            {images.map((img, idx) => (
              <div
                key={idx}
                className='overflow-hidden rounded-lg border bg-muted'
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt={`uploaded-${idx}`}
                  className='h-40 w-full object-cover'
                />
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className='mt-8 rounded-lg border bg-background p-4'>
            <div className='mb-2 flex items-center gap-2 text-lg font-semibold'>
              <Bot size={18} />
              AI Report
            </div>
            <pre className='whitespace-pre-wrap text-sm text-muted-foreground'>
              {report}
            </pre>
          </div>
        )}

        <Separator className='mt-10' />
      </Main>
    </>
  )
}
