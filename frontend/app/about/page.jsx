export const metadata = {
  title: 'About',
  description: 'Learn about Provn and our mission to revolutionize tech career readiness.',
};

export default function AboutPage() {
  return (
    <div className="bg-bg min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="heading-brutal text-5xl sm:text-7xl mb-8">
          ABOUT <span className="text-lime bg-black px-2 py-1">PROVN</span>
        </h1>
        
        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000]">
          <h2 className="heading-brutal text-3xl mb-6">OUR MISSION</h2>
          <p className="font-mono text-sm leading-relaxed mb-8">
            At Provn, we believe the traditional transition from campus to the tech industry is broken. Students spend years learning theory but struggle to land jobs because they lack verified, real-world skills. Meanwhile, companies spend massive amounts of time and money filtering through resumes that don't accurately reflect a candidate's abilities.
          </p>
          <p className="font-mono text-sm leading-relaxed mb-8">
            We built Provn to fix this. We provide structured, industry-curated roadmaps where students learn by doing. Our platform validates technical skills through practical challenges, code submissions, and our proprietary Industry Simulator.
          </p>
          
          <h2 className="heading-brutal text-3xl mb-6 mt-12">THE PROVN DIFFERENCE</h2>
          <div className="flex flex-col gap-4 font-mono text-sm">
            <div className="flex items-start gap-4 p-4 bg-bg border-2 border-black">
              <span className="font-bold text-xl text-purple">1.</span>
              <p><strong>Skill Validation:</strong> We replace generic resumes with verified project portfolios.</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-bg border-2 border-black">
              <span className="font-bold text-xl text-lime">2.</span>
              <p><strong>Direct Hiring:</strong> Tech partners can instantly filter and hire candidates based on actual performance metrics.</p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-bg border-2 border-black">
              <span className="font-bold text-xl text-yellow-dark">3.</span>
              <p><strong>Zero Barrier:</strong> Anyone with an internet connection can start building their career for free.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
