// src/dashboard/supabase-config.js
// Configuration et instance unique du client Supabase.
//
// Le SDK est chargé depuis un CDN ESM, donc pas besoin de bundler.
// On n'expose qu'une seule instance (singleton) pour éviter les warnings.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const SUPABASE_URL = 'https://jhpfmtjvgckbdnwcbcwm.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocGZtdGp2Z2NrYmRud2NiY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NzU2ODIsImV4cCI6MjA5NDA1MTY4Mn0.E8wiiPTkbCBEPntw07VMn4yJltEgbEmECoGxQ0JOqVU';

// Singleton client. Toutes les pages doivent importer celui-ci.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,         // garde la session dans localStorage de l'origine
    autoRefreshToken: true,       // refresh auto les tokens
    detectSessionInUrl: true,     // récupère la session après le callback OAuth
    flowType: 'pkce',             // plus secure que implicit pour SPA
  },
});
