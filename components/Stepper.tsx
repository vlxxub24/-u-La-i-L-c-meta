import React from 'react';

interface StepperProps {
  steps: { label: string }[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full px-1 sm:px-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-amber-600 border-amber-500 text-white' : ''}
                  ${isCurrent ? 'bg-amber-800/50 border-amber-400 text-amber-300 scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-stone-800 border-stone-700 text-stone-400' : ''}
                `}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-bold text-base sm:text-lg">{stepNumber}</span>
                )}
              </div>
              <p className={`mt-2 text-xs text-center transition-colors duration-300 hidden sm:block ${isCurrent ? 'text-amber-300 font-semibold' : 'text-stone-500'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-auto border-t-2 transition-colors duration-300
                ${isCompleted || isCurrent ? 'border-amber-700' : 'border-stone-700'}
              `}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
