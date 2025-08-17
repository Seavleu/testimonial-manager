'use client';

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const toast = (options: ToastOptions) => {
  const { title, description, variant } = options;
  
  if (variant === 'destructive') {
    return sonnerToast.error(description || title || 'Error');
  }
  
  if (title && description) {
    return sonnerToast(title, {
      description,
    });
  }
  
  return sonnerToast(description || title || 'Success');
};

export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
};

export { toast };
