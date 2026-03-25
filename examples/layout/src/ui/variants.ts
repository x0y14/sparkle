export type Color = "default" | "primary" | "secondary" | "success" | "warning" | "danger"
export type Size = "sm" | "md" | "lg"
export type Radius = "none" | "sm" | "md" | "lg" | "full"

// -- solid color (button, badge, chip, alert) --
export const solid: Record<Color, string> = {
  default: "bg-default-200 text-default-800",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-black",
  danger: "bg-danger text-white",
}

// -- flat color --
export const flat: Record<Color, string> = {
  default: "bg-default-100 text-default-800",
  primary: "bg-primary-50 text-primary-600",
  secondary: "bg-secondary-50 text-secondary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
}

// -- bordered color --
export const bordered: Record<Color, string> = {
  default: "border border-default-300 text-default-800",
  primary: "border border-primary text-primary",
  secondary: "border border-secondary text-secondary",
  success: "border border-success text-success",
  warning: "border border-warning text-warning",
  danger: "border border-danger text-danger",
}

// -- light color --
export const light: Record<Color, string> = {
  default: "text-default-800",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

// -- dot/fill color (progress, meter, slider) --
export const dot: Record<Color, string> = {
  default: "bg-default-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

// -- text color (link, icon) --
export const textColor: Record<Color, string> = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

// -- button variant → color map --
export const buttonVariant: Record<string, Record<Color, string>> = {
  solid: {
    default: "bg-default-200 text-default-800 hover:bg-default-300",
    primary: "bg-primary text-white hover:bg-primary-600",
    secondary: "bg-secondary text-white hover:bg-secondary-600",
    success: "bg-success text-white hover:bg-success-600",
    warning: "bg-warning text-black hover:bg-warning-600",
    danger: "bg-danger text-white hover:bg-danger-600",
  },
  bordered: {
    default: "border-2 border-default-300 text-default-800 hover:bg-default-100",
    primary: "border-2 border-primary text-primary hover:bg-primary-50",
    secondary: "border-2 border-secondary text-secondary hover:bg-secondary-50",
    success: "border-2 border-success text-success hover:bg-success-50",
    warning: "border-2 border-warning text-warning hover:bg-warning-50",
    danger: "border-2 border-danger text-danger hover:bg-danger-50",
  },
  light: {
    default: "text-default-800 hover:bg-default-100",
    primary: "text-primary hover:bg-primary-50",
    secondary: "text-secondary hover:bg-secondary-50",
    success: "text-success hover:bg-success-50",
    warning: "text-warning hover:bg-warning-50",
    danger: "text-danger hover:bg-danger-50",
  },
  flat: {
    default: "bg-default-100 text-default-800 hover:bg-default-200",
    primary: "bg-primary-50 text-primary-600 hover:bg-primary-100",
    secondary: "bg-secondary-50 text-secondary-600 hover:bg-secondary-100",
    success: "bg-success-50 text-success-600 hover:bg-success-100",
    warning: "bg-warning-50 text-warning-600 hover:bg-warning-100",
    danger: "bg-danger-50 text-danger-600 hover:bg-danger-100",
  },
  faded: {
    default: "bg-default-100 border border-default-200 text-default-800 hover:bg-default-200",
    primary: "bg-default-100 border border-default-200 text-primary hover:bg-default-200",
    secondary: "bg-default-100 border border-default-200 text-secondary hover:bg-default-200",
    success: "bg-default-100 border border-default-200 text-success hover:bg-default-200",
    warning: "bg-default-100 border border-default-200 text-warning hover:bg-default-200",
    danger: "bg-default-100 border border-default-200 text-danger hover:bg-default-200",
  },
  shadow: {
    default: "bg-default-200 text-default-800 shadow-lg shadow-default-200/50 hover:shadow-default-300/60",
    primary: "bg-primary text-white shadow-lg shadow-primary/40 hover:shadow-primary/50",
    secondary: "bg-secondary text-white shadow-lg shadow-secondary/40 hover:shadow-secondary/50",
    success: "bg-success text-white shadow-lg shadow-success/40 hover:shadow-success/50",
    warning: "bg-warning text-black shadow-lg shadow-warning/40 hover:shadow-warning/50",
    danger: "bg-danger text-white shadow-lg shadow-danger/40 hover:shadow-danger/50",
  },
  ghost: {
    default: "border-2 border-default-300 text-default-800 hover:bg-default-200",
    primary: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    secondary: "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white",
    success: "border-2 border-success text-success hover:bg-success hover:text-white",
    warning: "border-2 border-warning text-warning hover:bg-warning hover:text-black",
    danger: "border-2 border-danger text-danger hover:bg-danger hover:text-white",
  },
}

// -- button size --
export const buttonSize: Record<Size, string> = {
  sm: "text-xs px-3 h-8 min-w-16 gap-1",
  md: "text-sm px-4 h-10 min-w-20 gap-2",
  lg: "text-base px-6 h-12 min-w-24 gap-2",
}

// -- button size (fit: fill host, no fixed height) --
export const buttonSizeFit: Record<Size, string> = {
  sm: "text-xs px-3 gap-1",
  md: "text-sm px-4 gap-2",
  lg: "text-base px-6 gap-2",
}

export const buttonIconOnlySize: Record<Size, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
}

export const buttonIconOnlySizeFit: Record<Size, string> = {
  sm: "", md: "", lg: "",
}

// -- chip size --
export const chipSize: Record<Size, string> = {
  sm: "text-xs px-1.5 h-5",
  md: "text-xs px-2 h-6",
  lg: "text-sm px-2.5 h-7",
}

// -- badge size --
export const badgeSize: Record<Size, string> = {
  sm: "text-[10px] min-w-4 h-4 px-1",
  md: "text-xs min-w-5 h-5 px-1",
  lg: "text-sm min-w-6 h-6 px-1.5",
}

// -- avatar size --
export const avatarSize: Record<Size, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
}

