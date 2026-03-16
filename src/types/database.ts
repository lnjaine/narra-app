export type EventStatus = "scheduled" | "live" | "finished";
export type StreamStatus = "scheduled" | "live" | "ended";
export type UserRole = "listener" | "narrator" | "both";
export type ReactionType = "fire" | "laugh" | "goal" | "boo";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          avatar_url: string | null;
          role: UserRole;
          bio: string | null;
          style: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          style?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          style?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          sport: string;
          league: string;
          title: string;
          home_team: string;
          away_team: string;
          start_time: string;
          status: EventStatus;
          external_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sport: string;
          league: string;
          title: string;
          home_team: string;
          away_team: string;
          start_time: string;
          status?: EventStatus;
          external_id?: string | null;
        };
        Update: {
          sport?: string;
          league?: string;
          title?: string;
          home_team?: string;
          away_team?: string;
          start_time?: string;
          status?: EventStatus;
          external_id?: string | null;
        };
      };
      streams: {
        Row: {
          id: string;
          event_id: string;
          narrator_id: string;
          title: string;
          status: StreamStatus;
          listener_count: number;
          peak_listeners: number;
          sync_offset_ms: number | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          narrator_id: string;
          title: string;
          status?: StreamStatus;
          listener_count?: number;
          peak_listeners?: number;
          sync_offset_ms?: number | null;
        };
        Update: {
          title?: string;
          status?: StreamStatus;
          listener_count?: number;
          peak_listeners?: number;
          sync_offset_ms?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          narrator_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          narrator_id: string;
        };
        Update: never;
      };
      reactions: {
        Row: {
          id: string;
          stream_id: string;
          user_id: string;
          type: ReactionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          stream_id: string;
          user_id: string;
          type: ReactionType;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_status: EventStatus;
      stream_status: StreamStatus;
      user_role: UserRole;
      reaction_type: ReactionType;
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Stream = Database["public"]["Tables"]["streams"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];

export type StreamWithNarrator = Stream & {
  narrator: Profile;
};

export type EventWithStreams = Event & {
  streams: StreamWithNarrator[];
};
