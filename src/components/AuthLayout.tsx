
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/lovable-uploads/c1a690d0-2bbc-48da-acef-49803b92983e.png"
            alt="DarijaCode Hub Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            DarijaCode Hub
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
