import { FileImage, FileVideo } from "lucide-react"

interface PlaceholderProps {
  type: "image" | "video"
  className?: string
}

export function PlaceholderMedia({ type, className }: PlaceholderProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-muted ${className}`}>
      {type === "image" ? (
        <FileImage className="h-12 w-12 text-muted-foreground/50" />
      ) : (
        <FileVideo className="h-12 w-12 text-muted-foreground/50" />
      )}
    </div>
  )
}