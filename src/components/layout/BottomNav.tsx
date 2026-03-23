"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, User } from "lucide-react";

const TABS = [
  { href: "/", Icon: Home, label: "หน้าแรก" },
  { href: "/map", Icon: Map, label: "แผนที่" },
  { href: "/profile", Icon: User, label: "โปรไฟล์" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around py-2">
        {TABS.map((tab) => {
          const { href, Icon, label } = tab;
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs ${
                active ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}