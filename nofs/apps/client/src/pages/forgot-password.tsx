import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
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
import { Mail, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";
import { useForgotPassword } from "@repo/api-client-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPasswordMutation.mutateAsync({ data: { email: values.email } });
      setSubmittedEmail(values.email);
      setSubmitted(true);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
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
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-4"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">Check your inbox</h2>
            <p className="text-muted-foreground mb-2">
              If <span className="text-white font-medium">{submittedEmail}</span> is
              registered, you'll receive a temporary password shortly.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Use that temporary password on the Reset Password page to set a new permanent password.
            </p>
            <div className="w-full space-y-3">
              <Button
                className="w-full h-11 gap-2"
                onClick={() =>
                  setLocation(
                    `/reset-password?email=${encodeURIComponent(submittedEmail)}`,
                  )
                }
              >
                <KeyRound className="w-4 h-4" />
                Reset Password
              </Button>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11 border-white/10 text-white/70 hover:text-white hover:bg-white/5">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white text-center">Forgot password?</h2>
              <p className="text-muted-foreground mt-2 text-center text-sm">
                Enter your email and we'll send you a temporary password.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Sending..." : "Send temporary password"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center space-y-3">
              <Link href="/login">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </span>
              </Link>
              <div>
                <Link href="/reset-password">
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline cursor-pointer font-medium">
                    <KeyRound className="w-4 h-4" />
                    Already have a temporary password?
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
