'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { initializeRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase/auth';
import { useDispatch } from 'react-redux';
import { authSlice } from '@/lib/store/slices/authSlice';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Initialize reCAPTCHA
    if (typeof window !== 'undefined') {
      initializeRecaptcha('recaptcha-container');
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend OTP
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    
    try {
      const recaptcha = initializeRecaptcha('recaptcha-container');
      const result = await sendOTP(phoneNumber, recaptcha);
      
      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setStep('otp');
        setCountdown(60);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      const result = await verifyOTP(verificationId, otp);
      
      if (result.success && result.user) {
        // Update Redux store
        dispatch(authSlice.actions.setUser(result.user));
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Invalid OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const recaptcha = initializeRecaptcha('recaptcha-container');
      const result = await sendOTP(phoneNumber, recaptcha);
      
      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setCountdown(60);
        toast.success('OTP resent successfully!');
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">भर</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Bharat Breed Rakshask
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage your livestock
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === 'phone' ? (
                <>
                  <Phone className="w-5 h-5" />
                  Enter Phone Number
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                      <span className="text-sm">+91</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none accessibility-button"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send you a verification code
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full accessibility-button"
                  disabled={loading || phoneNumber.length < 10}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest accessibility-button"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    OTP sent to +91 {phoneNumber}
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full accessibility-button"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </Button>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setCountdown(0);
                  }}
                >
                  Change Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <Badge variant="outline" className="w-full py-2">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <p className="text-xs text-muted-foreground">OTP Login</p>
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="w-full py-2">
              78
            </Badge>
            <p className="text-xs text-muted-foreground">Breeds</p>
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="w-full py-2">
              🇮🇳
            </Badge>
            <p className="text-xs text-muted-foreground">Indian</p>
          </div>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" className="hidden"></div>
      </div>
    </div>
  );
};

export default LoginPage;