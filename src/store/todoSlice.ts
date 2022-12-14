import {createSlice, createAsyncThunk, PayloadAction, AnyAction} from '@reduxjs/toolkit';

export const fetchTodos = createAsyncThunk<Todo[], undefined, { rejectValue: string }>('todos/fetchTodos', async (_, {rejectWithValue}) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

    if (!response.ok) {
        throw rejectWithValue('Server Error!');
    }

    const data = await response.json();

    return data;
});

export const deleteTodo = createAsyncThunk<unknown, number, { rejectValue: string }>('todos/deleteTodo', async (id, {
    rejectWithValue,
}) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw rejectWithValue('Server Error!');
    }

    return id
});

export const toggleStatus = createAsyncThunk<Todo, number, { rejectWithValue: string, state: {todos: TodosState} }>(
    'todos/toggleStatus',
    async (id, {rejectWithValue, getState}) => {
        const todo = getState().todos.list.find((todo) => todo.id === id);

        if (todo) {
            const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    completed: !todo.completed,
                }),
            });

            if (!response.ok) {
                return rejectWithValue('Can\'t change status task. Server error!');
            }

            return (await response.json()) as Todo
        }

        return rejectWithValue('No such todo in the list!');
    }
);

export const addNewTodo = createAsyncThunk<Todo, string, { rejectValue: string }>('todos/addNewTodo', async (title, {rejectWithValue}) => {
    const todo = {
        title: title,
        userId: 1,
        completed: false,
    };

    const response = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(todo),
    });

    if (!response.ok) {
        throw rejectWithValue('Server Error!');
    }

    return (await response.json()) as Todo
});

type Todo = {
    id: number;
    title: string;
    completed: boolean;
};

type TodosState = {
    list: Todo[];
    loading: boolean;
    error: string | null;
};

const initialState: TodosState = {
    list: [],
    loading: false,
    error: null,
};

const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        // addTodo(state, action: PayloadAction<Todo>) {
        //   state.list.push(action.payload);
        // },
        // toggleComplete(state, action: PayloadAction<number>) {
        //   const toggledTodo = state.list.find((todo) => todo.id === action.payload);
        //   if (toggledTodo) {
        //     toggledTodo.completed = !toggledTodo.completed;
        //   }
        // },
        // removeTodo(state, action: PayloadAction<number>) {
        //   state.list = state.list.filter((todo) => todo.id !== action.payload);
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state, action) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(addNewTodo.pending, (state, action) => {
                state.error = null
            })
            .addCase(addNewTodo.fulfilled, (state, action) => {
                state.list.push(action.payload)
            })
            .addCase(toggleStatus.fulfilled, (state, action) => {
                  const toggledTodo = state.list.find((todo) => todo.id === action.payload.id);
                  if (toggledTodo) {
                    toggledTodo.completed = !toggledTodo.completed;
                  }
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.list = state.list.filter((todo) => todo.id !== action.payload);
            })
            .addMatcher(isError,(state, action:PayloadAction<string>) => {
                state.error = action.payload
                state.loading = false
            })
    },
});

// export const {addTodo, toggleComplete, removeTodo} = todoSlice.actions;

export default todoSlice.reducer;

function isError(action:AnyAction) {
    return action.type.endsWith('rejected')
}
