"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
  getProjectProgress,
  Project,
  Task,
  PRESET_COLORS,
  CATEGORIES,
} from "@/lib/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Check,
  ChevronRight,
  ChevronDown,
  Edit2,
} from "lucide-react";

type ViewMode = "week" | "month" | "quarter";

function toLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function getViewDays(mode: ViewMode): number {
  if (mode === "week") return 14;
  if (mode === "month") return 60;
  return 180;
}

function getDateLabels(start: Date, totalDays: number, mode: ViewMode) {
  const labels: { date: Date; label: string; isMajor: boolean }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i);
    const day = d.getDate();
    const isFirst = day === 1;
    let show = false;
    let isMajor = false;

    if (mode === "week") {
      show = true;
      isMajor = d.getDay() === 1;
    } else if (mode === "month") {
      show = day === 1 || day === 15;
      isMajor = day === 1;
    } else {
      show = day === 1;
      isMajor = d.getMonth() % 3 === 0 && day === 1;
    }

    if (show) {
      const label =
        mode === "week"
          ? `${day}`
          : isFirst
          ? d.toLocaleDateString("en-GB", { month: "short" })
          : `${day}`;
      labels.push({ date: d, label, isMajor });
    }
  }
  return labels;
}

export function GanttChart() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Dialogs
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(PRESET_COLORS[0].value);
  const [newProjectCategory, setNewProjectCategory] = useState(CATEGORIES[0]);
  const [newProjectStart, setNewProjectStart] = useState("");
  const [newProjectEnd, setNewProjectEnd] = useState("");

  const [addTaskProjectId, setAddTaskProjectId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("");
  const [newTaskEnd, setNewTaskEnd] = useState("");

  const [editingTask, setEditingTask] = useState<{ projectId: string; task: Task } | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskStart, setEditTaskStart] = useState("");
  const [editTaskEnd, setEditTaskEnd] = useState("");

  const [renameProject, setRenameProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "project" | "task";
    projectId: string;
    taskId?: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const totalDays = getViewDays(viewMode);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset = diffDays(viewStart, today);

  const dateLabels = useMemo(
    () => getDateLabels(viewStart, totalDays, viewMode),
    [viewStart, totalDays, viewMode]
  );

  // Month headers for the top row
  const monthHeaders = useMemo(() => {
    const headers: { label: string; startPct: number; widthPct: number }[] = [];
    let currentMonth = -1;
    let currentYear = -1;
    let startDay = 0;

    for (let i = 0; i <= totalDays; i++) {
      const d = addDays(viewStart, i);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (m !== currentMonth || y !== currentYear) {
        if (currentMonth >= 0) {
          headers.push({
            label: new Date(currentYear, currentMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
            startPct: (startDay / totalDays) * 100,
            widthPct: ((i - startDay) / totalDays) * 100,
          });
        }
        currentMonth = m;
        currentYear = y;
        startDay = i;
      }
    }
    if (currentMonth >= 0) {
      headers.push({
        label: new Date(currentYear, currentMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
        startPct: (startDay / totalDays) * 100,
        widthPct: ((totalDays - startDay) / totalDays) * 100,
      });
    }
    return headers;
  }, [viewStart, totalDays]);

  const navigate = (dir: number) => {
    const step = viewMode === "week" ? 7 : viewMode === "month" ? 30 : 90;
    setViewStart(addDays(viewStart, dir * step));
  };

  const goToToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    setViewStart(d);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setExpanded(next);
  };

  const getBarPosition = (startDate: string, endDate: string) => {
    const s = toLocalDate(startDate);
    const e = toLocalDate(endDate);
    const startOffset = diffDays(viewStart, s);
    const duration = diffDays(s, e) + 1;
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return {
      left: `${Math.max(left, 0)}%`,
      width: `${Math.min(width, 100 - Math.max(left, 0))}%`,
      visible: startOffset + duration > 0 && startOffset < totalDays,
    };
  };

  // Handlers
  const handleAddProject = () => {
    if (!newProjectName.trim() || !newProjectStart || !newProjectEnd) return;
    setProjects(addProject(newProjectName.trim(), newProjectColor, newProjectCategory, newProjectStart, newProjectEnd));
    setNewProjectName("");
    setNewProjectColor(PRESET_COLORS[0].value);
    setNewProjectCategory(CATEGORIES[0]);
    setNewProjectStart("");
    setNewProjectEnd("");
    setAddProjectOpen(false);
  };

  const handleAddTask = () => {
    if (!addTaskProjectId || !newTaskName.trim() || !newTaskStart || !newTaskEnd) return;
    setProjects(addTask(addTaskProjectId, newTaskName.trim(), newTaskStart, newTaskEnd));
    setNewTaskName("");
    setNewTaskStart("");
    setNewTaskEnd("");
    setAddTaskProjectId(null);
  };

  const handleEditTask = () => {
    if (!editingTask || !editTaskName.trim()) return;
    setProjects(updateTask(editingTask.projectId, editingTask.task.id, {
      name: editTaskName.trim(),
      startDate: editTaskStart,
      endDate: editTaskEnd,
    }));
    setEditingTask(null);
  };

  const handleRename = () => {
    if (!renameProject || !renameValue.trim()) return;
    setProjects(updateProject(renameProject.id, { name: renameValue.trim() }));
    setRenameProject(null);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "project") {
      setProjects(deleteProject(deleteConfirm.projectId));
    } else if (deleteConfirm.taskId) {
      setProjects(deleteTask(deleteConfirm.projectId, deleteConfirm.taskId));
    }
    setDeleteConfirm(null);
  };

  const handleToggleTask = (projectId: string, taskId: string, completed: boolean) => {
    setProjects(updateTask(projectId, taskId, { completed: !completed }));
  };

  const LABEL_WIDTH = 280;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="text-xs font-medium text-brg hover:text-brg-hover px-2 py-1 rounded border border-brg/20 hover:bg-brg-light transition-colors">
            Today
          </button>
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary">&larr;</button>
          <button onClick={() => navigate(1)} className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary">&rarr;</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-cream border border-border rounded-lg overflow-hidden">
            {(["week", "month", "quarter"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-medium transition-colors capitalize ${
                  viewMode === m ? "bg-brg text-white" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Button size="sm" className="bg-racing-red hover:bg-racing-red/90 text-white" onClick={() => setAddProjectOpen(true)}>
            <Plus size={16} className="mr-1" /> Add Project
          </Button>
        </div>
      </div>

      {/* Gantt */}
      <div className="bg-cream-light border border-border rounded-card overflow-hidden">
        {/* Month header row */}
        <div className="flex border-b border-border">
          <div style={{ minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }} className="bg-cream-light border-r border-border p-2">
            <span className="text-xs font-medium text-text-muted uppercase">Projects</span>
          </div>
          <div className="flex-1 relative h-7 bg-cream/50">
            {monthHeaders.map((h, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center border-r border-border/40 px-2"
                style={{ left: h.startPct + "%", width: h.widthPct + "%" }}
              >
                <span className="text-[10px] font-medium text-text-primary truncate">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Date tick row */}
        <div className="flex border-b border-border">
          <div style={{ minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }} className="bg-cream-light border-r border-border" />
          <div className="flex-1 relative h-5 bg-cream/30">
            {dateLabels.map((dl, i) => {
              const offset = diffDays(viewStart, dl.date);
              const pct = (offset / totalDays) * 100;
              return (
                <div key={i} className="absolute top-0 h-full" style={{ left: `${pct}%` }}>
                  <div className={`border-l ${dl.isMajor ? "border-border" : "border-border/30"} h-full`} />
                  <span className="absolute top-0 left-0.5 text-[8px] font-mono text-text-muted">{dl.label}</span>
                </div>
              );
            })}
            {/* Today line in header */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div className="absolute top-0 h-full w-0.5 bg-racing-red z-10" style={{ left: `${(todayOffset / totalDays) * 100}%` }} />
            )}
          </div>
        </div>

        {/* Project rows */}
        {projects.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            No projects yet. Click &quot;Add Project&quot; to get started.
          </div>
        ) : (
          projects.map((project) => {
            const isExpanded = expanded.has(project.id);
            const progress = getProjectProgress(project);
            const bar = getBarPosition(project.startDate, project.endDate);

            return (
              <div key={project.id} className="border-b border-border last:border-0">
                {/* Project row */}
                <div className="flex hover:bg-cream/30 transition-colors group">
                  {/* Label */}
                  <div
                    style={{ minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }}
                    className="border-r border-border p-2 flex items-center gap-2"
                  >
                    <button onClick={() => toggleExpand(project.id)} className="text-text-muted hover:text-text-primary">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="text-xs font-semibold text-text-primary truncate flex-1">{project.name}</span>
                    <span className="font-mono text-[10px] text-text-muted shrink-0">{progress}%</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button onClick={() => { setRenameProject(project); setRenameValue(project.name); }} className="text-text-muted hover:text-brg"><Edit2 size={11} /></button>
                      <button onClick={() => setAddTaskProjectId(project.id)} className="text-text-muted hover:text-brg"><Plus size={12} /></button>
                      <button onClick={() => setDeleteConfirm({ type: "project", projectId: project.id, name: project.name })} className="text-text-muted hover:text-racing-red"><Trash2 size={11} /></button>
                    </div>
                  </div>
                  {/* Timeline bar */}
                  <div className="flex-1 relative h-10">
                    {bar.visible && (
                      <div
                        className="absolute top-1.5 h-7 rounded-md flex items-center overflow-hidden"
                        style={{ left: bar.left, width: bar.width, backgroundColor: project.color }}
                      >
                        {/* Progress fill */}
                        <div
                          className="absolute inset-0 rounded-md opacity-30 bg-white"
                          style={{ width: `${100 - progress}%`, marginLeft: `${progress}%` }}
                        />
                        <span className="text-[10px] font-semibold text-white px-2 truncate relative z-10">
                          {project.name} · {progress}%
                        </span>
                      </div>
                    )}
                    {/* Today line */}
                    {todayOffset >= 0 && todayOffset <= totalDays && (
                      <div className="absolute top-0 h-full w-0.5 bg-racing-red/30 pointer-events-none" style={{ left: `${(todayOffset / totalDays) * 100}%` }} />
                    )}
                  </div>
                </div>

                {/* Task rows */}
                {isExpanded &&
                  project.tasks.map((task) => {
                    const taskBar = getBarPosition(task.startDate, task.endDate);
                    return (
                      <div key={task.id} className="flex hover:bg-cream/20 transition-colors group">
                        {/* Task label */}
                        <div
                          style={{ minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }}
                          className="border-r border-border p-2 pl-10 flex items-center gap-2"
                        >
                          <button
                            onClick={() => handleToggleTask(project.id, task.id, task.completed)}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              task.completed ? "bg-brg border-brg text-white" : "border-border text-transparent hover:border-brg"
                            }`}
                          >
                            <Check size={10} />
                          </button>
                          <span className={`text-[11px] truncate flex-1 ${task.completed ? "line-through text-text-muted" : "text-text-secondary"}`}>
                            {task.name}
                          </span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={() => { setEditingTask({ projectId: project.id, task }); setEditTaskName(task.name); setEditTaskStart(task.startDate); setEditTaskEnd(task.endDate); }}
                              className="text-text-muted hover:text-brg"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: "task", projectId: project.id, taskId: task.id, name: task.name })}
                              className="text-text-muted hover:text-racing-red"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                        {/* Task bar */}
                        <div className="flex-1 relative h-8">
                          {taskBar.visible && (
                            <div
                              className={`absolute top-2 h-4 rounded ${task.completed ? "opacity-40" : ""}`}
                              style={{
                                left: taskBar.left,
                                width: taskBar.width,
                                backgroundColor: project.color,
                                opacity: task.completed ? 0.4 : 0.6,
                              }}
                            />
                          )}
                          {todayOffset >= 0 && todayOffset <= totalDays && (
                            <div className="absolute top-0 h-full w-0.5 bg-racing-red/30 pointer-events-none" style={{ left: `${(todayOffset / totalDays) * 100}%` }} />
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Progress bar under expanded project */}
                {isExpanded && project.tasks.length > 0 && (
                  <div className="flex border-t border-border/30">
                    <div style={{ minWidth: LABEL_WIDTH, maxWidth: LABEL_WIDTH }} className="border-r border-border p-2 pl-10 flex items-center gap-2">
                      <span className="text-[10px] text-text-muted">
                        {project.tasks.filter((t) => t.completed).length}/{project.tasks.length} tasks complete
                      </span>
                    </div>
                    <div className="flex-1 flex items-center px-4">
                      <div className="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                      </div>
                      <span className="font-mono text-[10px] text-text-muted ml-2">{progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent className="bg-cream-light">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Project Name</Label>
              <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="mt-1 bg-cream" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={newProjectCategory} onChange={(e) => setNewProjectCategory(e.target.value)} className="mt-1 block w-full bg-cream border border-border rounded-lg px-3 py-2 text-sm">
                {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={newProjectStart} onChange={(e) => setNewProjectStart(e.target.value)} className="mt-1 bg-cream" /></div>
              <div><Label>End Date</Label><Input type="date" value={newProjectEnd} onChange={(e) => setNewProjectEnd(e.target.value)} className="mt-1 bg-cream" /></div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_COLORS.map((c) => (
                  <button key={c.value} onClick={() => setNewProjectColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newProjectColor === c.value ? "border-text-primary scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAddProject} className="bg-racing-red hover:bg-racing-red/90 text-white">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={!!addTaskProjectId} onOpenChange={() => setAddTaskProjectId(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Task Name</Label><Input value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="mt-1 bg-cream" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={newTaskStart} onChange={(e) => setNewTaskStart(e.target.value)} className="mt-1 bg-cream" /></div>
              <div><Label>End Date</Label><Input type="date" value={newTaskEnd} onChange={(e) => setNewTaskEnd(e.target.value)} className="mt-1 bg-cream" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAddTask} className="bg-racing-red hover:bg-racing-red/90 text-white">Add Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Task Name</Label><Input value={editTaskName} onChange={(e) => setEditTaskName(e.target.value)} className="mt-1 bg-cream" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={editTaskStart} onChange={(e) => setEditTaskStart(e.target.value)} className="mt-1 bg-cream" /></div>
              <div><Label>End Date</Label><Input type="date" value={editTaskEnd} onChange={(e) => setEditTaskEnd(e.target.value)} className="mt-1 bg-cream" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleEditTask} className="bg-racing-red hover:bg-racing-red/90 text-white">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={!!renameProject} onOpenChange={() => setRenameProject(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader><DialogTitle>Rename Project</DialogTitle></DialogHeader>
          <div className="py-2"><Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="bg-cream" /></div>
          <DialogFooter><Button onClick={handleRename} className="bg-racing-red hover:bg-racing-red/90 text-white">Rename</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader><DialogTitle>Delete {deleteConfirm?.type}?</DialogTitle></DialogHeader>
          <p className="text-sm text-text-secondary py-2">
            Are you sure you want to delete &quot;{deleteConfirm?.name}&quot;? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-racing-red hover:bg-racing-red/90 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
