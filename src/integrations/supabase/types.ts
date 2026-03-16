export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          avatar: string | null
          cost_total: number
          created_at: string
          current_task: string | null
          id: string
          last_activity: string | null
          model: string
          name: string
          role: string
          status: string
          tasks_completed: number
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          cost_total?: number
          created_at?: string
          current_task?: string | null
          id: string
          last_activity?: string | null
          model: string
          name: string
          role: string
          status?: string
          tasks_completed?: number
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          cost_total?: number
          created_at?: string
          current_task?: string | null
          id?: string
          last_activity?: string | null
          model?: string
          name?: string
          role?: string
          status?: string
          tasks_completed?: number
          updated_at?: string
        }
        Relationships: []
      }
      commands: {
        Row: {
          command: string
          created_at: string
          executed_at: string | null
          id: string
          issued_by: string | null
          payload: Json | null
          result: Json | null
          status: string
        }
        Insert: {
          command: string
          created_at?: string
          executed_at?: string | null
          id?: string
          issued_by?: string | null
          payload?: Json | null
          result?: Json | null
          status?: string
        }
        Update: {
          command?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          issued_by?: string | null
          payload?: Json | null
          result?: Json | null
          status?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          agent: string | null
          data: Json | null
          event_type: string
          id: string
          project_id: string | null
          task_id: string | null
          timestamp: string
        }
        Insert: {
          agent?: string | null
          data?: Json | null
          event_type: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Update: {
          agent?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_agents: string[]
          completed_tasks: number
          created_at: string
          description: string
          goal: string
          id: string
          name: string
          progress: number
          status: string
          task_count: number
          updated_at: string
        }
        Insert: {
          assigned_agents?: string[]
          completed_tasks?: number
          created_at?: string
          description?: string
          goal?: string
          id: string
          name: string
          progress?: number
          status?: string
          task_count?: number
          updated_at?: string
        }
        Update: {
          assigned_agents?: string[]
          completed_tasks?: number
          created_at?: string
          description?: string
          goal?: string
          id?: string
          name?: string
          progress?: number
          status?: string
          task_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_state: {
        Row: {
          active_projects: number
          api_calls_24h: number
          avg_latency: number
          failure_rate: number
          id: number
          monthly_revenue: number
          online_agents: number
          phase: string
          phase_goals: string[]
          tasks_today_completed: number
          tasks_today_total: number
          total_agents: number
          total_revenue: number
          updated_at: string
          uptime: string
        }
        Insert: {
          active_projects?: number
          api_calls_24h?: number
          avg_latency?: number
          failure_rate?: number
          id?: number
          monthly_revenue?: number
          online_agents?: number
          phase?: string
          phase_goals?: string[]
          tasks_today_completed?: number
          tasks_today_total?: number
          total_agents?: number
          total_revenue?: number
          updated_at?: string
          uptime?: string
        }
        Update: {
          active_projects?: number
          api_calls_24h?: number
          avg_latency?: number
          failure_rate?: number
          id?: number
          monthly_revenue?: number
          online_agents?: number
          phase?: string
          phase_goals?: string[]
          tasks_today_completed?: number
          tasks_today_total?: number
          total_agents?: number
          total_revenue?: number
          updated_at?: string
          uptime?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_agent: string | null
          completion_time: string | null
          created_at: string
          dependencies: string[]
          description: string
          errors: string[]
          id: string
          logs: string[]
          priority: string
          project_id: string | null
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          completion_time?: string | null
          created_at?: string
          dependencies?: string[]
          description?: string
          errors?: string[]
          id: string
          logs?: string[]
          priority?: string
          project_id?: string | null
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          completion_time?: string | null
          created_at?: string
          dependencies?: string[]
          description?: string
          errors?: string[]
          id?: string
          logs?: string[]
          priority?: string
          project_id?: string | null
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
