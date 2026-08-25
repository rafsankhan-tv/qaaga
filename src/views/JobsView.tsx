import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
  FileText,
  Search,
  Send,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceStore } from '../services/marketplaceStore';
import { JobPost } from '../types';

interface JobsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const jobs = marketplaceStore.getJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('ALL');
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);

  // Application form state
  const [candidateName, setCandidateName] = useState(currentUser?.fullName || 'Mohammad Rafiq');
  const [candidatePhone, setCandidatePhone] = useState(currentUser?.phone || '01712-345678');
  const [candidateExperience, setCandidateExperience] = useState('4 Years in HVAC Diagnostics & Installation');
  const [coverNote, setCoverNote] = useState('I hold a certified diploma in Electrical & Refrigeration engineering.');

  const jobTypes = ['ALL', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  const filteredJobs = jobs.filter((j) => {
    const matchesType = selectedJobType === 'ALL' || j.jobType === selectedJobType;
    const matchesSearch =
      j.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.requirements.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob || !currentUser) return;

    marketplaceStore.applyToJob({
      jobId: applyingJob.id,
      jobTitle: applyingJob.jobTitle,
      companyName: applyingJob.companyName,
      recruiterId: applyingJob.recruiterId,
      applicantId: currentUser.id,
      applicantName: candidateName,
      applicantEmail: currentUser.email,
      applicantPhone: candidatePhone,
      skills: ['HVAC Installation', 'Gas Charging', 'Wiring Diagnostics'],
      education: 'Diploma in Engineering',
      experience: candidateExperience,
      expectedSalary: applyingJob.salaryMin,
      coverLetter: coverNote
    });

    alert(`Application successfully submitted for ${applyingJob.jobTitle} at ${applyingJob.companyName}!`);
    setApplyingJob(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Briefcase size={16} />
            <span>Technical & Skilled Service Careers</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Verified Technician, IT & Hospital Jobs
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100">
            Direct employer recruitment &bull; No middleman fees &bull; Transparent salary disclosures
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skills, or company..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white text-slate-800 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="ALL">All Employment Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="PART_TIME">Part Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200">
                    {job.jobType}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{job.jobTitle}</h3>
                  <div className="text-xs text-slate-500 font-semibold">{job.companyName}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-700">
                    BDT {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Deadline: {job.deadline}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <MapPin size={13} className="text-indigo-600 shrink-0" />
                <span>{job.area}, {job.district}</span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

              {/* Requirements Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.requirements.map((req, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setApplyingJob(job)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>Apply Directly for Job</span>
            </button>
          </div>
        ))}
      </div>

      {/* APPLY MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply for {applyingJob.jobTitle}</h3>
                <div className="text-xs text-indigo-700 font-semibold">{applyingJob.companyName} &bull; {applyingJob.area}, {applyingJob.district}</div>
              </div>
              <button onClick={() => setApplyingJob(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                Close
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name & Mobile Number:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Full Name"
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    placeholder="Phone"
                    className="p-2 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experience Summary & Key Technical Skills:</label>
                <input
                  type="text"
                  value={candidateExperience}
                  onChange={(e) => setCandidateExperience(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Cover Note / Why are you a good fit?:</label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-900">
                📄 Your verified QAAGA profile & credentials will be forwarded directly to the HR director at {applyingJob.companyName}.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
