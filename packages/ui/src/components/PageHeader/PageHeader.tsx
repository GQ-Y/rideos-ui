import type { ReactNode } from "react";

export interface PageHeaderProps {
  breadcrumb?: ReactNode[];
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ breadcrumb = [], title, description, actions }: PageHeaderProps) {
  return (
    <header className="rideos-page-heading">
      <div>
        {breadcrumb.length > 0 && (
          <div className="rideos-breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`}>
                {index > 0 && " / "}
                {item}
              </span>
            ))}
          </div>
        )}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
}
