import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          {/* Illustration */}
          <div className="mb-8">
            <svg
              className="w-64 h-64 mx-auto"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" fill="#F3F4F6" className="dark:fill-gray-800" />
              
              {/* Magnifying glass */}
              <circle cx="70" cy="70" r="40" stroke="#6B7280" strokeWidth="4" className="dark:stroke-gray-400" />
              <line x1="90" y1="90" x2="130" y2="130" stroke="#6B7280" strokeWidth="4" className="dark:stroke-gray-400" />
              
              {/* 404 text */}
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-4xl font-bold fill-gray-600 dark:fill-gray-300"
              >
                404
              </text>
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            {t('notFound.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('notFound.message')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="px-6 py-2"
            >
              {t('notFound.goBack')}
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="px-6 py-2"
            >
              {t('notFound.goHome')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
