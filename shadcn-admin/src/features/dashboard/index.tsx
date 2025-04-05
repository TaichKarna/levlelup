import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Overview } from './components/overview';
import { RecentSales } from './components/recent-sales';

const defaultImgUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=University';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <div className="p-4 text-center">Loading...</div>;

  return (
    <>
      {/* Top Header */}
      <Header>
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">
            {user.role === 'admin' ? 'Dashboard' : 'Profile'}
          </h1>
          {user.role === 'admin' && <Button>Download</Button>}
        </div>

        {/* Admin Dashboard */}
        {user.role === 'admin' ? (
          <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto pb-2">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Metrics Cards */}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>You made 265 sales this month.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // User Profile View
          <Card className="p-6 space-y-6">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar className="h-14 w-14">
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
                <CardTitle>{user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>ID:</strong> {user._id}</p>
                  <p><strong>Provider:</strong> {user.provider}</p>
                  <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>

                {user.university && (
                  <div>
                    <p className="text-base font-semibold mb-1">University Details</p>
                    <p><strong>Name:</strong> {user.university.institutionName}</p>
                    <p><strong>Type:</strong> {user.university.institutionType}</p>
                    <p><strong>Affiliation:</strong> {user.university.affiliation}</p>
                    <p><strong>Registration No:</strong> {user.university.registrationNumber}</p>
                    <p><strong>Established:</strong> {user.university.yearOfEstablishment}</p>
                    <p>
                      <strong>Website:</strong>{' '}
                      <a
                        href={user.university.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {user.university.website}
                      </a>
                    </p>
                    <p><strong>Verified:</strong> {user.university.isverified ? 'Yes' : 'No'}</p>
                    <p><strong>Rating Requested:</strong> {user.university.ratingRequested ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              {user.university?.logo && (
                <div>
                  <p className="font-semibold mb-1">University Logo</p>
                  <img
                    src={user.university.logo}
                    alt="University Logo"
                    onError={(e) => (e.currentTarget.src = defaultImgUrl)}
                    className="w-28 rounded shadow-md"
                  />
                </div>
              )}

              {user.university?.documents?.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Documents</p>
                  <ul className="list-disc list-inside">
                    {user.university.documents.map((doc) => (
                      <li key={doc._id}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 underline"
                        >
                          {doc.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {user.university?.infrastructureImages?.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Infrastructure Images</p>
                  <div className="flex flex-wrap gap-3">
                    {user.university.infrastructureImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`infra-${idx}`}
                        onError={(e) => (e.currentTarget.src = defaultImgUrl)}
                        className="w-32 rounded shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  );
}
