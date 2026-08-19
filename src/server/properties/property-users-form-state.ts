export type PropertyUserFormState = {
  message?: string;
  status: "idle" | "error" | "success";
};

export const initialPropertyUserFormState: PropertyUserFormState = { status: "idle" };
