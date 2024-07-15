'use client'

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../app/firebase/firebaseconfigdb';
import { getFirestore, addDoc, collection, getDocs} from "firebase/firestore"; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';

import Logo from '@components/layout/shared/Logo';
import CustomTextField from '@core/components/mui/TextField';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const db = getFirestore();

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const response = await createUserWithEmailAndPassword(email, password);
      if (response.user) {
        // Add a new document in Firestore
        const userDocRef = await addDoc(collection(db, "users"), {
          username: username,
          email: email
        });
        console.log("Document written with ID: ", userDocRef.id);
        router.push('/login'); // Navigate to login page after account creation
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-backgroundPaper'>
      <div className='p-6 md:p-12 md:max-w-sm w-full'>
        <Logo />
        <Typography variant='h4' mb={2}>Adventure starts here 🚀</Typography>
        <form noValidate autoComplete='off' onSubmit={handleSignUp}>
          <CustomTextField
            autoFocus
            fullWidth
            label='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <CustomTextField
            fullWidth
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
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
                  <IconButton onClick={() => setIsPasswordShown(!isPasswordShown)}>
                    <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel control={<Checkbox />} label="I agree to the privacy policy & terms" />
          <Button type='submit' fullWidth variant='contained' sx={{ my: 2 }}>
            Sign Up
          </Button>
          <Typography textAlign="center">
            Already have an account? <Link href='/login' style={{ color: 'var(--mui-palette-primary-main)' }}>Sign in instead</Link>
          </Typography>
          
        </form>
      </div>
    </div>
  );
};

export default SignIn;
