export const navigationIcons = [
  "overview",
  "revenue-operations",
  "robin",
  "website-intelligence",
  "smart-blog-studio",
  "content-intelligence",
  "work-management",
  "settings",
  "properties",
  "users-and-permissions",
  "integrations",
  "audit-log",
] as const;

export type NavigationIcon = (typeof navigationIcons)[number];

export type PropertyDisplay = {
  name: string;
  domain?: string;
  initials: string;
};

export type NavigationItemDisplay = {
  label: string;
  href: string;
  icon: NavigationIcon;
  isActive?: boolean;
  isDisabled?: boolean;
};

export type NavigationGroupDisplay = {
  label?: string;
  items: NavigationItemDisplay[];
};

export type UserDisplay = {
  name: string;
  avatarUrl?: string;
  initials: string;
};

export type AppShellDisplay = {
  property: PropertyDisplay;
  primaryNavigation: NavigationItemDisplay[];
  administrativeNavigation?: NavigationGroupDisplay;
  user: UserDisplay;
};
