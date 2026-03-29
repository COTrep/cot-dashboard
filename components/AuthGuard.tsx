import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("cot_auth") === "true";
    if (!ok && router.pathname !== "/login") {
      router.replace("/login");
    } else {
      setAuth(true);
    }
  }, [router]);

  if (!auth) return null;
  return <>{children}</>;
}