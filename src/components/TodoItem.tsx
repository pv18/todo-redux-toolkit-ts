import {deleteTodo, toggleStatus} from '../store/todoSlice';
import {useAppDispatch} from '../hooks';
import {FC} from 'react';

interface ITodoItem {
    id: number
    title: string
    completed: boolean
}

const TodoItem:FC<ITodoItem> = ({ id, title, completed }) => {
  const dispatch = useAppDispatch();

  return (
    <li>
      <input type='checkbox' checked={completed} onChange={() => dispatch(toggleStatus(id))} />
      <span>{title}</span>
      <span onClick={() => dispatch(deleteTodo(id))}>&times;</span>
    </li>
  );
};

export default TodoItem;
