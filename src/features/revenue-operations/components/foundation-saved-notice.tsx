"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";
/** Presentation-only confirmation; all business state is read from server services. */
export function FoundationSavedNotice() {
  const saved = useSearchParams().get("saved") === "1";
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [saved]);
  return saved && visible ? <Alert variant="success">Changes saved.</Alert> : null;
}
