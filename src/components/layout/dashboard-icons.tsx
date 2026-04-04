"use client";

import {
  Activity,
  ArrowBarLeft,
  ArrowBarRight,
  ArrowRight,
  BoxArrowRight,
  Calendar3,
  CardChecklist,
  ChevronDown,
  ChevronRight,
  CircleFill,
  DisplayFill,
  EnvelopeFill,
  ExclamationTriangleFill,
  FileEarmarkTextFill,
  FunnelFill,
  Grid1x2Fill,
  InfoCircleFill,
  KanbanFill,
  LightbulbFill,
  LightningChargeFill,
  Link45deg,
  PeopleFill,
  PersonFill,
  PlusLg,
  Search,
  Slack,
  Sliders,
  Telegram,
  Trello,
  Trash3Fill,
  XLg,
  type Icon,
} from "react-bootstrap-icons";

type IconProps = {
  className?: string;
};

function renderIcon(Component: Icon, className?: string) {
  return <Component className={className} aria-hidden="true" focusable="false" />;
}

export function DashboardIcon({ className }: IconProps) {
  return renderIcon(Grid1x2Fill, className);
}

export function ReportsIcon({ className }: IconProps) {
  return renderIcon(FileEarmarkTextFill, className);
}

export function PlansIcon({ className }: IconProps) {
  return renderIcon(CardChecklist, className);
}

export function EmployeesIcon({ className }: IconProps) {
  return renderIcon(PeopleFill, className);
}

export function SuggestionsIcon({ className }: IconProps) {
  return renderIcon(LightbulbFill, className);
}

export function IntegrationIcon({ className }: IconProps) {
  return renderIcon(Link45deg, className);
}

export function ClickUpIcon({ className }: IconProps) {
  return renderIcon(LightningChargeFill, className);
}

export function JiraIcon({ className }: IconProps) {
  return renderIcon(KanbanFill, className);
}

export function TrelloIcon({ className }: IconProps) {
  return renderIcon(Trello, className);
}

export function SlackIcon({ className }: IconProps) {
  return renderIcon(Slack, className);
}

export function TelegramIcon({ className }: IconProps) {
  return renderIcon(Telegram, className);
}

export function InfoIcon({ className }: IconProps) {
  return renderIcon(InfoCircleFill, className);
}

export function SettingsIcon({ className }: IconProps) {
  return renderIcon(Sliders, className);
}

export function UserIcon({ className }: IconProps) {
  return renderIcon(PersonFill, className);
}

export function AccountIcon({ className }: IconProps) {
  return renderIcon(EnvelopeFill, className);
}

export function InterfaceIcon({ className }: IconProps) {
  return renderIcon(DisplayFill, className);
}

export function CloseIcon({ className }: IconProps) {
  return renderIcon(XLg, className);
}

export function SidebarCollapseIcon({ className }: IconProps) {
  return renderIcon(ArrowBarLeft, className);
}

export function SidebarExpandIcon({ className }: IconProps) {
  return renderIcon(ArrowBarRight, className);
}

export function ChevronDownIcon({ className }: IconProps) {
  return renderIcon(ChevronDown, className);
}

export function BreadcrumbChevronIcon({ className }: IconProps) {
  return renderIcon(ChevronRight, className);
}

export function SignOutIcon({ className }: IconProps) {
  return renderIcon(BoxArrowRight, className);
}

export function StatusIcon({ className }: IconProps) {
  return renderIcon(Activity, className);
}

export function FilterIcon({ className }: IconProps) {
  return renderIcon(FunnelFill, className);
}

export function SearchIcon({ className }: IconProps) {
  return renderIcon(Search, className);
}

export function PlusIcon({ className }: IconProps) {
  return renderIcon(PlusLg, className);
}

export function ArrowRightIcon({ className }: IconProps) {
  return renderIcon(ArrowRight, className);
}

export function CalendarIcon({ className }: IconProps) {
  return renderIcon(Calendar3, className);
}

export function AlertTriangleIcon({ className }: IconProps) {
  return renderIcon(ExclamationTriangleFill, className);
}

export function DotIcon({ className }: IconProps) {
  return renderIcon(CircleFill, className);
}

export function TrashIcon({ className }: IconProps) {
  return renderIcon(Trash3Fill, className);
}
