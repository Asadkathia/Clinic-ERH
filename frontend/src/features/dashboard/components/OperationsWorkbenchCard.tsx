import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { RecentLogEntry } from "../types";
import { DashboardSectionCard } from "./DashboardSectionCard";

const TODO_STORAGE_KEY = "clinic_erh_dashboard_replicated_todos";

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

type OperationsWorkbenchCardProps = {
  recentLog: RecentLogEntry[];
  defaultTodoItems: string[];
};

export function OperationsWorkbenchCard({ recentLog, defaultTodoItems }: OperationsWorkbenchCardProps) {
  const [todoInput, setTodoInput] = useState("");
  const [todoItems, setTodoItems] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    if (!saved) {
      return defaultTodoItems.map((item) => ({
        id: crypto.randomUUID(),
        text: item,
        done: false,
      }));
    }

    try {
      return JSON.parse(saved) as TodoItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoItems));
  }, [todoItems]);

  return (
    <DashboardSectionCard
      title="Operations Desk"
      meta="Recent log + receptionist task board"
      className="operations-card"
    >
      <div className="operations-grid">
        <section className="todo-panel">
          <h5>To-do List</h5>
          <div className="todo-input-row">
            <Input
              placeholder="Add a follow-up task"
              value={todoInput}
              onChange={(event) => setTodoInput(event.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                const text = todoInput.trim();
                if (!text) return;
                setTodoItems((current) => [{ id: crypto.randomUUID(), text, done: false }, ...current]);
                setTodoInput("");
              }}
            >
              Add
            </Button>
          </div>
          <div className="todo-list">
            {todoItems.map((item) => (
              <label key={item.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    setTodoItems((current) =>
                      current.map((todo) => (todo.id === item.id ? { ...todo, done: !todo.done } : todo)),
                    )
                  }
                />
                <span>{item.text}</span>
                <button
                  type="button"
                  className="todo-remove"
                  onClick={() => setTodoItems((current) => current.filter((todo) => todo.id !== item.id))}
                >
                  Remove
                </button>
              </label>
            ))}
          </div>
        </section>

        <section className="log-panel">
          <h5>Recent Activity Log</h5>
          <div className="log-list">
            {recentLog.map((entry) => (
              <article key={entry.id} className="log-item">
                <div>
                  <strong>{entry.type}</strong>
                  <time>{new Date(entry.at).toLocaleString()}</time>
                </div>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardSectionCard>
  );
}
