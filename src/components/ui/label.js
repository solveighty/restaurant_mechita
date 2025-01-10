import * as LabelPrimitive from "@radix-ui/react-label"

const Label = ({ className, ...props }) => {
  return (
    <LabelPrimitive.Root
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
}

export { Label } 