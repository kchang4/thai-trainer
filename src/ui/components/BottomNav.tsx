export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface BottomNavProps {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function BottomNav({ items, active, onSelect }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface-raised"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                className={[
                  "flex w-full flex-col items-center gap-0.5 py-2",
                  "font-display text-xs font-bold",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
                  isActive ? "text-primary" : "text-on-surface-muted",
                ].join(" ")}
              >
                <span aria-hidden className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
