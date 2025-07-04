"use client";

import type React from "react";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Icon} from "@iconify/react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {CUSTOM_CODES} from "@/app/types/types.utils";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthError, selectUser, selectUserLoading} from "@/store/auth/selectors";
import {toast} from "sonner";
import {clearAuthError, loginStart} from "@/store/auth/actions";
import {sendOtp} from "@/lib/helpers";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [OTPSentMessage, setOTPSentMessage] = useState("");
  const [customErrorCode, setCustomErrorCode] = useState<CUSTOM_CODES | null>(null);
  const [loadingState, setLoadingState] = useState<{auth: boolean; OTP: boolean}>({
    auth: false,
    OTP: false,
  });
  const currentUser = useSelector(selectUser);
  const authLoading = useSelector(selectUserLoading);
  const authError = useSelector(selectAuthError);
  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser]);


  useEffect(() => {
    setLoadingState((prev) => ({...prev, auth: authLoading}));
  }, [authLoading]);

  useEffect(() => {
    console.log("\n\n Auth error : ", authError)
    if (!authError) {
      return;
    }

    if (
      [CUSTOM_CODES.ADMIN_CREATED_UNVERIFIED, CUSTOM_CODES.SELF_CREATED_UNVERIFIED].some(
        (code) => code === authError.customCode,
      )
    ) {
      setCustomErrorCode(authError.customCode);
    }
    let errorMessage = "";

    if (authError.customCode === CUSTOM_CODES.SELF_CREATED_UNVERIFIED) {
      errorMessage = "You need to verify your email to login";
    } else if (authError.customCode === CUSTOM_CODES.INVALID_CREDENTIALS) {
      errorMessage = "Invalid Credentials";
    } else{
      errorMessage = "An error occurred during login";
    }
    errorMessage && showErrorToast(errorMessage);

    return () => {
      dispatch(clearAuthError());
    }
  }, [authError]);

  useEffect(() => {
    if (OTPSentMessage.trim()) {
      const timer = setTimeout(() => {
        setOTPSentMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [OTPSentMessage]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("You need to provide a password and email !");
      return;
    } else {
      setErrorMessage("");
      dispatch(loginStart(email, password));
    }
  };

  const handleCustomCodeAction = async (code: CUSTOM_CODES) => {
    setLoadingState((prev) => ({...prev, OTP: true}));
    if (code === CUSTOM_CODES.BLOCKED_BY_ADMIN) {
      return;
    }
    if (!email.trim()) {
      setErrorMessage("You need to provide your email address");

      return;
    }

    if (code == CUSTOM_CODES.SELF_CREATED_UNVERIFIED) {
      try {
        const response = await sendOtp({mode: "otp", email});
        // const user_id = response.data.id;

        router.push(`verify-otp?q=${encodeURIComponent(email)}`);
      } catch (error: any) {
        setErrorMessage("Failed to send OTP");
      }
    } else if (code == CUSTOM_CODES.ADMIN_CREATED_UNVERIFIED) {
      try {
        await sendOtp({mode: "password_link", email});
        setOTPSentMessage(`We have sent an email to ${email}, check your inbox`);
      } catch (error: any) {
        setErrorMessage("Failed to send email");
      }
    }
    setLoadingState((prev) => ({...prev, OTP: false}));
  };

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Login</h1>
        <p className="text-gray-600">Enter your credentials to access your account</p>
      </div>

      {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}

      {customErrorCode && customErrorCode && (
        <p className="text-sm w-full text-center">
          {loadingState.OTP ? (
            <span className=" opacity-80 animate-bounce">Sending...</span>
          ) : (
            <span
              className="text-primary font-semibold cursor-pointer underline-offset-2 underline hover:cursor-pointer"
              onClick={() => handleCustomCodeAction(customErrorCode)}
            >
              Send{" "}
              {customErrorCode === CUSTOM_CODES.SELF_CREATED_UNVERIFIED ? "OTP" : "Password link"}{" "}
              to this email
            </span>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            className="h-12 rounded-2xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              className="h-12 pr-10 rounded-2xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-700 hover:underline hover:underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary-700 rounded-full"
          disabled={isLoading}
        >
          {loadingState.auth ? (
            <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
        <span className="text-sm w-fit text-center opacity-70 mx-auto mt-8">
          Already have an account ?{" "}
          <Link className=" text-primary underline-offset-4 hover:underline" href="/signup">
            {" "}
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
}
