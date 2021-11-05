import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import produce from "immer";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
}

export type TodoItemFormData = Omit<TodoItem, "id" | "done">;

interface TodoItemsState {
  todoItems: TodoItem[];
  todoItemsDone: TodoItem[];
}

type TodoItemsAction =
  | {
      type: "loadState";
      data: TodoItemsState;
    }
  | {
      type: "add";
      data: { todoItem: TodoItemFormData };
    }
  | {
      type: "delete";
      data: { id: string; done: boolean };
    }
  | {
      type: "toggleDone";
      data: { id: string; done: boolean };
    }
  | {
      type: "reorder";
      data: { startIndex: number; endIndex: number; done: boolean };
    };

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [], todoItemsDone: [] };
const localStorageKey = "todoListState";

export const TodoItemsContextProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey);

    if (savedState) {
      try {
        dispatch({ type: "loadState", data: JSON.parse(savedState) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [state]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>{children}</TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error("useTodoItems hook should only be used inside TodoItemsContextProvider");
  }

  return todoItemsContext;
};

const todoItemsReducer = produce((draft: TodoItemsState, action: TodoItemsAction) => {
  switch (action.type) {
    case "loadState": {
      return action.data;
    }
    case "add":
      draft.todoItems.unshift({
        id: generateId(),
        title: action.data.todoItem.title,
        details: action.data.todoItem.details,
      });
      break;
    case "delete": {
      const listName = action.data.done ? "todoItemsDone" : "todoItems";

      const list = draft[listName];

      const index = list.findIndex(({ id }) => id === action.data.id);
      if (index !== -1) {
        list.splice(index, 1);
      }
      break;
    }
    case "toggleDone": {
      const listName = action.data.done ? "todoItemsDone" : "todoItems";
      const listNameAnother = action.data.done ? "todoItems" : "todoItemsDone";

      const list = draft[listName];
      const listAnother = draft[listNameAnother];

      const index = list.findIndex(({ id }) => id === action.data.id);
      if (index !== -1) {
        const item = list[index];
        list.splice(index, 1);
        listAnother.splice(1, 0, item);
      }

      break;
    }
    case "reorder": {
      const listName = action.data.done ? "todoItemsDone" : "todoItems";

      const list = draft[listName];

      const [removed] = list.splice(action.data.startIndex, 1);
      list.splice(action.data.endIndex, 0, removed);
      break;
    }

    default:
      throw new Error();
  }
});

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e16).toString(36)}`;
}
