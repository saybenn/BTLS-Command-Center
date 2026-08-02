import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Field } from "@/components/forms/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("shared core controls", () => {
  it("disables loading buttons and communicates the busy state", async () => {
    const user = userEvent.setup();
    let calls = 0;

    render(
      <Button loading onClick={() => (calls += 1)}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.click(button);

    expect(calls).toBe(0);
  });

  it("associates labels, descriptions, and errors with a form field", () => {
    render(
      <Field
        description="Use the public business name."
        error="Enter a business name."
        label="Business name"
        required
      >
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText(/business name/i);
    const description = screen.getByText("Use the public business name.");
    const error = screen.getByText("Enter a business name.");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", `${description.id} ${error.id}`);
    expect(screen.getByText("(required)")).toHaveClass("sr-only");
  });

  it("moves focus into a dialog and restores it after Escape", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open details</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Review details</DialogTitle>
          <DialogDescription>Confirm the change before continuing.</DialogDescription>
          <Button>Confirm</Button>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open details" });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveAccessibleName("Review details");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });

  it("supports keyboard tab navigation", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Lead detail sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>,
    );

    const overview = screen.getByRole("tab", { name: "Overview" });

    overview.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Activity panel")).toBeVisible();
  });

  it("opens and selects options with the keyboard", async () => {
    const user = userEvent.setup();

    render(
      <Select defaultValue="new">
        <SelectTrigger aria-label="Lead status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Lead status" });

    trigger.focus();
    await user.keyboard("{ArrowDown}");

    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("option", { name: "Contacted" })).toHaveAttribute("data-highlighted");

    await user.keyboard("{Enter}");

    expect(trigger).toHaveTextContent("Contacted");
  });

  it("uses assertive announcements only when requested", () => {
    const { rerender } = render(<Alert>Saved successfully.</Alert>);

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully.");

    rerender(<Alert assertive>Could not save changes.</Alert>);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not save changes.");
  });
});
