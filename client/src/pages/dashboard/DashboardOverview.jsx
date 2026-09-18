import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Send,
  Sparkles,
  Gauge,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSeedDemoData = async () => {
    try {
      await api.post('/profile/seed-demo');
      await api.post('/jobs/seed-demo');
      addToast('Populated demo Master Profile and sample Job Description!', 'success');
      fetchDashboard();
    } catch (err) {
      addToast('Error seeding demo data.', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '120px', width: '100%' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    resumeHealth: 82,
    jobsAnalyzed: 0,
    totalApplications: 0,
    averageMatch: 76
  };

  const charts = data?.charts || {
    scoreTrend: [],
    applicationsByStatus: [],
    topSkills: []
  };

  const activities = data?.recentActivity || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
        borderColor: '#BFDBFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Candidate'}! 👋
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your ATS resume optimization hub is active. Review your match scores or tailor a resume for an upcoming opening.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!data?.hasMasterProfile && (
            <button onClick={handleSeedDemoData} className="btn btn-secondary btn-sm" style={{ borderStyle: 'dashed' }}>
              <Sparkles size={14} color="var(--primary)" />
              Load Sample Profile Data
            </button>
          )}
          <Link to="/dashboard/jobs/analyze" className="btn btn-secondary">
            <Briefcase size={16} />
            Analyze Job
          </Link>
          <Link to="/dashboard/builder" className="btn btn-primary">
            <Plus size={16} />
            Create Resume
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Resume Health</span>
            <div style={{ padding: '6px', backgroundColor: 'var(--primary-light)', borderRadius: '6px', color: 'var(--primary)' }}>
              <Gauge size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {metrics.resumeHealth}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>
            <TrendingUp size={14} />
            <span>ATS-ready structure verified</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Jobs Analyzed</span>
            <div style={{ padding: '6px', backgroundColor: '#FEF3C7', borderRadius: '6px', color: '#D97706' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {metrics.jobsAnalyzed}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Extracted requirements & skills
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Active Applications</span>
            <div style={{ padding: '6px', backgroundColor: 'var(--success-bg)', borderRadius: '6px', color: 'var(--success)' }}>
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {metrics.totalApplications}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            In application tracking pipeline
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Average Match</span>
            <div style={{ padding: '6px', backgroundColor: '#EDE9FE', borderRadius: '6px', color: '#7C3AED' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {metrics.averageMatch}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Based on verified profile skills
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* ATS Score Trend */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>ATS Compatibility Progress</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Optimization scores across revisions</p>
            </div>
            <span className="badge badge-success">Trending Up</span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.scoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                <YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Demanded Skills */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>In-Demand Job Skills</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Frequency in analyzed job postings</p>
            </div>
            <Link to="/dashboard/skill-gap" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
              View Gaps →
            </Link>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topSkills} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                <YAxis dataKey="skill" type="category" stroke="#334155" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="demand" fill="#2563EB" radius={[0, 4, 4, 0]}>
                  {charts.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Activity Timeline */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recent Optimization Activity</h3>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px' }}>No recent activity logged yet.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Analyze a job or create a resume to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-subtle)'
                  }}
                >
                  <div style={{
                    padding: '6px',
                    borderRadius: '50%',
                    backgroundColor: act.type === 'ats' ? '#FEF3C7' : 'var(--primary-light)',
                    color: act.type === 'ats' ? '#D97706' : 'var(--primary)',
                    marginTop: '2px'
                  }}>
                    {act.type === 'ats' ? <Gauge size={14} /> : <FileText size={14} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {act.action}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Quick Actions</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Jump straight into core optimization tasks:
          </p>

          <Link to="/dashboard/profile" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <FileText size={16} />
            <span>Edit Master Profile</span>
          </Link>

          <Link to="/dashboard/jobs/analyze" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <Briefcase size={16} />
            <span>Analyze New Job Posting</span>
          </Link>

          <Link to="/dashboard/optimizer" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <Sparkles size={16} />
            <span>Optimize Resume for Job</span>
          </Link>

          <Link to="/dashboard/ats" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <Gauge size={16} />
            <span>Run ATS Diagnostic Check</span>
          </Link>

          <Link to="/dashboard/interview" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <Send size={16} />
            <span>Generate Interview Pitch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
