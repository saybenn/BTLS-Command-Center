import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createFoundationFixture } from "../fixtures/feature-08";
import { expect, test } from "./fixtures";
import { signInThroughUi } from "./auth-helpers";
import type { Locator, Page } from "@playwright/test";
let fixture: Awaited<ReturnType<typeof createFoundationFixture>>;
const auth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const authUsers: string[] = [];
test.beforeAll(async () => {
  fixture = await createFoundationFixture();
});
test.afterAll(async () => {
  await fixture?.cleanup();
  for (const id of authUsers) await auth.auth.admin.deleteUser(id);
});
async function identity(role: "CLIENT_OWNER" | "CLIENT_MANAGER" | "CLIENT_STAFF") {
  const context = await fixture.context(role);
  const password = `Local-test-${randomUUID()}`;
  const result = await auth.auth.admin.createUser({
    id: context.user.id,
    email: context.user.email,
    password,
    email_confirm: true,
  });
  if (result.error) throw new Error("Could not create local test identity.");
  authUsers.push(context.user.id);
  return { email: context.user.email, password };
}
async function form(page: Page, name: string): Promise<Locator> {
  const locator = page.getByRole("form", { name, exact: true });
  await expect(locator).toHaveAttribute("data-ready", "true");
  return locator;
}
async function saveAndLoad(page: Page, button: Locator) {
  await Promise.all([page.waitForEvent("domcontentloaded"), button.click()]);
}
test("owner manages customers, optional context, workforce and shared defaults", async ({
  page,
}, info) => {
  // This single journey covers six independently persisted administration workflows.
  test.setTimeout(90_000);
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  const root = `/${fixture.property}`;
  await page.goto(`${root}/revenue-operations/customers`);
  const create = await form(page, "Create customer");
  const customerName = `Browser customer ${randomUUID()}`;
  await create.getByLabel("Customer name", { exact: false }).fill(customerName);
  await create.getByLabel("Person's name", { exact: false }).fill("Ada Browser");
  await create.getByLabel("Phone number", { exact: false }).fill("+44 20 7946 0018");
  await create.getByRole("button", { name: "Create customer", exact: true }).click();
  await expect(page.getByRole("heading", { name: customerName, exact: true })).toBeVisible();
  const customerUrl = page.url();
  await expect(page.getByRole("heading", { name: "Ada Browser · Primary" })).toBeVisible();
  await page.locator("summary").filter({ hasText: "Edit Ada Browser" }).click();
  const person = await form(page, "Edit Ada Browser");
  await person.getByLabel("Person's name", { exact: false }).fill("Ada Field");
  await saveAndLoad(page, person.getByRole("button", { name: "Save changes" }));
  await expect(page.getByRole("heading", { name: "Ada Field · Primary" })).toBeVisible();
  const update = await form(page, "Customer details");
  await update.getByLabel("Relationship", { exact: false }).selectOption("CURRENT");
  await saveAndLoad(page, update.getByRole("button", { name: "Save changes" }));
  await expect(page.getByText("Changes saved.", { exact: true }).first()).toBeVisible();
  await page.getByRole("link", { name: "Locations", exact: true }).click();
  const location = await form(page, "Add optional location");
  await location.getByLabel("Location name", { exact: false }).fill("Home");
  await location.getByLabel("Street address", { exact: false }).fill("12 Main Street");
  await location.getByLabel("City / locality", { exact: false }).fill("Boston");
  await location.getByLabel("Country code", { exact: false }).fill("US");
  await saveAndLoad(page, location.getByRole("button", { name: "Add location" }));
  await expect
    .poll(
      async () =>
        (
          await fixture.sql.query(
            "select count(*)::int as count from service_locations where property_id=$1",
            [fixture.property],
          )
        ).rows[0].count,
    )
    .toBe(1);
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Equipment", exact: true }).click();
  const equipment = await form(page, "Add optional equipment");
  await equipment.getByLabel("Equipment / item name", { exact: false }).fill("Boiler");
  await saveAndLoad(page, equipment.getByRole("button", { name: "Add equipment" }));
  await expect(page.getByRole("heading", { name: "Boiler", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Tags", exact: true }).click();
  const tag = await form(page, "Create property tag");
  await tag.getByLabel("Tag name", { exact: false }).fill("Priority");
  await saveAndLoad(page, tag.getByRole("button", { name: "Create tag" }));
  const assign = await form(page, "Assign Priority");
  await assign.getByLabel("Assigned to this customer", { exact: false }).selectOption("true");
  await saveAndLoad(page, assign.getByRole("button", { name: "Save changes" }));
  await expect(page.getByRole("heading", { name: "Priority · Assigned" })).toBeVisible();
  await page.goto(`${root}/revenue-operations/employees`);
  const employee = await form(page, "Create employee");
  await employee.getByLabel("Employee name", { exact: false }).fill("Sam Technician");
  await saveAndLoad(page, employee.getByRole("button", { name: "Create employee" }));
  await expect(
    page.getByRole("link", { name: "Sam Technician", exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Sam Technician", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole("heading", { name: "Sam Technician", exact: true })).toBeVisible();
  await page.goto(`${root}/settings/services`);
  const service = await form(page, "Create offered service");
  await service.getByLabel("Service name", { exact: false }).fill("Heating repair");
  await service.getByLabel("Service slug", { exact: false }).fill("heating-repair");
  await saveAndLoad(page, service.getByRole("button", { name: "Save changes" }));
  await expect(
    page.getByRole("link", { name: "Heating repair", exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await page.goto(`${root}/settings/revenue-operations`);
  const settings = await form(page, "Revenue defaults");
  await settings.getByLabel("Review request delay (days)", { exact: false }).fill("5");
  await saveAndLoad(page, settings.getByRole("button", { name: "Save changes" }));
  await expect(page.getByText("Changes saved.", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Review request delay (days)", { exact: false })).toHaveValue("5");
  await page.goto(customerUrl);
  await expect(page.getByText(/Relationship: current/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("customer-detail.png"), fullPage: true });
  if (info.project.name === "chromium") {
    await page.getByRole("combobox", { name: "Theme", exact: true }).click();
    await page.getByRole("option", { name: "Light", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await page.screenshot({ path: info.outputPath("customer-light.png"), fullPage: true });
    await page.getByRole("combobox", { name: "Theme", exact: true }).click();
    await page.getByRole("option", { name: "System", exact: true }).click();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).not.toHaveClass(/light/);
  }
  await page.setViewportSize({ width: 820, height: 1180 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("customer-tablet.png"), fullPage: true });
});
test("duplicate review requires a human choice and allows opening the existing customer", async ({
  page,
}) => {
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  const root = `/${fixture.property}/revenue-operations/customers`;
  const name = `Duplicate review ${randomUUID()}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto(root);
    const create = await form(page, "Create customer");
    await create.getByLabel("Customer name", { exact: false }).fill(name);
    await create.getByLabel("Person's name", { exact: false }).fill("Duplicate Person");
    await create.getByRole("button", { name: "Create customer", exact: true }).click();
    if (!attempt) await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    else {
      await expect(create.getByText(/Possible duplicates found/)).toBeVisible();
      await expect(create.getByText(/Same customer name/)).toBeVisible();
      page.once("dialog", (dialog) => dialog.accept());
      await create.getByRole("link", { name, exact: true }).click();
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  }
  const rows = await fixture.sql.query(
    "select count(*)::int as count from customers where property_id=$1 and display_name=$2",
    [fixture.property, name],
  );
  expect(rows.rows[0].count).toBe(1);
});
test("manager settings are read-only and staff directory entry is denied", async ({ page }) => {
  const manager = await identity("CLIENT_MANAGER");
  await signInThroughUi(page, manager);
  await page.goto(`/${fixture.property}/settings/revenue-operations`);
  await expect(page.getByRole("heading", { name: "Revenue settings", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
  await page.context().clearCookies();
  const staff = await identity("CLIENT_STAFF");
  await signInThroughUi(page, staff);
  await page.goto(`/${fixture.property}/revenue-operations/customers`);
  await expect(page).toHaveURL(/\/no-access/);
  await page.goto(`/${fixture.otherProperty}/revenue-operations/customers`);
  await expect(page).toHaveURL(/\/no-access/);
});

test("discard is atomic across retained customer forms", async ({ page }) => {
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  await page.goto(`/${fixture.property}/revenue-operations/customers`);
  const create = await form(page, "Create customer");
  const name = "Discard regression " + randomUUID();
  await create.getByLabel("Customer name", { exact: false }).fill(name);
  await create.getByLabel("Person's name", { exact: false }).fill("Persisted person");
  await saveAndLoad(page, create.getByRole("button", { name: "Create customer", exact: true }));
  const url = page.url();
  const details = await form(page, "Customer details");
  await details.getByLabel("Customer name", { exact: false }).fill("Discarded customer");
  await page.locator("summary").filter({ hasText: "Edit Persisted person" }).click();
  const person = await form(page, "Edit Persisted person");
  await person.getByLabel("Person's name", { exact: false }).fill("Discarded person");
  let dialogs = 0;
  const cancel = (dialog: import("@playwright/test").Dialog) => {
    dialogs++;
    void dialog.dismiss();
  };
  page.on("dialog", cancel);
  await page.getByRole("link", { name: "Locations", exact: true }).click();
  expect(dialogs).toBe(1);
  expect(page.url()).toBe(url);
  await expect(details.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Discarded customer",
  );
  await expect(person.getByLabel("Person's name", { exact: false })).toHaveValue(
    "Discarded person",
  );
  page.off("dialog", cancel);
  page.once("dialog", async (dialog) => {
    dialogs++;
    await dialog.accept();
  });
  await page.getByRole("link", { name: "Locations", exact: true }).click();
  await form(page, "Add optional location");
  expect(dialogs).toBe(2);
  await expect(
    page
      .getByRole("form", { name: "Customer details", exact: true })
      .getByLabel("Customer name", { exact: false }),
  ).toHaveValue(name);
  await page.getByRole("link", { name: "Contacts", exact: true }).click();
  await page.locator("summary").filter({ hasText: "Edit Persisted person" }).click();
  await expect(
    (await form(page, "Edit Persisted person")).getByLabel("Person's name", { exact: false }),
  ).toHaveValue("Persisted person");
});
test("directory search preserves typing focus and synchronizes history and filters", async ({
  page,
}) => {
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  const path = `/${fixture.property}/revenue-operations/customers`;
  await page.goto(path);
  await form(page, "Create customer");
  const search = page.getByLabel("Search customers (name, contact, email or phone)", {
    exact: true,
  });
  const query = "Focus " + randomUUID();
  await search.fill(query);
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(query);
  await expect(page.getByText("No matching records", { exact: true })).toBeVisible();
  await expect(search).toBeFocused();
  await page.keyboard.type(" Jones");
  await expect(search).toHaveValue(query + " Jones");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(query + " Jones");
  await expect(search).toBeFocused();
  await search.clear();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("");
  await expect(search).toBeFocused();
  await page.getByLabel("Status", { exact: true }).selectOption("CURRENT");
  await expect(page).toHaveURL(/status=CURRENT/);
  await page.goto(path + "?q=First");
  await form(page, "Create customer");
  await page.goto(path + "?q=Second&page=2");
  await form(page, "Create customer");
  await page.goBack();
  await expect(search).toHaveValue("First");
  await page.goForward();
  await expect(search).toHaveValue("Second");
  await expect(page.getByText("Page 2 of 1", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Previous", exact: true }).click();
  await expect(page).toHaveURL(/page=1/);
  await expect(search).toHaveValue("Second");
});

test("Feature 08 document entry and browser history protect drafts without reviving discarded values", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  const root = `/${fixture.property}`;
  await page.goto(`${root}/overview`);
  // The Radix Select label appears after client hydration, including when hidden on mobile.
  await expect(page.locator("header [role=combobox]").filter({ hasText: "Dark" })).toHaveCount(1);
  await page.evaluate(() => {
    document.documentElement.dataset.documentToken = "overview";
  });
  if (await page.getByRole("button", { name: "Open navigation" }).isVisible()) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await page
    .getByRole("link", { name: "Revenue Operations", exact: true })
    .filter({ visible: true })
    .click();
  const create = await form(page, "Create customer");
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBeUndefined();
  await create.getByLabel("Customer name", { exact: false }).fill("Abandoned entry");
  let dialogs: string[] = [];
  const cancel = async (dialog: import("@playwright/test").Dialog) => {
    dialogs.push(dialog.type());
    await dialog.dismiss();
  };
  page.on("dialog", cancel);
  await page.evaluate(() => history.back());
  await expect.poll(() => dialogs.length).toBe(1);
  await expect(page).toHaveURL(`${root}/revenue-operations/customers`);
  await expect(create.getByLabel("Customer name", { exact: false })).toHaveValue("Abandoned entry");
  page.off("dialog", cancel);
  const accept = async (dialog: import("@playwright/test").Dialog) => {
    dialogs.push(dialog.type());
    await dialog.accept();
  };
  page.on("dialog", accept);
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(`${root}/overview`);
  expect(dialogs).toEqual(["beforeunload", "beforeunload"]);
  await page.goForward();
  await expect(
    (await form(page, "Create customer")).getByLabel("Customer name", { exact: false }),
  ).toHaveValue("");
  // Section transitions must also create document history boundaries.
  const name = "History " + randomUUID();
  await create.getByLabel("Customer name", { exact: false }).fill(name);
  await create.getByLabel("Person's name", { exact: false }).fill("History person");
  await saveAndLoad(page, create.getByRole("button", { name: "Create customer", exact: true }));
  const contactUrl = page.url();
  await page.getByRole("link", { name: "Locations", exact: true }).click();
  const location = await form(page, "Add optional location");
  await location.getByLabel("Location name", { exact: false }).fill("Unsaved location");
  const details = await form(page, "Customer details");
  await details.getByLabel("Customer name", { exact: false }).fill("Unsaved customer");
  page.off("dialog", accept);
  page.on("dialog", cancel);
  dialogs = [];
  await page.evaluate(() => history.back());
  await expect.poll(() => dialogs.length).toBe(1);
  await expect(location.getByLabel("Location name", { exact: false })).toHaveValue(
    "Unsaved location",
  );
  await expect(details.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Unsaved customer",
  );
  page.off("dialog", cancel);
  page.on("dialog", accept);
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(contactUrl);
  const restoredDetails = await form(page, "Customer details");
  await restoredDetails.getByLabel("Customer name", { exact: false }).fill("Forward draft");
  page.off("dialog", accept);
  page.on("dialog", cancel);
  await page.evaluate(() => history.forward());
  await expect.poll(() => dialogs.length).toBe(3);
  await expect(page).toHaveURL(contactUrl);
  await expect(restoredDetails.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Forward draft",
  );
  // A true document exit uses the same native protection and cancellation semantics.
  await page.evaluate(() => window.location.reload());
  await expect.poll(() => dialogs.length).toBe(4);
  await expect(restoredDetails.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Forward draft",
  );
  page.off("dialog", cancel);
  page.on("dialog", accept);
  await page.evaluate(() => history.forward());
  await expect(
    (await form(page, "Add optional location")).getByLabel("Location name", { exact: false }),
  ).toHaveValue("");
  await expect(
    (await form(page, "Customer details")).getByLabel("Customer name", { exact: false }),
  ).toHaveValue(name);
  expect(dialogs).toEqual(Array(5).fill("beforeunload"));
  page.off("dialog", accept);
});

test("property switching preserves duplicate review on cancel and prompts once on discard", async ({
  page,
}) => {
  const user = await identity("CLIENT_OWNER");
  const membership = await fixture.sql.query(
    "select m.id from account_memberships m join app_users u on u.id=m.user_id where u.email=$1",
    [user.email],
  );
  const second = randomUUID();
  await fixture.sql.query(
    "insert into client_properties(id,account_id,name,updated_at) values($1,$2,'Second authorized property',now())",
    [second, fixture.account],
  );
  await fixture.sql.query(
    "insert into property_accesses(id,account_id,membership_id,property_id,updated_at) values($1,$2,$3,$4,now())",
    [randomUUID(), fixture.account, membership.rows[0].id, second],
  );
  await signInThroughUi(page, user);
  const root = `/${fixture.property}/revenue-operations/customers`;
  const name = "Switch duplicate " + randomUUID();
  await page.goto(root);
  let create = await form(page, "Create customer");
  await create.getByLabel("Customer name", { exact: false }).fill(name);
  await create.getByLabel("Person's name", { exact: false }).fill("Same person");
  await saveAndLoad(page, create.getByRole("button", { name: "Create customer", exact: true }));
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  create = await form(page, "Create customer");
  await create.getByLabel("Customer name", { exact: false }).fill(name);
  await create.getByLabel("Person's name", { exact: false }).fill("Same person");
  await create.getByRole("button", { name: "Create customer", exact: true }).click();
  await expect(create.getByText(/Possible duplicates found/)).toBeVisible();
  let dialogs = 0;
  const cancel = async (dialog: import("@playwright/test").Dialog) => {
    dialogs++;
    expect(dialog.type()).toBe("confirm");
    await dialog.dismiss();
  };
  page.on("dialog", cancel);
  await page.getByRole("combobox", { name: "Switch property" }).click();
  await page.getByRole("option", { name: /Second authorized property/ }).click();
  expect(dialogs).toBe(1);
  await expect(page).toHaveURL(root);
  await expect(page.getByRole("combobox", { name: "Switch property" })).toContainText(
    "Foundation property",
  );
  await expect(create.getByLabel("Customer name", { exact: false })).toHaveValue(name);
  await expect(create.getByRole("button", { name: /I reviewed/ })).toBeVisible();
  page.off("dialog", cancel);
  const accept = async (dialog: import("@playwright/test").Dialog) => {
    dialogs++;
    await dialog.accept();
  };
  page.on("dialog", accept);
  await page.getByRole("combobox", { name: "Switch property" }).click();
  await page.getByRole("option", { name: /Second authorized property/ }).click();
  await expect(page).toHaveURL(`/${second}/overview`);
  expect(dialogs).toBe(2);
  await page.goBack();
  await expect(
    (await form(page, "Create customer")).getByLabel("Customer name", { exact: false }),
  ).toHaveValue("");
  await expect(page.getByRole("button", { name: /I reviewed/ })).toHaveCount(0);
  page.off("dialog", accept);
});

test("delayed directory requests cannot undo newer status, typing, clear or pagination", async ({
  page,
}) => {
  const user = await identity("CLIENT_OWNER");
  await signInThroughUi(page, user);
  const path = `/${fixture.property}/revenue-operations/customers`;
  const paginationQuery = "Paged " + randomUUID();
  for (let index = 0; index < 26; index++) {
    const id = randomUUID(),
      name = `${paginationQuery} ${index}`;
    await fixture.sql.query(
      "insert into customers(id,property_id,display_name,normalized_name,relationship_state,create_request_id,create_actor_id,create_fingerprint,updated_at) values($1,$2,$3,$4,'CURRENT',$1,$1,'fixture',now())",
      [id, fixture.property, name, name.toLowerCase()],
    );
  }
  await page.goto(path);
  const create = await form(page, "Create customer");
  await create.getByLabel("Customer name", { exact: false }).fill("Keep working draft");
  await page.evaluate(() => {
    document.documentElement.dataset.documentToken = "directory";
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.pathname === path &&
      url.searchParams.has("_rsc") &&
      url.searchParams.get("status") === "CURRENT"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
    await route.continue();
  });
  const search = page.getByLabel("Search customers (name, contact, email or phone)", {
    exact: true,
  });
  const query = "Race " + randomUUID();
  await search.fill(query);
  await page.getByLabel("Status", { exact: true }).selectOption("CURRENT");
  await search.press("End");
  await search.pressSequentially(" newer");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(query + " newer");
  await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("CURRENT");
  await expect(search).toBeFocused();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("CURRENT");
  await search.clear();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("");
  await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("CURRENT");
  await expect(create.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Keep working draft",
  );
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "directory",
  );
  // A query replace can commit to page one while Playwright scrolls to Next on mobile.
  // History must restore that actual entry, whether the debounce committed before pagination or not.
  let previousDirectoryUrl = page.url();
  const rememberPageOne = (frame: import("@playwright/test").Frame) => {
    if (frame !== page.mainFrame()) return;
    const url = new URL(frame.url());
    if (url.pathname === path && (url.searchParams.get("page") ?? "1") === "1") {
      previousDirectoryUrl = frame.url();
    }
  };
  page.on("framenavigated", rememberPageOne);
  await search.fill(paginationQuery);
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(paginationQuery);
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("CURRENT");
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await expect(create.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Keep working draft",
  );
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "directory",
  );
  page.off("framenavigated", rememberPageOne);
  const pendingHistoryRequest = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get("q") === "Abandoned history search",
  );
  await search.fill("Abandoned history search");
  await pendingHistoryRequest;
  await page.goBack();
  await expect(page).toHaveURL(previousDirectoryUrl);
  await expect(search).toHaveValue(new URL(previousDirectoryUrl).searchParams.get("q") ?? "");
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("CURRENT");
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("1");
  await page.goForward();
  await expect(search).toHaveValue(paginationQuery);
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(create.getByLabel("Customer name", { exact: false })).toHaveValue(
    "Keep working draft",
  );
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "directory",
  );
  await create.getByLabel("Customer name", { exact: false }).clear();
});

test("related Contact pages protect drafts during native history traversal", async ({ page }) => {
  const user = await identity("CLIENT_OWNER");
  const customerId = randomUUID();
  await fixture.sql.query(
    "insert into customers(id,property_id,display_name,normalized_name,create_request_id,create_actor_id,create_fingerprint,updated_at) values($1,$2,'Paged contacts','paged contacts',$1,$1,'fixture',now())",
    [customerId, fixture.property],
  );
  for (let index = 0; index < 26; index++) {
    await fixture.sql.query(
      "insert into contacts(id,property_id,customer_id,person_name,updated_at) values($1,$2,$3,$4,now())",
      [randomUUID(), fixture.property, customerId, `Person ${String(index).padStart(2, "0")}`],
    );
  }
  await signInThroughUi(page, user);
  const path = `/${fixture.property}/revenue-operations/customers/${customerId}`;
  await page.goto(path);
  await form(page, "Customer details");
  await page.evaluate(() => {
    document.documentElement.dataset.documentToken = "first-contact-page";
  });
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBeUndefined();
  await page.locator("summary").filter({ hasText: "Edit Person" }).click();
  const person = page.getByRole("form", { name: /Edit Person/ });
  const input = person.getByLabel("Person's name", { exact: false });
  const persisted = await input.inputValue();
  await input.fill("Unsaved paged contact");
  let dialogs = 0;
  const cancel = async (dialog: import("@playwright/test").Dialog) => {
    dialogs++;
    await dialog.dismiss();
  };
  page.on("dialog", cancel);
  await page.evaluate(() => history.back());
  await expect.poll(() => dialogs).toBe(1);
  await expect(input).toHaveValue("Unsaved paged contact");
  page.off("dialog", cancel);
  page.once("dialog", (dialog) => dialog.accept());
  await page.evaluate(() => history.back());
  await expect(page).toHaveURL(path);
  await page.goForward();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await page.locator("summary").filter({ hasText: "Edit Person" }).click();
  await expect(input).toHaveValue(persisted);
  // Playwright may disable BFCache; exercise its persisted lifecycle explicitly as well.
  await input.fill("Abandoned cached contact");
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })),
  );
  await Promise.all([
    page.waitForEvent("domcontentloaded"),
    page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })),
    ),
  ]);
  await form(page, "Customer details");
  await page.locator("summary").filter({ hasText: "Edit Person" }).click();
  await expect(input).toHaveValue(persisted);
});

async function offeredServices(count = 2) {
  const prefix = `Slice 08.10 ${randomUUID()}`;
  const records = [];
  for (let index = 0; index < count; index++) {
    const id = randomUUID();
    const name = `${prefix} ${String(index).padStart(2, "0")}`;
    await fixture.sql.query(
      "insert into property_services(id,property_id,name,normalized_name,slug,updated_at) values($1,$2,$3,$4,$5,now())",
      [id, fixture.property, name, name.toLowerCase(), id],
    );
    records.push({ id, name });
  }
  return { prefix, records };
}
async function serviceEditor(page: Page, existing: boolean) {
  if (existing) {
    const disclosure = page
      .locator("details")
      .filter({ has: page.locator("summary").filter({ hasText: "Edit offered service" }) });
    if (!(await disclosure.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await disclosure.locator("summary").click();
    }
  }
  return form(page, existing ? "Edit offered service" : "Create offered service");
}
for (const transition of ["new to existing", "existing to existing", "existing to new"] as const) {
  test(`offered-service ${transition} protects editor history and app cancellation`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const user = await identity("CLIENT_OWNER");
    const { records } = await offeredServices();
    await signInThroughUi(page, user);
    const path = `/${fixture.property}/settings/services`;
    const start = transition === "new to existing" ? null : records[0];
    const target = transition === "existing to new" ? null : records[1];
    const url = (record: typeof start) => path + (record ? `?edit=${record.id}` : "");
    const link = (record: typeof start) =>
      record
        ? page.getByRole("link", { name: record.name, exact: true }).filter({ visible: true })
        : page.getByRole("link", { name: "Create another service", exact: true });
    await page.goto(url(start));
    await serviceEditor(page, !!start);
    const dialogs: string[] = [];
    let accept = false;
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.type());
      if (accept) await dialog.accept();
      else await dialog.dismiss();
    });
    await page.evaluate(() => {
      document.documentElement.dataset.documentToken = "clean-editor";
    });
    await saveAndLoad(page, link(target));
    expect(dialogs).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.dataset.documentToken),
    ).toBeUndefined();
    let editor = await serviceEditor(page, !!target);
    const dirty = async (current: Locator) => {
      await current.getByLabel("Service name", { exact: false }).fill("Unfinished service edit");
      await current.getByLabel("Service slug", { exact: false }).clear();
      await current.getByRole("button", { name: "Save changes" }).click();
      await expect(current.getByLabel("Service slug", { exact: false })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    };
    await dirty(editor);
    await expect(editor.getByText("Loading options…", { exact: true })).toHaveCount(0);
    const draftState = await editor.innerText();
    await link(start).click();
    expect(dialogs).toEqual(["confirm"]);
    await expect(page).toHaveURL(url(target));
    await expect(editor.getByLabel("Service name", { exact: false })).toHaveValue(
      "Unfinished service edit",
    );
    expect(await editor.innerText()).toBe(draftState);
    await page.evaluate(() => history.back());
    await expect.poll(() => dialogs.length).toBe(2);
    expect(dialogs[1]).toBe("beforeunload");
    await expect(page).toHaveURL(url(target));
    expect(await editor.innerText()).toBe(draftState);
    await expect(editor.getByLabel("Service name", { exact: false })).toHaveValue(
      "Unfinished service edit",
    );
    accept = true;
    await page.evaluate(() => history.back());
    await expect(page).toHaveURL(url(start));
    editor = await serviceEditor(page, !!start);
    await dirty(editor);
    accept = false;
    await page.evaluate(() => history.forward());
    await expect.poll(() => dialogs.length).toBe(4);
    await expect(page).toHaveURL(url(start));
    await expect(editor.getByLabel("Service name", { exact: false })).toHaveValue(
      "Unfinished service edit",
    );
    await expect(editor.getByLabel("Service slug", { exact: false })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    accept = true;
    await page.evaluate(() => history.forward());
    await expect(page).toHaveURL(url(target));
    editor = await serviceEditor(page, !!target);
    await expect(editor.getByLabel("Service name", { exact: false })).toHaveValue(
      target?.name ?? "",
    );
    await expect(editor.getByLabel("Service slug", { exact: false })).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await dirty(editor);
    await saveAndLoad(page, link(start));
    await serviceEditor(page, !!start);
    expect(dialogs).toEqual([
      "confirm",
      "beforeunload",
      "beforeunload",
      "beforeunload",
      "beforeunload",
      "confirm",
    ]);
    const stored = await fixture.sql.query(
      "select id,name,revision from property_services where id=any($1::uuid[])",
      [records.map((record) => record.id)],
    );
    for (const record of records) expect(stored.rows).toContainEqual({ ...record, revision: 1 });
  });
}

test("offered-service directory state retains the editor and abandoned requests cannot restore it", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const user = await identity("CLIENT_OWNER");
  const { prefix, records } = await offeredServices(26);
  await signInThroughUi(page, user);
  const path = `/${fixture.property}/settings/services`;
  await page.goto(`${path}?edit=${records[0].id}&q=${encodeURIComponent(prefix)}`);
  const editor = await serviceEditor(page, true);
  const input = editor.getByLabel("Service name", { exact: false });
  await input.fill("Retained service draft");
  await input.evaluate((element) => element.setAttribute("data-editor-token", "retained"));
  await page.evaluate(() => {
    document.documentElement.dataset.documentToken = "service-directory";
  });
  const dialogs: string[] = [];
  let accept = false;
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.type());
    if (accept) await dialog.accept();
    else await dialog.dismiss();
  });
  const search = page.getByLabel("Search offered services", { exact: true });
  await search.fill(prefix + " 0");
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(prefix + " 0");
  await search.fill(prefix);
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(input).toHaveValue("Retained service draft");
  await expect(input).toHaveAttribute("data-editor-token", "retained");
  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get("page") ?? "1").toBe("1");
  await page.goForward();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("page")).toBe("2");
  await search.clear();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe("");
  await expect(input).toHaveValue("Retained service draft");
  await expect(input).toHaveAttribute("data-editor-token", "retained");
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "service-directory",
  );
  expect(dialogs).toEqual([]);
  // Reselecting the current service clears list state but retains editor identity.
  await search.fill(prefix);
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(prefix);
  await page
    .getByRole("link", { name: records[0].name, exact: true })
    .filter({ visible: true })
    .click();
  expect(dialogs).toEqual([]);
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBeNull();
  await expect(input).toHaveValue("Retained service draft");
  await expect(input).toHaveAttribute("data-editor-token", "retained");
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "service-directory",
  );
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === path &&
      url.searchParams.has("_rsc") &&
      url.searchParams.get("q") === "Delayed abandoned editor"
    );
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.pathname === path &&
      url.searchParams.has("_rsc") &&
      url.searchParams.get("q") === "Delayed abandoned editor"
    )
      await held;
    await route.continue();
  });
  await search.fill("Delayed abandoned editor");
  await pending;
  accept = true;
  try {
    await saveAndLoad(
      page,
      page.getByRole("link", { name: "Create another service", exact: true }),
    );
  } finally {
    release();
  }
  await page.unrouteAll({ behavior: "wait" });
  const create = await serviceEditor(page, false);
  await expect(page).toHaveURL(path);
  await expect(create.getByLabel("Service name", { exact: false })).toHaveValue("");
  expect(dialogs).toEqual(["confirm"]);
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBeUndefined();
});
