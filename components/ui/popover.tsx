"use client"

import * as React from "react"
import {
  Popover as RadixPopover,
  PopoverContent as RadixPopoverContent,
  PopoverTrigger as RadixPopoverTrigger,
} from "@radix-ui/react-popover"

const Popover = ({ children, ...props }: React.ComponentProps<typeof RadixPopover>) => (
  <RadixPopover {...props}>{children}</RadixPopover>
)
Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof RadixPopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixPopoverTrigger>
>(({ children, className, ...props }, ref) => (
  <RadixPopoverTrigger ref={ref} className={className} {...props}>
    {children}
  </RadixPopoverTrigger>
))
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopoverContent>,
  React.ComponentPropsWithoutRef<typeof RadixPopoverContent>
>(({ children, className, ...props }, ref) => (
  <RadixPopoverContent
    ref={ref}
    className={`z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[side=bottom]:translate-y-1 data-[side=left]:translate-x-[-4px] data-[side=right]:translate-x-[4px] data-[side=top]:translate-y-[-4px] ${className}`}
    {...props}
  >
    {children}
  </RadixPopoverContent>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
