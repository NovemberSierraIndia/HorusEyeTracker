"use client";

import { useState, useEffect } from "react";
import {
  getProjects,
  addProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
  getEarliestDeadline,
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
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";

type SortMode = "name" | "deadline" | "category";

export function GanttChart() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(PRESET_COLORS[0].value);
  const [newProjectCategory, setNewProjectCategory] = useState(CATEGORIES[0]);
  const [addTaskProjectId, setAddTaskProjectId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("");
  const [newTaskEnd, setNewTaskEnd] = useState("");
  const [editingTask, setEditingTask] = useState<{
    projectId: string;
    taskId: string;
  } | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskStart, setEditTaskStart] = useState("");
  const [editTaskEnd, setEditTaskEnd] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "project" | "task";
    projectId: string;
    taskId?: string;
  } | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const todayDay = new Date().getDate();
  const isCurrentMonth =
    new Date().getMonth() === month && new Date().getFullYear() === year;

  const navigateMonth = (dir: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
  };

  const getBarStyle = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const effectiveStart = start < monthStart ? monthStart : start;
    const effectiveEnd = end > monthEnd ? monthEnd : end;

    if (effectiveStart > monthEnd || effectiveEnd < monthStart) return null;

    const startDay = effectiveStart.getDate();
    const endDay = effectiveEnd.getDate();
    const left = ((startDay - 1) / daysInMonth) * 100;
    const width = ((endDay - startDay + 1) / daysInMonth) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortMode === "name") return a.name.localeCompare(b.name);
    if (sortMode === "category") return a.category.localeCompare(b.category);
    // deadline
    const aDeadline = getEarliestDeadline(a);
    const bDeadline = getEarliestDeadline(b);
    if (!aDeadline && !bDeadline) return 0;
    if (!aDeadline) return 1;
    if (!bDeadline) return -1;
    return aDeadline.localeCompare(bDeadline);
  });

  // Separate active vs completed projects (a project is "completed" if all tasks are done)
  const activeProjects = sortedProjects.filter(
    (p) => p.tasks.length === 0 || p.tasks.some((t) => !t.completed)
  );
  const completedProjects = sortedProjects.filter(
    (p) => p.tasks.length > 0 && p.tasks.every((t) => t.completed)
  );

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    setProjects(addProject(newProjectName.trim(), newProjectColor, newProjectCategory));
    setNewProjectName("");
    setNewProjectColor(PRESET_COLORS[0].value);
    setNewProjectCategory(CATEGORIES[0]);
    setAddProjectOpen(false);
  };

  const handleAddTask = () => {
    if (!addTaskProjectId || !newTaskName.trim() || !newTaskStart || !newTaskEnd)
      return;
    setProjects(
      addTask(addTaskProjectId, newTaskName.trim(), newTaskStart, newTaskEnd)
    );
    setNewTaskName("");
    setNewTaskStart("");
    setNewTaskEnd("");
    setAddTaskProjectId(null);
  };

  const handleToggleComplete = (
    projectId: string,
    taskId: string,
    completed: boolean
  ) => {
    setProjects(updateTask(projectId, taskId, { completed: !completed }));
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

  const openEditTask = (projectId: string, task: Task) => {
    setEditingTask({ projectId, taskId: task.id });
    setEditTaskName(task.name);
    setEditTaskStart(task.startDate);
    setEditTaskEnd(task.endDate);
  };

  const handleEditTask = () => {
    if (!editingTask || !editTaskName.trim()) return;
    setProjects(
      updateTask(editingTask.projectId, editingTask.taskId, {
        name: editTaskName.trim(),
        startDate: editTaskStart,
        endDate: editTaskEnd,
      })
    );
    setEditingTask(null);
  };

  const renderProjectRows = (projectList: Project[], faded = false) =>
    projectList.map((project) => (
      <div key={project.id} className={`border-b border-border last:border-0 ${faded ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-cream/50">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm font-medium text-text-primary flex-1">
            {project.name}
          </span>
          <span className="text-[10px] font-mono text-text-muted bg-cream px-1.5 py-0.5 rounded">
            {project.category}
          </span>
          {!faded && (
            <button
              onClick={() => setAddTaskProjectId(project.id)}
              className="text-xs text-brg hover:text-brg-hover"
            >
              + Task
            </button>
          )}
          <button
            onClick={() =>
              setDeleteConfirm({
                type: "project",
                projectId: project.id,
              })
            }
            className="text-text-muted hover:text-racing-red"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {project.tasks.map((task) => {
          const barStyle = getBarStyle(task.startDate, task.endDate);
          return (
            <div
              key={task.id}
              className="relative h-10 border-t border-border/50 group"
            >
              <div className="absolute inset-0 flex items-center px-2">
                <span
                  className={`text-xs text-text-secondary truncate max-w-[120px] ${
                    task.completed ? "line-through opacity-50" : ""
                  }`}
                >
                  {task.name}
                </span>
              </div>
              {barStyle && (
                <div
                  className={`absolute top-1.5 h-7 rounded cursor-pointer transition-opacity ${
                    task.completed ? "opacity-50" : "hover:opacity-80"
                  }`}
                  style={{ ...barStyle, backgroundColor: project.color }}
                  onClick={() => openEditTask(project.id, task)}
                />
              )}
              {isCurrentMonth && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-racing-red/30 pointer-events-none"
                  style={{
                    left: `${((todayDay - 0.5) / daysInMonth) * 100}%`,
                  }}
                />
              )}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                <button
                  onClick={() =>
                    handleToggleComplete(
                      project.id,
                      task.id,
                      task.completed
                    )
                  }
                  className="p-1 bg-cream rounded hover:bg-brg-light"
                >
                  <Check
                    size={12}
                    className={
                      task.completed ? "text-brg" : "text-text-muted"
                    }
                  />
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      type: "task",
                      projectId: project.id,
                      taskId: task.id,
                    })
                  }
                  className="p-1 bg-cream rounded hover:bg-red-50"
                >
                  <Trash2 size={12} className="text-text-muted" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    ));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
          >
            &larr;
          </button>
          <span className="text-sm font-medium text-text-primary min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
          >
            &rarr;
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="text-xs bg-cream border border-border rounded-lg px-2 py-1.5 text-text-secondary"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="name">Sort: Name</option>
            <option value="category">Sort: Category</option>
          </select>
          <Button
            size="sm"
            className="bg-racing-red hover:bg-racing-red/90 text-white"
            onClick={() => setAddProjectOpen(true)}
          >
            <Plus size={16} className="mr-1" /> Add Project
          </Button>
        </div>
      </div>

      {/* Day headers + chart */}
      <div className="bg-cream-light border border-border rounded-card overflow-hidden">
        <div className="relative h-8 border-b border-border flex">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className="flex-1 text-center text-[10px] font-mono text-text-muted flex items-center justify-center border-r border-border/50 last:border-0"
            >
              {d % 5 === 0 || d === 1 ? d : ""}
            </div>
          ))}
          {isCurrentMonth && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-racing-red z-10"
              style={{
                left: `${((todayDay - 0.5) / daysInMonth) * 100}%`,
              }}
            />
          )}
        </div>

        {activeProjects.length === 0 && completedProjects.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            No projects yet. Click &quot;Add Project&quot; to get started.
          </div>
        ) : (
          renderProjectRows(activeProjects)
        )}
      </div>

      {/* Completed projects section */}
      {completedProjects.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary mb-2"
          >
            {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Completed ({completedProjects.length})
          </button>
          {showCompleted && (
            <div className="bg-cream-light border border-border rounded-card overflow-hidden">
              {renderProjectRows(completedProjects, true)}
            </div>
          )}
        </div>
      )}

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent className="bg-cream-light">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="mt-1 bg-cream"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={newProjectCategory}
                onChange={(e) => setNewProjectCategory(e.target.value)}
                className="mt-1 block w-full bg-cream border border-border rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewProjectColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newProjectColor === c.value
                        ? "border-text-primary scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddProject}
              className="bg-racing-red hover:bg-racing-red/90 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog
        open={!!addTaskProjectId}
        onOpenChange={() => setAddTaskProjectId(null)}
      >
        <DialogContent className="bg-cream-light">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Task Name</Label>
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="mt-1 bg-cream"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newTaskStart}
                  onChange={(e) => setNewTaskStart(e.target.value)}
                  className="mt-1 bg-cream"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newTaskEnd}
                  onChange={(e) => setNewTaskEnd(e.target.value)}
                  className="mt-1 bg-cream"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddTask}
              className="bg-racing-red hover:bg-racing-red/90 text-white"
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Task Name</Label>
              <Input
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
                className="mt-1 bg-cream"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={editTaskStart}
                  onChange={(e) => setEditTaskStart(e.target.value)}
                  className="mt-1 bg-cream"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={editTaskEnd}
                  onChange={(e) => setEditTaskEnd(e.target.value)}
                  className="mt-1 bg-cream"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditTask}
              className="bg-racing-red hover:bg-racing-red/90 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-cream-light">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary py-2">
            Are you sure you want to delete this {deleteConfirm?.type}? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-racing-red hover:bg-racing-red/90 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
