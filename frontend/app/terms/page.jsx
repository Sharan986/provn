export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Provn.',
};

export default function TermsPage() {
  return (
    <div className="bg-bg min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="heading-brutal text-5xl sm:text-6xl mb-8 uppercase">
          TERMS OF <span className="text-purple bg-black px-2 py-1">SERVICE</span>
        </h1>
        
        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000]">
          <div className="font-mono text-sm leading-relaxed space-y-6">
            <p><strong>Last Updated:</strong> April 2026</p>
            
            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Provn platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">2. User Accounts</h2>
            <p>
              To use certain features of Provn, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
            </p>
            
            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">3. Code Submissions & Academic Integrity</h2>
            <p>
              When submitting code, projects, or taking assessments on Provn, you agree that all work submitted is your own. Plagiarism, sharing assessment answers, or using unauthorized automated bots to pass challenges may result in immediate account termination and a permanent ban from our hiring network.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              The content, design, and structure of the roadmaps on Provn are the intellectual property of Provn and our partners. You retain the intellectual property rights to the actual code you write and submit for your own portfolio.
            </p>
            
            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without cause, including for violations of these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
