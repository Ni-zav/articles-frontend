"use client";

import React from "react";

type StateCardProps = {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function StateCard({
  title,
  children,
  className,
  headerClassName,
  bodyClassName,
}: StateCardProps) {
  const sectionClass = ["max-w-xl mx-auto p-4", className].filter(Boolean).join(" ");
  const cardClass = ["ui-card", bodyClassName].filter(Boolean).join(" ");
  const headerClass = ["text-lg font-semibold mb-2", headerClassName].filter(Boolean).join(" ");

  return (
    <section className={sectionClass}>
      <div className={cardClass}>
        {title ? <h1 className={headerClass}>{title}</h1> : null}
        {children}
      </div>
    </section>
  );
}