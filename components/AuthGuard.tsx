import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    if (router.pathname === "/login") {
      setAuth(true);
      return;
    }
    fetch("/api/check")
      .then((r) => {
        if (r.ok) setAuth(true);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!auth) return null;
  return <>{children}</>;
}