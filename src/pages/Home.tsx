import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Brain, Share2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-8">
            Unleash Your Ideas with
            <span className="text-blue-600"> AI-Powered</span> Whiteboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Draw, sketch, and visualize your thoughts while our AI assistant helps you solve problems,
            explain concepts, and bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Pencil className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Draw Freely</h3>
            <p className="text-gray-600">
              Intuitive drawing tools that feel natural and responsive, just like a real whiteboard.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Get instant feedback and solutions for mathematical equations, code snippets, and diagrams.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Collaborate</h3>
            <p className="text-gray-600">
              Save your work and share it with others to collaborate on ideas and solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};