"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import apiRequest from "@/lib/apiRequest";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.otp_code as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid or missing token.");
      router.push("/login");
    }
  }, [token, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");

      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest.post("user/reset-password/", {
        token,
        new_password: newPassword,
      });

      if (response.status === 200) {
        router.push("/login?password_reset=true");
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Enter your new password below</p>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="grid gap-4">
            {errorMessage && <div className="text-red-500 text-center mt-2">{errorMessage}</div>}
            <Input
              required
              className="text-lg"
              id="new-password"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              required
              className="text-lg"
              id="confirm-password"
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Button
                className="p-0 text-primary"
                variant="link"
                onClick={() => router.push("/login")}
              >
                Login here
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