// -- spinner size --
export const spinnerSize: Record<Size, string> = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
}

// -- input variant --
export const inputVariant: Record<string, string> = {
  flat: "bg-default-100 hover:bg-default-200 focus-within:bg-default-100",
  bordered: "border-2 border-default-200 hover:border-default-400 focus-within:border-primary",
  faded: "bg-default-100 border-2 border-default-200 hover:border-default-400 focus-within:border-primary",
  underlined: "border-b-2 border-default-200 hover:border-default-400 focus-within:border-primary rounded-none",
}

// -- input size --
export const inputSize: Record<Size, string> = {
  sm: "h-8 text-xs px-2",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
}

// -- input size (fit: fill host, no fixed height) --
export const inputSizeFit: Record<Size, string> = {
  sm: "text-xs px-2",
  md: "text-sm px-3",
  lg: "text-base px-4",
}

// -- card variant --
export const cardVariant: Record<string, string> = {
  flat: "bg-content1",
  bordered: "bg-content1 border border-default-200",
  shadow: "bg-content1 shadow-md",
}

// -- radius --
export const radius: Record<Radius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
}

// -- text size --
export const textSize: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

// -- progress track size --
export const progressTrackSize: Record<Size, string> = {
  sm: "h-1",
  md: "h-3",
  lg: "h-5",
}

// -- close button size --
export const closeButtonSize: Record<Size, string> = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
}

// -- badge placement --
export const badgePlacement: Record<string, string> = {
  "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
  "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
}

// -- switch size --
export const switchTrackSize: Record<Size, string> = {
  sm: "w-8 h-4",
  md: "w-10 h-5",
  lg: "w-12 h-6",
}

export const switchThumbSize: Record<Size, string> = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
}

// -- checkbox size --
export const checkboxSize: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
}

// -- radio size --
export const radioSize: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
}

// -- slider track size --
export const sliderTrackSize: Record<Size, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
}

export const sliderThumbSize: Record<Size, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
}
