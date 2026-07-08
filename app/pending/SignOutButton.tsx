"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AppButton } from "@/components/ui";

const SignOutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <AppButton variant="outline" loading={loading} onClick={handleSignOut}>
      Sign out
    </AppButton>
  );
};

export default SignOutButton;
