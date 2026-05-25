import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "@repo/api-client-react";
import { useToast } from "@/hooks/use-toast";

const schema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    temporaryPassword: z.string().min(1, "Temporary password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [done, setDone] = useState(false);
  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const resetPasswordMutation = useResetPassword();

  const params = new URLSearchParams(search);
  const emailFromQuery = params.get("email") ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailFromQuery,
      temporaryPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPasswordMutation.mutateAsync({
        data: {
          email: values.email,
          currentPassword: values.temporaryPassword,
          newPassword: values.newPassword,
        },
      });
      setDone(true);
    } catch (err: unknown) {
      const status =
        err &&
        typeof err === "object" &&
        "status" in err
          ? (err as { status: number }).status
          : 0;

      if (status === 401) {
        toast({
          title: "Invalid or expired temporary password",
          description:
            "Please request a new temporary password from the Forgot Password page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset failed",
          description: "Please check your details and try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-card border border-card-border p-8 rounded-2xl shadow-2xl"
      >
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-4"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">
              Password updated!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>
            <Button className="w-full h-11" onClick={() => setLocation("/login")}>
              Sign In
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white text-center">
                Reset password
              </h2>
              <p className="text-muted-foreground mt-2 text-center text-sm">
                Enter the temporary password from your email and choose a new
                password.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          {...field}
                          className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temporaryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">
                        Temporary password{" "}
                        <span className="text-muted-foreground font-normal">
                          (from email)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showTemp ? "text" : "password"}
                            placeholder="Enter the code from your email"
                            {...field}
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-primary pr-10 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTemp((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            {showTemp ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">New password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNew ? "text" : "password"}
                            placeholder="At least 8 characters"
                            {...field}
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-primary pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            {showNew ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Confirm new password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter your new password"
                            {...field}
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-primary pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium mt-2"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? "Updating password..."
                    : "Reset Password"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center space-y-2">
              <Link href="/forgot-password">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Request a new temporary password
                </span>
              </Link>
              <div>
                <Link href="/login">
                  <span className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">
                    Back to Sign In
                  </span>
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
