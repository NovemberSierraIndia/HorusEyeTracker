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
  category: string;
  tasks: Task[];
}

export interface ProjectsData {
  projects: Project[];
}

export const PRESET_COLORS = [
  { name: "BRG", value: "#1B4332" },
  { name: "Racing Red", value: "#C0392B" },
  { name: "Forest", value: "#2D6A4F" },
  { name: "Navy", value: "#1B3A5C" },
  { name: "Purple", value: "#6C3483" },
  { name: "Orange", value: "#D35400" },
  { name: "Gold", value: "#B7950B" },
  { name: "Slate", value: "#566573" },
];

export const CATEGORIES = ["Academic", "Career", "Personal", "Side Project"];

const STORAGE_KEY = "horuseye-projects";

const defaultProjects: Project[] = [
  {
    id: uuidv4(),
    name: "Master's Thesis",
    color: "#1B4332",
    category: "Academic",
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
    category: "Career",
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
    category: "Academic",
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
  // Migrate old projects without category
  const projects: Project[] = JSON.parse(stored);
  let needsSave = false;
  for (const p of projects) {
    if (!p.category) {
      p.category = "Personal";
      needsSave = true;
    }
  }
  if (needsSave) saveProjects(projects);
  return projects;
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(name: string, color: string, category: string): Project[] {
  const projects = getProjects();
  projects.push({ id: uuidv4(), name, color, category, tasks: [] });
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

export function getEarliestDeadline(project: Project): string | null {
  const activeTasks = project.tasks.filter((t) => !t.completed);
  if (activeTasks.length === 0) return null;
  return activeTasks.reduce((earliest, t) =>
    t.endDate < earliest ? t.endDate : earliest
  , activeTasks[0].endDate);
}
