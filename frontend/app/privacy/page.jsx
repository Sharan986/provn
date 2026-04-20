export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Provn.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-bg min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="heading-brutal text-5xl sm:text-6xl mb-8 uppercase">
          PRIVACY <span className="text-yellow-dark bg-black px-2 py-1">POLICY</span>
        </h1>

        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000]">
          <div className="font-mono text-sm leading-relaxed space-y-6">
            <p><strong>Last Updated:</strong> April 2026</p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">1. Information We Collect</h2>
            <p>
              When you use Provn, we collect information you provide directly to us (such as your name, email address, university, and resume). We also automatically collect data regarding your progress on roadmaps, task completion rates, and code submissions.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate, maintain, and improve our services. Specifically, your task performance and code submissions are used to calculate your "Readiness Score," which helps matching you with potential tech employers.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">3. Information Sharing</h2>
            <p>
              If you opt-in to our hiring network, we will share your profile, verified skills, and portfolio with our partnered industry recruiters. We do not sell your personal data to third-party data brokers.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@provn.live" className="text-purple font-bold hover:underline">support@provn.live</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
