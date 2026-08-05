import { TASK_STATUSES } from '../data/sampleData.js'
import { formatDate } from '../utils/attendance.js'
import {
  groupByStatus,
  isOverdue,
  nextStatus,
  prevStatus,
  priorityLabel,
  priorityTagClass
} from '../utils/tasks.js'

// A Planner-style board with three columns (To do / In progress / Done).
// Props:
//   tasks        - the tasks to show
//   nameOf       - function(id) -> person's name (used when showAssignee is on)
//   onMove       - function(taskId, newStatus); if given, shows move buttons
//   onDelete     - function(taskId); if given, shows a small remove button
//   showAssignee - show who the task is for (for team/admin views)
export default function TaskBoard({ tasks, nameOf, onMove, onDelete, showAssignee }) {
  const groups = groupByStatus(tasks)

  return (
    <div className="board">
      {TASK_STATUSES.map((col) => (
        <div className="board-col" key={col.key}>
          <div className="board-col-head">
            <span>{col.label}</span>
            <span className="muted">{groups[col.key].length}</span>
          </div>

          <div className="board-col-body">
            {groups[col.key].length === 0 && (
              <p className="muted small board-empty">No tasks.</p>
            )}

            {groups[col.key].map((t) => {
              const prev = prevStatus(t.status)
              const next = nextStatus(t.status)
              return (
                <div className="task-card" key={t.id}>
                  <div className="task-top">
                    <span className={`tag ${priorityTagClass(t.priority)}`}>
                      {priorityLabel(t.priority)}
                    </span>
                    {onDelete && (
                      <button
                        className="task-x"
                        title="Remove task"
                        onClick={() => onDelete(t.id)}
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  <div className="task-title">{t.title}</div>
                  {t.description && <div className="task-desc">{t.description}</div>}

                  <div className="task-meta">
                    {showAssignee && nameOf && (
                      <span className="task-who">{nameOf(t.assigneeId)}</span>
                    )}
                    {t.dueDate && (
                      <span className={isOverdue(t) ? 'task-due due-over' : 'task-due'}>
                        Due {formatDate(t.dueDate)}
                      </span>
                    )}
                  </div>

                  {onMove && (
                    <div className="task-move">
                      <button
                        className="btn btn-tiny btn-light"
                        disabled={!prev}
                        onClick={() => prev && onMove(t.id, prev)}
                      >
                        &larr;
                      </button>
                      <button
                        className="btn btn-tiny btn-light"
                        disabled={!next}
                        onClick={() => next && onMove(t.id, next)}
                      >
                        &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
