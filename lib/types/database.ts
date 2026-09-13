// Hand-maintained types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is linked,
// and keep this file in sync until then.

export type ContentType = "resource" | "audio" | "video";
export type Tier = "free" | "member";
export type ProfileRole = "member" | "admin";
export type MembershipStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: ProfileRole;
  created_at: string;
}

export interface Membership {
  id: string;
  profile_id: string | null;
  email: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: MembershipStatus;
  price_id: string | null;
  current_period_end: string | null;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  description: string | null;
  tier: Tier;
  cover_image_url: string | null;
  file_url: string | null;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
  duration_seconds: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tier: Tier;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  tier: Tier | null;
  body: string | null;
  content_item_id: string | null;
  sort_order: number;
}

export interface CourseProgress {
  id: string;
  profile_id: string;
  lesson_id: string;
  completed_at: string;
}

// Metadata-only shapes returned by the *_public views — never include a
// gated field (mux_playback_id, file_url, lesson body) here, since these
// views are readable by anyone regardless of tier.
export interface ContentItemPreview {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  description: string | null;
  tier: Tier;
  cover_image_url: string | null;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
}

export interface CoursePreview {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tier: Tier;
  cover_image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface CourseModulePreview {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
}

export interface CourseLessonPreview {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  tier: Tier;
  sort_order: number;
}

// Every Table/View below needs a `Relationships` array (even if empty) and
// the schema needs a `Functions` map — both required by @supabase/postgrest-js's
// GenericSchema/GenericTable constraints. Omitting them silently collapses
// every `.from(...)` call's inferred Row type to `never`.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      memberships: {
        Row: Membership;
        Insert: Partial<Membership> & Pick<Membership, "email" | "stripe_customer_id" | "status">;
        Update: Partial<Membership>;
        Relationships: [];
      };
      content_items: {
        Row: ContentItem;
        Insert: Partial<ContentItem> & Pick<ContentItem, "type" | "slug" | "title">;
        Update: Partial<ContentItem>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & Pick<Course, "slug" | "title">;
        Update: Partial<Course>;
        Relationships: [];
      };
      course_modules: {
        Row: CourseModule;
        Insert: Partial<CourseModule> & Pick<CourseModule, "course_id" | "title">;
        Update: Partial<CourseModule>;
        Relationships: [];
      };
      course_lessons: {
        Row: CourseLesson;
        Insert: Partial<CourseLesson> & Pick<CourseLesson, "module_id" | "title" | "slug">;
        Update: Partial<CourseLesson>;
        Relationships: [];
      };
      course_progress: {
        Row: CourseProgress;
        Insert: Partial<CourseProgress> & Pick<CourseProgress, "profile_id" | "lesson_id">;
        Update: Partial<CourseProgress>;
        Relationships: [];
      };
    };
    Views: {
      content_items_public: { Row: ContentItemPreview; Relationships: [] };
      courses_public: { Row: CoursePreview; Relationships: [] };
      course_modules_public: { Row: CourseModulePreview; Relationships: [] };
      course_lessons_public: { Row: CourseLessonPreview; Relationships: [] };
    };
    Functions: {
      is_member: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
  };
}
