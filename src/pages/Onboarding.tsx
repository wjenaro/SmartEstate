import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingSetup } from "@/components/onboarding/OnboardingSetup";
import { OnboardingSubscription } from "@/components/onboarding/OnboardingSubscription";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = "welcome" | "setup" | "subscription" | "complete";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true" || false;
  const { user, userAccount, updateUserAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Onboarding - Page loaded");
    console.log("Onboarding - User:", user ? "exists" : "null");
    console.log("Onboarding - UserAccount:", userAccount);
    console.log("Onboarding - Is Demo:", isDemo);
    console.log(
      "Onboarding - Onboarding completed:",
      userAccount?.onboarding_completed
    );

    if (!user) {
      console.log("Onboarding - No user, redirecting to auth");
      navigate("/auth", { replace: true });
      return;
    }

    if (!userAccount) {
      console.log("Onboarding - No user account, waiting...");
      return;
    }

    if (userAccount.onboarding_completed) {
      console.log("Onboarding - Already completed, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }

    // Set demo mode based on user account
    if (userAccount.is_demo && !isDemo) {
      navigate("/onboarding?demo=true", { replace: true });
    }
  }, [user, userAccount, navigate, isDemo]);

  const handleNext = () => {
    console.log("Onboarding - Moving to next step from:", currentStep);
    switch (currentStep) {
      case "welcome":
        setCurrentStep("setup");
        break;
      case "setup":
        setCurrentStep("subscription");
        break;
      case "subscription":
        setCurrentStep("complete");
        break;
    }
  };

  const handlePrevious = () => {
    console.log("Onboarding - Moving to previous step from:", currentStep);
    switch (currentStep) {
      case "setup":
        setCurrentStep("welcome");
        break;
      case "subscription":
        setCurrentStep("setup");
        break;
      case "complete":
        setCurrentStep("subscription");
        break;
    }
  };

  const handleComplete = async () => {
    try {
      if (!userAccount?.id) {
        throw new Error("User account not found");
      }

      console.log(
        "Onboarding - Completing onboarding for user:",
        userAccount.id
      );

      // Update the user account to mark onboarding as completed
      await updateUserAccount({ onboarding_completed: true });

      toast({
        title: userAccount.is_demo ? "Demo Ready!" : "Welcome to KangaMbili!",
        description: userAccount.is_demo
          ? "Your demo account is set up with 2 properties and 20 units limit."
          : "Your account has been set up successfully.",
      });

      console.log(
        "Onboarding - Completed successfully, navigating to dashboard"
      );
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading while waiting for user account
  if (!user || !userAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const effectiveIsDemo = userAccount.is_demo || isDemo;

  const baseProps = {
    isDemo: effectiveIsDemo,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onComplete: handleComplete,
    userAccount,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Step{" "}
                {currentStep === "welcome"
                  ? 1
                  : currentStep === "setup"
                  ? 2
                  : currentStep === "subscription"
                  ? 3
                  : 4}{" "}
                of 4
              </span>
              {effectiveIsDemo && (
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Demo Mode: 2 Properties, 20 Units
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width:
                    currentStep === "welcome"
                      ? "25%"
                      : currentStep === "setup"
                      ? "50%"
                      : currentStep === "subscription"
                      ? "75%"
                      : "100%",
                }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {currentStep === "welcome" && <OnboardingWelcome {...baseProps} />}
            {currentStep === "setup" && <OnboardingSetup {...baseProps} />}
            {currentStep === "subscription" && (
              <OnboardingSubscription {...baseProps} />
            )}
            {currentStep === "complete" && (
              <OnboardingComplete {...baseProps} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
