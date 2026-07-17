import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-3 -left-3 md:-top-4 md:-left-4 bg-black text-white rounded-full p-1.5 md:p-2 shadow-xl hover:bg-black/80 transition-colors z-[110]"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          className="max-w-full max-h-[85vh] object-contain rounded-xl"
        />
      </div>
    </div>
  );
}
