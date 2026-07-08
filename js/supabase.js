const supabaseUrl =
'https://cfwqfsenyjzsuckydppb.supabase.co';

const supabaseKey =
'sb_publishable_-yQFO1GgMWZSj9j2kRzj5A_INdpc7qA';

const {
createClient
} = supabase;

window.supabaseClient =
createClient(
supabaseUrl,
supabaseKey
);