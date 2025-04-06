import { useRef, useState, useEffect } from 'react'
import {
  Camera,
  Bot,
  Loader2,
  Upload,
  Star,
  AlertTriangle,
  LightbulbIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

// Replace with your actual API key or use environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Define interfaces for parsed data
interface InfrastructureAnalysis {
  summary: {
    cleanliness: string
    maintenance: string
    facilities: string
    design: string
  }
  rating: number
  observations: string[]
  suggestions: {
    classroom: string[]
    laboratories: string[]
    greenery: string[]
    accessibility: string[]
    safety: string[]
    amenities: string[]
    appeal: string[]
  }
  rawResponse: string
}

export default function Apps() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [parsedAnalysis, setParsedAnalysis] =
    useState<InfrastructureAnalysis | null>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setImages(Array.from(e.target.files))
    setResponse(null) // reset response when new images are added
    setParsedAnalysis(null)
  }

  // Convert file to base64
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  // Progress simulation
  const simulateProgress = () => {
    return setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        const increment = Math.random() * 15
        return Math.min(prev + increment, 95)
      })
    }, 500)
  }

  // Parse the response to extract structured data
  const parseResponse = (text: string): InfrastructureAnalysis => {
    // Default structure for parsed analysis
    const defaultAnalysis: InfrastructureAnalysis = {
      summary: {
        cleanliness: 'No data provided',
        maintenance: 'No data provided',
        facilities: 'No data provided',
        design: 'No data provided',
      },
      rating: 0,
      observations: [],
      suggestions: {
        classroom: [],
        laboratories: [],
        greenery: [],
        accessibility: [],
        safety: [],
        amenities: [],
        appeal: [],
      },
      rawResponse: text,
    }

    try {
      // Extract rating
      const ratingRegex = /(\d+(\.\d+)?)\s*(?:\/|\s*out of\s*)\s*10/i
      const ratingMatch = text.match(ratingRegex)
      if (ratingMatch && ratingMatch[1]) {
        defaultAnalysis.rating = parseFloat(ratingMatch[1])
      }

      // Replace all asterisks with empty string
      const cleanText = text.replace(/\*/g, '')

      // Extract summary sections
      if (cleanText.includes('Cleanliness:')) {
        const cleanlinessRegex =
          /Cleanliness:(.*?)(?=Maintenance:|Facilities:|Design:|$)/s
        const match = cleanText.match(cleanlinessRegex)
        if (match) defaultAnalysis.summary.cleanliness = match[1].trim()
      }

      if (cleanText.includes('Maintenance:')) {
        const maintenanceRegex = /Maintenance:(.*?)(?=Facilities:|Design:|$)/s
        const match = cleanText.match(maintenanceRegex)
        if (match) defaultAnalysis.summary.maintenance = match[1].trim()
      }

      if (cleanText.includes('Facilities:')) {
        const facilitiesRegex = /Facilities:(.*?)(?=Design:|$)/s
        const match = cleanText.match(facilitiesRegex)
        if (match) defaultAnalysis.summary.facilities = match[1].trim()
      }

      if (cleanText.includes('Design:')) {
        const designRegex = /Design:(.*?)(?=\d+\/10|Rating|$)/s
        const match = cleanText.match(designRegex)
        if (match) defaultAnalysis.summary.design = match[1].trim()
      }

      // Extract observations
      const observationStart = cleanText.indexOf('Key Observations/Red Flags:')
      const observationEnd = cleanText.indexOf('Constructive Suggestions')

      if (observationStart !== -1 && observationEnd !== -1) {
        const observationSection = cleanText.substring(
          observationStart,
          observationEnd
        )
        const observationItems = observationSection
          .split(/(?:\r\n|\r|\n)+/)
          .filter(
            (line) =>
              line.trim() &&
              !line.includes('Key Observations/Red Flags:') &&
              line.trim().length > 3
          )

        defaultAnalysis.observations = observationItems.map((item) => {
          // Remove any bullet points or leading characters
          return item.replace(/^[•\-:]+\s*/, '').trim()
        })
      }

      // Extract suggestions for each category
      const extractSuggestionsForCategory = (
        category: string,
        text: string
      ) => {
        const regex = new RegExp(`${category}:(.*?)(?=\\n\\n|\\n[A-Z]|$)`, 's')
        const match = text.match(regex)
        if (match) {
          return match[1]
            .split(/\n/)
            .filter(
              (line) =>
                line.trim() &&
                !line.includes(category) &&
                line.trim().length > 3
            )
            .map((item) => {
              return item.replace(/^[•\-:]+\s*/, '').trim()
            })
        }
        return []
      }

      // Extract suggestions sections
      if (cleanText.includes('Classroom/Laboratory Quality:')) {
        defaultAnalysis.suggestions.classroom = extractSuggestionsForCategory(
          'Classroom/Laboratory Quality',
          cleanText
        )
      }

      if (cleanText.includes('Laboratories')) {
        defaultAnalysis.suggestions.laboratories =
          extractSuggestionsForCategory('Laboratories', cleanText)
      }

      if (cleanText.includes('Greenery/Environment:')) {
        defaultAnalysis.suggestions.greenery = extractSuggestionsForCategory(
          'Greenery/Environment',
          cleanText
        )
      }

      if (cleanText.includes('Accessibility:')) {
        defaultAnalysis.suggestions.accessibility =
          extractSuggestionsForCategory('Accessibility', cleanText)
      }

      if (cleanText.includes('Safety/Fire Measures:')) {
        defaultAnalysis.suggestions.safety = extractSuggestionsForCategory(
          'Safety/Fire Measures',
          cleanText
        )
      }

      if (cleanText.includes('Student Amenities:')) {
        defaultAnalysis.suggestions.amenities = extractSuggestionsForCategory(
          'Student Amenities',
          cleanText
        )
      }

      if (cleanText.includes('Overall Appeal and Modernity:')) {
        defaultAnalysis.suggestions.appeal = extractSuggestionsForCategory(
          'Overall Appeal and Modernity',
          cleanText
        )
      }

      return defaultAnalysis
    } catch (error) {
      console.error('Error parsing analysis:', error)
      return {
        ...defaultAnalysis,
        rawResponse: text,
      }
    }
  }

  // Handle the upload and API call
  const handleUpload = async () => {
    if (images.length === 0) return

    setLoading(true)
    setProgress(0)

    // Start progress simulation
    const progressInterval = simulateProgress()

    try {
      // Process each image and create analysis requests
      const requests = await Promise.all(
        images.map(async (file) => {
          const base64 = await toBase64(file)
          const imageData = base64.split(',')[1] // Remove data:image/...;base64,

          return fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inlineData: {
                          mimeType: file.type,
                          data: imageData,
                        },
                      },
                      {
                        text: `This is an image of a college/institute campus or building. Please perform an infrastructure analysis based on what you see. Your response should include:
1. A summary of the visible infrastructure state (e.g., cleanliness, maintenance, facilities, design).
2. A rating out of 10 for the infrastructure.
3. Key observations or red flags.
4. Constructive suggestions for improvement based on NAAC and AICTE evaluation parameters such as:
   - Classroom quality
   - Laboratories
   - Greenery/Environment
   - Accessibility
   - Safety/Fire measures
   - Student amenities (hostel, cafeteria, etc.)
   - Overall appeal and modernity
Be as specific and helpful as possible in the analysis.`,
                      },
                    ],
                  },
                ],
              }),
            }
          )
        })
      )

      // Process all responses
      const responses = await Promise.all(
        requests.map(async (res) => {
          const json = await res.json()
          return (
            json?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'No response from Gemini'
          )
        })
      )

      // Combine all responses
      const combinedResponse = responses.join(
        '\n\n--- NEXT IMAGE ANALYSIS ---\n\n'
      )
      setResponse(combinedResponse)

      // Parse the response for the first image (if multiple images are uploaded)
      if (responses.length > 0) {
        const analysis = parseResponse(responses[0])
        setParsedAnalysis(analysis)
      }
    } catch (error) {
      console.error('Error analyzing images:', error)
      setResponse('Error analyzing images. Please try again later.')
    } finally {
      clearInterval(progressInterval)
      setProgress(100)
      setLoading(false)
    }
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
            Upload photos from your institute to get an AI-generated analysis
            and rating.
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
            <Button onClick={handleUpload} disabled={loading} className='gap-2'>
              {loading ? (
                <>
                  <Loader2 size={18} className='animate-spin' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Analyze Images
                </>
              )}
            </Button>
          )}
        </div>

        {loading && (
          <div className='mt-4'>
            <p className='mb-2 text-sm text-muted-foreground'>
              Analyzing infrastructure with Gemini AI...
            </p>
            <Progress value={progress} className='h-2' />
          </div>
        )}

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

        {parsedAnalysis && (
          <div className='mt-8 space-y-6'>
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-lg font-semibold'>
                    <Star size={18} className='text-yellow-500' />
                    Infrastructure Rating
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      parsedAnalysis.rating >= 8
                        ? 'text-green-500'
                        : parsedAnalysis.rating >= 6
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }`}
                  >
                    {parsedAnalysis.rating}/10
                  </div>
                </div>
                <Progress
                  value={parsedAnalysis.rating * 10}
                  className='h-3'
                  indicatorClassName={
                    parsedAnalysis.rating >= 8
                      ? 'bg-green-500'
                      : parsedAnalysis.rating >= 6
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }
                />
              </CardContent>
            </Card>

            <Tabs defaultValue='summary' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='summary'>Summary</TabsTrigger>
                <TabsTrigger value='issues'>Issues</TabsTrigger>
                <TabsTrigger value='suggestions'>Suggestions</TabsTrigger>
                <TabsTrigger value='raw'>Raw Report</TabsTrigger>
              </TabsList>

              <TabsContent value='summary'>
                <Card>
                  <CardHeader>
                    <CardTitle>Infrastructure Summary</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <h3 className='text-base font-semibold'>Cleanliness</h3>
                      <p className='text-muted-foreground'>
                        {parsedAnalysis.summary.cleanliness}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-base font-semibold'>Maintenance</h3>
                      <p className='text-muted-foreground'>
                        {parsedAnalysis.summary.maintenance}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-base font-semibold'>Facilities</h3>
                      <p className='text-muted-foreground'>
                        {parsedAnalysis.summary.facilities}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-base font-semibold'>Design</h3>
                      <p className='text-muted-foreground'>
                        {parsedAnalysis.summary.design}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='issues'>
                <Card>
                  <CardHeader className='flex flex-row items-center'>
                    <CardTitle className='flex items-center gap-2'>
                      <AlertTriangle size={18} className='text-red-500' />
                      Key Observations & Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {parsedAnalysis.observations.length > 0 ? (
                        parsedAnalysis.observations.map((observation, idx) => (
                          <li key={idx} className='flex gap-2 pb-2'>
                            <span className='flex-shrink-0 text-red-500'>
                              •
                            </span>
                            <span className='text-muted-foreground'>
                              {observation}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className='text-muted-foreground'>
                          No specific issues identified.
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='suggestions'>
                <Card>
                  <CardHeader className='flex flex-row items-center'>
                    <CardTitle className='flex items-center gap-2'>
                      <LightbulbIcon size={18} className='text-green-500' />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {parsedAnalysis.suggestions.classroom.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Classroom/Laboratory Quality
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.classroom.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.laboratories.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Laboratories
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.laboratories.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.greenery.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Greenery/Environment
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.greenery.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.accessibility.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Accessibility
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.accessibility.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.safety.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Safety/Fire Measures
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.safety.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.amenities.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Student Amenities
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.amenities.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {parsedAnalysis.suggestions.appeal.length > 0 && (
                      <div>
                        <h3 className='mb-2 text-base font-semibold'>
                          Overall Appeal and Modernity
                        </h3>
                        <ul className='space-y-1'>
                          {parsedAnalysis.suggestions.appeal.map(
                            (item, idx) => (
                              <li key={idx} className='flex gap-2'>
                                <span className='flex-shrink-0 text-green-500'>
                                  •
                                </span>
                                <span className='text-muted-foreground'>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='raw'>
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Analysis Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground'>
                      {response}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!parsedAnalysis && response && (
          <Card className='mt-8'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bot size={18} />
                AI Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground'>
                {response}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className='mt-10' />
      </Main>
    </>
  )
}
