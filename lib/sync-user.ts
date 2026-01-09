import { createClient } from "@supabase/supabase-js";

interface WhopUserData {
  id: string;
  username: string;
  name?: string;
  email?: string;
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function syncWhopUser(whopUser: WhopUserData): Promise<void> {
  try {
    const supabase = getSupabase();
    
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id, username")
      .eq("id", whopUser.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing user:", fetchError);
      return;
    }

    if (existingUser) {
      // Update existing user if username changed
      if (existingUser.username !== whopUser.username) {
        await supabase
          .from("users")
          .update({
            username: whopUser.username,
            email: whopUser.email || `${whopUser.id}@whop.user`,
          })
          .eq("id", whopUser.id);
      }
    } else {
      // Create new user
      const { error: insertError } = await supabase.from("users").insert({
        id: whopUser.id,
        username: whopUser.username,
        email: whopUser.email || `${whopUser.id}@whop.user`,
        is_admin: false,
      });

      if (insertError) {
        console.error("Error creating user:", insertError);
      }
    }
  } catch (error) {
    console.error("Error syncing Whop user:", error);
  }
}
