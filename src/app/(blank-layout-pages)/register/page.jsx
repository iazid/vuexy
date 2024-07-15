// Component Imports
import Register from '@views/Register'  // Assure-toi que le chemin vers le composant Register est correct

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Register',  // Mise à jour du titre pour la page d'inscription
  description: 'Register for a new account'  // Mise à jour de la description pour la page d'inscription
}

const RegisterPage = () => {
  // Vars
  const mode = getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
