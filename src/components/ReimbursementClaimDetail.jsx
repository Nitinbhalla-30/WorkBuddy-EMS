import { X } from 'lucide-react'
import { formatDateDDMMYYYY } from '../utils/attendance.js'
import {
  categoryLabel,
  formatAmount,
  statusLabel,
  statusTagClass
} from '../utils/reimbursements.js'
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
    <div className="claim-detail">
      <div className="claim-detail-head">
        <div className="claim-detail-heading">
          <h3 className="claim-detail-title">{categoryLabel(claim.category)}</h3>
          <div className="claim-detail-sub">{subtitle}</div>
        </div>
        <div className="claim-detail-head-right">
          <span className={`tag ${statusTagClass(claim.status)}`}>
            {statusLabel(claim.status)}
          </span>
          <button
            type="button"
            className="claim-detail-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="claim-summary">
        <div className="claim-summary-item">
          <span className="claim-summary-label">Expense date</span>
          <span className="claim-summary-value">{formatDateDDMMYYYY(claim.expenseDate)}</span>
        </div>
        <div className="claim-summary-item">
          <span className="claim-summary-label">Amount</span>
          <span className="claim-summary-value claim-summary-amount">{formatAmount(claim.amount)}</span>
        </div>
        {claim.status === 'paid' && claim.paidOn && (
          <div className="claim-summary-item">
            <span className="claim-summary-label">Paid on</span>
            <span className="claim-summary-value">{formatDateDDMMYYYY(claim.paidOn)}</span>
          </div>
        )}
        {claim.description && (
          <div className="claim-summary-item claim-summary-full">
            <span className="claim-summary-label">Description</span>
            <span className="claim-summary-desc">{claim.description}</span>
          </div>
        )}
      </div>

      {claim.status === 'rejected' && claim.reviewNote && (
        <div className="info-box">
          <strong>Reason:</strong> {claim.reviewNote}
        </div>
      )}

      <div className="claim-thread-wrap">
        <ReimbursementThread
          claim={claim}
          viewerRole={viewerRole}
          viewerId={viewerId}
          nameOf={nameOf}
          onReply={onReply}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
