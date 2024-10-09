import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type Props<T> = {
  value?: T;
  placeholder: string;
  handleSelect: (value?: T) => void;
  prefilled: T[];
  handleSearch: (query: string) => T[];
  renderItem: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
};

export default function AutoComplete<T>({
  value,
  placeholder,
  handleSelect,
  prefilled,
  handleSearch,
  renderItem,
  getItemId,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState(prefilled);

  const handleInputChange = (query: string) => {
    const newOptions = handleSearch(query);
    setOptions(newOptions);
    setQuery(query);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-3/4 justify-between"
        >
          {value ? renderItem(value) : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={handleInputChange}
            placeholder="Search..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={getItemId(item)}
                  value={getItemId(item)}
                  onSelect={(id) => {
                    if (value && id === getItemId(value)) {
                      handleSelect(undefined);
                    } else {
                      const rs = options.find((o) => id === getItemId(o));
                      handleSelect(rs);
                    }
                    setOpen(false);
                  }}
                >
                  {renderItem(item)}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === getItemId(item) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
