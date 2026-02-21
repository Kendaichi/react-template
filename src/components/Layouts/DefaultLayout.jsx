import useUserStore from "@/stores/useUserStore";
import React, { useEffect, useState, useRef } from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import axiosClient from "@/axiosClient";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Home,
  Settings,
  Key,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

// Helper: renders a collapsible submenu when sidebar is expanded,
// or a dropdown when sidebar is collapsed (icon mode).
function SidebarMenuWithSubmenu({ icon: Icon, label, items }) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={label}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48">
            {items.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => navigate(item.path)}
                className="cursor-pointer"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={label}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item, index) => (
              <SidebarMenuSubItem key={index}>
                <SidebarMenuSubButton onClick={() => navigate(item.path)}>
                  <span className="text-gray-300">{item.label}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function DefaultLayout() {
  const { user, token, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await axiosClient.get("/user");
        setUser(data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [token]);

  function handleLogout() {
    const { logout } = useUserStore.getState();
    axiosClient
      .get("/logout")
      .catch(() => {})
      .finally(() => {
        logout();
        window.location.href = "/guest/login";
      });
  }

  const newPasswordSchema = z
    .object({
      new_password: z.string().min(8, { message: "Password must be at least 8 characters." }),
      new_password_confirmation: z.string().min(8, { message: "Password must be at least 8 characters." }),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: "Passwords don't match",
      path: ["new_password_confirmation"],
    });

  const newPasswordForm = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { new_password: "", new_password_confirmation: "" },
  });

  function onChangePasswordSubmit() {
    const { new_password, new_password_confirmation } = newPasswordForm.getValues();
    setSubmitting(true);
    axiosClient
      .patch(`/users/${user?.id}/change-password`, { new_password, new_password_confirmation })
      .then(() => {
        newPasswordForm.reset();
        toast.info("Password Updated!");
      })
      .catch((err) => {
        const response = err.response;
        if (response?.status === 422) {
          const errorMessage = Object.entries(response.data.errors)
            .map(([key, value]) => `${key}: ${value.join(", ")}`)
            .join("\n");
          toast.error(errorMessage);
        }
      })
      .finally(() => setSubmitting(false));
  }

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 60 * 60 * 1000); // 1 hour idle timeout
  };

  useEffect(() => {
    if (!token) return;
    resetTimeout();
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keydown", resetTimeout);
    return () => {
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/guest/login" />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      {loading && (
        <div className="absolute bg-gray-50 w-full h-full z-50 flex flex-col justify-center items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}

      <Sidebar collapsible="icon">
        <SidebarHeader className="bg-gray-800">
          <Link to="/" className="flex items-center justify-center p-2">
            <span className="text-white font-bold text-lg group-data-[collapsible=icon]:hidden">
              AppName
            </span>
            <span className="text-white font-bold text-lg hidden group-data-[collapsible=icon]:block">
              A
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="text-gray-300 bg-gray-800">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/")} tooltip="Home">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Example submenu — customize or remove as needed */}
              {(user?.roles?.includes("super-admin") ||
                user?.roles?.includes("admin")) && (
                <SidebarMenuWithSubmenu
                  icon={Settings}
                  label="Settings"
                  items={[
                    { label: "Users", path: "/users" },
                    { label: "Roles", path: "/roles" },
                  ]}
                />
              )}

              {(user?.roles?.includes("super-admin") ||
                user?.roles?.includes("admin")) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/users")}
                    tooltip="Users"
                  >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-gray-800">
          <div className="p-2 text-center text-xs font-semibold text-gray-300 group-data-[collapsible=icon]:hidden">
            <div>AppName | v1.0</div>
            <span>All rights reserved © 2025</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col w-full h-screen overflow-hidden relative">
        <header className="bg-gray-50 flex shadow pr-3 md:pr-10 md:gap-5 py-1 z-10 flex-shrink-0">
          <div className="grow flex px-1 lg:px-3 gap-2 items-center">
            <SidebarTrigger />
          </div>

          <div className="place-self-center flex gap-1">
            <Avatar>
              <AvatarImage src={user?.profile_image} alt="user_image" />
              <AvatarFallback className="bg-gray-400 uppercase text-white font-bold">
                {user?.name ? user.name.charAt(0) : "#"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block place-self-center text-sm">
              {user?.name}
            </div>
          </div>

          <div className="place-self-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                <DropdownMenuLabel className="lg:text-sm text-xs">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Key className="mr-2 h-4 w-4" />
                      <span className="lg:text-sm text-xs">Change Password</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="text-xs lg:text-sm">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      This will update your account password.
                    </DialogDescription>
                    <Form {...newPasswordForm}>
                      <form
                        onSubmit={newPasswordForm.handleSubmit(onChangePasswordSubmit)}
                        className="flex flex-col justify-center"
                      >
                        <FormField
                          control={newPasswordForm.control}
                          name="new_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="New Password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={newPasswordForm.control}
                          name="new_password_confirmation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm Password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <br />
                        <DialogFooter>
                          <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Submit"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="lg:text-sm text-xs">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <div className="min-w-0 flex-1 overflow-auto min-h-0 relative z-10 custom-scrollbar">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
