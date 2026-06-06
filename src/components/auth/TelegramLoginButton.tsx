"use client";

import { useEffect, useRef } from "react";

interface Props {
  botUsername: string;
  onAuth: (data: any) => void;
}

export default function TelegramLoginButton({ botUsername, onAuth }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const onAuthRef = useRef(onAuth);

  // onAuth ni ref da saqlaymiz — stale closure muammosini hal qiladi
  useEffect(() => {
    onAuthRef.current = onAuth;
  }, [onAuth]);

  useEffect(() => {
    (window as any).TelegramLoginCallback = (data: any) => {
      onAuthRef.current(data);
    };

    const timer = setTimeout(() => {
      const el = ref.current;
      if (!el) {
        console.log("ref.current null!");
        return;
      }
      if (el.querySelector("script")) {
        console.log("script allaqachon bor");
        return;
      }

      console.log("script qo'shilmoqda...", botUsername);

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", botUsername);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "TelegramLoginCallback(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;
      el.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timer);
      delete (window as any).TelegramLoginCallback;
    };
  }, [botUsername]);

  return (
    <div ref={ref} className="flex justify-center min-h-12.5" />
  );
}