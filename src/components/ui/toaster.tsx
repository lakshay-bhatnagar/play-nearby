import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="down" duration={2200}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="!p-3 !pr-8 !rounded-2xl !shadow-md !min-h-0 !w-auto !max-w-[92vw] mx-auto bg-card/95 backdrop-blur-xl border border-border"
          >
            <div className="grid gap-0.5">
              {title && <ToastTitle className="text-xs font-semibold leading-tight">{title}</ToastTitle>}
              {description && <ToastDescription className="text-[11px] opacity-80 leading-tight">{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose className="!top-1.5 !right-1.5 opacity-50" />
          </Toast>
        );
      })}
      <ToastViewport className="!top-auto !bottom-24 !left-1/2 !-translate-x-1/2 !right-auto !flex !flex-col !items-center !p-0 !w-auto !max-w-[92vw] sm:!bottom-24 sm:!right-auto sm:!left-1/2" />
    </ToastProvider>
  );
}
