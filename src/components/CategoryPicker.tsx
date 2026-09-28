import type { FC, InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES, tint } from "@/lib/config";

interface Props {
  selected: string;
  // props del radio: il risultato di register() di react-hook-form oppure name/onChange
  inputProps: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };
  controlled?: boolean;
}

export const CategoryPicker: FC<Props> = ({ selected, inputProps, controlled }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
    {CATEGORIES.map(({ name, icon: Icon, color }) => {
      const active = selected === name;
      return (
        <label
          key={name}
          className={cn(
            "group flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition-all",
            active ? "border-transparent shadow-md" : "border-line hover:border-ink/20",
          )}
          style={active ? { backgroundColor: tint(color, "1a"), boxShadow: `inset 0 0 0 2px ${color}` } : undefined}
        >
          <input
            type="radio"
            value={name}
            className="sr-only"
            {...(controlled ? { checked: active } : {})}
            {...inputProps}
          />
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: active ? color : tint(color), color: active ? "#fff" : color }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="line-clamp-1 w-full text-[11px] font-semibold leading-tight">
            {name === "Piano accumulo bitcoin" ? "PAC Bitcoin" : name}
          </span>
        </label>
      );
    })}
  </div>
);
