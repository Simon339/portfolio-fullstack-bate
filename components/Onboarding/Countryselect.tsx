/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const countries = [
  { code: "US", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
]

// Map of country names for display
const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  JP: "Japan",
  ZA: "South Africa",
}

interface CountrySelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const CountrySelect = ({ value, onValueChange, disabled = false }: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false)

  // Find the country by code or try to match by name
  const selectedCountry = countries.find(
    (country) => country.code === value || countryNames[country.code]?.toLowerCase() === value.toLowerCase(),
  )

  // Format for display
  const getCountryDisplay = (code: string) => {
    const country = countries.find((c) => c.code === code)
    if (!country) return value
    return `${country.flag} ${countryNames[code]} ${country.dialCode}`
  }

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-slate-50 border-[#acc2ef] hover:bg-slate-100 hover:border-[#acc2ef]",
            !value && "text-muted-foreground",
          )}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{countryNames[selectedCountry.code]}</span>
              <span className="text-slate-500 text-sm">{selectedCountry.dialCode}</span>
            </span>
          ) : (
            value || "Select country"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#acc2ef]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-slate-50 border-[#acc2ef]">
        <Command className="bg-slate-50">
          <CommandInput placeholder="Search country..." className="border-b-[#acc2ef] focus:ring-[#acc2ef]" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={countryNames[country.code]}
                  onSelect={() => {
                    onValueChange(country.code)
                    setOpen(false)
                  }}
                  className="hover:bg-slate-100"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-[#acc2ef]",
                      selectedCountry?.code === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="mr-2">{country.flag}</span>
                  <span>{countryNames[country.code]}</span>
                  <span className="ml-auto text-slate-500">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default CountrySelect

