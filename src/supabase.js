import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ynqeiubvzgltzjezslpg.supabase.co'
const supabaseAnonKey = 'sb_publishable_jHthmcjve4EDSQHYoTF_OA_KigblgtC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)