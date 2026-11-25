import React from 'react';
import Icon from './Icon';

interface CrmTableProps {
  title: string;
  description: string;
  firstColumnLabel: string;
  selectAllLabel: string;
  columns: React.ReactNode[];
  toolbar: React.ReactNode;
  rowCount: number;
  rowIds: string[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onDeleteSelected: (selectedIds: string[]) => void;
  totalCount: number;
  itemLabel: string;
  emptyMessage: string;
  tableClassName?: string;
  children: React.ReactNode;
}

function CrmTable({
  title,
  description,
  firstColumnLabel,
  selectAllLabel,
  columns,
  toolbar,
  rowCount,
  rowIds,
  selectedIds,
  onSelectionChange,
  onDeleteSelected,
  totalCount,
  itemLabel,
  emptyMessage,
  tableClassName = '',
  children,
}: CrmTableProps) {
  const allRowsSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.includes(id));

  const selectVisibleRows = (selected: boolean) => {
    if (selected) {
      onSelectionChange(Array.from(new Set([...selectedIds, ...rowIds])));
      return;
    }

    const visibleIds = new Set(rowIds);
    onSelectionChange(selectedIds.filter((id) => !visibleIds.has(id)));
  };

  const deleteSelectedRows = () => {
    if (selectedIds.length === 0) return;

    const recordLabel = selectedIds.length === 1 ? 'record' : itemLabel;
    if (window.confirm(`Delete ${selectedIds.length} selected ${recordLabel}? This cannot be undone.`)) {
      onDeleteSelected(selectedIds);
      onSelectionChange([]);
    }
  };

  return (
    <section className="data-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="panel-actions">
          {selectedIds.length > 0 && (
            <button
              className="button button--danger button--compact"
              onClick={deleteSelectedRows}
              type="button"
              aria-label={`Delete ${selectedIds.length} selected ${itemLabel}`}
            >
              <Icon name="trash" size={15} /> Delete ({selectedIds.length})
            </button>
          )}
          <button className="button button--secondary button--compact" type="button"><Icon name="filter" size={16} /> Filters</button>
          <button className="button button--secondary button--compact" type="button" aria-label="More table options"><Icon name="more" size={18} /></button>
        </div>
      </div>
      <div className="table-toolbar">{toolbar}</div>
      <div className="table-scroll">
        <table className={`crm-table ${tableClassName}`}>
          <thead>
            <tr>
              <th>
                <label className="select-all">
                  <input
                    aria-label={selectAllLabel}
                    aria-checked={selectedIds.some((id) => rowIds.includes(id)) && !allRowsSelected ? 'mixed' : allRowsSelected}
                    checked={allRowsSelected}
                    onChange={(event) => selectVisibleRows(event.target.checked)}
                    type="checkbox"
                  />
                  <span />
                </label>
                {firstColumnLabel} <Icon name="chevron" size={13} />
              </th>
              {columns.map((column, index) => <th key={index}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rowCount > 0 ? children : (
              <tr><td className="empty-row" colSpan={columns.length + 1}>{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing <strong>{rowCount ? 1 : 0}–{rowCount}</strong> of <strong>{totalCount}</strong> {itemLabel}</span>
        <div><button type="button" disabled>Previous</button><button type="button" disabled>Next</button></div>
      </div>
    </section>
  );
}

export default CrmTable;
