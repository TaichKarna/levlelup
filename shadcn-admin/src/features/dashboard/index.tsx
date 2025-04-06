import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Globe,
  Award,
  Calendar,
  CheckCircle,
  Download,
  School,
  BookOpen,
  FileText,
  Image,
  Building,
  IdCard as Id,
  Key,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  FileBarChart,
  Bell,
  Verified,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

const defaultImgUrl =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz2Sq5y9mw3-ilQIUeenv0zUkz3V3XFC-MTQ&s'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/auth/me`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        )

        if (!response.ok) throw new Error('Failed to fetch user data')
        const userData = await response.json()
        console.log(userData)
        setUser({ ...userData, role: 'user' })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Helper function to get file icon based on extension
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className='text-red-500' />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image className='text-blue-500' />
      default:
        return <FileText className='text-gray-500' />
    }
  }

  if (loading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='space-y-4 text-center'>
          <Loader2 className='mx-auto h-12 w-12 animate-spin text-primary' />
          <p className='text-lg font-medium'>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <Card className='w-full max-w-md p-6'>
          <CardHeader className='text-center'>
            <AlertCircle className='mx-auto h-12 w-12 text-red-500' />
            <CardTitle>Unable to load user data</CardTitle>
            <CardDescription>Please try refreshing the page</CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className='mr-2 h-4 w-4' /> Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Top Header */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-3xl font-semibold tracking-tight'>Dashboard</h1>
          {user.role === 'admin' && (
            <Button>
              <Download className='mr-2 h-4 w-4' /> Download
            </Button>
          )}
        </div>

        {/* Admin Dashboard */}
        {user.role === 'admin' ? (
          <Tabs
            orientation='vertical'
            defaultValue='overview'
            className='space-y-4'
          >
            <div className='overflow-x-auto pb-2'>
              <TabsList>
                <TabsTrigger value='overview'>
                  <BarChart3 className='mr-2 h-4 w-4' /> Overview
                </TabsTrigger>
                <TabsTrigger value='analytics' disabled>
                  <FileBarChart className='mr-2 h-4 w-4' /> Analytics
                </TabsTrigger>
                <TabsTrigger value='reports' disabled>
                  <FileText className='mr-2 h-4 w-4' /> Reports
                </TabsTrigger>
                <TabsTrigger value='notifications' disabled>
                  <Bell className='mr-2 h-4 w-4' /> Notifications
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value='overview'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {/* Metrics Cards */}
              </div>
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                <Card className='col-span-1 lg:col-span-4'>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className='pl-2'>
                    <Overview />
                  </CardContent>
                </Card>
                <Card className='col-span-1 lg:col-span-3'>
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // User Profile View - Split into separate cards
          <div className='grid gap-6 md:grid-cols-1'>
            {/* User Details Card */}
            <Card className='h-fit'>
              <CardHeader className='flex flex-row items-center space-x-4'>
                <Avatar className='h-14 w-14'>
                  <AvatarImage
                    src={user.avatar || defaultImgUrl}
                    alt={user.username}
                    onError={(e) => (e.currentTarget.src = defaultImgUrl)}
                  />
                  <AvatarFallback>
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className='flex items-center'>
                    {user.username}
                    {user.isVerified && (
                      <CheckCircle className='ml-2 h-5 w-5 text-green-500' />
                    )}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className='space-y-4 text-sm'>
                <div className='space-y-2'>
                  <h3 className='mb-2 text-base font-semibold'>
                    User Information
                  </h3>
                  <div className='flex items-center gap-2'>
                    <Id className='h-4 w-4 text-gray-500' />
                    <span>
                      <strong>ID:</strong> {user._id}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Key className='h-4 w-4 text-gray-500' />
                    <span>
                      <strong>Provider:</strong> {user.provider}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-gray-500' />
                    <span>
                      <strong>Verified:</strong>
                      {user.isVerified ? (
                        <Badge className='ml-2 bg-green-100 text-green-800'>
                          Yes
                        </Badge>
                      ) : (
                        <Badge className='ml-2 bg-red-100 text-red-800'>
                          No
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-gray-500' />
                    <span>
                      <strong>Role:</strong> {user.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* University Details Card */}
            {user.university && (
              <Card className='h-fit'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2'>
                      <School className='h-5 w-5 text-blue-500' />
                      University Details
                    </CardTitle>
                    {user.university.isverified && (
                      <Badge className='bg-green-100 text-green-800'>
                        <CheckCircle className='mr-1 h-3 w-3' /> Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {user.university.institutionName}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                  <div className='grid gap-2'>
                    <div className='flex items-center gap-2'>
                      <Building className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Type:</strong> {user.university.institutionType}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Award className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Affiliation:</strong>{' '}
                        {user.university.affiliation}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Id className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Registration No:</strong>{' '}
                        {user.university.registrationNumber}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Established:</strong>{' '}
                        {user.university.yearOfEstablishment}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Website:</strong>{' '}
                        <a
                          href={user.university.website}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-600 underline'
                        >
                          {user.university.website}
                        </a>
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-4 w-4 text-gray-500' />
                      <span>
                        <strong>Rating Requested:</strong>{' '}
                        {user.university.ratingRequested ? (
                          <Badge className='ml-2 bg-blue-100 text-blue-800'>
                            Yes
                          </Badge>
                        ) : (
                          <Badge className='ml-2 bg-gray-100 text-gray-800'>
                            No
                          </Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  {user.university?.logo && (
                    <div className='mt-4 border-t pt-4'>
                      <p className='mb-2 flex items-center gap-2 font-semibold'>
                        <Image className='h-4 w-4 text-gray-500' />
                        University Logo
                      </p>
                      <img
                        src={user.university.logo}
                        alt='University Logo'
                        onError={(e) => (e.currentTarget.src = defaultImgUrl)}
                        className='w-28 rounded shadow-md'
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* University Documents Card */}
            {user.university?.documents?.length > 0 && (
              <Card className='h-fit'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-indigo-500' />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    {user.university.documents.length} documents uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-3'>
                    {user.university.documents.map((doc) => (
                      <a
                        key={doc._id}
                        href={doc.url}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900'
                      >
                        {getFileIcon(doc.filename)}
                        <div className='flex-1'>
                          <p className='font-medium'>{doc.filename}</p>
                          <p className='text-xs text-gray-500'>
                            Uploaded:{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Download className='h-4 w-4 text-gray-400' />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* University Infrastructure Images Card */}
            {user.university?.infrastructureImages?.length > 0 && (
              <Card className='h-fit'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Building className='h-5 w-5 text-orange-500' />
                    Infrastructure Images
                  </CardTitle>
                  <CardDescription>
                    {user.university.infrastructureImages.length} images of
                    campus facilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                    {user.university.infrastructureImages.map((img, idx) => (
                      <div
                        key={idx}
                        className='group relative overflow-hidden rounded-lg'
                      >
                        <img
                          src={img}
                          alt={`Campus Infrastructure ${idx + 1}`}
                          onError={(e) => (e.currentTarget.src = defaultImgUrl)}
                          className='aspect-video w-full object-cover transition-transform group-hover:scale-105'
                        />
                        <div className='absolute inset-0 bg-black bg-opacity-0 transition-opacity group-hover:bg-opacity-10' />
                      </div>
                    ))}
                  </div>
                </CardContent>
                {user.university.infrastructureImages.length > 3 && (
                  <CardFooter>
                    <Button variant='outline' className='w-full'>
                      <Image className='mr-2 h-4 w-4' />
                      View All Images
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        )}
      </Main>
    </>
  )
}
