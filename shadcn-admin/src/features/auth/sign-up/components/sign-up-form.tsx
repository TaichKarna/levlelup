import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/password-input'

// Adjust this import path

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    username: z.string().min(1, { message: 'Please enter a username' }),
    email: z
      .string()
      .min(1, { message: 'Please enter your email' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(1, {
        message: 'Please enter your password',
      })
      .min(7, {
        message: 'Password must be at least 7 characters long',
      }),
    confirmPassword: z.string(),
    institutionName: z
      .string()
      .min(1, { message: 'Institution name is required' }),
    institutionType: z
      .string()
      .min(1, { message: 'Institution type is required' }),
    affiliation: z.string().optional(),
    registrationNumber: z.string().optional(),
    yearOfEstablishment: z.string().optional(),
    website: z.string().url({ message: 'Please enter a valid URL' }).optional(),
    logo: z.string().optional(),
    ratingRequested: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const { register, loading, error, clearError } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      institutionName: '',
      institutionType: '',
      affiliation: '',
      registrationNumber: '',
      yearOfEstablishment: '',
      website: '',
      logo: '',
      ratingRequested: false,
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setFormError(null)
      if (error) clearError()

      // Transform the data to match API requirements
      const registerData = {
        email: data.email,
        password: data.password,
        username: data.username,
        university: {
          institutionName: data.institutionName,
          institutionType: data.institutionType,
          affiliation: data.affiliation,
          registrationNumber: data.registrationNumber,
          yearOfEstablishment: data.yearOfEstablishment
            ? parseInt(data.yearOfEstablishment)
            : undefined,
          website: data.website,
          logo: data.logo,
          ratingRequested: data.ratingRequested,
          documents: [],
          infrastructureImages: [],
          report: {},
          reportChallenged: [],
        },
      }

      console.log(registerData)
      // Call   the register function from AuthContext
      await register(registerData)
      navigate({ to: '/sign-in-2' })
      // Handle successful registration - redirect, show success message, etc.
      // You might want to navigate to a verification screen or login page
    } catch (err) {
      // Error is handled by the AuthContext, but you might want to do additional handling here
      setFormError('Registration failed. Please try again.')
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            {/* Display errors from auth context or form processing */}
            {(error || formError) && (
              <div className='rounded-md bg-red-50 p-3 text-sm text-red-500'>
                {error || formError}
              </div>
            )}

            {/* User details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>User Information</h3>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder='johndoe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='********' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* University details - always shown */}
            <div className='mt-6 space-y-4'>
              <h3 className='text-lg font-medium'>University Information</h3>
              <FormField
                control={form.control}
                name='institutionName'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl>
                      <Input placeholder='University of Example' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='institutionType'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Institution Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select institution type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Public'>Public</SelectItem>
                        <SelectItem value='Private'>Private</SelectItem>
                        <SelectItem value='Community'>
                          Community College
                        </SelectItem>
                        <SelectItem value='Technical'>
                          Technical Institute
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='affiliation'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Affiliation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='State Board of Education'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='registrationNumber'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder='REG12345678' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='yearOfEstablishment'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Year of Establishment</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='1970' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://www.university.edu'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='logo'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://www.university.edu/logo.png'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='ratingRequested'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                    <FormControl>
                      <div className='flex h-4 w-4 items-center justify-center rounded-sm border border-primary'>
                        <input
                          type='checkbox'
                          className='h-3 w-3'
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </div>
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Request Rating</FormLabel>
                      <p className='text-sm text-muted-foreground'>
                        Check this if you want your institution to be rated
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button className='mt-6' disabled={loading} type='submit'>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Or continue with
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={loading}
              >
                <IconBrandGithub className='mr-2 h-4 w-4' /> GitHub
              </Button>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={loading}
              >
                <IconBrandFacebook className='mr-2 h-4 w-4' /> Facebook
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
