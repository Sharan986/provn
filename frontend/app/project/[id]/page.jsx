'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Github, ExternalLink, Play,
  CheckCircle, Zap, ShieldCheck, TerminalSquare, AlertCircle,
  FileCode2, Send
} from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Input from '@/components/Input';
import { useToast } from '@/components/ToastContext';
import { getSkillProjectDetails, submitSkillProject } from '@/lib/actions/skillTests';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('codespaces'); // codespaces, manual

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        const res = await getSkillProjectDetails(params.id);
        if (res.data?.project) {
          setProject(res.data.project);
          if (res.data.project.submission?.content) {
            setSubmissionUrl(res.data.project.submission.content);
          }
        } else {
          toast.error(res.error || 'Project not found');
        }
      } catch (err) {
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      toast.error('Please enter your project URL');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitSkillProject(project.skill_id, project.id, submissionUrl.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Project submitted successfully! 🎉');
        // Refresh project data to show under review status
        const updatedRes = await getSkillProjectDetails(params.id);
        if (updatedRes.data?.project) {
          setProject(updatedRes.data.project);
        }
      }
    } catch (err) {
      toast.error('Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const diffColor = (d) => d === 'beginner' ? 'lime' : d === 'intermediate' ? 'yellow' : 'purple';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-purple" />
          <span className="font-mono text-sm text-muted uppercase font-bold tracking-widest">
            Loading Project...
          </span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center p-4">
        <Card variant="default" padding="lg" className="max-w-md text-center">
          <span className="text-6xl mb-4 block">🚫</span>
          <h2 className="heading-brutal text-2xl mb-2">Project Not Found</h2>
          <p className="font-mono text-sm text-muted mb-6">
            The project you're looking for doesn't exist or hasn't been unlocked yet.
          </p>
          <Button variant="primary" onClick={() => router.back()} icon={ArrowLeft}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  let reqs = [];
  if (project.requirements) {
    try {
      reqs = typeof project.requirements === 'string' ? JSON.parse(project.requirements) : project.requirements;
    } catch (e) {
      reqs = [];
    }
  }

  // Determine template repo name for display if URL exists
  let repoName = '';
  if (project.template_repo_url) {
    try {
      // Handle both https://github.com/owner/repo and https://github.com/owner/repo.git
      const cleanUrl = project.template_repo_url.replace(/\.git$/, '');
      const urlParts = new URL(cleanUrl).pathname.split('/').filter(Boolean);
      if (urlParts.length >= 2) {
        repoName = `${urlParts[0]}/${urlParts[1]}`;
      }
    } catch (e) {
      console.error('Error parsing template repo URL:', e);
      repoName = 'provn-org/template';
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg pb-20">
      {/* Header */}
      <div className="bg-white border-b-4 border-black px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.back()}
              className="mt-1 p-2 bg-bg border-3 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={diffColor(project.difficulty)} size="sm">
                  {project.difficulty}
                </Badge>
                <Badge variant="default" size="sm">
                  Project {project.project_order}
                </Badge>
                <Badge variant="purple" size="sm">
                  <Zap size={10} className="mr-1" />
                  {project.points} pts
                </Badge>
                <span className="font-mono text-xs text-muted font-bold ml-2">
                  Skill: {project.skill_name}
                </span>
              </div>
              <h1 className="heading-brutal text-2xl sm:text-4xl leading-tight">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex-shrink-0">
            {project.submission?.status === 'approved' ? (
              <div className="px-4 py-2 bg-lime border-3 border-black shadow-brutal flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-bold uppercase">Completed</span>
              </div>
            ) : project.submission?.status === 'pending' ? (
              <div className="px-4 py-2 bg-yellow-400 border-3 border-black shadow-brutal flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span className="font-bold uppercase">Under Review</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 grid md:grid-cols-3 gap-8">

        {/* Left Col: Details & Requirements */}
        <div className="md:col-span-2 space-y-8">

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <h2 className="heading-brutal text-xl mb-4 border-b-2 border-black pb-2">Mission Brief</h2>
            <p className="font-mono text-sm leading-relaxed text-gray-800">
              {project.description}
            </p>
          </div>

          <div className="bg-purple/5 border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <h2 className="heading-brutal text-xl mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <ShieldCheck className="text-purple" />
              Requirements
            </h2>
            {reqs && reqs.length > 0 ? (
              <ul className="space-y-3 font-mono text-sm">
                {reqs.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white border-2 border-black p-3 shadow-brutal-sm">
                    <CheckCircle size={18} className="text-lime flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-sm text-muted">Complete the mission brief above to specification.</p>
            )}
          </div>

          {/* Setup Instructions */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
            <h2 className="heading-brutal text-xl mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <FileCode2 className="text-cyan-600" />
              Development Setup
            </h2>

            {!project.template_repo_url ? (
              <div className="p-4 bg-yellow-100 border-2 border-black flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                <p className="font-mono text-sm">
                  This project requires you to create your own repository from scratch. Start an empty repository, build your solution, and provide the link.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex border-b-2 border-black mb-6">
                  <button
                    onClick={() => setActiveTab('codespaces')}
                    className={`flex-1 py-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors border-r-2 border-black ${activeTab === 'codespaces' ? 'bg-black text-white' : 'hover:bg-bg-dark'
                      }`}
                  >
                    <TerminalSquare size={16} />
                    GitHub Codespaces
                  </button>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'manual' ? 'bg-black text-white' : 'hover:bg-bg-dark'
                      }`}
                  >
                    <Github size={16} />
                    Manual Setup
                  </button>
                </div>

                {activeTab === 'codespaces' ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-bg border-2 border-black font-mono text-sm space-y-4">
                      <p>
                        We recommend using GitHub Codespaces. It gives you an instant, cloud-based development environment with everything pre-configured.
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Click the button below to open the template in Codespaces.</li>
                        <li>GitHub will create a personalized cloud environment for you.</li>
                        <li>Follow the README inside the workspace to run and test the project.</li>
                        <li>Once finished, commit your changes. Codespaces will automatically sync.</li>
                      </ol>
                    </div>
                    <a
                      href={`https://codespaces.new/${repoName}?quickstart=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="primary" fullWidth icon={ExternalLink} className="py-4 text-lg">
                        Launch GitHub Codespace
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-bg border-2 border-black font-mono text-sm space-y-4">
                      <p>Prefer setting it up locally? Follow these steps to clone and run the template.</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Visit the template repository.</li>
                        <li>Click "Use this template" {"->"} "Create a new repository".</li>
                        <li>Clone your new repository locally: <br /> <code className="bg-black text-lime px-2 py-1 mt-1 inline-block">git clone https://github.com/your-username/repo-name.git</code></li>
                        <li>Follow the README instructions to setup the project dependencies.</li>
                        <li>When finished, push your changes to your remote repository.</li>
                      </ol>
                    </div>
                    <a
                      href={project.template_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="outline" fullWidth icon={Github}>
                        Open Template Repository
                      </Button>
                    </a>
                  </div>
                )}

                <div className="mt-8 p-4 bg-cyan-50 border-2 border-cyan-800">
                  <h3 className="font-bold text-cyan-900 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} /> Automated Testing
                  </h3>
                  <p className="font-mono text-xs text-cyan-800 leading-relaxed">
                    The template includes GitHub Actions configured for this project. Once you push your changes, the automated tests will run in the "Actions" tab of your repository. Ensure all tests pass before submitting!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Submission */}
        <div>
          <div className="bg-white border-4 border-black p-6 sticky top-24 shadow-[8px_8px_0_0_#000]">
            <h2 className="heading-brutal text-xl mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <Send className="text-lime-600" />
              Submit Work
            </h2>

            {project.submission?.status === 'approved' ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-lime border-4 border-black mx-auto flex items-center justify-center mb-4 transform rotate-3">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">Project Accepted!</h3>
                <p className="font-mono text-xs text-muted mb-4">
                  Great job completing this project.
                </p>
                <a href={project.submission.content} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" fullWidth icon={ExternalLink}>
                    View Submitted Work
                  </Button>
                </a>
              </div>
            ) : project.submission?.status === 'pending' ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-yellow-300 border-4 border-black mx-auto flex items-center justify-center mb-4 transform -rotate-3">
                  <Loader2 size={32} className="animate-spin" />
                </div>
                <h3 className="font-bold text-lg mb-2">Review in Progress</h3>
                <p className="font-mono text-xs text-muted mb-4">
                  Your submission is being reviewed. Check back later!
                </p>
                <a href={project.submission.content} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" fullWidth icon={ExternalLink}>
                    View Submitted Work
                  </Button>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-sm mb-2 uppercase">Project URL</label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    required
                  />
                  <p className="font-mono text-[10px] text-muted mt-2">
                    Submit the link to your GitHub repository or deployed project.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  icon={Send}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </Button>

                {project.submission?.status === 'needs_revision' && (
                  <div className="p-3 bg-red-100 border-2 border-red-500 mt-4">
                    <span className="font-bold text-red-700 text-xs block mb-1">Needs Revision:</span>
                    <p className="font-mono text-[10px] text-red-900">
                      Your previous submission was not accepted. Please review the feedback and resubmit.
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
