import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © {currentYear} AI Blackboard. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">By Tarin Agarwal</span>
            <a
              href="https://github.com/tarinagarwal/ai-blackboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};