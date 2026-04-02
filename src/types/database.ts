export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "manager" | "employee";
export type ReportStatus = "done" | "in_progress" | "blocked";
export type PlanPriority = "low" | "medium" | "high";
export type PlanStatus = "todo" | "in_progress" | "done" | "blocked";
export type SuggestionStatus = "new" | "accepted" | "prepared" | "canceled";
export type IntegrationStatus = "connected";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          title: string | null;
          department: string | null;
          profile_status: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          title?: string | null;
          department?: string | null;
          profile_status?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          title?: string | null;
          department?: string | null;
          profile_status?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_reports: {
        Row: {
          id: string;
          employee_id: string;
          report_date: string;
          completed_work: string;
          current_work: string;
          next_plan: string;
          blockers: string | null;
          status: ReportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          report_date: string;
          completed_work: string;
          current_work: string;
          next_plan: string;
          blockers?: string | null;
          status?: ReportStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          report_date?: string;
          completed_work?: string;
          current_work?: string;
          next_plan?: string;
          blockers?: string | null;
          status?: ReportStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          assignee_id: string;
          created_by: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: PlanPriority;
          status: PlanStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignee_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: PlanPriority;
          status?: PlanStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          assignee_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          priority?: PlanPriority;
          status?: PlanStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      suggestions: {
        Row: {
          id: string;
          employee_id: string;
          title: string;
          description: string | null;
          status: SuggestionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          title: string;
          description?: string | null;
          status?: SuggestionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: SuggestionStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      integration_connections: {
        Row: {
          id: string;
          provider: string;
          display_name: string;
          status: IntegrationStatus;
          public_config: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          display_name: string;
          status?: IntegrationStatus;
          public_config?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: string;
          display_name?: string;
          status?: IntegrationStatus;
          public_config?: Json;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      integration_credentials: {
        Row: {
          connection_id: string;
          provider: string;
          secret_config: Json;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          connection_id: string;
          provider: string;
          secret_config?: Json;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider?: string;
          secret_config?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_plan_status: {
        Args: {
          plan_id: string;
          next_status: PlanStatus;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      report_status: ReportStatus;
      plan_priority: PlanPriority;
      plan_status: PlanStatus;
      suggestion_status: SuggestionStatus;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type Suggestion = Database["public"]["Tables"]["suggestions"]["Row"];
export type IntegrationConnection = Database["public"]["Tables"]["integration_connections"]["Row"];
export type IntegrationCredential = Database["public"]["Tables"]["integration_credentials"]["Row"];

export type Viewer = Profile & {
  email: string;
};
