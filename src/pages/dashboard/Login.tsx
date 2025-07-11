import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/auth-context';
import AmaiLogo from '@/components/AmaiLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <div className="bg-neutral-800 px-8 pt-8 pb-6">
            <div className="mb-6 text-center">
              <div className="relative mb-4 inline-block">
  <AmaiLogo subtitle="ADMIN" />
</div>
              <h2 className="text-2xl font-bold text-white">Dashboard Login</h2>
              <p className="mt-2 text-sm text-gray-400">
                Enter your credentials to access the dashboard
              </p>
            </div>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="manager@amaibarbershop.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  (For demo, use any password)
                </p>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 py-2 px-4 text-center font-medium text-white shadow-lg hover:from-amber-600 hover:to-yellow-600 focus:outline-none disabled:opacity-70"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Demo accounts:<br />
                <span className="text-gray-400">Manager:</span> manager@amaibarbershop.com<br />
                <span className="text-gray-400">Barber:</span> alex@amaibarbershop.com
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-700 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} AMAI Men's Care
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  Modern barbershop management system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
