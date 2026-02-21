import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import axiosClient from "@/axiosClient";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import useUserStore from "@/stores/useUserStore";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function Login() {
  const { setUser, setToken, setTokenExpiresAt } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit() {
    const values = form.getValues();
    setIsLoading(true);

    axiosClient
      .post("/login", values)
      .then(({ data }) => {
        if (data.success) {
          setUser(data.user);
          setToken(data.token);
          setTokenExpiresAt(data.expires_at);
        } else {
          toast.error(data.message);
        }
      })
      .catch((err) => {
        const response = err.response;
        if (response?.status === 422) {
          const errorMessage = Object.entries(response.data.errors)
            .map(([key, value]) => `${key}: ${value.join(", ")}`)
            .join("\n");
          toast.error(errorMessage);
        } else if (response?.status === 403) {
          toast.error("Not authorized. Please contact your administrator.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="auth-card w-full p-8 lg:p-10">
      <div className="mb-6">
        <span className="text-blue-500 font-semibold text-lg">Hello there!</span>
        <br />
        <span className="text-gray-600 text-sm">Please sign in to continue.</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    autoComplete="email"
                    className="form-input-modern"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      className="pr-10 form-input-modern"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-auto hover:bg-transparent"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full btn-primary-gradient text-white mt-2"
            disabled={isLoading}
          >
            {isLoading && <LoaderCircle className="animate-spin mr-2" size={18} />}
            Sign In
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          to="/guest/register"
          className="text-blue-500 hover:underline hover:text-blue-600 duration-200"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
