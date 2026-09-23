import React, { useState } from 'react';
import {
  Check,
  X,
  Edit2,
  CheckCheck,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

/**
 * AIChangeReview Component
 * 
 * Implements the AI change-review interface:
 * - Shows Original vs Suggested for every AI modification
 * - Action buttons: Accept, Reject, Edit for individual changes
 * - Global actions: Accept All, Reject All
 * - Safe: Does NOT overwrite the original resume automatically
 */
export default function AIChangeReview({
  suggestions = [],
  onAccept,
  onReject,
  onEdit,
  onAcceptAll,
  onRejectAll,
  decisions = {},
  editedTexts = {},
  title = 'AI Modification Review',
  subtitle = 'Review each proposed optimization. Accept, reject, or edit individual changes before applying.'
}) {
  const [editingId, setEditingId] = useState(null);
  const [localEditText, setLocalEditText] = useState('');

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setLocalEditText(editedTexts[item.id] !== undefined ? editedTexts[item.id] : item.suggested);
  };

  const handleSaveEdit = (itemId) => {
    if (onEdit) {
      onEdit(itemId, localEditText);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setLocalEditText('');
  };

  const pendingCount = suggestions.filter(s => (decisions[s.id] || 'PENDING') === 'PENDING').length;
  const acceptedCount = suggestions.filter(s => decisions[s.id] === 'ACCEPTED').length;
  const rejectedCount = suggestions.filter(s => decisions[s.id] === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header and Bulk Action Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        background: 'var(--bg-subtle, #F8FAFC)',
        border: '1px solid var(--border-color, #E2E8F0)',
        borderRadius: '10px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary, #2563EB)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #0F172A)' }}>
              {title}
            </h3>
            <span className="badge badge-success" style={{ gap: '4px', fontSize: '11px' }}>
              <ShieldCheck size={12} /> Anti-Fabrication Verified
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary, #64748B)', margin: '4px 0 0 0' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onAcceptAll}
            disabled={suggestions.length === 0}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <CheckCheck size={14} />
            <span>Accept All ({suggestions.filter(s => s.status !== 'UNSUPPORTED').length})</span>
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            disabled={suggestions.length === 0}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <XCircle size={14} />
            <span>Reject All</span>
          </button>
        </div>
      </div>

      {/* Summary Status Strip */}
      <div style={{
        display: 'flex',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-secondary, #64748B)'
      }}>
        <span>Total: <strong>{suggestions.length}</strong></span>
        <span>•</span>
        <span style={{ color: 'var(--success, #16A34A)' }}>Accepted: <strong>{acceptedCount}</strong></span>
        <span>•</span>
        <span style={{ color: 'var(--danger, #DC2626)' }}>Rejected: <strong>{rejectedCount}</strong></span>
        <span>•</span>
        <span>Pending: <strong>{pendingCount}</strong></span>
      </div>

      {/* Suggestion Cards */}
      {suggestions.length === 0 ? (
        <div style={{
          padding: '32px 16px',
          textAlign: 'center',
          background: '#FFFFFF',
          border: '1px dashed var(--border-color, #CBD5E1)',
          borderRadius: '8px',
          color: 'var(--text-muted, #94A3B8)'
        }}>
          No pending AI modifications.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {suggestions.map((item) => {
            const decision = decisions[item.id] || 'PENDING';
            const isEditing = editingId === item.id;
            const currentSuggested = editedTexts[item.id] !== undefined ? editedTexts[item.id] : item.suggested;
            const isSupported = item.status === 'SUPPORTED';
            const isUnsupported = item.status === 'UNSUPPORTED';

            const cardBorder = decision === 'ACCEPTED'
              ? 'var(--success, #16A34A)'
              : decision === 'REJECTED'
              ? '#CBD5E1'
              : '#E2E8F0';

            return (
              <div
                key={item.id}
                style={{
                  background: decision === 'REJECTED' ? '#F8FAFC' : '#FFFFFF',
                  opacity: decision === 'REJECTED' ? 0.65 : 1,
                  border: `1px solid ${cardBorder}`,
                  borderLeft: `4px solid ${
                    decision === 'ACCEPTED'
                      ? 'var(--success, #16A34A)'
                      : decision === 'REJECTED'
                      ? '#94A3B8'
                      : isUnsupported
                      ? 'var(--danger, #DC2626)'
                      : 'var(--primary, #2563EB)'
                  }`,
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header Row: Title, Tag, and Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
                      {item.title || `${item.section ? item.section.toUpperCase() : 'Enhancement'}`}
                    </span>
                    <span
                      className={`badge ${
                        isSupported ? 'badge-success' : isUnsupported ? 'badge-danger' : 'badge-warning'
                      }`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {item.status || 'AI SUGGESTION'}
                    </span>
                    {decision !== 'PENDING' && (
                      <span
                        className={`badge ${decision === 'ACCEPTED' ? 'badge-success' : 'badge-neutral'}`}
                        style={{ fontSize: '10.5px', fontWeight: 700 }}
                      >
                        {decision}
                      </span>
                    )}
                  </div>

                  {/* Buttons: Accept, Reject, Edit */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onAccept && onAccept(item.id, currentSuggested)}
                      disabled={isUnsupported}
                      className={`btn btn-sm ${decision === 'ACCEPTED' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: decision === 'ACCEPTED' ? 'var(--success, #16A34A)' : undefined,
                        borderColor: decision === 'ACCEPTED' ? 'var(--success, #16A34A)' : undefined
                      }}
                      title={isUnsupported ? 'Unsupported modification cannot be accepted' : 'Accept this change'}
                    >
                      <Check size={13} />
                      <span>Accept</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onReject && onReject(item.id)}
                      className={`btn btn-sm ${decision === 'REJECTED' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}
                      title="Reject this change"
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>

                    {!isUnsupported && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            handleSaveEdit(item.id);
                          } else {
                            handleStartEdit(item);
                          }
                        }}
                        className={`btn btn-sm ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}
                        title="Edit suggested text"
                      >
                        <Edit2 size={13} />
                        <span>{isEditing ? 'Done' : 'Edit'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanation / Why Box */}
                {(item.explanation || item.reason) && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--primary, #2563EB)',
                    background: 'var(--primary-light, #EFF6FF)',
                    padding: '6px 10px',
                    borderRadius: '5px',
                    lineHeight: 1.4
                  }}>
                    <strong>Rationale:</strong> {item.explanation || item.reason}
                  </div>
                )}

                {/* Original vs Suggested Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px'
                }}>
                  {/* Original Content */}
                  <div style={{
                    padding: '10px 12px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-muted, #64748B)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      Original:
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary, #475569)',
                      lineHeight: 1.5,
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {item.original || item.current || '(Empty or not provided in resume)'}
                    </div>
                  </div>

                  {/* Suggested Content */}
                  <div style={{
                    padding: '10px 12px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#15803D',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Suggested:</span>
                      {editedTexts[item.id] !== undefined && (
                        <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>
                          (Edited by user)
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <textarea
                          className="form-textarea"
                          style={{
                            fontSize: '12.5px',
                            minHeight: '80px',
                            padding: '8px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                          value={localEditText}
                          onChange={(e) => setLocalEditText(e.target.value)}
                          placeholder="Customize the suggested modification..."
                        />
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '3px 10px', fontSize: '11px' }}
                          >
                            Save Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#166534',
                        lineHeight: 1.5,
                        fontWeight: 500,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {currentSuggested}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
