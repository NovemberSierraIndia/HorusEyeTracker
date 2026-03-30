import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

export interface ProjectsData {
  projects: Project[];
}

const STORAGE_KEY = "horuseye-projects";

const defaultProjects: Project[] = [
  {
    id: uuidv4(),
    name: "Master's Thesis",
    color: "#1B4332",
    tasks: [
      {
        id: uuidv4(),
        name: "Navigating Exclusivity in the Digital Age",
        startDate: "2026-01-15",
        endDate: "2026-07-15",
        completed: false,
      },
    ],
  },
  {
    id: uuidv4(),
    name: "Horse Powertrain Application",
    color: "#C0392B",
    tasks: [
      {
        id: uuidv4(),
        name: "Application preparation",
        startDate: "2026-05-01",
        endDate: "2026-07-01",
        completed: false,
      },
    ],
  },
  {
    id: uuidv4(),
    name: "LUISS Coursework",
    color: "#2D6A4F",
    tasks: [
      {
        id: uuidv4(),
        name: "Digital Innovation Management courses",
        startDate: "2026-01-10",
        endDate: "2026-07-15",
        completed: false,
      },
    ],
  },
];

export function getProjects(): Project[] {
  if (typeof window === "undefined") return defaultProjects;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
    return defaultProjects;
  }
  return JSON.parse(stored);
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(name: string, color: string): Project[] {
  const projects = getProjects();
  projects.push({ id: uuidv4(), name, color, tasks: [] });
  saveProjects(projects);
  return projects;
}

export function deleteProject(projectId: string): Project[] {
  const projects = getProjects().filter((p) => p.id !== projectId);
  saveProjects(projects);
  return projects;
}

export function addTask(
  projectId: string,
  name: string,
  startDate: string,
  endDate: string
): Project[] {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    project.tasks.push({ id: uuidv4(), name, startDate, endDate, completed: false });
    saveProjects(projects);
  }
  return projects;
}

export function updateTask(
  projectId: string,
  taskId: string,
  updates: Partial<Task>
): Project[] {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    const task = project.tasks.find((t) => t.id === taskId);
    if (task) Object.assign(task, updates);
    saveProjects(projects);
  }
  return projects;
}

export function deleteTask(projectId: string, taskId: string): Project[] {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    project.tasks = project.tasks.filter((t) => t.id !== taskId);
    saveProjects(projects);
  }
  return projects;
}
