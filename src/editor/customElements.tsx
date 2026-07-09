import React from "react";

export function renderCustomElements(sectionName: string, elementsDict?: Record<string, any>) {
  if (!elementsDict) return null;
  
  const els = Object.values(elementsDict)
    .filter((e: any) => e.section === sectionName)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return els.map((el: any) => {
    const commonProps = {
      key: el.id,
      "data-edit-id": el.id,
      "data-edit-name": el.name,
      "data-edit-kind": el.kind,
      "data-edit-path": el.path,
      className: `custom-element custom-element-${el.kind} my-4 transition-all duration-300 inline-block w-full`,
    };

    switch (el.kind) {
      case "heading":
        return (
          <h3 {...commonProps} className="font-display font-bold text-2xl text-slate-900">
            {el.value}
          </h3>
        );
      case "text":
        return (
          <p {...commonProps} className="text-base text-slate-600">
            {el.value}
          </p>
        );
      case "button":
        return (
          <div key={el.id} className="my-4">
            <a
              href={el.href || "#"}
              {...commonProps}
              className="custom-element-button px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors inline-block text-center"
            >
              {el.value}
            </a>
          </div>
        );
      case "image":
        return (
          <img
            key={el.id}
            src={el.value}
            alt={el.name}
            {...commonProps}
            className="max-w-md rounded-lg shadow-md"
          />
        );
      default:
        return null;
    }
  });
}
