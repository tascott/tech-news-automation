import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process.env.DEEP_SUPABASE_URL;
const supabaseKey = process.env.DEEP_SUPABASE_SERVICE_KEY;
export const supabase = createClient(supabaseUrl,DEEP_SUPABASE_SERVICE_KEY);