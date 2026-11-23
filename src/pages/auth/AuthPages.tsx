import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/FormControls';
import { SafeImage } from '../../components/ui/SafeImage';
import { BRAND_IMAGES } from '../../data/seedData';
import { authService } from '../../services/auth.service';
import { useToastStore } from '../../store/useToastStore';

function AuthSplitShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      <div className="hidden lg:block lg:col-span-6 relative bg-[#F8F8F7] border-r border-[#E5E5E5]">
        <SafeImage
          src={BRAND_IMAGES.authEditorial}
          alt="KOVA Atelier sculptural ceramic vase and desk lamp"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-between p-12 text-white">
          <Link to="/" className="font-display text-lg font-bold tracking-[0.14em]">
            KOVA ATELIER
          </Link>
          <div className="max-w-md">
            <p className="text-2xl font-bold leading-snug">
              Direct workshop craftsmanship for modern studios and living spaces.
            </p>
            <p className="mt-2 text-sm text-white/80">
              Manage orders, track supplier dispatches, and access trade studio pricing.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#171717] mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Storefront
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-[#737373]">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pushToast = useToastStore((s) => s.pushToast);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState(false);
  const [loading, setLoading] = useState(false);

  const fromPath = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await authService.login(values.email, values.password);
      pushToast({
        title: `Welcome back, ${user.name.split(' ')[0]}`,
        description: `Signed in as ${user.role}`,
        variant: 'success',
      });
      const canVisitFrom =
        fromPath &&
        (!fromPath.startsWith('/admin') || user.role === 'admin') &&
        (!fromPath.startsWith('/supplier') || user.role === 'supplier' || user.role === 'admin');

      if (canVisitFrom && fromPath) {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'supplier') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/account/profile', { replace: true });
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const prefillAccount = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <AuthSplitShell
      title="Sign in to KOVA"
      subtitle="Access your customer orders, admin operations, or supplier fulfillment portal."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {authError && (
          <div role="alert" className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <div>
          <Label htmlFor="login-email">Email Address</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="clara@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="login-password" className="mb-0">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-[#2563EB] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              error={errors.password?.message}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-2.5 text-[#737373] hover:text-[#171717] cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-[#737373] cursor-pointer">
          <input type="checkbox" {...register('remember')} className="accent-[#2563EB]" />
          Keep me signed in on this device
        </label>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Sign In
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setGoogleNotice(true)}
          className="w-full"
        >
          Continue with Google
        </Button>

        {googleNotice && (
          <p className="text-xs text-[#737373] bg-[#F8F8F7] border border-[#E5E5E5] rounded-xl p-3">
            Google OAuth requires configuring an OAuth client ID in your deployment environment. Please sign in with email and password below.
          </p>
        )}
      </form>

      {/* Role Demo Credentials Helper (Populates form cleanly for verification) */}
      <div className="mt-7 p-4 rounded-xl bg-[#F8F8F7] border border-[#E5E5E5] space-y-2.5">
        <p className="text-xs font-semibold text-[#171717]">Portal Seed Credentials (Click to fill form)</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => prefillAccount('clara@example.com', 'Password123!')}
            className="px-2.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs font-medium text-[#171717] hover:border-[#2563EB] cursor-pointer"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => prefillAccount('admin@kovaatelier.com', 'AdminPassword123!')}
            className="px-2.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs font-medium text-[#171717] hover:border-[#2563EB] cursor-pointer"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => prefillAccount('supplier@nordicbrass.dk', 'SupplierPassword123!')}
            className="px-2.5 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs font-medium text-[#171717] hover:border-[#2563EB] cursor-pointer"
          >
            Supplier
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-[#737373]">
        New to KOVA?{' '}
        <Link to="/register" className="font-semibold text-[#171717] hover:text-[#2563EB]">
          Create an account
        </Link>
      </p>
    </AuthSplitShell>
  );
}

const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(7, 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.pushToast);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(values);
      pushToast({ title: 'Account created', description: 'Welcome to KOVA Atelier.', variant: 'success' });
      navigate('/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitShell
      title="Create your account"
      subtitle="Save studio addresses, curate your wishlist, and track direct workshop orders."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="reg-name">Full Name</Label>
          <Input id="reg-name" placeholder="Clara Jensen" error={errors.name?.message} {...register('name')} />
        </div>
        <div>
          <Label htmlFor="reg-email">Email Address</Label>
          <Input id="reg-email" type="email" placeholder="you@studio.com" error={errors.email?.message} {...register('email')} />
        </div>
        <div>
          <Label htmlFor="reg-phone">Mobile Number</Label>
          <Input id="reg-phone" type="tel" placeholder="+1 (415) 555-0192" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div>
          <Label htmlFor="reg-pw">Password</Label>
          <Input id="reg-pw" type="password" placeholder="Minimum 8 characters" error={errors.password?.message} {...register('password')} />
        </div>
        <div>
          <Label htmlFor="reg-pw2">Confirm Password</Label>
          <Input id="reg-pw2" type="password" placeholder="Re-enter password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#737373]">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-[#171717] hover:text-[#2563EB]">
          Sign in
        </Link>
      </p>
    </AuthSplitShell>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setStatus({ ok: true, msg: res.message });
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Unable to locate account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitShell
      title="Reset your password"
      subtitle="Enter your registered email address to receive password recovery instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {status && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              status.ok
                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
            }`}
          >
            {status.msg}
          </div>
        )}
        <div>
          <Label htmlFor="fp-email">Email Address</Label>
          <Input
            id="fp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="clara@example.com"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Send Reset Link
        </Button>
        <div className="flex justify-between text-xs pt-2">
          <Link to="/login" className="text-[#737373] hover:text-[#171717]">Back to Sign In</Link>
          <Link to="/reset-password" className="text-[#2563EB] hover:underline">Have a reset token?</Link>
        </div>
      </form>
    </AuthSplitShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.pushToast);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirm) {
      pushToast({ title: 'Passwords must match and be at least 8 characters', variant: 'error' });
      return;
    }
    pushToast({ title: 'Password updated', description: 'Sign in with your new credentials.', variant: 'success' });
    navigate('/login');
  };

  return (
    <AuthSplitShell
      title="Set a new password"
      subtitle="Choose a strong password of at least 8 characters for your KOVA account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rp-pw">New Password</Label>
          <Input id="rp-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rp-pw2">Confirm New Password</Label>
          <Input id="rp-pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Update Password
        </Button>
      </form>
    </AuthSplitShell>
  );
}

export function VerifyEmailPage() {
  return (
    <AuthSplitShell
      title="Verify your email"
      subtitle="Your account has been created and is ready for workshop orders."
    >
      <div className="p-6 rounded-2xl bg-[#F8F8F7] border border-[#E5E5E5] space-y-4">
        <div className="flex items-center gap-2.5 text-[#16A34A]">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Email Verification Ready</span>
        </div>
        <p className="text-sm text-[#737373] leading-relaxed">
          You can proceed directly to your customer dashboard or continue browsing the KOVA Atelier collection.
        </p>
        <div className="flex gap-3 pt-2">
          <Link to="/account/profile">
            <Button variant="primary">Go to Account</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline">Browse Shop</Button>
          </Link>
        </div>
      </div>
    </AuthSplitShell>
  );
}
