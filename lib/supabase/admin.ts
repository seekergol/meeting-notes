import { createClient } from "@supabase/supabase-js";

// IMPORTANT: This client is meant for server-side use only.
// It uses the service role key and has admin privileges.
// Do not expose this to the client-side.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey); 