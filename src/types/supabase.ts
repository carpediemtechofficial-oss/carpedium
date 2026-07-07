export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string | null;
          long_description: string | null;
          overview: string | null;
          difficulty: string | null;
          duration: string | null;
          language: string | null;
          instructor: string | null;
          price: string | null;
          discount_price: string | null;
          course_image: string | null;
          banner_image: string | null;
          preview_video: string | null;
          rating: number | null;
          students_enrolled: number | null;
          certificate_included: boolean | null;
          projects_included: number | null;
          placement_support: boolean | null;
          tools_covered: string[] | null;
          career_outcomes: string[] | null;
          requirements: string[] | null;
          curriculum: Json | null;
          faqs: Json | null;
          status: string | null;
          seo_title: string | null;
          seo_description: string | null;
          meta_keywords: string | null;
          is_published: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['courses']['Row']>;
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
      };
      mentors: {
        Row: {
          id: string;
          name: string;
          designation: string | null;
          company: string | null;
          experience: string | null;
          bio: string | null;
          linkedin: string | null;
          github: string | null;
          twitter: string | null;
          website: string | null;
          skills: string[] | null;
          profile_image: string | null;
          display_order: number | null;
          featured_toggle: boolean | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['mentors']['Row']>;
        Update: Partial<Database['public']['Tables']['mentors']['Row']>;
      };
      testimonials: {
        Row: {
          id: string;
          student_name: string;
          photo: string | null;
          course: string | null;
          company: string | null;
          job_role: string | null;
          rating: number | null;
          review: string;
          video_testimonial: string | null;
          linkedin: string | null;
          date: string | null;
          featured: boolean | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['testimonials']['Row']>;
        Update: Partial<Database['public']['Tables']['testimonials']['Row']>;
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['settings']['Row']>;
        Update: Partial<Database['public']['Tables']['settings']['Row']>;
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          profile_photo: string | null;
          gender: string | null;
          date_of_birth: string | null;
          email: string | null;
          mobile: string | null;
          alternate_number: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          course_id: string | null;
          course_name: string | null;
          batch: string | null;
          enrollment_date: string | null;
          expected_completion_date: string | null;
          mentor_id: string | null;
          mentor_name: string | null;
          learning_mode: string | null;
          attendance_percentage: number | null;
          total_classes: number | null;
          classes_attended: number | null;
          project_title: string | null;
          github_link: string | null;
          drive_link: string | null;
          live_demo_link: string | null;
          project_status: string | null;
          mentor_feedback: string | null;
          certificate_issued: boolean | null;
          certificate_number: string | null;
          certificate_verification_url: string | null;
          certificate_issue_date: string | null;
          resume_link: string | null;
          linkedin: string | null;
          portfolio: string | null;
          current_company: string | null;
          job_role: string | null;
          salary_package: string | null;
          placement_status: string | null;
          doc_resume: string | null;
          doc_id_proof: string | null;
          doc_offer_letter: string | null;
          doc_internship_certificate: string | null;
          doc_course_certificate: string | null;
          fees_total: number | null;
          fees_paid: number | null;
          pending_fees: number | null;
          invoice_number: string | null;
          lead_status: string | null;
          counsellor_notes: string | null;
          admin_notes: string | null;
          mentor_notes: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['students']['Row']>;
        Update: Partial<Database['public']['Tables']['students']['Row']>;
      };
      student_interactions: {
        Row: {
          id: string;
          student_id: string;
          type: string | null;
          notes: string | null;
          follow_up_date: string | null;
          lead_status: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['student_interactions']['Row']>;
        Update: Partial<Database['public']['Tables']['student_interactions']['Row']>;
      };
      student_payments: {
        Row: {
          id: string;
          student_id: string;
          amount: number | null;
          installment_no: number | null;
          invoice_number: string | null;
          receipt_url: string | null;
          method: string | null;
          payment_date: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['student_payments']['Row']>;
        Update: Partial<Database['public']['Tables']['student_payments']['Row']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
