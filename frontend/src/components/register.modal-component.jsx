import React, { useState } from "react";
import { X, CheckCircle, Loader2, CircleX } from "lucide-react";

export const SuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg shadow-dark-grey w-full max-w-md relative border-[1px] hover:border-[0px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center p-6 pt-8 pb-8">
          <div className="text-green-500 mb-4">
            <CheckCircle size={56} color="#36b125" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Success! You're In!
          </h2>

          <p className="text-gray-600 mb-8">
            Congrats! You've officially joined the deBlog community. Feel free to tweak your profile anytime from the dashboard.
          </p>

          <button
            onClick={onClose}
            className="bg-black hover:bg-gray-700 text-white hover:rounded-3xl font-medium py-2 px-4 rounded-2xl w-full max-w-xs"
          >
            Sweet, Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export const ErrorModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg shadow-dark-grey w-full max-w-md relative border-[1px] hover:border-[0px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center p-6 pt-8 pb-8">
          <div className="text-red-500 mb-4">
            <CircleX size={56} color="#b51c1c" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Registration Failed
          </h2>

          <p className="text-gray-600 mb-8">
            Something went sideways. Let's give it another try!
          </p>

          <button
            onClick={onClose}
            className="bg-black hover:bg-gray-700 text-white hover:rounded-3xl font-medium py-2 px-4 rounded-2xl w-full max-w-xs"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, text = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <Loader2
            color="#322f2f"
            className="h-12 w-12 animate-spin text-blue-500"
          />
          <p className="mt-4 text-gray-700 font-medium text-center">
            {text} Hang tight, good things take time!
          </p>
        </div>
      </div>
    </div>
  );
};
