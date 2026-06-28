"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    toast.loading("Logging in...", { id: "login-toast" });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message, { id: "login-toast" });
      return;
    }

    toast.success("Logged in successfully!", { id: "login-toast" });
    router.push("/dashboard/school"); // Redirect to dashboard
    router.refresh();
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email Address</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="remember"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="login-remember"
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="login-remember" className="font-normal">
                  Remember me for 30 days
                </FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full" type="submit">
        Login
      </Button>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-4 text-center text-muted-foreground text-sm">Developer Quick Login</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                form.setValue("email", "md_local@school.com");
                form.setValue("password", "password123");
                onSubmit({ email: "md_local@school.com", password: "password123" });
              }}
            >
              MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                form.setValue("email", "teacher1_local@school.com");
                form.setValue("password", "password123");
                onSubmit({ email: "teacher1_local@school.com", password: "password123" });
              }}
            >
              Teacher
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                form.setValue("email", "student1_local@school.com");
                form.setValue("password", "password123");
                onSubmit({ email: "student1_local@school.com", password: "password123" });
              }}
            >
              Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                form.setValue("email", "principal_local@school.com");
                form.setValue("password", "password123");
                onSubmit({ email: "principal_local@school.com", password: "password123" });
              }}
            >
              Principal
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
