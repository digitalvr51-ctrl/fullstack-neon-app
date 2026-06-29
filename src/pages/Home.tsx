import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, CheckCircle2, Circle, Clock, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const variants: Record<TaskStatus, { label: string; className: string; icon: React.ReactNode }> = {
    todo: { label: "K udělání", className: "bg-slate-100 text-slate-700 hover:bg-slate-200", icon: <Circle className="w-3 h-3 mr-1" /> },
    in_progress: { label: "Probíhá", className: "bg-blue-100 text-blue-700 hover:bg-blue-200", icon: <Clock className="w-3 h-3 mr-1" /> },
    done: { label: "Hotovo", className: "bg-green-100 text-green-700 hover:bg-green-200", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
  };
  const v = variants[status];
  return (
    <Badge variant="secondary" className={`${v.className} flex items-center w-fit`}>
      {v.icon}
      {v.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const colors: Record<TaskPriority, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={`${colors[priority]} w-fit capitalize`}>
      {priority === "low" ? "Nízká" : priority === "medium" ? "Střední" : "Vysoká"}
    </Badge>
  );
}

export default function Home() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.task.list.useQuery();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      resetForm();
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.list.invalidate();
      resetForm();
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => utils.task.list.invalidate(),
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");
    setIsFormOpen(false);
    setEditingTask(null);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setIsFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask.mutate({
        id: editingTask.id,
        title,
        description: description || undefined,
        status,
        priority,
      });
    } else {
      createTask.mutate({
        title,
        description: description || undefined,
        status,
        priority,
        userId: user?.unionId,
      });
    }
  }

  const typedTasks = (tasks ?? []).map((t) => ({
    ...t,
    status: t.status as TaskStatus,
    priority: t.priority as TaskPriority,
  }));

  const todoTasks = typedTasks.filter((t) => t.status === "todo");
  const inProgressTasks = typedTasks.filter((t) => t.status === "in_progress");
  const doneTasks = typedTasks.filter((t) => t.status === "done");

  function TaskList({ items }: { items: Task[] }) {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Žádné úkoly. Vytvořte svůj první úkol!
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <StatusBadge status={task.status as TaskStatus} />
                    <PriorityBadge priority={task.priority as TaskPriority} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(task)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask.mutate({ id: task.id })}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Správce úkolů
            </h1>
            <p className="text-muted-foreground mt-1">
              Organizujte svou práci s Neon PostgreSQL + tRPC
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/tickets">
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Vstupenky
              </Button>
            </Link>
            <Button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nový úkol
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>K udělání</CardDescription>
              <CardTitle className="text-3xl">{todoTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Probíhá</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{inProgressTasks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hotovo</CardDescription>
              <CardTitle className="text-3xl text-green-600">{doneTasks.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Form */}
        {isFormOpen && (
          <Card className="mb-8 border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle>{editingTask ? "Upravit úkol" : "Vytvořit nový úkol"}</CardTitle>
              <CardDescription>
                {editingTask ? "Aktualizujte detaily úkolu" : "Přidejte nový úkol do seznamu"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Název</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Zadejte název úkolu..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Popis</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Přidejte podrobnosti..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Stav</label>
                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">K udělání</SelectItem>
                        <SelectItem value="in_progress">Probíhá</SelectItem>
                        <SelectItem value="done">Hotovo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Priorita</label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Nízká</SelectItem>
                        <SelectItem value="medium">Střední</SelectItem>
                        <SelectItem value="high">Vysoká</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Zrušit
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTask.isPending || updateTask.isPending}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {editingTask ? "Uložit změny" : "Vytvořit úkol"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Task Tabs */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
            <p className="text-muted-foreground mt-2">Načítání úkolů...</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Všechny ({tasks?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="todo">K udělání ({todoTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress">Probíhá ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="done">Hotovo ({doneTasks.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TaskList items={typedTasks} />
            </TabsContent>
            <TabsContent value="todo">
              <TaskList items={todoTasks} />
            </TabsContent>
            <TabsContent value="in_progress">
              <TaskList items={inProgressTasks} />
            </TabsContent>
            <TabsContent value="done">
              <TaskList items={doneTasks} />
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          Full-Stack aplikace s React + tRPC + Drizzle ORM + Neon PostgreSQL
        </div>
      </div>
    </div>
  );
}
