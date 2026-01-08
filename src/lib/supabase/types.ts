/* eslint-disable @typescript-eslint/no-explicit-any */
export type Database = {
  public: {
    Tables: any;
    Views: any;
    Functions: any;
    Enums: any;
    CompositeTypes: any;
  };
};

export type SupabaseUserMetadata = Record<string, unknown>;
