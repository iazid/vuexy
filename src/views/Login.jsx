'use client'

// React Imports
import { useState } from 'react';

// Firebase hooks and config imports
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../app/firebase/firebaseconfigdb';

// Next Imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

// Component Imports
import Logo from '@components/layout/shared/Logo';
import CustomTextField from '@core/components/mui/TextField';

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}));

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
});

const LoginV2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [signInWithEmailAndPassword, user ] = useSignInWithEmailAndPassword(auth);

  const router = useRouter();
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickShowPassword = () => setIsPasswordShown(!isPasswordShown);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
        router.push('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className='flex bs-full justify-center'>
      <div
        className='flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden'
        style={{ border: '1px solid transparent' }} // Example of inline style if needed
      >
        <LoginIllustration src='/images/illustrations/auth/v2-login-dark.png' alt='Login Illustration' />
        {!hidden && <MaskImg src='/images/pages/auth-mask-dark.png' alt='Background Mask' />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Welcome to MyApp! 👋🏻</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          <Alert severity="info">Admin credentials: admin@vuexy.com / pass123</Alert>
          <form noValidate autoComplete='off' onSubmit={handleLogin} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={handleClickShowPassword} onMouseDown={(e) => e.preventDefault()}>
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <FormControlLabel control={<Checkbox />} label="Remember me" />
            <Button type='submit' fullWidth variant='contained' sx={{ my: 2 }}>
              Login
            </Button>
            <Typography textAlign="center">
              New here? <Link href='/register' style={{ color: theme.palette.primary.main }}>Sign up</Link>
            </Typography>
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Button
              color='secondary'
              fullWidth
              startIcon={<img src='/images/logos/google.png' alt='Google' width={22} />}
            >
              Sign in with Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginV2;
