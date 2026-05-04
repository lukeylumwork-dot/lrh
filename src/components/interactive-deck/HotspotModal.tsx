import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
}

export function HotspotModal({ open, onOpenChange, title, body }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg overflow-hidden p-0 sm:w-full">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-tight">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-5">
            <DialogDescription asChild>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {body || (
                  <span className="text-muted-foreground">No details provided.</span>
                )}
              </div>
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
