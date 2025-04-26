
import { ReactNode } from 'react';
import logo from '../assets/logo.png';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src={logo}
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
