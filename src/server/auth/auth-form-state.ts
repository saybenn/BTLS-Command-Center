export type AuthFormState = {
  fieldErrors?: Partial<Record<"email" | "password" | "passwordConfirmation", string>>;
  message?: string;
  status: "error" | "idle" | "success";
};

export const initialAuthFormState: AuthFormState = { status: "idle" };
