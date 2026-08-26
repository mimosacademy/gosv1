-- Phase 1 / 002: application enums
create type public.app_role as enum ('admin','staff','viewer');
create type public.n_a_state as enum ('not_applicable','provided','pending','unknown');
