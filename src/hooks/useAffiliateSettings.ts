"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { useApi } from "./useApi";
import { toast } from "sonner";

interface Bank {
  name: string;
  code: string;
}

interface Profile {
  fullName: string | null;
  email: string | null;
  phone: string | null;
}

interface BankState {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  accountVerified: boolean;
  accountVerifying: boolean;
}

export const useAffiliateSettings = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { post } = useApi();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [bankState, setBankState] = useState<BankState>({
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
    accountVerified: false,
    accountVerifying: false,
  });

  const [banks, setBanks] = useState<Bank[]>([]);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch banks on mount
  useEffect(() => {
    const getBanks = async () => {
      try {
        const res = await fetch("/api/banks");
        const json = await res.json();
        setBanks(json?.banks || []);
      } catch (e) {
        console.warn("Could not load banks", e);
      }
    };
    getBanks();
  }, []);

  // Fetch user profile on mount or when user changes
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      const userBankCode = user.bankCode || "";
      const userAccountNumber = user.accountNumber || "";
      const userAccountName = user.accountName || "";

      setBankState((prev) => ({
        ...prev,
        bankCode: userBankCode,
        accountNumber: userAccountNumber,
        accountName: userAccountName,
        accountVerified: !!(
          userAccountName &&
          userBankCode &&
          userAccountNumber
        ),
      }));

      // Set bank name from banks list
      if (userBankCode && banks.length > 0) {
        const bank = banks.find((b) => b.code === userBankCode);
        if (bank) {
          setBankState((prev) => ({ ...prev, bankName: bank.name }));
        }
      }
    }
    setLoading(false);
  }, [user, banks]);

  const updateProfileField = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateBankField = (
    field: keyof Omit<BankState, "accountVerifying" | "accountVerified">,
    value: string
  ) => {
    setBankState((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updatePayload: any = {
        fullName: profile.fullName,
        phone: profile.phone,
      };

      if (bankState.bankCode) updatePayload.bankCode = bankState.bankCode;
      if (bankState.accountNumber)
        updatePayload.accountNumber = bankState.accountNumber;
      if (bankState.accountName)
        updatePayload.accountName = bankState.accountName;

      const result = await post("/api/user/update-profile", updatePayload);

      if (result?.error) {
        toast.error(result.error, { id: "profile-update" });
        return;
      }

      dispatch(setUser(result.user));
      toast.success("Profile updated successfully", { id: "profile-update" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", { id: "profile-update" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match", { id: "password-change" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters", {
        id: "password-change",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const result = await post("/api/user/change-password", {
        newPassword: passwordData.newPassword,
      });

      if (result?.error) {
        toast.error(result.error, { id: "password-change" });
        return;
      }

      toast.success("Password updated successfully", { id: "password-change" });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password", { id: "password-change" });
    } finally {
      setChangingPassword(false);
    }
  };

  return {
    user,
    loading,
    profile,
    updateProfileField,
    bankState,
    updateBankField,
    banks,
    saving,
    changingPassword,
    passwordData,
    setPasswordData,
    handleProfileUpdate,
    handlePasswordChange,
  };
};
