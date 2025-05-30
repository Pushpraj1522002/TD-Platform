import * as React from "react";
import projects from "../../../services/MyProjects"; // Adjust path if necessary


export default function MyProjects() {
  // Example project data
  
  return (
    <section aria-labelledby="projects-heading" >
      <h2
        id="projects-heading"
        className="mt-9 text-base font-bold text-white max-md:mt-10"
      >
        My Projects
      </h2>
      <div className="grid grid-cols-1 gap-9 mt-7 sm:grid-cols-3 lg:grid-cols-5 max-h-[80vh]  overflow-y-auto	scrollbar-hide">
        {projects.map((project) => (
          <button
            key={project.id}
            className="flex flex-col px-px pt-px pb-5  rounded-xl border-2 border-solid bg-zinc-900 bg-opacity-100 border-zinc-700 w-[280px] hover:bg-opacity-50 focus:ring-2 focus:border-blue-500"
            role="menuitem"
            onClick={() => alert(`Selected Project: ${project.title}`)}
          >
            <img
              loading="lazy"
              src={project.imgSrc}
              alt={`${project.title} Project`}
              className="object-contain w-full rounded-xl aspect-[1.7] shadow-[0px_2px_4px_rgba(0,0,0,0.12)]"
            />
            <div className="flex flex-col self-start mt-3 ml-3 max-md:ml-2.5">
              <h3 className="self-start text-base font-semibold text-white text-opacity-80">
                {project.title}
              </h3>
              <p className="text-sm text-white text-opacity-80">
                {project.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
