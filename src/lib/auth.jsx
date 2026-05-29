import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u) => {
    if (!u) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Timeout safety — nëse Supabase nuk përgjigjet brenda 8s
    const timeout = setTimeout(() => {
      console.warn("Profile load timeout");
      setProfile(null);
      setLoading(false);
    }, 8000);

    try {
      // 1. Platform admin?
      const { data: admin } = await supabase
        .from("platform_admins")
        .select("id, email, name, auth_id")
        .eq("auth_id", u.id)
        .maybeSingle();

      if (admin) {
        clearTimeout(timeout);
        setProfile({ type: "admin", data: admin });
        setLoading(false);
        return;
      }

      // 2. Gym user me auth_id?
      const { data: gymUser } = await supabase
        .from("gym_users")
        .select("*, gym:gyms(*)")
        .eq("auth_id", u.id)
        .eq("is_active", true)
        .maybeSingle();

      if (gymUser) {
        clearTimeout(timeout);
        setProfile({ type: "gym", data: gymUser, gym: gymUser.gym });
        setLoading(false);
        return;
      }

      // 3. Gym user me email (hera e parë — lidh auth_id)
      const { data: byEmail } = await supabase
        .from("gym_users")
        .select("*, gym:gyms(*)")
        .eq("email", u.email)
        .is("auth_id", null)
        .eq("is_active", true)
        .maybeSingle();

      if (byEmail) {
        await supabase
          .from("gym_users")
          .update({ auth_id: u.id })
          .eq("id", byEmail.id);

        clearTimeout(timeout);
        setProfile({
          type: "gym",
          data: { ...byEmail, auth_id: u.id },
          gym: byEmail.gym,
        });
        setLoading(false);
        return;
      }

      // 4. Nuk u gjet asgjë
      clearTimeout(timeout);
      setProfile(null);
      setLoading(false);
    } catch (e) {
      clearTimeout(timeout);
      console.error("loadProfile:", e.message);
      setProfile(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_IN") loadProfile(u);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  };

  return (
    <Ctx.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
        isAdmin: profile?.type === "admin",
        isGym: profile?.type === "gym",
        gymId: profile?.gym?.id ?? null,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
