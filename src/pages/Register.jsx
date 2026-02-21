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
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import useUserStore from "@/stores/useUserStore";

const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" })
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    password_confirmation: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });

export default function Register() {
  const { setUser, setToken, setTokenExpiresAt } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  function onSubmit() {
    const values = form.getValues();
    setIsLoading(true);

    axiosClient
      .post("/register", values)
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
        } else {
          toast.error("An error occurred. Please try again.");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="auth-card w-full p-8 lg:p-10">
      <div className="mb-6">
        <span className="text-blue-500 font-semibold text-lg">Create Account</span>
        <br />
        <span className="text-gray-600 text-sm">Fill in the details below to register.</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    className="form-input-modern"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                    className="form-input-modern"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                    className="form-input-modern"
                  />
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
            Register
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          to="/guest/login"
          className="text-blue-500 hover:underline hover:text-blue-600 duration-200"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
