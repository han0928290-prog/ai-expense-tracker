import { EditIcon, ChartIcon, UserIcon } from "@/components/icons";

export const NAV_ITEMS = [
  { href: "/" as const, label: "記帳", Icon: EditIcon },
  { href: "/stats" as const, label: "統計", Icon: ChartIcon },
  { href: "/profile" as const, label: "我的", Icon: UserIcon },
];

export const AUTH_ROUTES = ["/login", "/register"];
