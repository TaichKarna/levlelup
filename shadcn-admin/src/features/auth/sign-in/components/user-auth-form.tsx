import { HTMLAttributes, useState } from 'react'
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
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
import { PasswordInput } from '@/components/password-input'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
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
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Clear error when component unmounts or form changes
  useEffect(() => {
    return () => {
      if (clearError) clearError()
    }
  }, [clearError])

  // Reset form errors when inputs change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (error && clearError) clearError()
    })
    return () => subscription.unsubscribe()
  }, [form, error, clearError])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await login(data)
      navigate({ to: '/' })
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {error && (
        <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
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
                  <div className='flex items-center justify-between'>
                    <FormLabel>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading} type='submit'>
              {isLoading ? 'Logging in...' : 'Login'}
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

            <div className='flex items-center justify-center gap-2'>
              <a href='/api/auth/github'>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  disabled={isLoading}
                >
                  <IconBrandGithub className='mr-2 h-4 w-4' /> GitHub
                </Button>
              </a>
              <a href='/api/auth/google'>
                <Button
                  variant='outline'
                  className='w-full'
                  type='button'
                  disabled={isLoading}
                >
                  <IconBrandGoogle className='mr-2 h-4 w-4' /> Google
                </Button>
              </a>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
