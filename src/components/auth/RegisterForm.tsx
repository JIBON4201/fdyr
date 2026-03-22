// =====================================================
// REGISTER FORM COMPONENT
// User registration with invite code requirement
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useUserStore, useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Shield, ArrowLeft } from 'lucide-react';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const { setActivePage } = useAppStore();

  // Generate captcha on mount
  useEffect(() => {
    setCaptchaValue(Math.floor(1000 + Math.random() * 9000).toString());
  }, []);

  const refreshCaptcha = () => {
    setCaptchaValue(Math.floor(1000 + Math.random() * 9000).toString());
    setCaptcha('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate captcha
    if (captcha !== captchaValue) {
      setError('Invalid verification code');
      refreshCaptcha();
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, confirmPassword, inviteCode }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);
        window.location.hash = '/hor';
      } else {
        setError(data.error || 'Registration failed');
        refreshCaptcha();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button 
          onClick={() => {
            setActivePage('login');
            window.location.hash = '/login';
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-lg">Registration</h1>
        <div className="w-9"></div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="6-16 letters or numbers"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 py-6 bg-gray-50 border-gray-200"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="6-16 alphanumeric password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 py-6 bg-gray-50 border-gray-200"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Please enter the password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 py-6 bg-gray-50 border-gray-200"
                required
              />
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Invitation code (required)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="pl-10 py-6 bg-gray-50 border-gray-200"
                required
              />
            </div>
          </div>

          {/* Captcha */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Verification Code"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200"
                  required
                />
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="bg-green-100 text-green-700 font-bold text-xl px-4 rounded-lg border border-green-200 hover:bg-green-200 transition-colors"
                style={{ fontFamily: 'cursive', letterSpacing: '2px' }}
              >
                {captchaValue}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#6B0000] hover:bg-[#8B0000] text-white py-6 text-lg font-medium"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Registration'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => {
                setActivePage('login');
                window.location.hash = '/login';
              }}
              className="text-[#6B0000] font-medium hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
