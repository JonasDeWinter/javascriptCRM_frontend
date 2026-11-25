import React from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

export interface CrmTableCell {
  content: React.ReactNode;
  className?: string;
}

interface CrmTableRowProps {
  id: string;
  name: string;
  description: string;
  cells: CrmTableCell[];
  selected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  onNameClick?: () => void;
}

function CrmTableRow({ id, name, description, cells, selected, onSelectionChange, onNameClick }: CrmTableRowProps) {
  return (
    <tr>
      <td>
        <div className="contact-person">
          <input
            aria-label={`Select ${name}`}
            checked={selected}
            onChange={(event) => onSelectionChange(id, event.target.checked)}
            type="checkbox"
          />
          <Avatar name={name} />
          <span className="contact-person__details">
            <strong>
              {onNameClick ? (
                <button className="table-name-link" onClick={onNameClick} type="button" aria-label={`View details for ${name}`}>
                  {name}
                </button>
              ) : name}
            </strong>
            <small>{description}</small>
          </span>
        </div>
      </td>
      {cells.map((cell, index) => (
        <td className={cell.className} key={index}>{cell.content}</td>
      ))}
      <td>
        <button className="row-more" type="button" aria-label={`More actions for ${name}`}>
          <Icon name="more" size={19} />
        </button>
      </td>
    </tr>
  );
}

export default CrmTableRow;
