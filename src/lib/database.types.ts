export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      impostazioni_dispositivo: {
        Row: {
          device_id: string;
          updated_at: string;
          usa_ricette_standard: boolean;
        };
        Insert: {
          device_id: string;
          updated_at?: string;
          usa_ricette_standard?: boolean;
        };
        Update: {
          device_id?: string;
          updated_at?: string;
          usa_ricette_standard?: boolean;
        };
        Relationships: [];
      };
      ricette_standard: {
        Row: {
          created_at: string;
          id: string;
          ingredienti: string | null;
          procedimento: string | null;
          nome: string;
          pasto: string[] | null;
          tag: string[];
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredienti?: string | null;
          procedimento?: string | null;
          nome: string;
          pasto?: string[] | null;
          tag?: string[];
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredienti?: string | null;
          procedimento?: string | null;
          nome?: string;
          pasto?: string[] | null;
          tag?: string[];
        };
        Relationships: [];
      };
      ricette_utente: {
        Row: {
          created_at: string;
          device_id: string;
          libro: string;
          id: string;
          ingredienti: string | null;
          procedimento: string | null;
          nome: string;
          pasto: string[] | null;
          tag: string[];
        };
        Insert: {
          created_at?: string;
          device_id: string;
          libro: string;
          id?: string;
          ingredienti?: string | null;
          procedimento?: string | null;
          nome: string;
          pasto?: string[] | null;
          tag?: string[];
        };
        Update: {
          created_at?: string;
          device_id?: string;
          libro?: string;
          id?: string;
          ingredienti?: string | null;
          procedimento?: string | null;
          nome?: string;
          pasto?: string[] | null;
          tag?: string[];
        };
        Relationships: [];
      };
      libri: {
        Row: {
          codice: string;
          nome: string;
          password_hash: string | null;
          created_at: string;
        };
        Insert: {
          codice: string;
          nome?: string;
          password_hash?: string | null;
          created_at?: string;
        };
        Update: {
          codice?: string;
          nome?: string;
          password_hash?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      crea_libro: {
        Args: { p_codice: string; p_nome: string; p_password?: string | null };
        Returns: void;
      };
      rinomina_libro: {
        Args: { p_codice: string; p_nome: string };
        Returns: void;
      };
      verifica_password_libro: {
        Args: { p_codice: string; p_password: string };
        Returns: boolean;
      };
      libri_info: {
        Args: { p_codici: string[] };
        Returns: { codice: string; nome: string; protetto: boolean }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
