import { Inbox, RotateCcw } from "lucide-react";

import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Field } from "@/components/forms/field";
import { PageHeader } from "@/components/layout/page-header";
import {
  TableShell,
  TableShellBody,
  TableShellCaption,
  TableShellCell,
  TableShellHead,
  TableShellHeader,
  TableShellRow,
} from "@/components/tables/table-shell";
import { ThemeControl } from "@/components/theme/theme-control";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";

function ShowcaseSection({
  children,
  description,
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  title: string;
}>) {
  return (
    <section
      aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}
      className="space-y-4"
    >
      <div>
        <h2
          id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}
          className="text-xl font-semibold tracking-tight text-text-primary"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SharedUiFoundationShowcase() {
  return (
    <section aria-label="Shared UI foundation showcase" className="space-y-12">
      <PageHeader
        description="Illustrative examples only. They do not fetch, mutate, authorize, or navigate to product data."
        primaryAction={<Button disabled>Primary action unavailable</Button>}
        secondaryControls={<Button variant="secondary">Secondary control</Button>}
        title="UI Foundation showcase"
      />

      <ShowcaseSection
        description="Shared controls retain their native and Radix accessibility behavior."
        title="Primitives"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions and status</CardTitle>
              <CardDescription>
                Explicit button variants and semantic status treatment.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary action</Button>
              <Button variant="ghost">Ghost action</Button>
              <Button variant="danger">Danger action</Button>
              <Badge variant="success">Ready</Badge>
              <Badge variant="warning">Needs review</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Controlled choices</CardTitle>
              <CardDescription>
                Small examples for Radix-backed dialog, select, and tabs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Open example dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Example dialog</DialogTitle>
                    <DialogDescription>
                      This illustrative dialog does not change any product data.
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
                <Select defaultValue="review">
                  <SelectTrigger aria-label="Illustrative workflow state" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Ready to review</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs defaultValue="overview">
                <TabsList aria-label="Illustrative content sections">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">Overview content is visible.</TabsContent>
                <TabsContent value="details">Detail content is visible.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Field composition</CardTitle>
              <CardDescription>
                Visible labels, help text, required indicators, and linked errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field
                description="This illustrative value is not saved."
                label="Business name"
                required
              >
                <Input defaultValue="Brightway Plumbing" />
              </Field>
              <Field error="Enter a concise internal note." label="Internal note">
                <Textarea defaultValue="" />
              </Field>
            </CardContent>
          </Card>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        description="Every feedback example uses concise, actionable, illustrative copy."
        title="Feedback states"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingState
            className="rounded-xl border border-border bg-surface p-6"
            label="Loading example"
          />
          <EmptyState
            action={<Button variant="secondary">Add the first record</Button>}
            description="New records will appear here when they are available."
            icon={Inbox}
            title="Nothing to review yet"
          />
          <ErrorState
            action={
              <Button variant="secondary">
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
            }
            description="Check your connection and try again. If this keeps happening, contact your BTLS administrator."
          />
        </div>
        <Alert variant="success">
          <AlertTitle>Changes saved</AlertTitle>
          <AlertDescription>Your illustrative workspace settings are up to date.</AlertDescription>
        </Alert>
      </ShowcaseSection>

      <ShowcaseSection
        description="Dense tables retain native semantics and scroll horizontally on narrow screens."
        title="Table shell"
      >
        <TableShell className="min-w-[42rem]">
          <TableShellCaption>Illustrative recent activity table</TableShellCaption>
          <TableShellHeader>
            <TableShellRow>
              <TableShellHead>Item</TableShellHead>
              <TableShellHead>Status</TableShellHead>
              <TableShellHead alignment="end">Open tasks</TableShellHead>
            </TableShellRow>
          </TableShellHeader>
          <TableShellBody>
            <TableShellRow>
              <TableShellCell>Website content review</TableShellCell>
              <TableShellCell>Ready to review</TableShellCell>
              <TableShellCell alignment="end">3</TableShellCell>
            </TableShellRow>
          </TableShellBody>
        </TableShell>
      </ShowcaseSection>

      <ShowcaseSection
        description="Page headers make the primary action and supporting controls clear at every viewport."
        title="Page header"
      >
        <Card>
          <PageHeader
            description="An illustrative header with one primary action and an optional secondary control."
            primaryAction={<Button>Illustrative primary action</Button>}
            secondaryControls={<Button variant="secondary">Illustrative secondary control</Button>}
            title="Illustrative page title"
          />
        </Card>
      </ShowcaseSection>

      <ShowcaseSection
        description="Theme selection is persisted locally and uses the same semantic tokens across all examples."
        title="Theme"
      >
        <Card>
          <ThemeControl />
        </Card>
      </ShowcaseSection>
    </section>
  );
}
