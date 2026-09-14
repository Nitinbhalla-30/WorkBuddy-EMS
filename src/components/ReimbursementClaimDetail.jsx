import { X } from 'lucide-react'
import { formatDateDDMMYYYY } from '../utils/attendance.js'
import {
  categoryLabel,
  formatAmount,
  statusLabel,
  statusTagClass
} from '../utils/reimbursements.js'
import LeaveDocumentList from './LeaveDocumentList.jsx'
import ReimbursementThread from './ReimbursementThread.jsx'

// Shared, polished body for the reimbursement claim detail modal. Used by both
// the admin and employee pages so the two views stay visually identical. The
// thread (Q&A) is rendered inside so reply/author styling is consistent too.
export default function ReimbursementClaimDetail({
  claim,
  viewerRole,
  viewerId,
  nameOf,
  onReply,
  onClose
}) {
  const isAdmin = viewerRole === 'admin'
  const submitted = `Submitted ${formatDateDDMMYYYY(claim.appliedOn)}`
  const subtitle = isAdmin
    ? `${nameOf ? nameOf(claim.employeeId) : claim.employeeId} · ${submitted}`
    : submitted

  return (
    <div>
      <div className="modal-header">
        <div>
          <h3 className="section-title first" style={{ margin: 0 }}>{categoryLabel(claim.category)}</h3>
          <div className="muted small">{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`tag ${statusTagClass(claim.status)}`}>
            {statusLabel(claim.status)}
          </span>
          <button
            type="button"
            className="btn btn-tiny btn-light"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="first" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginTop: '16px' }}>
        <div>
          <div className="muted small">Expense date</div>
          <div style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(claim.expenseDate)}</div>
        </div>
        <div>
          <div className="muted small">Amount</div>
          <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--brand)' }}>{formatAmount(claim.amount)}</div>
        </div>
        {claim.status === 'paid' && claim.paidOn && (
          <div>
            <div className="muted small">Paid on</div>
            <div style={{ fontWeight: 600 }}>{formatDateDDMMYYYY(claim.paidOn)}</div>
          </div>
        )}
      </div>

      {claim.description && (
        <p className="hint" style={{ marginTop: '12px' }}><strong>Description:</strong> {claim.description}</p>
      )}

      <div className="first" style={{ marginTop: '12px' }}>
        <div className="muted small" style={{ marginBottom: '6px' }}>Receipts</div>
        <LeaveDocumentList documents={claim.receipts} emptyLabel="No receipts uploaded" />
      </div>

      {claim.status === 'rejected' && claim.reviewNote && (
        <div className="info-box">
          <strong>Reason:</strong> {claim.reviewNote}
        </div>
      )}

      <ReimbursementThread
        claim={claim}
        viewerRole={viewerRole}
        viewerId={viewerId}
        nameOf={nameOf}
        onReply={onReply}
        onClose={onClose}
      />
    </div>
  )
}
